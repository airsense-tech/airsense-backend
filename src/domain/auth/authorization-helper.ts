import { UserRights } from './user-rights';

/**
 * The authorization helper.
 */
export class AuthorizationHelper {
  /**
   * Checks whether a user is entitled with the given rights.
   *
   * @param userRights The rights of the user.
   * @param requiredRights The rights which are required.
   *
   * @returns True, if the user is entitled with the required rights, false otherwise.
   */
  public isEntitledWith(userRights: UserRights[], ...requiredRights: UserRights[]): boolean {
    if (!userRights) {
      return false;
    }

    if (!requiredRights) {
      return true;
    }

    for (const right of requiredRights) {
      const isContained = userRights.includes(right);

      if (!isContained) {
        return false;
      }
    }

    return true;
  }
}
