import { Collection } from 'mongodb';
import { HttpRequest, IHttpResponse } from '../../core/api';
import { Log } from '../../core/logging';
import { IRouterHandler } from '../../core/routing';
import { AuthenticationHelper } from '../../domain/auth/authentication-helper';
import { IllegalRequestBodyf, InternalServerError, Unauthorized } from '../../domain/responses';
import { DataPointInfo } from '../../models/data-point.info';

/**
 * The get datapoint endpoint handler.
 */
export class GetDataPointHandler implements IRouterHandler {
  /**
   * The device collection.
   */
  private readonly collection: Collection<DataPointInfo>;

  /**
   * The authentication helper.
   */
  private readonly authenticationHelper: AuthenticationHelper;

  /**
   * Constructor.
   *
   * @param collection The data point collection.
   * @param authenticationHelper The authentication helper.
   */
  constructor(collection: Collection<DataPointInfo>, authenticationHelper: AuthenticationHelper) {
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

    const user = this.authenticationHelper.verifyRequest<{ userId: string; deviceId: string }>(request);
    if (!user) {
      Log.warn('user not authenticated ...');
      return Unauthorized();
    }

    if (!user.userId || !user.deviceId) {
      Log.warn('user not authorized ...');
      return Unauthorized();
    }

    if (!request.body) {
      Log.warn('missing request body ...');
      return IllegalRequestBodyf('Expected a request body.');
    }

    let dataPoints: DataPointInfo[] = [];
    const query = this.collection.find({ _userId: user.userId }).sort({ createdOn: -1 }).limit(25).toArray();

    try {
      dataPoints = await query;
    } catch (error) {
      Log.error('failed to query collection:', error);
      return InternalServerError();
    }

    return {
      statusCode: 200,
      body: dataPoints,
    };
  }
}
