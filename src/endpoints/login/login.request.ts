import { IsEmail, Length } from 'class-validator';

/**
 * The request body for the login endpoint.
 */
export class OnLoginInfo {
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
