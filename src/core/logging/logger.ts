import { DateUtils } from '../utils/date-utils';
import { ILogDevice } from './log-device';
import { LogLevel } from './log-level';

/**
 * Represents a logger.
 */
export class Logger {
  /**
   * The devices to log to.
   */
  private devices: ILogDevice[] = [];

  /**
   * Adds a log device to this logger.
   *
   * @param device The device to add.
   */
  public addDevice(device: ILogDevice): void {
    this.devices.push(device);
  }

  /**
   * Logs a message with the trace log level.
   *
   * @param messages The messages to log.
   */
  public trace(...messages: unknown[]): void {
    this.logWithLevel(LogLevel.Trace, ...messages);
  }

  /**
   * Logs a message with the debug log level.
   *
   * @param messages The messages to log.
   */
  public debug(...messages: unknown[]): void {
    this.logWithLevel(LogLevel.Debug, ...messages);
  }

  /**
   * Logs a message with the info log level.
   *
   * @param messages The messages to log.
   */
  public info(...messages: unknown[]): void {
    this.logWithLevel(LogLevel.Info, ...messages);
  }

  /**
   * Logs a message with the warn log level.
   *
   * @param messages The messages to log.
   */
  public warn(...messages: unknown[]): void {
    this.logWithLevel(LogLevel.Warn, ...messages);
  }

  /**
   * Logs a message with the error log level.
   *
   * @param messages The messages to log.
   */
  public error(...messages: unknown[]): void {
    this.logWithLevel(LogLevel.Error, ...messages);
  }

  /**
   * Logs a message to all registered devices, prefixed with the current date time and log level.
   *
   * @param messages The messages to log.
   */
  private logWithLevel(level: LogLevel, ...messages: unknown[]): void {
    const datePrefix = this.formattedDate();
    const levelPrefix = this.formattedLevel(level);

    for (const device of this.devices) {
      device.write(level, datePrefix, levelPrefix, ...messages);
    }
  }

  /**
   * Gets the current date time in the format: [yyyy-mm-dd hh:mm:ss].
   *
   * @returns The current date time in the format: [yyyy-mm-dd hh:mm:ss].
   */
  private formattedDate(): string {
    const date = new Date();
    const [year, month, day, hour, minute, second] = DateUtils.ymdhms(date);

    return `[${year}-${month}-${day} ${hour}:${minute}:${second}]`;
  }

  /**
   * Gets the current log level in the format: [level].
   *
   * @param level The log level to format.
   *
   * @returns The current log level in the format: [level].
   */
  private formattedLevel(level: LogLevel): string {
    let levelString = LogLevel[level];

    levelString = levelString.toLowerCase();
    levelString = levelString.padStart(5, ' ');

    return `[${levelString}]`;
  }
}
