import { LogLevel } from './log-level';

/**
 * Represents a log device.
 */
export interface ILogDevice {
  /**
   * Opens the log device.
   */
  open(): void;

  /**
   * Closes the log device.
   */
  close(): void;

  /**
   * Writes a series of messages to the log device.
   *
   * @param messages The messages to log.
   */
  write(level: LogLevel, ...messages: unknown[]): void;
}
