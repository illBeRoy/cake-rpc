import axios from 'axios';
import express from 'express';
import { Chance } from 'chance';
import { equal, expect } from 'twobees';
import {
  createExpressServer,
  disconnectAllExpressServers,
} from '../testkits/express';
import { createService } from '../../src';
import { createRouter, CakeServerImplementation } from '../../src/express';

describe('cake express router', () => {
  afterEach(() => disconnectAllExpressServers());

  const myService = createService({
    myGetMethod: {
      path: `/foo`,
      method: 'GET',
      request: (z) => ({
        name: z.string().min(3),
        age: z.number().int().positive(),
      }),
      response: (z) => ({ id: z.string() }),
    },
    myPostMethod: {
      path: `/bar`,
      method: 'POST',
      request: (z) => ({
        name: z.string().min(3),
        age: z.number().int().positive(),
      }),
      response: (z) => ({ id: z.string() }),
    },
    myPutMethod: {
      path: `/buzz`,
      method: 'PUT',
      request: (z) => ({
        name: z.string().min(3),
        age: z.number().int().positive(),
      }),
      response: (z) => ({ id: z.string() }),
    },
    myPatchMethod: {
      path: `/pasta`,
      method: 'PATCH',
      request: (z) => ({
        name: z.string().min(3),
        age: z.number().int().positive(),
      }),
      response: (z) => ({ id: z.string() }),
    },
    myDeleteMethod: {
      path: `/pizza`,
      method: 'DELETE',
      request: (z) => ({
        name: z.string().min(3),
        age: z.number().int().positive(),
      }),
      response: (z) => ({ id: z.string() }),
    },
  });

  const createRouterForTest = (
    routeOverrides: Partial<CakeServerImplementation<typeof myService>> = {}
  ) =>
    createRouter(myService, {
      myGetMethod: (req, res) => {
        res.send({ id: `GET ${req.body.name} ${req.body.age}` });
      },
      myPostMethod: (req, res) =>
        res.send({ id: `POST ${req.body.name} ${req.body.age}` }),
      myPutMethod: (req, res) =>
        res.send({ id: `PUT ${req.body.name} ${req.body.age}` }),
      myPatchMethod: (req, res) =>
        res.send({ id: `PATCH ${req.body.name} ${req.body.age}` }),
      myDeleteMethod: (req, res) =>
        res.send({ id: `DELETE ${req.body.name} ${req.body.age}` }),
      ...routeOverrides,
    });

  describe('making requests to GET endpoints', () => {
    it('should accept and respond to them if the request was valid and was passed in a query string', async () => {
      const server = createExpressServer((app) =>
        app.use(createRouterForTest())
      );
      await server.start();

      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      const res = await axios.get('/foo', {
        baseURL: server.getBaseUrl(),
        params: { args: JSON.stringify(req) },
      });

      expect(res.data).toBe(equal({ id: `GET ${req.name} ${req.age}` }));
    });

    it('should reject requests with invalid payload', async () => {
      const server = createExpressServer((app) =>
        app.use(createRouterForTest())
      );
      await server.start();

      const req = {
        name: Chance().name(),
      };

      const res = await axios.get('/foo', {
        baseURL: server.getBaseUrl(),
        params: { args: JSON.stringify(req) },
        validateStatus: () => true,
      });

      expect(res.status).toBe(equal(400));
    });

    it('should reject with correct status, if passed', async () => {
      const server = createExpressServer((app) =>
        app.use(
          createRouterForTest({
            myGetMethod: (req, res) => res.status(404).send(),
          })
        )
      );
      await server.start();

      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      const res = await axios.get('/foo', {
        baseURL: server.getBaseUrl(),
        params: { args: JSON.stringify(req) },
        validateStatus: () => true,
      });

      expect(res.status).toBe(equal(404));
    });

    it('should gracefully handle async errors', async () => {
      const server = createExpressServer((app) =>
        app.use(
          createRouterForTest({
            myGetMethod: async (req, res) => {
              throw new Error('oh :(');
            },
          })
        )
      );
      await server.start();

      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      const res = await axios.get('/foo', {
        baseURL: server.getBaseUrl(),
        params: { args: JSON.stringify(req) },
        validateStatus: () => true,
      });

      expect(res.status).toBe(equal(500));
    });
  });

  describe('making requests to POST endpoints', () => {
    it('should accept and respond to them if the request was valid and was passed in the body', async () => {
      const server = createExpressServer((app) =>
        app.use(createRouterForTest())
      );
      await server.start();

      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      const res = await axios.post('/bar', req, {
        baseURL: server.getBaseUrl(),
      });

      expect(res.data).toBe(equal({ id: `POST ${req.name} ${req.age}` }));
    });

    it('should reject requests with invalid payload', async () => {
      const server = createExpressServer((app) =>
        app.use(createRouterForTest())
      );
      await server.start();

      const req = {
        name: Chance().name(),
      };

      const res = await axios.post('/bar', req, {
        baseURL: server.getBaseUrl(),
        validateStatus: () => true,
      });

      expect(res.status).toBe(equal(400));
    });

    it('should reject with correct status, if passed', async () => {
      const server = createExpressServer((app) =>
        app.use(
          createRouterForTest({
            myPostMethod: (req, res) => res.status(404).send(),
          })
        )
      );
      await server.start();

      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      const res = await axios.post('/bar', req, {
        baseURL: server.getBaseUrl(),
        validateStatus: () => true,
      });

      expect(res.status).toBe(equal(404));
    });

    it('should gracefully handle async errors', async () => {
      const server = createExpressServer((app) =>
        app.use(
          createRouterForTest({
            myPostMethod: async (req, res) => {
              throw new Error('oh :(');
            },
          })
        )
      );
      await server.start();

      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      const res = await axios.post('/bar', req, {
        baseURL: server.getBaseUrl(),
        validateStatus: () => true,
      });

      expect(res.status).toBe(equal(500));
    });
  });

  describe('making requests to PUT endpoints', () => {
    it('should accept and respond to them if the request was valid and was passed in the body', async () => {
      const server = createExpressServer((app) =>
        app.use(createRouterForTest())
      );
      await server.start();

      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      const res = await axios.put('/buzz', req, {
        baseURL: server.getBaseUrl(),
      });

      expect(res.data).toBe(equal({ id: `PUT ${req.name} ${req.age}` }));
    });

    it('should reject requests with invalid payload', async () => {
      const server = createExpressServer((app) =>
        app.use(createRouterForTest())
      );
      await server.start();

      const req = {
        name: Chance().name(),
      };

      const res = await axios.put('/buzz', req, {
        baseURL: server.getBaseUrl(),
        validateStatus: () => true,
      });

      expect(res.status).toBe(equal(400));
    });

    it('should reject with correct status, if passed', async () => {
      const server = createExpressServer((app) =>
        app.use(
          createRouterForTest({
            myPutMethod: (req, res) => res.status(404).send(),
          })
        )
      );
      await server.start();

      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      const res = await axios.put('/buzz', req, {
        baseURL: server.getBaseUrl(),
        validateStatus: () => true,
      });

      expect(res.status).toBe(equal(404));
    });

    it('should gracefully handle async errors', async () => {
      const server = createExpressServer((app) =>
        app.use(
          createRouterForTest({
            myPutMethod: async (req, res) => {
              throw new Error('oh :(');
            },
          })
        )
      );
      await server.start();

      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      const res = await axios.put('/buzz', req, {
        baseURL: server.getBaseUrl(),
        validateStatus: () => true,
      });

      expect(res.status).toBe(equal(500));
    });
  });

  describe('making requests to PATCH endpoints', () => {
    it('should accept and respond to them if the request was valid and was passed in the body', async () => {
      const server = createExpressServer((app) =>
        app.use(createRouterForTest())
      );
      await server.start();

      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      const res = await axios.patch('/pasta', req, {
        baseURL: server.getBaseUrl(),
      });

      expect(res.data).toBe(equal({ id: `PATCH ${req.name} ${req.age}` }));
    });

    it('should reject requests with invalid payload', async () => {
      const server = createExpressServer((app) =>
        app.use(createRouterForTest())
      );
      await server.start();

      const req = {
        name: Chance().name(),
      };

      const res = await axios.patch('/pasta', req, {
        baseURL: server.getBaseUrl(),
        validateStatus: () => true,
      });

      expect(res.status).toBe(equal(400));
    });

    it('should reject with correct status, if passed', async () => {
      const server = createExpressServer((app) =>
        app.use(
          createRouterForTest({
            myPatchMethod: (req, res) => res.status(404).send(),
          })
        )
      );
      await server.start();

      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      const res = await axios.patch('/pasta', req, {
        baseURL: server.getBaseUrl(),
        validateStatus: () => true,
      });

      expect(res.status).toBe(equal(404));
    });

    it('should gracefully handle async errors', async () => {
      const server = createExpressServer((app) =>
        app.use(
          createRouterForTest({
            myPatchMethod: async (req, res) => {
              throw new Error('oh :(');
            },
          })
        )
      );
      await server.start();

      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      const res = await axios.patch('/pasta', req, {
        baseURL: server.getBaseUrl(),
        validateStatus: () => true,
      });

      expect(res.status).toBe(equal(500));
    });
  });

  describe('making requests to DELETE endpoints', () => {
    it('should accept and respond to them if the request was valid and was passed in a query string', async () => {
      const server = createExpressServer((app) =>
        app.use(createRouterForTest())
      );
      await server.start();

      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      const res = await axios.delete('/pizza', {
        baseURL: server.getBaseUrl(),
        params: { args: JSON.stringify(req) },
      });

      expect(res.data).toBe(equal({ id: `DELETE ${req.name} ${req.age}` }));
    });

    it('should reject requests with invalid payload', async () => {
      const server = createExpressServer((app) =>
        app.use(createRouterForTest())
      );
      await server.start();

      const req = {
        name: Chance().name(),
      };

      const res = await axios.delete('/pizza', {
        baseURL: server.getBaseUrl(),
        params: { args: JSON.stringify(req) },
        validateStatus: () => true,
      });

      expect(res.status).toBe(equal(400));
    });

    it('should reject with correct status, if passed', async () => {
      const server = createExpressServer((app) =>
        app.use(
          createRouterForTest({
            myDeleteMethod: (req, res) => res.status(404).send(),
          })
        )
      );
      await server.start();

      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      const res = await axios.delete('/pizza', {
        baseURL: server.getBaseUrl(),
        params: { args: JSON.stringify(req) },
        validateStatus: () => true,
      });

      expect(res.status).toBe(equal(404));
    });

    it('should gracefully handle async errors', async () => {
      const server = createExpressServer((app) =>
        app.use(
          createRouterForTest({
            myDeleteMethod: async (req, res) => {
              throw new Error('oh :(');
            },
          })
        )
      );
      await server.start();

      const req = {
        name: Chance().name(),
        age: Chance().integer({ min: 1 }),
      };

      const res = await axios.delete('/pizza', {
        baseURL: server.getBaseUrl(),
        params: { args: JSON.stringify(req) },
        validateStatus: () => true,
      });

      expect(res.status).toBe(equal(500));
    });
  });
});
