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
import { OnCreateDataPointInfo } from './create-data-point.request';

/**
 * The data point creation endpoint handler.
 */
export class CreateDataPointHandler implements IRouterHandler {
  /**
   * The data point collection.
   */
  private readonly collection: Collection<DataPointInfo>;

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
  constructor(collection: Collection<DataPointInfo>, authenticationHelper: AuthenticationHelper) {
    this.collection = collection;
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
      return Unauthorized();
    }

    const isAuthorized = this.authorizationHelper.isEntitledWith(user.rights, UserRights.CREATE_DATA_POINT);
    if (!isAuthorized) {
      return Forbidden();
    }

    if (!request.body) {
      return IllegalRequestBodyf('Expected a request body.');
    }

    const info = new OnCreateDataPointInfo();
    Object.assign(info, request.body);

    const errors = await validate(info);
    if (errors.length > 0) {
      return IllegalRequestBodyf(errors);
    }

    const dataPoint: DataPointInfo = {
      _id: uuidv4(),
      _userId: user.userId,
      _deviceId: user.deviceId,
      humidity: info.humidity,
      pressure: info.pressure,
      temperature: info.temp,
      createdOn: new Date(),
    };

    try {
      await this.collection.insertOne(dataPoint);
    } catch (error) {
      Log.error('failed to create data point:', error);
      return InternalServerError();
    }

    return {
      statusCode: 200,
      body: dataPoint,
    };
  }
}
