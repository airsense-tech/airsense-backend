import { IsAlpha, IsEmail, Length } from 'class-validator';

/**
 * The request body for the registration endpoint.
 */
export class OnRegisterInfo {
  /**
   * The user's first name.
   */
  @IsAlpha()
  public firstName: string | undefined;

  /**
   * The user's last name.
   */
  @IsAlpha()
  public lastName: string | undefined;

  /**
   * The user email.
   */
  @IsEmail()
  public email: string = '';

  /**
   * The user password.
   */
  @Length(8, 32)
  public password = '';
}
