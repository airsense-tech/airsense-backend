import { HttpRequest } from '../api';

/**
 * Represents a request transformer.
 * A request transformer transforms a request from one type to an API request.
 *
 * @template TInRequest The type of the request to transform.
 */
export interface RequestTransformer<TInRequest> {
  /**
   * Transforms the specified request to an API request.
   *
   * @param request The request to transform.
   *
   * @returns The API request.
   */
  transform(request: TInRequest): HttpRequest;
}
