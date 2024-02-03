import { ConsoleLogDevice } from './devices/console-log-device';
import { FileLogDevice } from './devices/file-log-device';
import { Logger } from './logger';

/**
 * The default global logger.
 */
export class Log {
  /**
   * The logger instance.
   */
  private static readonly logger = new Logger();

  /**
   * Static constructor.
   */
  static {
    const console = new ConsoleLogDevice();
    const file = new FileLogDevice('./logs');

    console.open();
    file.open();

    this.logger.addDevice(console);
    this.logger.addDevice(file);
  }

  /**
   * Logs a message with the trace log level.
   *
   * @param messages The messages to log.
   */
  public static trace(...messages: unknown[]): void {
    this.logger.trace(...messages);
  }

  /**
   * Logs a message with the debug log level.
   *
   * @param messages The messages to log.
   */
  public static debug(...messages: unknown[]): void {
    this.logger.debug(...messages);
  }

  /**
   * Logs a message with the info log level.
   *
   * @param messages The messages to log.
   */
  public static info(...messages: unknown[]): void {
    this.logger.info(...messages);
  }

  /**
   * Logs a message with the warn log level.
   *
   * @param messages The messages to log.
   */
  public static warn(...messages: unknown[]): void {
    this.logger.warn(...messages);
  }

  /**
   * Logs a message with the error log level.
   *
   * @param messages The messages to log.
   */
  public static error(...messages: unknown[]): void {
    this.logger.error(...messages);
  }
}
