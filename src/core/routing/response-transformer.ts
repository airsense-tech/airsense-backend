import { HttpResponse } from '../api';

/**
 * Represents a response transformer.
 * A response transformer transforms a response from one type to an API response.
 *
 * @template TOutResponse The type of the response to transform.
 */
export interface ResponseTransformer<TOutResponse> {
  /**
   * Transforms the specified API response to another response type.
   *
   * @param response The response to transform.
   * @param out The response to transform into.
   */
  transform(response: HttpResponse, out: TOutResponse): void;
}
