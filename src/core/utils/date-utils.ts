export class DateUtils {
  /**
   * Gets the individual components of a date.
   * The components are returned in the following order: year, month, day, hour, minutes, seconds.
   *
   * @remarks
   *
   * Each component is padded with a leading zero if it is less than 10.
   *
   * @returns The individual components of the current date and time.
   */
  public static ymdhms(date: Date): [string, string, string, string, string, string] {
    const year = date.toLocaleString('default', { year: 'numeric' });
    const month = date.toLocaleString('default', { month: '2-digit' });
    const day = date.toLocaleString('default', { day: '2-digit' });

    const hour = date.toLocaleString('default', { hour: '2-digit', hour12: false }).padStart(2, '0');
    const minute = date.toLocaleString('default', { minute: '2-digit' }).padStart(2, '0');
    const second = date.toLocaleString('default', { second: '2-digit' }).padStart(2, '0');

    return [year, month, day, hour, minute, second];
  }
}
