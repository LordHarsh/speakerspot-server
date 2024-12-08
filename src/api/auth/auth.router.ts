import { Router } from 'express';
import authenticateToken from '../../middlewares/authenticate';
import { validateRequest } from '../../middlewares/validator';
import {
  createUser,
  loginUser,
  sendOtp,
  updatePassword,
  verifyOtp,
} from './auth.controller';
import {
  createUserSchema,
  loginUserSchema,
  updatePasswordSchema,
  verifyOtpSchema,
} from './auth.schema';

export default (): Router => {
  const app = Router();
  app.post(
    '/:entity/signup',
    validateRequest('body', createUserSchema),
    createUser,
  );
  app.post(
    '/:entity/login',
    validateRequest('body', loginUserSchema),
    loginUser,
  );
  app.get('/:entity/send-otp', authenticateToken(true), sendOtp);
  app.put(
    '/:entity/verify-otp',
    authenticateToken(true),
    validateRequest('body', verifyOtpSchema),
    verifyOtp,
  );
  app.put(
    '/:entity/update-password',
    validateRequest('body', updatePasswordSchema),
    authenticateToken(),
    updatePassword,
  );
  return app;
};
