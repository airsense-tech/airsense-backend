/**
 * The data point model.
 */
export interface DataPointInfo {
  /**
   * The id of the data point.
   */
  _id: string;

  /**
   * The id of the user who owns this data point.
   */
  _userId: string;

  /**
   * The id of the device which generated this data point.
   */
  _deviceId: string;

  /**
   * The current humidity (in percentage).
   */
  humidity: number | undefined;

  /**
   * The current air pressure.
   */
  pressure: number | undefined;

  /**
   * The current temperature (in degrees celcius).
   */
  temperature: number | undefined;

  /**
   * The time when this data point was created.
   */
  createdOn: Date | undefined;
}
