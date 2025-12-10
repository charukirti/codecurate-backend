// create new user

import type { Request, Response, NextFunction } from 'express';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq, or } from 'drizzle-orm';
import { ConflictError, InternalError } from '../../shared/errors';
import bcrypt from 'bcryptjs';
import { SignUpInput } from './auth.schema';

export async function SignUp(
  req: Request<{}, {}, SignUpInput>,
  res: Response,
  next: NextFunction
) {
  try {
    // extract request body

    const { name, username, email, password } = req.body;

    // check user exist or not

    const [existingUser] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)));

    if (existingUser) {
      throw new ConflictError('User already exists!');
    }

    // hash password

    const hashedPassword = await bcrypt.hash(password, 10);

    // insert into DB

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        username,
        email,
        password: hashedPassword,
      })
      .returning();

    if (!newUser) {
      throw new InternalError('Failed to register user');
    }

    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
}

// Friday 5 DEC: worked on signup module
//TODO: monday 8 DEC work on signin, and other auth modules.
