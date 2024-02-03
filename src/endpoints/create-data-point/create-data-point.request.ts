/**
 * The request body for the create data point endpoint.
 */
export class OnCreateDataPointInfo {
  /**
   * The current humidity (in percent).
   */
  public humidity: number | undefined;

  /**
   * The current air pressure (in pascal).
   */
  public pressure: number | undefined;

  /**
   * The current temperature (in degrees celcius).
   */
  public temp: number | undefined;

  /**
   * The current gas resistance (in ohms).
   */
  public gasResistance: number | undefined;
}
