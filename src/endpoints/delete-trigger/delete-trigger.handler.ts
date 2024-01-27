import { Collection } from 'mongodb';
import { HttpRequest, IHttpResponse } from '../../core/api';
import { Log } from '../../core/logging';
import { IRouterHandler } from '../../core/routing';
import { AuthenticationHelper } from '../../domain/auth/authentication-helper';
import { AuthorizationHelper } from '../../domain/auth/authorization-helper';
import { UserRights } from '../../domain/auth/user-rights';
import {
  Forbidden,
  IllegalPathParamf,
  IllegalRequestBodyf,
  InternalServerError,
  ResourceNotFoundf,
  Unauthorized,
} from '../../domain/responses';
import { TriggerInfo } from '../../models/trigger-action.info';

/**
 * The delete trigger endpoint handler.
 */
export class DeleteTriggerHandler implements IRouterHandler {
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
   * @param collection The trigger collection.
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

    const isAuthorized = this.authorizationHelper.isEntitledWith(user.rights, UserRights.DELETE_TRIGGER);
    if (!isAuthorized) {
      Log.warn('user not authorized ...');
      return Forbidden();
    }

    if (!request.body) {
      Log.warn('missing request body ...');
      return IllegalRequestBodyf('Expected a request body.');
    }

    const triggerId = request.pathParam('id');
    if (!triggerId) {
      Log.warn('missing path parameter ...');
      return IllegalPathParamf('id');
    }

    try {
      const result = await this.collection.deleteOne({ _id: triggerId });

      if (result.deletedCount === 0) {
        Log.warn('trigger not found ...');
        return ResourceNotFoundf('trigger');
      }
    } catch (error) {
      Log.error('failed to delete device:', error);
      return InternalServerError();
    }

    return {
      statusCode: 200,
    };
  }
}
