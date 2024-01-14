import express from 'express';
import { IHttpResponse } from '../../api';
import { ResponseTransformer } from '../response-transformer';

/**
 * Implementation of a response transformer for Express.
 */
export class ExpressResponseTransformer implements ResponseTransformer<express.Response> {
  /**
   * Transforms an API response into an Express response.
   *
   * @param response The API response.
   * @param outResponse The Express response.
   */
  public async transform(response: IHttpResponse, outResponse: express.Response): Promise<void> {
    outResponse.status(response.statusCode);

    if (response.headers) {
      for (const [name, value] of response.headers) {
        outResponse.setHeader(name, value);
      }
    }

    outResponse.send(response.body);
  }
}
