import * as z from 'zod';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { CakeMethodDef, CakeService } from './schema';

export type CakeClient<TService extends CakeService> = {
  [TKey in keyof TService]: TService[TKey] extends CakeMethodDef<
    infer TReq,
    infer TRes
  >
    ? (
        req: z.infer<z.ZodObject<TReq>>,
        config?: AxiosRequestConfig
      ) => Promise<AxiosResponse<z.infer<z.ZodObject<TRes>>>>
    : never;
};

export const createClient = <TService extends CakeService>(
  service: TService,
  baseURL: string,
  defaultConfig?: AxiosRequestConfig
): CakeClient<TService> => {
  const axiosClient = axios.create({ baseURL });

  const makeHandler = (methodName: keyof TService) => {
    const method = service[methodName];
    const requestSchema = z.object(method.request(z));
    const responseSchema = z.object(method.response(z)).nonstrict();

    return async (req: unknown, config?: AxiosRequestConfig) => {
      const requestBody = await requestSchema.parseAsync(req);
      const deserializeResponse = async (res: AxiosResponse) => {
        if (res.status < 200 || res.status >= 300) {
          return res;
        }

        try {
          return {
            ...res,
            data: await responseSchema.parseAsync(res.data),
          };
        } catch (err) {
          throw new Error(
            `error parsing server response. are you using the up to date schemas? (original message: ${err?.message})`
          );
        }
      };

      switch (method.method) {
        case 'GET': {
          return axiosClient
            .get(method.path, {
              ...defaultConfig,
              ...config,
              params: {
                ...defaultConfig?.params,
                ...config?.params,
                args: JSON.stringify(requestBody),
              },
            })
            .then(deserializeResponse);
        }
        case 'POST': {
          return axiosClient
            .post(method.path, requestBody, { ...defaultConfig, ...config })
            .then(deserializeResponse);
        }
        case 'PUT': {
          return axiosClient
            .put(method.path, requestBody, { ...defaultConfig, ...config })
            .then(deserializeResponse);
        }
        case 'PATCH': {
          return axiosClient
            .patch(method.path, requestBody, { ...defaultConfig, ...config })
            .then(deserializeResponse);
        }
        case 'DELETE': {
          return axiosClient
            .delete(method.path, {
              ...defaultConfig,
              ...config,
              params: {
                ...defaultConfig?.params,
                ...config?.params,
                args: JSON.stringify(requestBody),
              },
            })
            .then(deserializeResponse);
        }
        default: {
          throw new Error(`unknown method "${method.method}"`);
        }
      }
    };
  };

  const clientInstance: any = {};
  Object.keys(service).forEach(
    (methodName) => (clientInstance[methodName] = makeHandler(methodName))
  );

  return clientInstance;
};
