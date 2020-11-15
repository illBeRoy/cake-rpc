import { Chance } from 'chance';
import { expect, throwing, throwingWith } from 'twobees';
import { service } from '../../src';

describe('cake service schema builders', () => {
  it('should accept a well defined service', () => {
    const createService = () =>
      service({
        methodA: {
          path: '/path/to/method',
          method: 'GET',
          request: (z) => ({
            name: z.string().nonempty().min(3),
            age: z.number().int().positive(),
            degree: z.boolean().optional(),
          }),
          response: (z) => ({
            registered: z.boolean(),
          }),
        },
        [`method_${Chance().word()}`]: {
          path: `${Chance().word()}/${Chance().word()}`,
          method: Chance().pickone(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
          request: (z) => ({
            [`key_${Chance().word()}`]: z.string(),
          }),
          response: (z) => ({
            [`key_${Chance().word()}`]: z.number(),
          }),
        },
      });

    // eslint-disable-next-line
    //@ts-ignore - figure out why this raises type errors :\
    expect(createService).not.toBe(throwing);
  });

  it('should reject a service that was not defined using an object', () => {
    // eslint-disable-next-line
    //@ts-expect-error
    const createService = () => service('asdfasdf');
    expect(createService).toBe(
      throwingWith('service definition should be an object')
    );
  });

  it('should reject a service that has a method that was not defined using an object', () => {
    const createService = () =>
      service({
        wellDefinedMethod: {
          path: '/path/to/method',
          method: 'GET',
          request: (z) => ({
            name: z.string().nonempty().min(3),
            age: z.number().int().positive(),
            degree: z.boolean().optional(),
          }),
          response: (z) => ({
            registered: z.boolean(),
          }),
        },
        // eslint-disable-next-line
        //@ts-expect-error
        invalidMethod: '',
      });

    expect(createService).toBe(
      throwingWith('type for method "invalidMethod": string')
    );
  });

  it('should reject a service that has a method without a proper path defined', () => {
    const createService = () =>
      service({
        wellDefinedMethod: {
          path: '/path/to/method',
          method: 'GET',
          request: (z) => ({
            name: z.string().nonempty().min(3),
            age: z.number().int().positive(),
            degree: z.boolean().optional(),
          }),
          response: (z) => ({
            registered: z.boolean(),
          }),
        },
        // eslint-disable-next-line
        //@ts-expect-error
        invalidMethod: {
          method: 'GET',
          request: (z) => ({
            name: z.string().nonempty().min(3),
            age: z.number().int().positive(),
            degree: z.boolean().optional(),
          }),
          response: (z) => ({
            registered: z.boolean(),
          }),
        },
      });

    expect(createService).toBe(
      throwingWith('invalid path value for method "invalidMethod"')
    );
  });

  it('should reject a service that has a method that does not make use of a valid http method', () => {
    const createService = () =>
      service({
        wellDefinedMethod: {
          path: '/path/to/method',
          method: 'GET',
          request: (z) => ({
            name: z.string().nonempty().min(3),
            age: z.number().int().positive(),
            degree: z.boolean().optional(),
          }),
          response: (z) => ({
            registered: z.boolean(),
          }),
        },
        invalidMethod: {
          path: '/path/to/method',
          // eslint-disable-next-line
          //@ts-expect-error
          method: 'asdfasdf',
          request: (z) => ({
            name: z.string().nonempty().min(3),
            age: z.number().int().positive(),
            degree: z.boolean().optional(),
          }),
          response: (z) => ({
            registered: z.boolean(),
          }),
        },
      });

    expect(createService).toBe(
      throwingWith('invalid http method value for method "invalidMethod"')
    );
  });

  it('should reject a service that has a method with a request that is not a function', () => {
    const createService = () =>
      service({
        wellDefinedMethod: {
          path: '/path/to/method',
          method: 'GET',
          request: (z) => ({
            name: z.string().nonempty().min(3),
            age: z.number().int().positive(),
            degree: z.boolean().optional(),
          }),
          response: (z) => ({
            registered: z.boolean(),
          }),
        },
        invalidMethod: {
          path: '/path/to/method',
          method: 'GET',
          // eslint-disable-next-line
          //@ts-expect-error
          request: true,
          response: (z) => ({
            registered: z.boolean(),
          }),
        },
      });

    expect(createService).toBe(throwingWith('was not a function'));
  });

  it('should reject a service that has a method with a request that is not a schema builder function', () => {
    const createService = () =>
      service({
        wellDefinedMethod: {
          path: '/path/to/method',
          method: 'GET',
          request: (z) => ({
            name: z.string().nonempty().min(3),
            age: z.number().int().positive(),
            degree: z.boolean().optional(),
          }),
          response: (z) => ({
            registered: z.boolean(),
          }),
        },
        invalidMethod: {
          path: '/path/to/method',
          method: 'GET',
          request: () => 'asfa',
          response: (z) => ({
            registered: z.boolean(),
          }),
        },
      });

    expect(createService).toBe(
      throwingWith('the returned value must be a valid zod object schema')
    );
  });

  it('should reject a service that has a method with a response that is not a function', () => {
    const createService = () =>
      service({
        wellDefinedMethod: {
          path: '/path/to/method',
          method: 'GET',
          request: (z) => ({
            name: z.string().nonempty().min(3),
            age: z.number().int().positive(),
            degree: z.boolean().optional(),
          }),
          response: (z) => ({
            registered: z.boolean(),
          }),
        },
        invalidMethod: {
          path: '/path/to/method',
          method: 'GET',
          request: (z) => ({
            registered: z.boolean(),
          }),
          // eslint-disable-next-line
          //@ts-expect-error
          response: true,
        },
      });

    expect(createService).toBe(throwingWith('was not a function'));
  });

  it('should reject a service that has a method with a response that is not a schema builder function', () => {
    const createService = () =>
      service({
        wellDefinedMethod: {
          path: '/path/to/method',
          method: 'GET',
          request: (z) => ({
            name: z.string().nonempty().min(3),
            age: z.number().int().positive(),
            degree: z.boolean().optional(),
          }),
          response: (z) => ({
            registered: z.boolean(),
          }),
        },
        invalidMethod: {
          path: '/path/to/method',
          method: 'GET',
          request: (z) => ({
            registered: z.boolean(),
          }),
          response: () => 'asfa',
        },
      });

    expect(createService).toBe(
      throwingWith('the returned value must be a valid zod object schema')
    );
  });
});
