import express from 'express';
import cors from 'cors';
import { echoServiceRouter } from './echo';

const app = express();

// we need cors since our client is going to be served from another port - this is unrelated to us using cake-rpc
app.use(cors());

app.use(echoServiceRouter);

app.listen(15123, () => {
  console.log('Server listening');
});
