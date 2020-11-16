import { Chance } from 'chance';
import { expect, resolvedWith } from 'twobees';
import eventually from 'wix-eventually';
import { createEchoClient } from '../testkits/echo-client';
import { createEchoServer } from '../testkits/echo-server';

describe('cake-rpc end to end test via puppeteer, with client & server apps', () => {
  jest.setTimeout(30000);

  const server = createEchoServer();
  const client = createEchoClient();

  beforeAll(() => Promise.all([server.start(), client.start()]));
  afterAll(() => Promise.all([server.stop(), client.stop()]));

  it('should successfully use the echo service from the client', async () => {
    const someEchoString = Chance().sentence();
    const page = await client.getClientPage();

    await page.type('#echoInput', someEchoString);
    await page.click('#echoButton');

    await eventually(async () => {
      await expect(
        page.$eval('#echoResponse', (e) => e.textContent ?? 'N/A')
      ).toBe(resolvedWith(`Response: ${someEchoString}`));
    });
  });
});
