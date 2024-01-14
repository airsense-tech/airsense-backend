import { IRouterHandler } from './router-handler';

/**
 * Represents a router.
 * A router is responsible for routing requests to the correct handler.
 */
export interface IRouter {
  /**
   * Registers a new route.
   *
   * @param method The HTTP method.
   * @param path The endpoint path.
   * @param handler The endpoint handler.
   */
  route(method: string, path: string, handler: IRouterHandler): void;

  /**
   * Runs the router.
   *
   * @param port The port to run the router on.
   * @param onStarted A callback that is called when the router has started.
   */
  run(port: number | string, onStarted: () => void): void;
}
