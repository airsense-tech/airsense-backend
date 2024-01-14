/**
 * Represents a user.
 */
export interface UserInfo {
  /**
   * The user id.
   */
  _id: string;

  /**
   * The user email.
   */
  email?: string | undefined;

  /**
   * The user password.
   */
  password?: string | undefined;

  /**
   * The user's first name.
   */
  firstName?: string | undefined;

  /**
   * The user's last name.
   */
  lastName?: string | undefined;

  /**
   * The time when this user was created.
   */
  createdOn: Date | undefined;
}
