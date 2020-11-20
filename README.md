<p align="center">
  <img src="logo.svg" width="100" height="100" />
</p>

<h1 align="center">
  cake-rpc
</h1>

<p align="center">
<a href="https://github.com/illBeRoy/cake-rpc/actions?query=workflow%3A%22Node.js+CI%22" target="_blank">
  <img src="https://img.shields.io/github/workflow/status/illBeRoy/cake-rpc/Node.js%20CI/master?style=flat-square" />
</a>
<a href="https://npmjs.com/package/@cakery/cake-rpc" target="_blank">
  <img src="https://img.shields.io/npm/v/@cakery/cake-rpc?style=flat-square" />
</a>
</p>

**cake-rpc** is a lightweight library for defining, implementing and consuming restful APIs using a fully structured interface with both static & runtime type safety. With **cake-rpc** you can easily:
- Define restful services using an easy js\ts lib 🎬
- Implement them in your express server (plugs right in as a router, no config needed!) 🚂
- Use from your client as if it was a class you imported 🌍
- Keeps you type safe: full typescript support, as well as runtime type validation 🎖

## Getting Started in 3 Steps
### Step 1: Define your service
Start by installing **cake-rpc** in your project:
```sh
npm install @cakery/cake-rpc
```

Now create a new file called `service.ts`, and define a service using `createService`:
```ts
import { createService } from '@cakery/cake-rpc';

export const echoService = createService({
  echo: {
    path: '/echo',
    method: 'POST',
    request: (z) => ({
      reqText: z.string().max(20),
    }),
    response: (z) => ({
      resText: z.string().max(20),
    }),
  },
});
```

