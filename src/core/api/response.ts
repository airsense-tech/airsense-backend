/**
 * Represents a HTTP response.
 */
export interface IHttpResponse {
  /**
   * The status code.
   */
  statusCode: number;

  /**
   * The request headers.
   */
  headers?: Map<string, string>;

  /**
   * The request body.
   */
  body?: unknown;
}

/**
 * Represents a HTTP response.
 */
export class HttpResponse implements IHttpResponse {
  /**
   * The status code.
   */
  public statusCode = 500;

  /**
   * The request headers.
   */
  public headers: Map<string, string> = new Map<string, string>();

  /**
   * The request body.
   */
  public body: unknown;
}
