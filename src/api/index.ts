import { Router } from 'express';
import authRouter from './auth/auth.router';
import sessionRouter from './session/session.router';
import speakerRouter from './speaker/speaker.router';

export default (): Router => {
  const app = Router();
  app.use('/auth', authRouter());
  app.use('/speaker', speakerRouter());
  app.use('/session', sessionRouter());
  return app;
};
