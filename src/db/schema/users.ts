import {
  pgTable,
  varchar,
  uuid,
  boolean,
  timestamp,
  text,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  isAdmin: boolean('is_admin').default(false).notNull(),
  refreshToken: text('refresh_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// type for data coming out of database after querying
export type User = typeof users.$inferSelect;

// type for data going inside database
export type NewUser = typeof users.$inferInsert;
