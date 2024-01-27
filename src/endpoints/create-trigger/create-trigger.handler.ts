import { validate } from 'class-validator';
import { Collection } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { HttpRequest, IHttpResponse } from '../../core/api';
import { Log } from '../../core/logging';
import { IRouterHandler } from '../../core/routing';
import { AuthenticationHelper } from '../../domain/auth/authentication-helper';
import { AuthorizationHelper } from '../../domain/auth/authorization-helper';
import { UserRights } from '../../domain/auth/user-rights';
import { Forbidden, IllegalRequestBodyf, InternalServerError, Unauthorized } from '../../domain/responses';
import { TriggerInfo } from '../../models/trigger-action.info';
import { OnCreateTriggerInfo } from './create-trigger.request';

/**
 * The create trigger endpoint handler.
 */
export class CreateTriggerHandler implements IRouterHandler {
  /**
   * The trigger collection.
   */
  private readonly collection: Collection<TriggerInfo>;

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
   * @param collection The device collection.
   * @param authenticationHelper The authentication helper.
   */
  constructor(collection: Collection<TriggerInfo>, authenticationHelper: AuthenticationHelper) {
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

    const user = this.authenticationHelper.verifyRequest<{ userId: string; rights: UserRights[] }>(request);
    if (!user) {
      Log.warn('user not authenticated ...');
      return Unauthorized();
    }

    const isAuthorized = this.authorizationHelper.isEntitledWith(user.rights, UserRights.CREATE_TRIGGER);
    if (!isAuthorized) {
      Log.warn('user not authorized ...');
      return Forbidden();
    }

    if (!request.body) {
      Log.warn('missing request body ...');
      return IllegalRequestBodyf('Expected a request body.');
    }

    const info = new OnCreateTriggerInfo();
    Object.assign(info, request.body);

    const errors = await validate(info);
    if (errors.length > 0) {
      Log.warn('request body validation failed ...');
      return IllegalRequestBodyf(errors);
    }

    const device: TriggerInfo = {
      _id: uuidv4(),
      _userId: user.userId,
      _deviceId: user.userId,
      name: info.name!,
      postUrl: info.postUrl!,
      threshold: info.threshold!,
      paramter: info.paramter!,
      operator: info.operator!,
      createdOn: new Date(),
    };

    try {
      await this.collection.insertOne(device);
    } catch (error) {
      Log.error('failed to create trigger:', error);
      return InternalServerError();
    }

    return {
      statusCode: 200,
      body: device,
    };
  }
}
