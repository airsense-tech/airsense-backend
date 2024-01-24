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
  Unauthorized,
} from '../../domain/responses';
import { DataPointInfo } from '../../models/data-point.info';
import { DeviceInfo } from '../../models/device.info';

/**
 * The delete device endpoint handler.
 */
export class DeleteDeviceHandler implements IRouterHandler {
  /**
   * The device collection.
   */
  private readonly deviceCollection: Collection<DeviceInfo>;

  /**
   * The data collection.
   */
  private readonly dataCollection: Collection<DataPointInfo>;

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
   * @param deviceCollection The device collection.
   * @param authenticationHelper The authentication helper.
   */
  constructor(
    deviceCollection: Collection<DeviceInfo>,
    dataCollection: Collection<DataPointInfo>,
    authenticationHelper: AuthenticationHelper,
  ) {
    this.deviceCollection = deviceCollection;
    this.dataCollection = dataCollection;
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

    const isAuthorized = this.authorizationHelper.isEntitledWith(user.rights, UserRights.DELETE_DEVICE);
    if (!isAuthorized) {
      Log.warn('user not authorized ...');
      return Forbidden();
    }

    if (!request.body) {
      Log.warn('missing request body ...');
      return IllegalRequestBodyf('Expected a request body.');
    }

    const deviceId = request.pathParam('id');
    if (!deviceId) {
      Log.warn('missing path parameter ...');
      return IllegalPathParamf('id');
    }

    try {
      await this.deviceCollection.deleteOne({ _id: deviceId });
      await this.dataCollection.deleteMany({ _userId: user.userId, _deviceId: deviceId });
    } catch (error) {
      Log.error('failed to delete device:', error);
      return InternalServerError();
    }

    return {
      statusCode: 200,
    };
  }
}
