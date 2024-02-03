import { MaxLength, MinLength } from 'class-validator';

/**
 * The request body for the create device endpoint.
 */
export class OnCreateDeviceInfo {
  /**
   * The name of the device.
   */
  @MinLength(3)
  @MaxLength(99)
  public name: string | undefined;
}
