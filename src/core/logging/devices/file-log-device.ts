import fs from 'fs';
import { ILogDevice, LogLevel } from '..';
import { DateUtils } from '../../utils';

export class FileLogDevice implements ILogDevice {
  /**
   * The maximum log file size (in bytes).
   * The default value is 10 MB.
   */
  public maxFileSize = 1024 * 1024 * 10;

  /**
   * The current log directory.
   */
  private directory: string;

  /**
   * The current file stream.
   */
  private file: number | undefined;

  /**
   * The number of bytes written to the current file.
   */
  private bytesWritten = 0;

  /**
   * Constructor.
   *
   * @param path The file to log to.
   */
  constructor(directory: string) {
    this.directory = directory;
  }

  /**
   * Opens the log device.
   */
  public open(): void {
    fs.mkdirSync(this.directory, { recursive: true });
    this.rotate();
  }

  /**
   * Closes the log device.
   */
  public close(): void {
    if (this.file) {
      fs.closeSync(this.file);
    }
  }

  /**
   * Writes a series of messages to the log device.
   *
   * @param messages The messages to log.
   */
  public write(level: LogLevel, ...messages: unknown[]): void {
    if (!this.file) {
      throw new Error('File stream is not initialized.');
    }

    const log = messages.join(' ') + '\n';
    const buffer = Buffer.from(log);

    fs.writeSync(this.file, buffer, 0, buffer.length);
    this.bytesWritten += buffer.length;

    if (this.bytesWritten > this.maxFileSize) {
      this.rotate();
    }
  }

  /**
   * Rotates the log file.
   */
  private rotate(): void {
    if (this.file) {
      fs.closeSync(this.file);
    }

    const date = new Date();
    const [year, month, day, hour, minute, second] = DateUtils.ymdhms(date);

    const newFile = `${this.directory}/${year}-${month}-${day}_${hour}-${minute}-${second}.log`;

    this.bytesWritten = 0;
    this.file = fs.openSync(newFile, 'w');
  }
}
