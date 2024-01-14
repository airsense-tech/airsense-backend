import { IsUUID } from 'class-validator';

/**
 * The request body for the create device code endpoint.
 */
export class OnCreateDeviceCodeInfo {
  @IsUUID(4)
  public deviceId: string | undefined;
}
