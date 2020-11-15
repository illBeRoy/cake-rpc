import express from 'express';
import type { Server } from 'http';

const allLiveServers: Server[] = [];

export const disconnectAllExpressServers = () =>
  Promise.all(
    allLiveServers.map(
      (server) => new Promise((res) => server.close(() => res()))
    )
  ).then(() => allLiveServers.splice(0, allLiveServers.length));

export const createExpressServer = (
  expressAppBuilder: (app: express.Express) => unknown
) => {
  const app = express();
  expressAppBuilder(app);

  let server: Server;

  const start = () => {
    return new Promise((res) => {
      server = app.listen(0, () => res());
      allLiveServers.push(server);
    });
  };

  const stop = () => {
    return new Promise((res) => {
      server.close(() => res());
    });
  };

  const getBaseUrl = () => `http://localhost:${(server.address() as any).port}`;

  return {
    start,
    stop,
    getBaseUrl,
  };
};
