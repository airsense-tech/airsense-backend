import { validate } from 'class-validator';
import { Collection, WithId } from 'mongodb';
import { HttpRequest, IHttpResponse } from '../../core/api';
import { Log } from '../../core/logging';
import { IRouterHandler } from '../../core/routing';
import { AuthenticationHelper } from '../../domain/auth/authentication-helper';
import { UserRights } from '../../domain/auth/user-rights';
import { IllegalRequestBodyf, InternalServerError, ResourceNotFoundf } from '../../domain/responses/functors';
import { DeviceCodeInfo } from '../../models/device-code.info';
import { OnLoginDeviceInfo } from './login-device.request';

/**
 * The login device endpoint handler.
 */
export class LoginDeviceHandler implements IRouterHandler {
  /**
   * The device code collection.
   */
  private readonly collection: Collection<DeviceCodeInfo>;

  /**
   * The authentication helper.
   */
  private readonly authenticationHelper: AuthenticationHelper;

  /**
   * Constructor.
   *
   * @param collection The user collection.
   * @param authenticationHelper The authentication helper.
   */
  constructor(collection: Collection<DeviceCodeInfo>, authenticationHelper: AuthenticationHelper) {
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

    if (!request.body) {
      Log.warn('missing request body ...');
      return IllegalRequestBodyf('Expected a request body.');
    }

    const info = new OnLoginDeviceInfo();
    Object.assign(info, request.body);

    const errors = await validate(info);
    if (errors.length > 0) {
      Log.warn('request body validation failed ...');
      return IllegalRequestBodyf(errors);
    }

    let deviceCode: WithId<DeviceCodeInfo> | null;

    try {
      deviceCode = await this.collection.findOne({ code: info.code });
    } catch (error) {
      Log.error('failed to query collection:', error);
      return InternalServerError();
    }

    if (!deviceCode) {
      Log.warn('device code not found ...');
      return ResourceNotFoundf('Device registration code not found.');
    }

    try {
      await this.collection.deleteOne({ _id: deviceCode._id });
    } catch (error) {
      Log.error('failed to delete device code:', error);
      return InternalServerError();
    }

    const payload = {
      userId: deviceCode._userId,
      deviceId: deviceCode._deviceId,
      rights: [UserRights.CREATE_DATA_POINT],
    };

    const token = this.authenticationHelper.sign(payload);

    return {
      statusCode: 200,
      body: token,
    };
  }
}
