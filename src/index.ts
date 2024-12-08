import express from 'express';
import config from './config';
import Loaders from './loaders';
import LoggerInstance from './loaders/logger';

async function start() {
  const app = express();
  await Loaders({ expressApp: app });
  app
    .listen(config.PORT, () => {
      LoggerInstance.info(`
      ------------ Server listening on port: ${config.PORT}------------
    `);
    })
    .on('error', (err: Error) => {
      LoggerInstance.error(err);
      process.exit(1);
    });
}

start();
