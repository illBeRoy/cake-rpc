import { createRouter } from '../../../src/express';
import { echoService } from '../service/echo';

export const echoServiceRouter = createRouter(echoService, {
  echo: (req, res) => {
    res.send({ resText: req.body.reqText });
  },
});
