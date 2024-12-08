import type { NextFunction, Request, Response } from 'express';
import { CONSTANTS } from '../../shared/constants';
import { ERRORS } from '../../shared/errors';
import {
  bookSessionHandler,
  getAllSpeakersWithAvailability,
  getUserSessionsHandler,
  removeSession,
} from './session.service';

export const listAvailableSpeakers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const availableSpeakers = await getAllSpeakersWithAvailability();

    res.status(CONSTANTS.SPEAKERS_AVAILABLE_RETRIEVED.code).json({
      success: CONSTANTS.SPEAKERS_AVAILABLE_RETRIEVED.success,
      message: CONSTANTS.SPEAKERS_AVAILABLE_RETRIEVED.message.description,
      data: availableSpeakers,
    });
  } catch (error) {
    next(error);
  }
};

export const bookSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = res.locals.user?.id;
    const role = res.locals.user?.role;
    if (role !== 'user') {
      throw {
        status: ERRORS.UNAUTHORIZED.code,
        message: ERRORS.UNAUTHORIZED.message.error_description,
      };
    }
    const { speakerProfileId, day, startTime } = req.body;
    const session = await bookSessionHandler(
      speakerProfileId,
      userId,
      day,
      startTime,
    );

    res.status(CONSTANTS.SESSION_BOOKING_SUCCESSFUL.code).json({
      success: CONSTANTS.SESSION_BOOKING_SUCCESSFUL.success,
      message: CONSTANTS.SESSION_BOOKING_SUCCESSFUL.message.description,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSessions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = res.locals.user?.id;
    const sessions = await getUserSessionsHandler(userId);

    res.status(CONSTANTS.USER_SESSIONS_RETRIEVED.code).json({
      success: CONSTANTS.USER_SESSIONS_RETRIEVED.success,
      message: CONSTANTS.USER_SESSIONS_RETRIEVED.message.description,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = res.locals.user?.id;
    const sessionId = req.params.sessionId;

    await removeSession(sessionId, userId);

    res.status(CONSTANTS.SESSION_CANCELLED_SUCCESSFULLY.code).json({
      success: CONSTANTS.SESSION_CANCELLED_SUCCESSFULLY.success,
      message: CONSTANTS.SESSION_CANCELLED_SUCCESSFULLY.message.description,
    });
  } catch (error) {
    next(error);
  }
};
