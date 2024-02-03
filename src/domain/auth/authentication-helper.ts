import jwt from 'jsonwebtoken';
import { HttpRequest } from '../../core/api';

/**
 * The authentication helper is responsible for signing and verifying authentication tokens.
 */
export class AuthenticationHelper {
  /**
   * The secret used for token signing.
   */
  private readonly secret: string;

  /**
   * Constructor.
   * F
   * @param secret The secret used for token signing.
   */
  constructor(secret: string) {
    this.secret = secret;
  }

  /**
   * Creates a new signed authentication token.
   *
   * @param payload The token payload.
   *
   * @returns The generated token.
   */
  public sign(payload: object, expiresIn: string | undefined = undefined): string {
    if (expiresIn) {
      return jwt.sign(payload, this.secret, { expiresIn: expiresIn });
    }

    return jwt.sign(payload, this.secret);
  }

  /**
   * Verifies, whether a given request is authenticated.
   *
   * @param request The request to check.
   *
   * @returns The token payload, if the request is authenticated, undefined otherwise.
   */
  public verifyRequest<TPayload>(request: HttpRequest): TPayload {
    const authHeader = request.header('authorization');

    if (!authHeader) {
      return undefined as TPayload;
    }

    if (authHeader.length < 1) {
      return undefined as TPayload;
    }

    let token = authHeader[0];

    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }

    let payload = undefined;

    try {
      payload = jwt.verify(token, this.secret);
    } catch (error) {
      return undefined as TPayload;
    }

    return payload as TPayload;
  }
}
