/**
 * Represents an API request.
 */
export class HttpRequest {
  /**
   * The request method.
   */
  public method: string | undefined;

  /**
   * The request path.
   */
  public path: string | undefined;

  /**
   * The request headers.
   */
  public headers: Map<string, string[]> = new Map<string, string[]>();

  /**
   * The query parameters.
   */
  public queryParams: Map<string, string[]> = new Map<string, string[]>();

  /**
   * The path parameters.
   */
  public pathParams: Map<string, string> = new Map<string, string>();

  /**
   * The request body.
   */
  public body: unknown;

  /**
   * Gets the value of the specified header.
   *
   * @param name The name of the header.
   *
   * @returns The value of the header.
   */
  public header(name: string): string[] | undefined {
    return this.headers.get(name);
  }

  /**
   * Gets the value of the specified query parameter.
   *
   * @param name The name of the query parameter.
   *
   * @returns The value of the query parameter.
   */
  public queryParam(name: string): string[] | undefined {
    return this.queryParams.get(name);
  }

  /**
   * Gets the value of the specified path parameter.
   *
   * @param name The name of the path parameter.
   *
   * @returns The value of the path parameter.
   */
  public pathParam(name: string): string | undefined {
    return this.pathParams.get(name);
  }
}
