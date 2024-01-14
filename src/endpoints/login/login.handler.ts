import { validate } from 'class-validator';
import sha256 from 'crypto-js/sha256';
import { Collection } from 'mongodb';
import { HttpRequest, IHttpResponse } from '../../core/api';
import { Log } from '../../core/logging';
import { IRouterHandler } from '../../core/routing';
import { AuthenticationHelper } from '../../domain/auth/authentication-helper';
import { UserRights } from '../../domain/auth/user-rights';
import { IllegalRequestBodyf, ResourceNotFoundf } from '../../domain/responses/functors';
import { UserInfo } from '../../models/user.info';
import { OnLoginInfo } from './login.request';

/**
 * The login endpoint handler.
 */
export class LoginHandler implements IRouterHandler {
  /**
   * The user collection.
   */
  private readonly collection: Collection<UserInfo>;

  /**
   * The authentication helper.
   */
  private readonly authenticationHelper: AuthenticationHelper;

  /**
   * Constructor.
   *
   * @param collection The user collection.
   * @param authenticationHelper The authenticationHelper.
   */
  constructor(collection: Collection<UserInfo>, authenticationHelper: AuthenticationHelper) {
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
      return IllegalRequestBodyf('Expected a request body.');
    }

    const info = new OnLoginInfo();
    Object.assign(info, request.body);

    const errors = await validate(info);
    if (errors.length > 0) {
      return IllegalRequestBodyf(errors);
    }

    const password = sha256(info.password).toString();
    const existingUser = await this.collection.findOne({ email: info.email });

    if (!existingUser) {
      return ResourceNotFoundf(`User does not exist.`);
    }

    if (existingUser.password !== password) {
      return IllegalRequestBodyf(`Email or password incorrect.`);
    }

    const payload = {
      userId: existingUser._id,
      rights: [UserRights.CREATE_DEVICE],
    };

    const token = this.authenticationHelper.sign(payload, '24h');

    return {
      statusCode: 200,
      body: token,
    };
  }
}
