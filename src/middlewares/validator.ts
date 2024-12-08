import type { NextFunction, Request, Response } from 'express';
import { ZodError, type z } from 'zod';
import { ERRORS } from '../shared/errors';

type RequestLocation = 'query' | 'body' | 'params';

export function validateRequest(
  location: RequestLocation,
  schema: z.AnyZodObject,
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<unknown> => {
    try {
      const validatedSchema = await schema.parseAsync(req[location]);
      req[location] = validatedSchema;
      next();
    } catch (error) {
      return res.status(ERRORS.MISDIRECTED_REQUEST.code).json({
        success: ERRORS.MISDIRECTED_REQUEST.success,
        error: error instanceof ZodError ? error.errors : error,
      });
    }
  };
}
