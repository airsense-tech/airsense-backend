import { ILogDevice } from '../log-device';
import { LogLevel } from '../log-level';

/**
 * Represents a log device that logs to the console.
 */
export class ConsoleLogDevice implements ILogDevice {
  /**
   * Opens the log device.
   */
  public open(): void {}

  /**
   * Closes the log device.
   */
  public close(): void {}

  /**
   * Writes a series of messages to the log device.
   *
   * @param messages The messages to log.
   */
  public write(level: LogLevel, ...messages: unknown[]): void {
    switch (level) {
      case LogLevel.Trace:
        this.writeInternal(console.trace, ...messages);
        break;

      case LogLevel.Debug:
        this.writeInternal(console.debug, ...messages);
        break;

      case LogLevel.Info:
        this.writeInternal(console.info, ...messages);
        break;

      case LogLevel.Warn:
        this.writeInternal(console.warn, ...messages);
        break;

      case LogLevel.Error:
        this.writeInternal(console.error, ...messages);
        break;

      default:
        break;
    }
  }

  /**
   * Writes a series of messages to the log device.
   *
   * @param functor The functor to use.
   * @param messages The messages to log.
   */
  private writeInternal(functor: (...messages: unknown[]) => void, ...messages: unknown[]): void {
    functor(...messages);
  }
}
