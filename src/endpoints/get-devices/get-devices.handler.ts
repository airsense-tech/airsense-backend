import { Collection } from 'mongodb';
import { HttpRequest, IHttpResponse } from '../../core/api';
import { Log } from '../../core/logging';
import { IRouterHandler } from '../../core/routing';
import { AuthenticationHelper } from '../../domain/auth/authentication-helper';
import { AuthorizationHelper } from '../../domain/auth/authorization-helper';
import { UserRights } from '../../domain/auth/user-rights';
import { Forbidden, InternalServerError, Unauthorized } from '../../domain/responses';
import { DeviceInfo } from '../../models/device.info';

/**
 * The get devices endpoint handler.
 */
export class GetDevicesHandler implements IRouterHandler {
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

    let devices: DeviceInfo[] = [];
    const query = this.collection.find({ _userId: user.userId }).toArray();

    try {
      devices = await query;
    } catch (error) {
      Log.error('failed to query collection:', error);
      return InternalServerError();
    }

    return {
      statusCode: 200,
      body: devices,
    };
  }
}
