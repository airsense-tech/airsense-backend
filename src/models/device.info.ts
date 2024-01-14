/**
 * Represents a single device, which is recording data points.
 */
export interface DeviceInfo {
  /**
   * The device id.
   */
  _id: string;

  /**
   * The user this device belongs to.F
   */
  _userId: string;

  /**
   * The device name.
   */
  name: string | undefined;

  /**
   * The time when this device was created.
   */
  createdOn: Date | undefined;
}
