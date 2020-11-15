import * as z from 'zod';

export interface CakeService {
  [TMethodName: string]: CakeMethodDef<any, any>;
}

export interface CakeMethodDef<
  TReq extends Record<string, z.ZodTypeAny>,
  TRes extends Record<string, z.ZodTypeAny>
> {
  path: string;
  method: typeof HTTPMethods[number];
  request: (schemaBuilder: typeof z) => TReq;
  response: (schemaBuilder: typeof z) => TRes;
}

const HTTPMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

export const service = <T extends Record<string, CakeMethodDef<any, any>>>(
  serviceDef: T
): T => {
  assert(
    typeof serviceDef === 'object',
    `the service definition should be an object. received type: ${typeof serviceDef}`
  );

  Object.keys(serviceDef).forEach((methodName) => {
    const method = serviceDef[methodName];
    assert(
      typeof method === 'object',
      `all method definitions for the service must be objects. type for method "${methodName}": ${typeof method}`
    );
    assert(
      typeof method.path === 'string',
      `invalid path value for method "${methodName}"`
    );
    assert(
      HTTPMethods.includes(method.method),
      `invalid http method value for method "${methodName}". received: "${
        method.method
      }", allowed values: (${HTTPMethods.join(', ')})`
    );

    try {
      assertSchemaBuilder(method.request);
    } catch (err) {
      throw new Error(
        `invalid request property for method "${methodName}": ${
          err?.message ?? 'failed due to an unknown reason'
        }`
      );
    }

    try {
      assertSchemaBuilder(method.response);
    } catch (err) {
      throw new Error(
        `invalid response property for method "${methodName}": ${
          err?.message ?? 'failed due to an unknown reason'
        }`
      );
    }
  });

  return serviceDef;
};

function assert(expr, msg: string): asserts expr {
  if (!expr) {
    throw new Error(msg);
  }
}

function assertSchemaBuilder(possibleSchemaBuilder: unknown) {
  assert(
    typeof possibleSchemaBuilder === 'function',
    `the provided value is expected to be a builder function that returns a schema, but was not a function`
  );

  let schemaObjectDef;
  try {
    schemaObjectDef = possibleSchemaBuilder(z);
  } catch (err) {
    throw new Error(
      `the schema builder function crashed. reason: ${
        err?.message ?? 'unspecified'
      }`
    );
  }

  try {
    const finalSchema = z.object(schemaObjectDef);
    finalSchema.toJSON();
  } catch (err) {
    throw new Error(
      `the schema builder returned an invalid value. the returned value must be a valid zod object schema`
    );
  }
}
