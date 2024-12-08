import type { NextFunction, Request, Response } from 'express';
import database from '../loaders/database';
import { verifyToken } from '../shared/jwt';
import { getModel } from '../shared/models';
import { OtpService } from '../shared/otp';
import type { ApiError } from './errorHandler';

export default function authenticateToken(ignoreVerified = false) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];
      if (!token) {
        throw { statusCode: 401, message: 'Token Not Found' };
      }
      const { email, role } = verifyToken(token);
      const Model = await getModel(role);
      const data = await Model.findOne({ where: { email } });
      if (!data) {
        throw { statusCode: 404, message: 'User Not Found' };
      }
      if (data.isDeleted) {
        throw { statusCode: 404, message: 'User Not Found' };
      }
      if (!ignoreVerified && data.verified === false) {
        await OtpService.sendOTPEmail(email);
        throw {
          statusCode: 401,
          message: `User Not Verified. First verify otp at /api/auth/${role}/verify-otp`,
        };
      }
      data.role = role;
      res.locals.user = data;
      next();
    } catch (error) {
      const err = error as ApiError;
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
      });
    }
  };
}
