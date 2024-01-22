import { Collection, Document } from 'mongodb';
import { HttpRequest, IHttpResponse } from '../../core/api';
import { Log } from '../../core/logging';
import { IRouterHandler } from '../../core/routing';
import { AuthenticationHelper } from '../../domain/auth/authentication-helper';
import { InternalServerError, Unauthorized } from '../../domain/responses';
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

    if (!user.userId) {
      Log.warn('user not authorized ...');
      return Unauthorized();
    }

    const filter = request.queryParam('filter');
    const projection = this.getProjectionFromFilter(filter);

    const oneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

    const pipeline = [
      {
        $match: {
          _userId: user.userId,
          createdOn: { $gte: oneDayAgo },
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
        },
      },
      {
        $group: {
          _id: {
            year: '$year',
            month: '$month',
            day: '$day',
            hour: '$hour',
          },
          humidity: { $avg: '$humidity' },
          pressure: { $avg: '$pressure' },
          temperature: { $avg: '$temperature' },
          gasResistance: { $avg: '$gasResistance' },
        },
      },
      {
        $project: {
          _id: 0,
          hour: '$_id.hour',
          ...projection,
        },
      },
      {
        $sort: {
          hour: 1,
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

  /**
   * Constructs a MongoDB projection object from the filter query parameter.
   *
   * @param filter The value of the filter query parameter.
   *
   * @returns A MongoDB projection object.
   */
  private getProjectionFromFilter(filter: string[] | undefined): { [key: string]: number } {
    const projection: { [key: string]: number } = {};

    if (!filter) {
      projection.humidity = 1;
      projection.pressure = 1;
      projection.temperature = 1;
      projection.gasResistance = 1;

      return projection;
    }

    if (filter.includes('humidity')) {
      projection.humidity = 1;
    }

    if (filter.includes('pressure')) {
      projection.pressure = 1;
    }

    if (filter.includes('temperature')) {
      projection.temperature = 1;
    }

    if (filter.includes('gasResistance')) {
      projection.gasResistance = 1;
    }

    return projection;
  }
}
