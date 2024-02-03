import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { HttpMethod } from '../../api';
import { IRouter } from '../router';
import { IRouterHandler } from '../router-handler';
import { ExpressRequestTransformer } from './express-request-transformer';
import { ExpressResponseTransformer } from './express-response-transformer';

/**
 * Implementation of a router for Express.
 */
export class ExpressRouter implements IRouter {
  /**
   * The Express application.
   */
  private readonly app: express.Application;

  /**
   * The request transformer.
   */
  private readonly requestTransformer: ExpressRequestTransformer;

  /**
   * The response transformer.
   */
  private readonly responseTransformer: ExpressResponseTransformer;

  /**
   * Constructor.
   */
  constructor() {
    this.app = express();
    this.app.use(cors());
    this.requestTransformer = new ExpressRequestTransformer();
    this.responseTransformer = new ExpressResponseTransformer();
  }

  /**
   * Registers a new route.
   *
   * @param method The HTTP method.
   * @param path The endpoint path.
   * @param handler The endpoint handler.
   */
  public route(method: string, path: string, handler: IRouterHandler): void {
    switch (method) {
      case HttpMethod.GET:
        this.get(path, handler);
        break;

      case HttpMethod.POST:
        this.post(path, handler);
        break;

      case HttpMethod.PUT:
        this.put(path, handler);
        break;

      case HttpMethod.PATCH:
        this.patch(path, handler);
        break;

      case HttpMethod.DELETE:
        this.delete(path, handler);
        break;
    }
  }

  /**
   * Runs the router.
   *
   * @param port The port to run the router on.
   * @param onStarted A callback that is called when the router has started.
   */
  public run(port: number | string, onStarted: () => void): void {
    this.app.listen(port, onStarted);
  }

  /**
   * Registers a route with the HTTP method GET.
   *
   * @param path The path to register.
   * @param handler The path handler.
   */
  private get(path: string, handler: IRouterHandler): void {
    this.app.get(path, bodyParser.json(), async (req: express.Request, res: express.Response) => {
      await this.handle(req, res, handler);
    });
  }

  /**
   * Registers a route with the HTTP method POST.
   *
   * @param path The path to register.
   * @param handler The path handler.
   */
  private post(path: string, handler: IRouterHandler): void {
    this.app.post(path, bodyParser.json(), async (req: express.Request, res: express.Response) => {
      await this.handle(req, res, handler);
    });
  }

  /**
   * Registers a route with the HTTP method PUT.
   *
   * @param path The path to register.
   * @param handler The path handler.
   */
  private put(path: string, handler: IRouterHandler): void {
    this.app.put(path, bodyParser.json(), async (req: express.Request, res: express.Response) => {
      await this.handle(req, res, handler);
    });
  }

  /**
   * Registers a route with the HTTP method PATCH.
   *
   * @param path The path to register.
   * @param handler The path handler.
   */
  private patch(path: string, handler: IRouterHandler): void {
    this.app.patch(path, bodyParser.json(), async (req: express.Request, res: express.Response) => {
      await this.handle(req, res, handler);
    });
  }

  /**
   * Registers a route with the HTTP method DELETE.
   *
   * @param path The path to register.
   * @param handler The path handler.
   */
  private delete(path: string, handler: IRouterHandler): void {
    this.app.delete(path, bodyParser.json(), async (req: express.Request, res: express.Response) => {
      await this.handle(req, res, handler);
    });
  }

  /**
   * The internal request handler.
   *
   * @param request The request to handle.
   * @param response The response to return.
   * @param handler The router handler.
   */
  private async handle(request: express.Request, response: express.Response, handler: IRouterHandler): Promise<void> {
    const req = this.requestTransformer.transform(request);
    const res = await handler.execute(req);

    this.responseTransformer.transform(res, response);
  }
}
