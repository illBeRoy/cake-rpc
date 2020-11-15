import nock from 'nock';
import { equal, expect, rejectedWith } from 'twobees';
import { Chance } from 'chance';
import { createService } from '../../src';
import { createClient } from '../../src/client';

describe('cake client factory', () => {
  afterEach(() => nock.cleanAll());

  const myService = createService({
    myGetMethod: {
      path: `/foo`,
      method: 'GET',
      request: (z) => ({
        name: z.string().min(3),
        age: z.number().int().positive(),
      }),
      response: (z) => ({ id: z.string().uuid() }),
    },
    myPostMethod: {
      path: `/bar`,
      method: 'POST',
      request: (z) => ({
        name: z.string().min(3),
        age: z.number().int().positive(),
      }),
      response: (z) => ({ id: z.string().uuid() }),
    },
    myPutMethod: {
      path: `/buzz`,
      method: 'PUT',
      request: (z) => ({
        name: z.string().min(3),
        age: z.number().int().positive(),
      }),
      response: (z) => ({ id: z.string().uuid() }),
    },
    myPatchMethod: {
      path: `/pasta`,
      method: 'PATCH',
      request: (z) => ({
        name: z.string().min(3),
        age: z.number().int().positive(),
      }),
      response: (z) => ({ id: z.string().uuid() }),
    },
    myDeleteMethod: {
      path: `/pizza`,
      method: 'DELETE',
      request: (z) => ({
        name: z.string().min(3),
        age: z.number().int().positive(),
      }),
      response: (z) => ({ id: z.string().uuid() }),
    },
  });

  describe('invoking GET methods', () => {
    it('should send the request payload serialized in the request and parse the response', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };
      const res = {
        id: Chance().guid(),
      };

      nock(baseUrl)
        .get('/foo')
        .query((q) => q.args === JSON.stringify(req))
        .reply(200, res);

      const myServiceClient = createClient(myService, baseUrl);
      const response = await myServiceClient.myGetMethod(req);
      expect(response.data).toBe(equal(res));
    });

    it('should not send the request payload, if it does not pass schema validation', async () => {
      const baseUrl = Chance().url();
      const req = {
        age: Chance().integer({ min: 1 }),
      };

      const myServiceClient = createClient(myService, baseUrl);
      //eslint-disable-next-line
      //@ts-expect-error
      await expect(myServiceClient.myGetMethod(req)).toBe(
        rejectedWith('invalid_type at name')
      );
    });

    it('should reject the response if it does not pass schema validation', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };
      const res = {
        id: Chance().string(),
      };

      nock(baseUrl)
        .get('/foo')
        .query((q) => q.args === JSON.stringify(req))
        .reply(200, res);

      const myServiceClient = createClient(myService, baseUrl);
      await expect(myServiceClient.myGetMethod(req)).toBe(
        rejectedWith('Invalid uuid')
      );
    });

    it('should throw http errors back as is', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      nock(baseUrl)
        .get('/foo')
        .query((q) => q.args === JSON.stringify(req))
        .reply(404);

      const myServiceClient = createClient(myService, baseUrl);
      await expect(myServiceClient.myGetMethod(req)).toBe(rejectedWith('404'));
    });

    it('should support passing axios default config via factory', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      nock(baseUrl)
        .get('/foo')
        .query((q) => q.args === JSON.stringify(req))
        .reply(404);

      const myServiceClient = createClient(myService, baseUrl, {
        validateStatus: () => true,
      });
      const response = await myServiceClient.myGetMethod(req);
      expect(response.status).toBe(equal(404));
    });

    it('should support passing axios config to method', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      nock(baseUrl)
        .get('/foo')
        .query((q) => q.args === JSON.stringify(req))
        .reply(404);

      const myServiceClient = createClient(myService, baseUrl);
      const response = await myServiceClient.myGetMethod(req, {
        validateStatus: () => true,
      });
      expect(response.status).toBe(equal(404));
    });

    it('should accept the response if it has extra properties, as long as the ones expected by the local schema are confirmed', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };
      const res = {
        id: Chance().guid(),
        extra: true,
      };

      nock(baseUrl)
        .get('/foo')
        .query((q) => q.args === JSON.stringify(req))
        .reply(200, res);

      const myServiceClient = createClient(myService, baseUrl);
      const response = await myServiceClient.myGetMethod(req);
      //eslint-disable-next-line
      //@ts-expect-error
      expect(response.data).toBe(equal(res));
    });
  });

  describe('invoking POST methods', () => {
    it('should send the request payload serialized in the body and parse the response', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };
      const res = {
        id: Chance().guid(),
      };

      nock(baseUrl).post('/bar', req).reply(200, res);

      const myServiceClient = createClient(myService, baseUrl);
      const response = await myServiceClient.myPostMethod(req);
      expect(response.data).toBe(equal(res));
    });

    it('should not send the request payload, if it does not pass schema validation', async () => {
      const baseUrl = Chance().url();
      const req = {
        age: Chance().integer({ min: 1 }),
      };

      const myServiceClient = createClient(myService, baseUrl);
      //eslint-disable-next-line
      //@ts-expect-error
      await expect(myServiceClient.myPostMethod(req)).toBe(
        rejectedWith('invalid_type at name')
      );
    });

    it('should reject the response if it does not pass schema validation', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };
      const res = {
        id: Chance().string(),
      };

      nock(baseUrl).post('/bar', req).reply(200, res);

      const myServiceClient = createClient(myService, baseUrl);
      await expect(myServiceClient.myPostMethod(req)).toBe(
        rejectedWith('Invalid uuid')
      );
    });

    it('should throw http errors back as is', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      nock(baseUrl).post('/bar', req).reply(404);

      const myServiceClient = createClient(myService, baseUrl);
      await expect(myServiceClient.myPostMethod(req)).toBe(rejectedWith('404'));
    });

    it('should support passing axios default config via factory', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      nock(baseUrl).post('/bar', req).reply(404);

      const myServiceClient = createClient(myService, baseUrl, {
        validateStatus: () => true,
      });
      const response = await myServiceClient.myPostMethod(req);
      expect(response.status).toBe(equal(404));
    });

    it('should support passing axios config to method', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      nock(baseUrl).post('/bar', req).reply(404);

      const myServiceClient = createClient(myService, baseUrl);
      const response = await myServiceClient.myPostMethod(req, {
        validateStatus: () => true,
      });
      expect(response.status).toBe(equal(404));
    });

    it('should accept the response if it has extra properties, as long as the ones expected by the local schema are confirmed', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };
      const res = {
        id: Chance().guid(),
        extra: true,
      };

      nock(baseUrl).post('/bar', req).reply(200, res);

      const myServiceClient = createClient(myService, baseUrl);
      const response = await myServiceClient.myPostMethod(req);
      //eslint-disable-next-line
      //@ts-expect-error
      expect(response.data).toBe(equal(res));
    });
  });

  describe('invoking PUT methods', () => {
    it('should send the request payload serialized in the body and parse the response', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };
      const res = {
        id: Chance().guid(),
      };

      nock(baseUrl).put('/buzz', req).reply(200, res);

      const myServiceClient = createClient(myService, baseUrl);
      const response = await myServiceClient.myPutMethod(req);
      expect(response.data).toBe(equal(res));
    });

    it('should not send the request payload, if it does not pass schema validation', async () => {
      const baseUrl = Chance().url();
      const req = {
        age: Chance().integer({ min: 1 }),
      };

      const myServiceClient = createClient(myService, baseUrl);
      //eslint-disable-next-line
      //@ts-expect-error
      await expect(myServiceClient.myPutMethod(req)).toBe(
        rejectedWith('invalid_type at name')
      );
    });

    it('should reject the response if it does not pass schema validation', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };
      const res = {
        id: Chance().string(),
      };

      nock(baseUrl).put('/buzz', req).reply(200, res);

      const myServiceClient = createClient(myService, baseUrl);
      await expect(myServiceClient.myPutMethod(req)).toBe(
        rejectedWith('Invalid uuid')
      );
    });

    it('should throw http errors back as is', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      nock(baseUrl).put('/buzz', req).reply(404);

      const myServiceClient = createClient(myService, baseUrl);
      await expect(myServiceClient.myPutMethod(req)).toBe(rejectedWith('404'));
    });

    it('should support passing axios default config via factory', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      nock(baseUrl).put('/buzz', req).reply(404);

      const myServiceClient = createClient(myService, baseUrl, {
        validateStatus: () => true,
      });
      const response = await myServiceClient.myPutMethod(req);
      expect(response.status).toBe(equal(404));
    });

    it('should support passing axios config to method', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      nock(baseUrl).put('/buzz', req).reply(404);

      const myServiceClient = createClient(myService, baseUrl);
      const response = await myServiceClient.myPutMethod(req, {
        validateStatus: () => true,
      });
      expect(response.status).toBe(equal(404));
    });

    it('should accept the response if it has extra properties, as long as the ones expected by the local schema are confirmed', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };
      const res = {
        id: Chance().guid(),
        extra: true,
      };

      nock(baseUrl).put('/buzz', req).reply(200, res);

      const myServiceClient = createClient(myService, baseUrl);
      const response = await myServiceClient.myPutMethod(req);
      //eslint-disable-next-line
      //@ts-expect-error
      expect(response.data).toBe(equal(res));
    });
  });

  describe('invoking PATCH methods', () => {
    it('should send the request payload serialized in the body and parse the response', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };
      const res = {
        id: Chance().guid(),
      };

      nock(baseUrl).patch('/pasta', req).reply(200, res);

      const myServiceClient = createClient(myService, baseUrl);
      const response = await myServiceClient.myPatchMethod(req);
      expect(response.data).toBe(equal(res));
    });

    it('should not send the request payload, if it does not pass schema validation', async () => {
      const baseUrl = Chance().url();
      const req = {
        age: Chance().integer({ min: 1 }),
      };

      const myServiceClient = createClient(myService, baseUrl);
      //eslint-disable-next-line
      //@ts-expect-error
      await expect(myServiceClient.myPatchMethod(req)).toBe(
        rejectedWith('invalid_type at name')
      );
    });

    it('should reject the response if it does not pass schema validation', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };
      const res = {
        id: Chance().string(),
      };

      nock(baseUrl).patch('/pasta', req).reply(200, res);

      const myServiceClient = createClient(myService, baseUrl);
      await expect(myServiceClient.myPatchMethod(req)).toBe(
        rejectedWith('Invalid uuid')
      );
    });

    it('should throw http errors back as is', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      nock(baseUrl).patch('/pasta', req).reply(404);

      const myServiceClient = createClient(myService, baseUrl);
      await expect(myServiceClient.myPatchMethod(req)).toBe(
        rejectedWith('404')
      );
    });

    it('should support passing axios default config via factory', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      nock(baseUrl).patch('/pasta', req).reply(404);

      const myServiceClient = createClient(myService, baseUrl, {
        validateStatus: () => true,
      });
      const response = await myServiceClient.myPatchMethod(req);
      expect(response.status).toBe(equal(404));
    });

    it('should support passing axios config to method', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      nock(baseUrl).patch('/pasta', req).reply(404);

      const myServiceClient = createClient(myService, baseUrl);
      const response = await myServiceClient.myPatchMethod(req, {
        validateStatus: () => true,
      });
      expect(response.status).toBe(equal(404));
    });

    it('should accept the response if it has extra properties, as long as the ones expected by the local schema are confirmed', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };
      const res = {
        id: Chance().guid(),
        extra: true,
      };

      nock(baseUrl).patch('/pasta', req).reply(200, res);

      const myServiceClient = createClient(myService, baseUrl);
      const response = await myServiceClient.myPatchMethod(req);
      //eslint-disable-next-line
      //@ts-expect-error
      expect(response.data).toBe(equal(res));
    });
  });

  describe('invoking DELETE methods', () => {
    it('should send the request payload serialized in the request and parse the response', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };
      const res = {
        id: Chance().guid(),
      };

      nock(baseUrl)
        .delete('/pizza')
        .query((q) => q.args === JSON.stringify(req))
        .reply(200, res);

      const myServiceClient = createClient(myService, baseUrl);
      const response = await myServiceClient.myDeleteMethod(req);
      expect(response.data).toBe(equal(res));
    });

    it('should not send the request payload, if it does not pass schema validation', async () => {
      const baseUrl = Chance().url();
      const req = {
        age: Chance().integer({ min: 1 }),
      };

      const myServiceClient = createClient(myService, baseUrl);
      //eslint-disable-next-line
      //@ts-expect-error
      await expect(myServiceClient.myDeleteMethod(req)).toBe(
        rejectedWith('invalid_type at name')
      );
    });

    it('should reject the response if it does not pass schema validation', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };
      const res = {
        id: Chance().string(),
      };

      nock(baseUrl)
        .delete('/pizza')
        .query((q) => q.args === JSON.stringify(req))
        .reply(200, res);

      const myServiceClient = createClient(myService, baseUrl);
      await expect(myServiceClient.myDeleteMethod(req)).toBe(
        rejectedWith('Invalid uuid')
      );
    });

    it('should throw http errors back as is', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      nock(baseUrl)
        .delete('/pizza')
        .query((q) => q.args === JSON.stringify(req))
        .reply(404);

      const myServiceClient = createClient(myService, baseUrl);
      await expect(myServiceClient.myDeleteMethod(req)).toBe(
        rejectedWith('404')
      );
    });

    it('should support passing axios default config via factory', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      nock(baseUrl)
        .delete('/pizza')
        .query((q) => q.args === JSON.stringify(req))
        .reply(404);

      const myServiceClient = createClient(myService, baseUrl, {
        validateStatus: () => true,
      });
      const response = await myServiceClient.myDeleteMethod(req);
      expect(response.status).toBe(equal(404));
    });

    it('should support passing axios config to method', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      nock(baseUrl)
        .delete('/pizza')
        .query((q) => q.args === JSON.stringify(req))
        .reply(404);

      const myServiceClient = createClient(myService, baseUrl);
      const response = await myServiceClient.myDeleteMethod(req, {
        validateStatus: () => true,
      });
      expect(response.status).toBe(equal(404));
    });

    it('should accept the response if it has extra properties, as long as the ones expected by the local schema are confirmed', async () => {
      const baseUrl = Chance().url();
      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };
      const res = {
        id: Chance().guid(),
        extra: true,
      };

      nock(baseUrl)
        .delete('/pizza')
        .query((q) => q.args === JSON.stringify(req))
        .reply(200, res);

      const myServiceClient = createClient(myService, baseUrl);
      const response = await myServiceClient.myDeleteMethod(req);
      //eslint-disable-next-line
      //@ts-expect-error
      expect(response.data).toBe(equal(res));
    });
  });
});
