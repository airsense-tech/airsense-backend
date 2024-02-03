import { Collection, WithId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { HttpRequest, IHttpResponse } from '../../core/api';
import { Log } from '../../core/logging';
import { IRouterHandler } from '../../core/routing';
import { StringUtils } from '../../core/utils/string-utils';
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
import { DeviceCodeInfo } from '../../models/device-code.info';
import { DeviceInfo } from '../../models/device.info';

/**
 * Responsible for generating device registration codes.
 */
export class CreateDeviceCodeHandler implements IRouterHandler {
  /**
   * The device collection.
   */
  private readonly deviceCollection: Collection<DeviceInfo>;

  /**
   * The device code collection.
   */
  private readonly deviceCodeCollection: Collection<DeviceCodeInfo>;

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
   * @param deviceCodeCollection The device code collection.
   * @param authenticationHelper The authentication helper.
   */
  constructor(
    deviceCollection: Collection<DeviceInfo>,
    deviceCodeCollection: Collection<DeviceCodeInfo>,
    authenticationHelper: AuthenticationHelper,
  ) {
    this.deviceCollection = deviceCollection;
    this.deviceCodeCollection = deviceCodeCollection;
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

    const isAuthorized = this.authorizationHelper.isEntitledWith(user.rights, UserRights.CREATE_DEVICE);
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

    let device: WithId<DeviceInfo> | null;

    try {
      device = await this.deviceCollection.findOne({ _id: deviceId, _userId: user.userId });
    } catch (error) {
      Log.error('failed to query collection:', error);
      return InternalServerError();
    }

    if (!device) {
      Log.warn('device not found ...');
      return ResourceNotFoundf('Device not found.');
    }

    const deviceCode: DeviceCodeInfo = {
      _id: uuidv4(),
      _userId: user.userId,
      _deviceId: device._id,
      code: StringUtils.random(8),
      createdOn: new Date(),
    };

    try {
      await this.deviceCodeCollection.insertOne(deviceCode);
    } catch (error) {
      Log.error('failed to create device code:', error);
      return InternalServerError();
    }

    return {
      statusCode: 200,
      body: deviceCode,
    };
  }
}
