import express, { Router, Request, Response, NextFunction } from 'express';
import authenticateToken from '../../middlewares/authenticate';
import { validateRequest } from '../../middlewares/validator';
import { CONSTANTS } from '../../shared/constants';
import {
  bookSession,
  cancelSession,
  getUserSessions,
  listAvailableSpeakers,
} from './session.controller';
import { SessionBookingSchema } from './session.schema';

export default (): Router => {
  const router = Router();

  // Book a session (protected route)
  router.post(
    '/book',
    authenticateToken(),
    validateRequest('body', SessionBookingSchema),
    bookSession,
  );

  // List available speakers for a specific day and time
  router.get('/available-speakers', authenticateToken(), listAvailableSpeakers);

  // Get user's sessions
  router.get('/my-sessions', authenticateToken(), getUserSessions);

  // Cancel a session
  router.delete('/cancel/:sessionId', authenticateToken(), cancelSession);
  return router;
};
