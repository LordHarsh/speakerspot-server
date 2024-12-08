import bodyParser from 'body-parser';
import cors from 'cors';
import type express from 'express';
import helmet from 'helmet';
import routes from '../api';
import config from '../config';
import { errorHandler } from '../middlewares/errorHandler';

export default ({ app }: { app: express.Application }): void => {
  app.get('/healthcheck', (req, res) => {
    const healthcheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now(),
    };
    try {
      return res.status(200).json(healthcheck);
    } catch (e) {
      return res.status(503).send();
    }
  });
  app.enable('trust proxy');
  app.use(helmet());
  app.use(cors());
  app.use(bodyParser.json());
  app.use(config.api.prefix, routes());
  app.use(errorHandler);
};
