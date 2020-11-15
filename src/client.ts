import * as z from 'zod';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
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

export const client = <TService extends CakeService>(
  service: TService,
  baseUrl: string
): CakeClient<TService> => {
  return null as any;
};
