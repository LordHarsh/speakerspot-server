import express, { Router } from 'express';
import authenticateToken from '../../middlewares/authenticate';
import { validateRequest } from '../../middlewares/validator';
import {
  createOrUpdateProfile,
  getProfile,
  listSpeakers,
  updateAvailability,
  updatePricing,
} from './speaker.controller';
import {
  AvailabilityUpdateSchema,
  ListSpeakersQuerySchema,
  PricingUpdateSchema,
  SpeakerProfileSchema,
} from './speaker.schema';

export default (): Router => {
  const app = Router();
  app.post(
    '/profile',
    authenticateToken(),
    validateRequest('body', SpeakerProfileSchema),
    createOrUpdateProfile,
  );
  app.put(
    '/profile',
    authenticateToken(),
    validateRequest('body', SpeakerProfileSchema),
    createOrUpdateProfile,
  );
  app.put(
    '/availability',
    authenticateToken(),
    validateRequest('body', AvailabilityUpdateSchema),
    updateAvailability,
  );

  app.get('/profile', authenticateToken(), getProfile);
  app.get('/', validateRequest('query', ListSpeakersQuerySchema), listSpeakers);
  app.put(
    '/pricing',
    authenticateToken(),
    validateRequest('body', PricingUpdateSchema),
    updatePricing,
  );
  return app;
};
