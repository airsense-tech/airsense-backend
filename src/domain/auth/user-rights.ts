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
   * The user is allowed to delete devices.
   */
  DELETE_DEVICE = 'delete-device',

  /**
   * The user is allowed to read all device triggers.
   */
  READ_TRIGGER = 'read-trigger',

  /**
   * The user is allowed to create device triggers.
   */
  CREATE_TRIGGER = 'create-trigger',

  /**
   * The user is allowed to delete device triggers.
   */
  DELETE_TRIGGER = 'delete-trigger',

  /**
   * The user is allowed to create new data points.
   */
  CREATE_DATA_POINT = 'create-data-point',
}
