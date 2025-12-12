import z from 'zod';
import Logger from '../utils/logger';

const envSchema = z.object({
  ACCESS_TOKEN_SECRET: z.string().min(1, 'Access token secret is missing'),
  REFRESH_TOKEN_SECRET: z.string().min(1, 'Refresh token secret is required'),
  ACCESS_TOKEN_EXPIRY: z.string().default('1d'),
  REFRESH_TOKEN_EXPIRY: z.string().default('10d'),
});

function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    Logger.error('Environment variables are missing.', error);
    process.exit(1);
  }
}

const env = validateEnv();

const authConfig = {
  access_secret: env.ACCESS_TOKEN_SECRET!,
  access_token_expiry: env.ACCESS_TOKEN_EXPIRY!,
  refresh_secret: env.REFRESH_TOKEN_SECRET!,
  refresh_token_expiry: env.REFRESH_TOKEN_EXPIRY!,
};

export default authConfig;
