import z from 'zod';
import Logger from '../utils/logger';

const envSchema = z.object({
  PORT: z.string().transform(Number).default(3001),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'Database connection string is missing'),
  YT_API_KEY: z.string().min(1, 'Youtube api key required').optional(),
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

const appConfig = {
  port: env.PORT!,
  node_env: env.NODE_ENV!,
  yt_api_key: env.YT_API_KEY!,
  db_url: env.DATABASE_URL!,
};

export default appConfig;
