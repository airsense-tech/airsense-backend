import { Collection, Document } from 'mongodb';
import { HttpRequest, IHttpResponse } from '../../core/api';
import { Log } from '../../core/logging';
import { IRouterHandler } from '../../core/routing';
import { AuthenticationHelper } from '../../domain/auth/authentication-helper';
import { AuthorizationHelper } from '../../domain/auth/authorization-helper';
import { UserRights } from '../../domain/auth/user-rights';
import { Forbidden, IllegalPathParamf, InternalServerError, Unauthorized } from '../../domain/responses';
import { DataPointInfo } from '../../models/data-point.info';

/**
 * The get device endpoint handler.
 */
export class GetDeviceDataHandler implements IRouterHandler {
  /**
   * The data collection.
   */
  private readonly collection: Collection<DataPointInfo>;

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
   * @param collection The data collection.
   * @param authenticationHelper The authentication helper.
   */
  constructor(collection: Collection<DataPointInfo>, authenticationHelper: AuthenticationHelper) {
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

    let since = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

    const queryParamSince = request.queryParam('since');
    if (queryParamSince && queryParamSince.length > 0) {
      const newSince = parseInt(queryParamSince[0], 10);
      since = new Date(newSince);
    }

    const pipeline = [
      {
        $match: {
          _deviceId: deviceId,
          _userId: user.userId,
          createdOn: { $gte: since },
        },
      },
      {
        $project: {
          _id: 1,
          humidity: 1,
          pressure: 1,
          temperature: 1,
          gasResistance: 1,
          year: { $year: '$createdOn' },
          month: { $month: '$createdOn' },
          day: { $dayOfMonth: '$createdOn' },
          hour: { $hour: '$createdOn' },
          minute: { $minute: '$createdOn' },
        },
      },
      {
        $group: {
          _id: {
            year: '$year',
            month: '$month',
            day: '$day',
            hour: '$hour',
            minute: '$minute',
          },
          humidity: { $avg: '$humidity' },
          pressure: { $avg: '$pressure' },
          temperature: { $avg: '$temperature' },
          gasResistance: { $avg: '$gasResistance' },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $project: {
          _id: 0,
          humidity: 1,
          pressure: 1,
          temperature: 1,
          gasResistance: 1,
          createdOn: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
              hour: '$_id.hour',
              minute: '$_id.minute',
            },
          },
        },
      },
    ];

    let documents: Document[] = [];
    const query = this.collection.aggregate(pipeline).toArray();

    try {
      documents = await query;
    } catch (error) {
      Log.error('failed to query collection:', error);
      return InternalServerError();
    }

    return {
      statusCode: 200,
      body: documents,
    };
  }
}
