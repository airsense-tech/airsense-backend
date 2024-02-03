/**
 * A device activation code model.
 */
export interface DeviceCodeInfo {
  /**
   * The id of the entry.
   */
  _id: string;

  /**
   * The id of the user to which the device belongs to.
   */
  _userId: string;

  /**
   * The id of the device to be registered.
   */
  _deviceId: string;

  /**
   * The actual registration code.
   */
  code: string | undefined;

  /**
   * The time when this code was created.
   */
  createdOn: Date | undefined;
}
