import type Express from 'express';
import database from './database';
import express from './express';
import LoggerInstance from './logger';
import models from './models';

export default async ({
  expressApp,
}: { expressApp: Express.Application }): Promise<void> => {
  await database();
  LoggerInstance.info('✌️ Connection to database successful');
  await models();
  LoggerInstance.info('✌️ Models loaded');
  express({ app: expressApp });
  LoggerInstance.info('✌️ Express loaded');
  LoggerInstance.info('✅ All modules loaded!');
};
