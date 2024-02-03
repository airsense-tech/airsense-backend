/**
 * The trigger action data model.
 */
export interface TriggerInfo {
  /**
   * The trigger action id.
   */
  _id: string;

  /**
   * The user id.
   */
  _userId: string;

  /**
   * The device id.
   */
  _deviceId: string;

  /**
   * The trigger name.
   */
  name: string;

  /**
   * The trigger id.
   */
  postUrl: string;

  /**
   * Depending on the operator, the trigger will be fired when the value is greater than, greater than or equal to, less than, or less than or equal to the threshold.
   */
  threshold: number;

  /**
   * The parameter to compare.
   */
  parameter: 'humidity' | 'pressure' | 'temperature' | 'gasResistance';

  /**
   * The operator used to compare the threshold.
   */
  operator: 'gt' | 'gte' | 'lt' | 'lte';

  /**
   * The date the trigger was created on.
   */
  createdOn: Date;
}
