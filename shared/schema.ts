import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const serverConfigs = pgTable("server_configs", {
  id: varchar("id").primaryKey(),
  serverId: varchar("server_id").notNull().unique(),
  verificationChannelId: varchar("verification_channel_id"),
  verificationRoleId: varchar("verification_role_id"),
  logsChannelId: varchar("logs_channel_id"),
  embedTitle: text("embed_title").default("🔐 Sistema de Verificação"),
  embedDescription: text("embed_description").default("Bem-vindo ao servidor! Para ter acesso completo, você precisa ser verificado por um membro existente."),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const verificationRequests = pgTable("verification_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull(),
  userId: varchar("user_id").notNull(),
  username: text("username").notNull(),
  referrerId: varchar("referrer_id").notNull(),
  referrerUsername: text("referrer_username").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected
  approvedBy: varchar("approved_by"),
  approvedByUsername: text("approved_by_username"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const verificationStats = pgTable("verification_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().unique(),
  totalVerified: text("total_verified").notNull().default("0"),
  totalPending: text("total_pending").notNull().default("0"),
  totalRejected: text("total_rejected").notNull().default("0"),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertServerConfigSchema = createInsertSchema(serverConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVerificationRequestSchema = createInsertSchema(verificationRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVerificationStatsSchema = createInsertSchema(verificationStats).omit({
  id: true,
  updatedAt: true,
});

export type InsertServerConfig = z.infer<typeof insertServerConfigSchema>;
export type ServerConfig = typeof serverConfigs.$inferSelect;

export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;
export type VerificationRequest = typeof verificationRequests.$inferSelect;

export type InsertVerificationStats = z.infer<typeof insertVerificationStatsSchema>;
export type VerificationStats = typeof verificationStats.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
