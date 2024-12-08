import type { NextFunction, Request, Response } from 'express';
import { CONSTANTS } from '../../shared/constants';
import {
  createOrUpdateSpeakerProfile,
  getSpeakerProfile,
  listAllSpeakers,
  updateSpeakerAvailability,
  updateSpeakerPricing,
} from './speaker.service';

export const createOrUpdateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const speakerId = res.locals.user?.id;
    const profileData = {
      name: req.body.name,
      expertise: req.body.expertise,
      pricePerSession: req.body.pricePerSession,
      availability: req.body.availability,
      biography: req.body.biography,
    };
    await createOrUpdateSpeakerProfile(speakerId, profileData);
    res.status(CONSTANTS.SPEAKER_PROFILE_UPDATION_SUCCESSFULL.code).json({
      success: CONSTANTS.SPEAKER_PROFILE_UPDATION_SUCCESSFULL.success,
      message:
        CONSTANTS.SPEAKER_PROFILE_UPDATION_SUCCESSFULL.message.description,
      data: profileData,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = res.locals.user?.id;
    const profile = await getSpeakerProfile(id);
    res.status(CONSTANTS.SPEAKER_PROFILE_RETRIEVAL_SUCCESSFULL.code).json({
      success: CONSTANTS.SPEAKER_PROFILE_RETRIEVAL_SUCCESSFULL.success,
      message:
        CONSTANTS.SPEAKER_PROFILE_RETRIEVAL_SUCCESSFULL.message.description,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const speakerId = res.locals.user?.id;
    const availability = req.body.availability;
    await updateSpeakerAvailability(speakerId, availability);
    res.status(CONSTANTS.SPEAKER_AVAILABILITY_UPDATION_SUCCESSFULL.code).json({
      success: CONSTANTS.SPEAKER_AVAILABILITY_UPDATION_SUCCESSFULL.success,
      message:
        CONSTANTS.SPEAKER_AVAILABILITY_UPDATION_SUCCESSFULL.message.description,
    });
  } catch (error) {
    next(error);
  }
};

export const listSpeakers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const pageNumber = req.query.page
      ? Number.parseInt(req.query.page as string)
      : 1;
    const limitNumber = req.query.limit
      ? Number.parseInt(req.query.limit as string)
      : 25;
    const expertise = req.query.expertise as string[];
    const speakers = await listAllSpeakers(pageNumber, limitNumber, expertise);
    res.status(CONSTANTS.SPEAKER_LIST_RETRIEVAL_SUCCESSFULL.code).json({
      success: CONSTANTS.SPEAKER_LIST_RETRIEVAL_SUCCESSFULL.success,
      message: CONSTANTS.SPEAKER_LIST_RETRIEVAL_SUCCESSFULL.message.description,
      data: speakers,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePricing = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const speakerId = res.locals.user?.id;
    const pricePerSession = req.body.pricePerSession;
    await updateSpeakerPricing(speakerId, pricePerSession);
    res.status(CONSTANTS.SPEAKER_PRICING_UPDATION_SUCCESSFULL.code).json({
      success: CONSTANTS.SPEAKER_PRICING_UPDATION_SUCCESSFULL.success,
      message:
        CONSTANTS.SPEAKER_PRICING_UPDATION_SUCCESSFULL.message.description,
    });
  } catch (error) {
    next(error);
  }
};
