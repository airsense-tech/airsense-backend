/**
 * Describes all available user rights.
 * Note that devices are users too.
 */
export enum UserRights {
  /**
   * The user is allowed to read all devices.
   */
  READ_DEVICE = 'read-device',

  /**
   * The user is allowed to create new devices.
   */
  CREATE_DEVICE = 'create-device',

  /**
   * The user is allowed to create new data points.
   */
  CREATE_DATA_POINT = 'create-data-point',
}
