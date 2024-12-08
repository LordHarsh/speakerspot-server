import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string(),
  POSTGRESQL_URI: z.string(),
  POSTGRESQL_SSL: z.string(),
  NODE_ENV: z.string(),
  JWT_SECRET: z.string(),
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string(),
  EMAIL_SENDER: z.string(),
});

const env = envSchema.parse(process.env);
export type EnvSchemaType = z.infer<typeof envSchema>;

export default {
  PORT: env.PORT || 8080,
  POSTGRESQL_URI: process.env.POSTGRESQL_URI || '',
  POSTGRESQL_SSL: process.env.POSTGRESQL_SSL || '',
  NODE_ENV: env.NODE_ENV,
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },
  api: {
    prefix: '/api',
  },
  jwtSecret: process.env.JWT_SECRET || 'jwtsecret',
  google: {
    GOOGLE_SERVICE_ACCOUNT_EMAIL:
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY:
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '',
  },
  AWS: {
    AWS_REGION: process.env.AWS_REGION || 'ap-south-1',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    EMAIL_SENDER: process.env.EMAIL_SENDER || 'noreply@gmail.com',
  },
};
