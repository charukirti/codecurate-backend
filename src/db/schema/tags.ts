import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  displayName: varchar("display_name", { length: 50 }).unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
