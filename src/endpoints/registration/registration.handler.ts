import { validate } from 'class-validator';
import sha256 from 'crypto-js/sha256';
import { Collection } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { HttpRequest, IHttpResponse } from '../../core/api';
import { Log } from '../../core/logging';
import { IRouterHandler } from '../../core/routing';
import { IllegalRequestBodyf } from '../../domain/responses';
import { UserInfo } from '../../models/user.info';
import { OnRegisterInfo } from './registration.request';

/**
 * The routing handler responsible for user registration.
 *
 * Steps:
 *  - Validate the request body
 *    - Fail if the request body is invalid
 *  - Check if the user already exists
 *    - Fail if the user already exists
 *  - Create the user
 *    - Fail if the user could not be created
 *  - Succeed
 */
export class RegistrationHandler implements IRouterHandler {
  /**
   * The user collection.
   */
  private readonly collection: Collection<UserInfo>;

  /**
   * Constructor.
   *
   * @param collection The user collection.
   */
  constructor(collection: Collection<UserInfo>) {
    this.collection = collection;
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
      return IllegalRequestBodyf('Expected request body.');
    }

    const info = new OnRegisterInfo();
    Object.assign(info, request.body);

    const errors = await validate(info);
    if (errors.length > 0) {
      return IllegalRequestBodyf(errors);
    }

    const existingUser = await this.collection.findOne({ email: info.email });

    if (existingUser) {
      return IllegalRequestBodyf('User already exists.');
    }

    const password = sha256(info.password).toString();

    const user: UserInfo = {
      _id: uuidv4(),
      firstName: info.firstName,
      lastName: info.lastName,
      email: info.email,
      password: password,
      createdOn: new Date(),
    };

    const result = await this.collection.insertOne(user);

    if (!result.acknowledged) {
      return {
        statusCode: 500,
      };
    }

    return {
      statusCode: 200,
      body: user,
    };
  }
}
