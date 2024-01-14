import { IsAscii, Length } from 'class-validator';

export class OnLoginDeviceInfo {
  @IsAscii()
  @Length(8, 8)
  public code: string | undefined;
}
