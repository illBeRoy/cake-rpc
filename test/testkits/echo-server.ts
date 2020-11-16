import path from 'path';
import execa from 'execa';
import waitPort from 'wait-port';

const tsNode = path.join(
  __dirname,
  '..',
  '..',
  'node_modules',
  '.bin',
  'ts-node'
);

const hardcodedServerPort = 15123;

export const createEchoServer = () => {
  let execaProcess: execa.ExecaChildProcess;

  const start = async () => {
    execaProcess = execa(tsNode, [
      path.join('test', 'fixtures', 'server-app', 'index.ts'),
    ]);

    await waitPort({ port: hardcodedServerPort });
  };

  const stop = async () => {
    await execaProcess.kill();
  };

  return {
    start,
    stop,
  };
};
