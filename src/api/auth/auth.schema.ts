import { z } from 'zod';

export const createUserSchema = z.object({
  firstName: z.string().min(2).max(30),
  lastName: z.string().min(2).max(30),
  email: z.string().email(),
  phoneNo: z.string().min(10).max(15),
  password: z.string().min(8).max(30),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(30),
});

export const updatePasswordSchema = z.object({
  oldPassword: z.string().min(8).max(30),
  newPassword: z.string().min(8).max(30),
});

export const verifyOtpSchema = z.object({
  otp: z.string().length(6),
});
