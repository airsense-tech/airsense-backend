import express from 'express';
import { HttpRequest } from '../../api';
import { RequestTransformer } from '../request-transformer';

/**
 * The request transformer implementation for Express.
 */
export class ExpressRequestTransformer implements RequestTransformer<express.Request> {
  /**
   * Transforms an Express request into an API request.
   *
   * @param request The Express request.
   *
   * @returns The API request.
   */
  public transform(request: express.Request): HttpRequest {
    const outRequest = new HttpRequest();

    outRequest.method = request.method;
    outRequest.path = request.path;

    this.transformHeaders(request, outRequest);
    this.transformQueryParams(request, outRequest);
    this.transformPathParams(request, outRequest);

    outRequest.body = request.body;

    return outRequest;
  }

  /**
   * Extracts the headers from the request and adds them to the out request.
   *
   * @param request The request to transform.
   * @param outRequest The out request to transform into.
   */
  private transformHeaders(request: express.Request, outRequest: HttpRequest) {
    for (const [name, value] of Object.entries(request.headers)) {
      if (!value) {
        continue;
      }

      if (Array.isArray(value)) {
        outRequest.headers.set(name, value);
      } else {
        outRequest.headers.set(name, [value]);
      }
    }
  }

  /**
   * Extracts the query parameters from the request and adds them to the out request.
   *
   * @param request The request to transform.
   * @param outRequest The out request to transform into.
   */
  private transformQueryParams(request: express.Request, outRequest: HttpRequest) {
    for (const key of Object.keys(request.query)) {
      const value = request.query[key];

      if (!value) {
        continue;
      }

      if (Array.isArray(value)) {
        outRequest.queryParams.set(
          key,
          value.map((v) => v.toString()),
        );
      } else {
        outRequest.queryParams.set(key, [value.toString()]);
      }
    }
  }

  /**
   * Extracts the path parameters from the request and adds them to the out request.
   *
   * @param request The request to transform.
   * @param outRequest The out request to transform into.
   */
  private transformPathParams(request: express.Request, outRequest: HttpRequest) {
    for (const [name, value] of Object.entries(request.params)) {
      outRequest.pathParams.set(name, value);
    }
  }
}
