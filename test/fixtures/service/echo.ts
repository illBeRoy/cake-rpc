import { createService } from '../../../src';

export const echoService = createService({
  echo: {
    path: '/echo',
    method: 'POST',
    request: (z) => ({
      reqText: z.string(),
    }),
    response: (z) => ({
      resText: z.string(),
    }),
  },
});
