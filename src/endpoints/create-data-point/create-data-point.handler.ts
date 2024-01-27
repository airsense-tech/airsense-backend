import axios from 'axios';
import { validate } from 'class-validator';
import { Collection } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { HttpRequest, IHttpResponse } from '../../core/api';
import { Log } from '../../core/logging';
import { IRouterHandler } from '../../core/routing';
import { AuthenticationHelper } from '../../domain/auth/authentication-helper';
import { AuthorizationHelper } from '../../domain/auth/authorization-helper';
import { UserRights } from '../../domain/auth/user-rights';
import { Forbidden, IllegalRequestBodyf, InternalServerError, Unauthorized } from '../../domain/responses/functors';
import { DataPointInfo } from '../../models/data-point.info';
import { TriggerInfo } from '../../models/trigger-action.info';
import { OnCreateDataPointInfo } from './create-data-point.request';

export interface ITriggerEvaluator {
  evaluate(value: number, threshold: number): boolean;
}

export class GreaterThanTriggerEvaluator implements ITriggerEvaluator {
  public evaluate(value: number, threshold: number): boolean {
    return value > threshold;
  }
}

export class GreaterThanOrEqualTriggerEvaluator implements ITriggerEvaluator {
  public evaluate(value: number, threshold: number): boolean {
    return value >= threshold;
  }
}

export class LessThanTriggerEvaluator implements ITriggerEvaluator {
  public evaluate(value: number, threshold: number): boolean {
    return value < threshold;
  }
}

export class LessThanOrEqualTriggerEvaluator implements ITriggerEvaluator {
  public evaluate(value: number, threshold: number): boolean {
    return value <= threshold;
  }
}

/**
 * The data point creation endpoint handler.
 */
export class CreateDataPointHandler implements IRouterHandler {
  /**
   * The data point collection.
   */
  private readonly collection: Collection<DataPointInfo>;

  /**
   * The trigger collection.
   */
  private readonly triggerCollection: Collection<TriggerInfo>;

  /**
   * The authentication helper.
   */
  private readonly authenticationHelper: AuthenticationHelper;

  /**
   * The authorization helper.
   */
  private readonly authorizationHelper = new AuthorizationHelper();

  /**
   * Constructor.
   *
   * @param collection The data collection.
   * @param authenticationHelper The authentication helper.
   */
  constructor(
    collection: Collection<DataPointInfo>,
    triggerCollection: Collection<TriggerInfo>,
    authenticationHelper: AuthenticationHelper,
  ) {
    this.collection = collection;
    this.triggerCollection = triggerCollection;
    this.authenticationHelper = authenticationHelper;
  }

  /**
   * Executes the endpoint handler.
   *
   * @param request The incoming request.
   *
   * @returns The outgoing response.
   */
  public async execute(request: HttpRequest): Promise<IHttpResponse> {
    Log.info(request.method, request.path);

    const user = this.authenticationHelper.verifyRequest<{ userId: string; deviceId: string; rights: UserRights[] }>(
      request,
    );
    if (!user) {
      Log.warn('user not authenticated ...');
      return Unauthorized();
    }

    const isAuthorized = this.authorizationHelper.isEntitledWith(user.rights, UserRights.CREATE_DATA_POINT);
    if (!isAuthorized) {
      Log.warn('user not authorized ...');
      return Forbidden();
    }

    if (!request.body) {
      Log.warn('missing request body ...');
      return IllegalRequestBodyf('Expected a request body.');
    }

    const info = new OnCreateDataPointInfo();
    Object.assign(info, request.body);

    const errors = await validate(info);
    if (errors.length > 0) {
      Log.warn('request body validation failed ...');
      return IllegalRequestBodyf(errors);
    }

    const dataPoint: DataPointInfo = {
      _id: uuidv4(),
      _userId: user.userId,
      _deviceId: user.deviceId,
      humidity: info.humidity,
      pressure: info.pressure,
      temperature: info.temp,
      gasResistance: info.gasResistance,
      createdOn: new Date(),
    };

    try {
      await this.collection.insertOne(dataPoint);
    } catch (error) {
      Log.error('failed to create data point:', error);
      return InternalServerError();
    }

    this.executeTriggers(user.userId, user.deviceId, dataPoint)
      .then(() => {
        Log.info('triggers successfully executed');
      })
      .catch((error) => {
        Log.error('failed to execute triggers:', error);
      });

    return {
      statusCode: 200,
      body: dataPoint,
    };
  }

  /**
   * Executes the registered device triggers if their corresponding thresholds are exceeded.
   *
   * @param userId The user id.
   * @param deviceId The device id.
   * @param dataPoint The data point.
   */
  private async executeTriggers(userId: string, deviceId: string, dataPoint: DataPointInfo): Promise<void> {
    const triggers = await this.triggerCollection.find({ _userId: userId, _deviceId: deviceId }).toArray();

    if (triggers && triggers.length > 0) {
      this.evaluateTriggers(triggers, dataPoint);
    }
  }

  /**
   * Evaluates the given triggers against the given data point.
   *
   * @param triggers The triggers to evaluate.
   * @param dataPoint The data point to evaluate against.
   */
  private evaluateTriggers(triggers: TriggerInfo[], dataPoint: DataPointInfo): void {
    for (const trigger of triggers) {
      const parameter = this.getDataPointParameterForTrigger(dataPoint, trigger);
      const evaluator = this.getTriggerEvaluator(trigger);

      if (!parameter) {
        continue;
      }

      const evaluate = evaluator.evaluate(parameter, trigger.threshold);

      if (evaluate) {
        this.postTrigger(trigger);
      }
    }
  }

  /**
   * Gets the data point parameter for the given trigger.
   *
   * @param dataPoint The data point.
   * @param trigger The trigger.
   *
   * @returns The value of the requested parameter.
   */
  private getDataPointParameterForTrigger(dataPoint: DataPointInfo, trigger: TriggerInfo): number | undefined {
    switch (trigger.paramter) {
      case 'humidity':
        return dataPoint.humidity;
      case 'pressure':
        return dataPoint.pressure;
      case 'temperature':
        return dataPoint.temperature;
      case 'gasResistance':
        return dataPoint.gasResistance;

      default:
        throw new Error('invalid trigger parameter');
    }
  }

  /**
   * Gets the trigger evaluator for the given trigger.
   *
   * @param trigger The trigger.
   *
   * @returns The trigger evaluator.
   */
  private getTriggerEvaluator(trigger: TriggerInfo): ITriggerEvaluator {
    switch (trigger.operator) {
      case 'gt':
        return new GreaterThanTriggerEvaluator();
      case 'gte':
        return new GreaterThanOrEqualTriggerEvaluator();
      case 'lt':
        return new LessThanTriggerEvaluator();
      case 'lte':
        return new LessThanOrEqualTriggerEvaluator();

      default:
        throw new Error('invalid trigger operator');
    }
  }

  /**
   * Posts the given trigger.
   *
   * @param trigger The trigger to post.
   */
  private async postTrigger(trigger: TriggerInfo): Promise<void> {
    await axios.post(trigger.postUrl);
  }
}
