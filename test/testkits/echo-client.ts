import puppeteer from 'puppeteer';
import path from 'path';
import execa from 'execa';
import waitPort from 'wait-port';

const parcel = path.join(
  __dirname,
  '..',
  '..',
  'node_modules',
  '.bin',
  'parcel'
);

export const createEchoClient = ({ port = 15120 } = {}) => {
  let execaProcess: execa.ExecaChildProcess;
  let browser: puppeteer.Browser;

  const start = async () => {
    execaProcess = execa(parcel, [
      'serve',
      '--port',
      `${port}`,
      path.join('test', 'fixtures', 'client-app', 'index.html'),
    ]);

    await waitPort({ port });

    browser = await puppeteer.launch();
  };

  const stop = async () => {
    await execaProcess.kill();
    await browser.close();
  };

  const getClientPage = async () => {
    const page = await browser.newPage();

    await page.goto(`http://localhost:${port}`);
    await page.waitForSelector('#echoResponse');

    return page;
  };

  return {
    start,
    stop,
    getClientPage,
  };
};
