import { echoService } from '../service/echo';
import { createClient } from '../../../src/client';

const serverUrl = `http://localhost:15123`;

const echoInput = document.getElementById('echoInput') as HTMLInputElement;
const echoButton = document.getElementById('echoButton') as HTMLButtonElement;
const echoResponse = document.getElementById('echoResponse') as HTMLSpanElement;

const echoClient = createClient(echoService, serverUrl);

echoButton.addEventListener('click', async () => {
  const res = await echoClient.echo({ reqText: echoInput.value });
  echoResponse.textContent = `Response: ${res.data.resText}`;
});
