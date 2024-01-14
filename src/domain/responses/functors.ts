import { IHttpResponse } from '../../core/api';

export function Unauthorized(): IHttpResponse {
  return {
    statusCode: 401,
    body: {
      message: 'User unauthorized.',
      details: 'Missing or illegal token.',
    },
  };
}

export function Forbidden(): IHttpResponse {
  return {
    statusCode: 403,
    body: {
      message: 'Forbidden',
      details: 'User is not allowed to access this resource.',
    },
  };
}

export function IllegalRequestBody(): IHttpResponse {
  return {
    statusCode: 400,
    body: {
      message: 'Illegal request body.',
    },
  };
}

export function IllegalRequestBodyf(message: unknown): IHttpResponse {
  return {
    statusCode: 400,
    body: {
      message: 'Illegal request body.',
      details: message,
    },
  };
}

export function ResourceNotFound(): IHttpResponse {
  return {
    statusCode: 404,
    body: {
      message: 'Resource not found.',
    },
  };
}

export function ResourceNotFoundf(message: unknown): IHttpResponse {
  return {
    statusCode: 404,
    body: {
      message: 'Resource not found.',
      details: message,
    },
  };
}

export function InternalServerError(): IHttpResponse {
  return {
    statusCode: 500,
    body: {
      message: 'Internal server error.',
    },
  };
}