We declared a service (called `echoService`), with one method called: `echo`:
* The path (url) to the method is `/echo`
* The http method to be used is `POST`
* The request body should contain a single string called `reqText` with up to 20 chars (more about schemas in the [relevant chapter](#creating-service-schemas))
* The response body will contain a single string called `reqText` with up to 20 chars

### Step 2: Implement using your Express server
**cake-rpc** is designed to be plugged into your express server with zero boilerplate or configuration. You don't need to change anything, just implement an express router!

Go to your express app and add the following:
```ts
import { createRouter } from '@cakery/cake-rpc/express';
import { echoService } from './service';

export const echoServiceRouter = createRouter(echoService, {
  echo: (req, res) => {
    res.send({ resText: req.body.reqText });
  },
});

app.use('/api', echoServiceRouter);
```

What we did is to create an express router from our service, where we implemented the `echo` method:
- The echo implementation is a simple express route
- No need to validate input! The request body is automatically checked for your before your route is even run
- If you are using typescript: `req.body` is fully typed for your convenience!
- If you are using typescript: `res.json` and `res.send` are fully typed for your convenience!
- The entire router is nested under `/api`. In theory, you can plug in as many **cake-rpc** service you'd like, and simply nest them under different routes!

We then took the router and utilized it by our express app!

### Step 3: Use your service from the client
Now we want to actually use our echo service. Let's go to our client's code and add the following:
```ts
import { createClient } from '@cakery/cake-rpc/client';
import { echoService } from '../service/echo';

const echoClient = createClient(echoService, '/api');

echoClient.echo({ reqText: 'hello, world!' })
  .then(res => console.log(res.data.resText));
```

Here, we simply created an instance of our echo service's client, and used it to echo `hello, world`:
- We created the client with `echoService` as the service, and `/api` as base url. If your client is served from the same server you used in step 2, you can keep it that way. Otherwise, you need to input full url (e.g. `http://localhost:1234/api`). If you are serving your app from a different server, don't forget [cors policy](https://npmjs.com/package/cors) as well!
- The created client has all the methods from `echoService`. We can invoke any of them with the relevant body!
- The method resolves to an [axios](https://github.com/axios/axios) response, where we have `status` for http status code, and `data` for the body
- If you are using typescript: `.echo({...})` is fully typed for your convenience!
- If you are using typescript: `res.data` is fully typed for your convenience!

**Congratulations!** You have successfully implemented your first cake-rpc service. You can go ahead and give it a spin in your existing express applications - no boilerplate, configurations or strings attached!

## Usage
### Installing cake-rpc
You can start by installing **cake-rpc** using your favorite package manager:

npm:
```sh
npm install cake-rpc
```

Or yarn:
```sh
yarn add cake-rpc
```

The **cake-rpc** actually has three entrypoints:
1. The first one is the default `@cakery/cake-rpc` import, which provides you with the service factory
2. The second one is `@cakery/cake-rpc/express` - this is where you import the server-side tools into your express application
3. The third one is `@cakery/cake-rpc/client` - this is where you import the client factory from, and should be used by your client application

### Creating Service Schemas
At its core, **cake-rpc** operates with *services*. You can think of them as interfaces that define all the api methods that you want to expose.

In order to create a new service, you need to import the `createService` factory method from the main entrypoint:
```ts
import { createService } from '@cakery/cake-rpc';
```

You can then use it to create a service schema:
```ts
const guestListService = createService({
  listGuests: { ... },
  addGuest: { ... },
  removeGuest: { ... }
})
```

In this example, we created a service with three methods: `listGuests`, `addGuest` and `removeGuest`.

Every method has four parameters to describe:
1. The path (url) to it
2. The http method to use
3. The type of the request body (or query string, for GET \ DELETE requests)
4. The type of the response body

Take a look at the following example for addGuest:
```ts
const guestListService = createService({
  ...
  addGuest: {
    path: '/guests',
    method: 'POST',
    request: (z) => ({
      name: z.string().min(3).max(20),
      age: z.number().int().positive(),
      plusOne: z.boolean(),
    }),
    response: (z) => ({
      success: z.boolean(),
    }),
  },
  ...
})
```
The request is a `POST` to `/guests`, and should denote name, age, and plusOne fields. The response denotes success using a boolean value.

**The schema builder** for the request and the response actually uses [zod](https://github.com/vriad/zod), a light and powerful schema declaration library.

Once we're done defining our service, it's time to implement it!

### Implementing Service in Express
**cake-rpc** wants to take as little of your attention as possible, unlike other terrific fullstack frameworks, such as [next.js](https://nextjs.org/) or [meteor](https://github.com/meteor/meteor). As a matter of fact, we consider **cake-rpc** a library, and not a framework.

As such, **cake-rpc** plugs into your `express` application as a [router](https://expressjs.com/en/api.html#router).

You can start by importing the router factory:
```ts
import { createRouter } from '@cakery/cake-rpc/express';
```

Now, create an express router for your service:
```ts
const guestListRouter = createRouter(guestListService, {
  listGuests: (req, res) => { ... },
  addGuest: (req, res) => { ... },
  removeGuest: (req, res) => { ... },
})
```

For every method, you simply have to define an express handler that would handle it - as simple as that. All the requests made to your server are validated **before** they are passed to the handler, so you can rest assured that if a request made it to your code, it was already validated!

Few other neat quality of life features when implementing your router are:
1. The router supports async functions, including error handling
2. The request is fully typed - `req.body` will match the schema that you defined for the request
2. The response is fully typed - `req.json` and `req.data` will hint at the schema that you defined for the response

Finally, attach the router to your express app:
```ts
app.use(guestListRouter);
```

As we said, the router is a simple `express` router, so you can use it as any other middleware, for example:
```ts
app.use('/api/v1', [cors(), authenticateUser(), guestListRouter]);
```

### Initializing your Client
Now that you've implemented your server, you can initialize your client.

Start by importing the `createClient` factory:
```ts
import { createClient } from '@cakery/cake-rpc/client';
```

The next thing to do is to create your client:
```ts
const guestListClient = createClient(guestListService, '/');
```

The `createClient` factory returns a full client that is based on the famous [axios](https://github.com/axios/axios) library. Think of it as a typed axios client: you can configure it as you would axios, and the response format is similar to axios, but instead of `get` `post` `put` (and other) methods, you get the service's methods (in our case, `listGuests`, `addGuest` and `deleteGuest`).

The `createClient` function receives up to three parameters:
1. The service definition (required) - the object we created using `createService`
2. The base url (required) - the base url under which the router can be found (can be relative if your app is served from the same server where the api can be found, otherwise it should be a full url)
3. Axios configuration (optional) - a configuration object that will be passed to the underlying axios client.

When invoking a method, all you need to do is pass the request payload:
```ts
guestListClient.addGuest({ name: 'Roy', age: 28, plusOne: true });
```

If you are using typescript, `addGuest` will be fully typed and hint at the correct request structure. In addition, all requests are validated on the client before being sent to the server for your convenience.

Additionally, you can pass an Axios config to the request as well, e.g.:
```ts
guestListClient.addGuest({ name: 'Roy', age: 28, plusOne: true }, { headers: { 'x-my-identity': 'super admin' } });
```

ℹ️ Regarding your bundle: if you are bundling your apps using webpack or parcel, fear not! **cake-rpc** only brings the essential code for your client-side application, since you import it from `@cakery/cake-rpc/client`. Nothing related to `express` will be imported.

### Making API Changes (Backwards Compatibility)
APIs are dynamic beings - we change and we add to them all the time. Question being asked - how does **cake-rpc** handle API changes? Let's divide it into two parts: requests and responses.

#### Requests
If you are adding fields to your request schemas, you cant take one of two approaches:

1. Make it optional. That way, you can provide backwards compatibility for older clients:
```diff
addGuest: {
  request: (z) => ({
    name: z.string().min(3).max(20),
    age: z.number().int().positive(),
    plusOne: z.boolean(),
+   hasARide: z.boolean().optional()
  }),
}
```

2. Make the new field required. In that case, all clients using the older schema will be rejected by your new server.

One way or another, if you are making breaking changes to your api, we suggest that you follow [api versioning best practices](https://restfulapi.net/versioning). 

#### Responses
By default, you can always add new fields to the response. The **cake-rpc** client takes that into account, and simply ignores fields it is not familiar with.

That said, if you want to remove fields from the response, it will most definitely break the client, causing it to throw accordingly and tell you to check your compatibility with the server schema. Therefore, if you want to remove fields, consider this a breaking api change, and preferably follow through with api versioning.

### Working in Multi-Package Workspaces
Of course, many projects tend to put the server and the client in separate packages. Are you using [lerna](https://github.com/lerna/lerna) or [yarn workspaces](https://classic.yarnpkg.com/en/docs/workspaces/)? We got you covered!

You can basically create your services as packages within your workspace \ monorepo, and consume them both in your server and client projects:

#### The Easy Way
Cake comes with a straight-forward tool called `create-cake-package`. When run, it will generate a package with all the required setup, so you can go ahead and start implementing your service immediately. Use it by running the following command:

```sh
npx create-cake-package
```

#### The Custom Way
Alternatively, you can create such packages on your on, in a way that matches your workflow. The only dependency for said packages would be **cake-rpc** itself.

You can take a look at a minimal implementation [here](assets/templates/service-package-ts).

## FAQ
### Why cake-rpc?
I've been working on fullstack web projects for a long time now, and no matter where I worked and on which system, there was always a single most important concern: how do we manage integrations between multiple services, servers and clients and not lose our minds?

In one of my workplaces, I attempted to solve this exact problem, and came up with a system that I am proud to say is used by the entire company (and even our dev sdk) to this day. From it, I learned the following:
1. Most people want to write as little boilerplate as possible
2. But they almost never want to commit their entire codebase to a full framework

That is, people want things to work fast and simple, and not have to wrap their entire program around a specific framework that wraps around and abstracts away their simple express \ react apps.

That's why I came up with **cake-rpc** - inspired by my experience with said libraries, I wanted to create a library that is as simple to plug into as an express router, and which you don't have to commit to - if you don't feel like using it anymore, just uninstall it and you're done. In short: comprehensive, but non-intrusive.

### What if I'm using Koa? Or Fastify? Or something else?
As you can see, the `createRouter` method from express is imported from `@cakery/cake-rpc/express`. In the future, and according to popular demand, adapters for `koa`, `fastify` and others might be added as well.

### What if I don't want Axios?
I went with `axios` first as it is my own requests library of choice. I do intend to implement a client base on `fetch` as well, so if you don't want to include `axios` in your bundle and prefer to use `fetch` - you will be able to pretty soon!

### What about other languages?
In order to keep it simple, **cake-rpc** is currently directed at a full js\ts stack. In the future, if demand arises, it is not out of the question to port cake to other languages as well!

## Contribution
I've yet to set up a contribution guide per se, but feel free to open issues and pull requests! I promise to try and be attentive to your requests and contributions.

**Tried it? Liked it? Be a star and give us a 🌟!**

> logo by [freepik](https://www.flaticon.com/authors/freepik) from [flaticon.com](https://www.flaticon.com)
