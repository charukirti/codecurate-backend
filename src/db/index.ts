import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema/index';
import appConfig from '../config/app.config';

const pool = new Pool({ connectionString: appConfig.db_url });
export const db = drizzle(pool, {
  schema,
  logger: appConfig.node_env === 'development' ? true : false,
});
