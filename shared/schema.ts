import { pgTable, varchar, text, timestamp, serial, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  profileImageUrl: text("profile_image_url"),
  phone: varchar("phone", { length: 20 }),
  dateOfBirth: varchar("date_of_birth", { length: 10 }),
  gender: varchar("gender", { length: 20 }),
  occupation: varchar("occupation", { length: 100 }),
  bio: text("bio"),
  verificationStatus: varchar("verification_status", { length: 50 }).default("unverified"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export const insertMessageSchema = createInsertSchema(messages);
