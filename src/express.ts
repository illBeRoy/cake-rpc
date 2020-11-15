import * as z from 'zod';
import { json, Request, Response, Router } from 'express';
import type { CakeMethodDef, CakeService } from './schema';

export type CakeServerImplementation<TService extends CakeService> = {
  [TKey in keyof TService]: TService[TKey] extends CakeMethodDef<
    infer TReq,
    infer TRes
  >
    ? CakeServerExpressRoute<TReq, TRes>
    : never;
};

export type CakeServerExpressRoute<
  TReq extends Record<string, z.ZodTypeAny>,
  TRes extends Record<string, z.ZodTypeAny>
> = (
  req: CakeServerRequest<TReq>,
  res: CakeServerResponse<TRes>
) => unknown | Promise<unknown>;

export interface CakeServerRequest<TReq extends Record<string, z.ZodTypeAny>>
  extends Request {
  body: z.infer<z.ZodObject<TReq>>;
  rawJsonBody: unknown;
}

export interface CakeServerResponse<TRes extends Record<string, z.ZodTypeAny>>
  extends Response {
  json(data: z.infer<z.ZodObject<TRes>>): this;
  send(data?: z.infer<z.ZodObject<TRes>>): this;
}

export const createRouter = <TService extends CakeService>(
  service: TService,
  implementation: CakeServerImplementation<TService>
) => {
  const handleRequest = (
    method: CakeMethodDef<any, any>,
    handler: CakeServerExpressRoute<any, any>
  ) => {
    const requestSchema = z.object(method.request(z));

    return async (req: Request, res: Response, next) => {
      let parsedReqBody;
      try {
        parsedReqBody = await requestSchema.parseAsync(
          typeof req.query.args === 'string'
            ? JSON.parse(req.query.args)
            : req.body || {}
        );
      } catch (err) {
        res.status(400).send(err?.message ?? 'invalid input');
        return;
      }

      try {
        (req as any).rawJsonBody = req.body;
        req.body = parsedReqBody;
        await handler(req as any, res);
      } catch (err) {
        next(err);
      }
    };
  };

  const router = Router();
  router.use(json());

  Object.keys(service).forEach((methodName) => {
    const method = service[methodName];
    const handler = implementation[methodName];

    switch (method.method) {
      case 'GET': {
        router.get(method.path, handleRequest(method, handler));
        break;
      }
      case 'POST': {
        router.post(method.path, handleRequest(method, handler));
        break;
      }
      case 'PUT': {
        router.put(method.path, handleRequest(method, handler));
        break;
      }
      case 'PATCH': {
        router.patch(method.path, handleRequest(method, handler));
        break;
      }
      case 'DELETE': {
        router.delete(method.path, handleRequest(method, handler));
        break;
      }
      default: {
        throw new Error(`unknown method "${method.method}"`);
      }
    }
  });

  return router;
};
