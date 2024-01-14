/**
 * Contains string utility functions.
 */
export class StringUtils {
  /**
   * Generates a random string of ASCII characters.
   *
   * @param length The length of the string to be generated.
   *
   * @returns The randomly generated string.
   */
  public static random(length: number): string {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let index = 0; index < length; ++index) {
      const rand = Math.random() * characters.length;
      const randIndex = Math.floor(rand);

      result += characters.charAt(randIndex);
    }

    return result;
  }
}
