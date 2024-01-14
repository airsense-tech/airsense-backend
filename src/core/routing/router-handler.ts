import { HttpRequest, IHttpResponse } from '../api';

/**
 * Represents a router handler.
 */
export interface IRouterHandler {
  /**
   * Executes the handler.
   *
   * @param request The request.
   * @param response The response.
   */
  execute(request: HttpRequest): Promise<IHttpResponse>;
}
