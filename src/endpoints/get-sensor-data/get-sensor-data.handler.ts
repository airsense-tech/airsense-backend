import { Collection, Document } from 'mongodb';
import { HttpRequest, IHttpResponse } from '../../core/api';
import { Log } from '../../core/logging';
import { IRouterHandler } from '../../core/routing';
import { AuthenticationHelper } from '../../domain/auth/authentication-helper';
import { IllegalRequestBodyf, InternalServerError, Unauthorized } from '../../domain/responses';
import { DataPointInfo } from '../../models/data-point.info';

/**
 * The get datapoint endpoint handler.
 */
export class GetSensorDataHandler implements IRouterHandler {
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

    if (!user.userId) {
      Log.warn('user not authorized ...');
      return Unauthorized();
    }

    if (!request.body) {
      Log.warn('missing request body ...');
      return IllegalRequestBodyf('Expected a request body.');
    }

    const pipeline = [
      {
        $match: {
          _userId: user.userId,
        },
      },
      {
        $project: {
          _id: 1,
          _deviceId: 1,
          humidity: 1,
          pressure: 1,
          temperature: 1,
          gasResistance: 1,
          year: { $year: '$createdOn' },
          month: { $month: '$createdOn' },
          day: { $dayOfMonth: '$createdOn' },
          hour: { $hour: '$createdOn' },
        },
      },
      {
        $lookup: {
          from: 'devices',
          localField: '_deviceId',
          foreignField: '_id',
          as: 'device',
        },
      },
      {
        $unwind: {
          path: '$device',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: {
            _deviceId: '$_deviceId',
            year: '$year',
            month: '$month',
            day: '$day',
            hour: '$hour',
          },
          device: { $first: '$device.name' },
          humidity: { $push: { $avg: '$humidity' } },
          pressure: { $push: { $avg: '$pressure' } },
          temperature: { $push: { $avg: '$temperature' } },
          gasResistance: { $push: { $avg: '$gasResistance' } },
          lastest: {
            $last: {
              humidity: '$humidity',
              pressure: '$pressure',
              temperature: '$temperature',
              gasResistance: '$gasResistance',
            },
          },
        },
      },
      {
        $group: {
          _id: '$_id._deviceId',
          device: { $first: '$device' },
          humidity: { $push: { k: { $toString: '$_id.hour' }, v: { $avg: '$humidity' } } },
          pressure: { $push: { k: { $toString: '$_id.hour' }, v: { $avg: '$pressure' } } },
          temperature: { $push: { k: { $toString: '$_id.hour' }, v: { $avg: '$temperature' } } },
          gasResistance: { $push: { k: { $toString: '$_id.hour' }, v: { $avg: '$gasResistance' } } },
          lastest: { $last: '$lastest' },
        },
      },
      {
        $project: {
          _id: 0,
          device: 1,
          lastest: 1,
          humidity: { $arrayToObject: '$humidity' },
          pressure: { $arrayToObject: '$pressure' },
          temperature: { $arrayToObject: '$temperature' },
          gasResistance: { $arrayToObject: '$gasResistance' },
        },
      },
      {
        $sort: {
          device: 1,
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
