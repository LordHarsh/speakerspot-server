import type { NextFunction, Request, Response } from 'express';
import { CONSTANTS } from '../../shared/constants';
import { ERRORS } from '../../shared/errors';
import {
  handleCreateUser,
  handleLoginUser,
  handleSendOtp,
  handleUpdatePassword,
  handleVerifyOtp,
} from './auth.service';

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await handleCreateUser(
      req.body.firstName,
      req.body.lastName,
      req.body.email,
      req.body.password,
      req.body.phoneNo,
      req.params.entity,
    );
    res.status(CONSTANTS.USER_CREATED_SUCCESSFULLY.code).send({
      success: CONSTANTS.USER_CREATED_SUCCESSFULLY.success,
      message: CONSTANTS.USER_CREATED_SUCCESSFULLY.message.msg,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userObj = { email: req.body.email, password: req.body.password };
    const token = await handleLoginUser(
      userObj.email,
      userObj.password,
      req.params.entity,
    );
    res.status(CONSTANTS.USER_LOGGED_IN_SUCCESSFULLY.code).json({
      success: CONSTANTS.USER_LOGGED_IN_SUCCESSFULLY.success,
      message: CONSTANTS.USER_LOGGED_IN_SUCCESSFULLY.message.description,
      jwt: token,
    });
  } catch (error) {
    next(error);
  }
};

export const sendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (res.locals.user.role !== req.params.entity) {
      throw {
        statusCode: ERRORS.UNAUTHORIZED.code,
        message: ERRORS.UNAUTHORIZED.message,
      };
    }
    await handleSendOtp(res.locals.user.email, res.locals.user.role);
    res.status(CONSTANTS.OTP_SENT_SUCCESSFULLY.code).json({
      success: CONSTANTS.OTP_SENT_SUCCESSFULLY.success,
      message: CONSTANTS.OTP_SENT_SUCCESSFULLY.message.description,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (res.locals.user.role !== req.params.entity) {
      throw {
        statusCode: ERRORS.UNAUTHORIZED.code,
        message: ERRORS.UNAUTHORIZED.message,
      };
    }
    const { otp } = req.body;
    await handleVerifyOtp(res.locals.user.email, otp, res.locals.user.role);
    res.status(CONSTANTS.OTP_VERIFIED_SUCCESSFULLY.code).json({
      success: CONSTANTS.OTP_VERIFIED_SUCCESSFULLY.success,
      message: CONSTANTS.OTP_VERIFIED_SUCCESSFULLY.message.description,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const email = res.locals.user.email;
    const { oldPassword, newPassword } = req.body;
    const new_token = await handleUpdatePassword(
      email,
      oldPassword,
      newPassword,
      res.locals.user.role,
    );
    res.status(CONSTANTS.UPDATED_PASSWORD_SUCCESSFULLY.code).json({
      success: CONSTANTS.UPDATED_PASSWORD_SUCCESSFULLY.success,
      message: CONSTANTS.UPDATED_PASSWORD_SUCCESSFULLY.message.description,
      jwt: new_token,
    });
  } catch (error) {
    next(error);
  }
};
