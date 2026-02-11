import {
  pgTable,
  varchar,
  uuid,
  timestamp,
  text,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role_enum', ['user', 'admin']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    username: varchar('username', { length: 100 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    role: roleEnum('role').default('user').notNull(),
    refreshToken: text('refresh_token'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('idx_users_email').on(table.email)]
);

// type for data coming out of database after querying
export type UserData = typeof users.$inferSelect;

// type for data going inside database
export type CreateUserData = typeof users.$inferInsert;
