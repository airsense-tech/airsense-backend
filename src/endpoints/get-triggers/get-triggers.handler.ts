import { Collection } from 'mongodb';
import { HttpRequest, IHttpResponse } from '../../core/api';
import { Log } from '../../core/logging';
import { IRouterHandler } from '../../core/routing';
import { AuthenticationHelper } from '../../domain/auth/authentication-helper';
import { AuthorizationHelper } from '../../domain/auth/authorization-helper';
import { UserRights } from '../../domain/auth/user-rights';
import { Forbidden, IllegalPathParamf, InternalServerError, Unauthorized } from '../../domain/responses';
import { TriggerInfo } from '../../models/trigger.info';

/**
 * The get triggers endpoint handler.
 */
export class GetTriggersHandler implements IRouterHandler {
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
  private readonly authorizationHelper: AuthorizationHelper;

  /**
   * Constructor.
   *
   * @param collection The trigger collection.
   * @param authenticationHelper The authentication helper.
   */
  constructor(collection: Collection<TriggerInfo>, authenticationHelper: AuthenticationHelper) {
    this.collection = collection;
    this.authenticationHelper = authenticationHelper;
    this.authorizationHelper = new AuthorizationHelper();
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

    if (!user.userId) {
      Log.warn('user not authenticated ...');
      return Unauthorized();
    }

    const isEntitled = this.authorizationHelper.isEntitledWith(user.rights, UserRights.READ_TRIGGER);
    if (!isEntitled) {
      Log.warn('user not authorized ...');
      return Forbidden();
    }

    const deviceId = request.pathParam('id');
    if (!deviceId) {
      Log.warn('device id not specified ...');
      return IllegalPathParamf('id');
    }

    let triggers: TriggerInfo[] = [];
    const query = this.collection.find({ _userId: user.userId, _deviceId: deviceId }).toArray();

    try {
      triggers = await query;
    } catch (error) {
      Log.error('failed to query collection:', error);
      return InternalServerError();
    }

    return {
      statusCode: 200,
      body: triggers,
    };
  }
}
