import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema/users.js';
import { InternalError, InvalidCredentialError } from '../shared/errors.js';
import Logger from '../utils/logger.js';

async function createAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new InvalidCredentialError(
        'Admin email and password must be set in .env'
      );
    }

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail));

    if (existingUser) {
      Logger.info('Admin already exists');
    }

    await db.insert(users).values({
      name: 'Charukirti',
      username: 'charukirticc',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
  } catch (error) {
    console.error(error);
    throw new InternalError('Error while creating admin');
  }
}

createAdmin();
