import 'dotenv/config';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { db } from './index.js';
import Logger from '../utils/logger.js';

async function runMigrations() {
  Logger.info('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  Logger.info('Migrations completed!');
  process.exit(0);
}

runMigrations().catch((err) => {
  Logger.error('Migration failed!', err);
  process.exit(1);
});
