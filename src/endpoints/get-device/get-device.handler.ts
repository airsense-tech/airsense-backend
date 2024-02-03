import { Collection } from 'mongodb';
import { HttpRequest, IHttpResponse } from '../../core/api';
import { Log } from '../../core/logging';
import { IRouterHandler } from '../../core/routing';
import { AuthenticationHelper } from '../../domain/auth/authentication-helper';
import { AuthorizationHelper } from '../../domain/auth/authorization-helper';
import { UserRights } from '../../domain/auth/user-rights';
import { Forbidden, IllegalPathParamf, InternalServerError, Unauthorized } from '../../domain/responses';
import { DeviceInfo } from '../../models/device.info';

/**
 * The get device endpoint handler.
 */
export class GetDeviceHandler implements IRouterHandler {
  /**
   * The device collection.
   */
  private readonly collection: Collection<DeviceInfo>;

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
   * @param collection The device collection.
   * @param authenticationHelper The authentication helper.
   */
  constructor(collection: Collection<DeviceInfo>, authenticationHelper: AuthenticationHelper) {
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

    const isEntitled = this.authorizationHelper.isEntitledWith(user.rights, UserRights.READ_DEVICE);
    if (!isEntitled) {
      Log.warn('user not authorized ...');
      return Forbidden();
    }

    const deviceId = request.pathParam('id');
    if (!deviceId) {
      Log.warn('device id not specified ...');
      return IllegalPathParamf('id');
    }

    let deviceInfo: DeviceInfo | undefined = undefined;
    const query = this.collection.find({ _id: deviceId, _userId: user.userId }).toArray();

    try {
      const result = await query;
      deviceInfo = result[0];
    } catch (error) {
      Log.error('failed to query collection:', error);
      return InternalServerError();
    }

    return {
      statusCode: 200,
      body: deviceInfo,
    };
  }
}
