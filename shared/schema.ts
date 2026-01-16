import { z } from "zod";

export const nationSchema = z.enum(["domestic", "export"]);
export type Nation = z.infer<typeof nationSchema>;

export const radarModelSchema = z.object({
  id: z.string(),
  month: z.string(),
  nation: nationSchema,
  rank: z.number(),
  prevRank: z.number().nullable(),
  modelName: z.string(),
  brandName: z.string(),
  sales: z.number(),
  prevSales: z.number(),
  momAbs: z.number(),
  momPct: z.number(),
  rankChange: z.number(),
  score: z.number(),
  danawaUrl: z.string(),
});

export type RadarModel = z.infer<typeof radarModelSchema>;

export const radarQuerySchema = z.object({
  month: z.string().optional(),
  nation: nationSchema.optional(),
  minSales: z.number().optional(),
  excludeNewEntry: z.boolean().optional(),
});

export type RadarQuery = z.infer<typeof radarQuerySchema>;

export const radarResponseSchema = z.object({
  data: z.array(radarModelSchema),
  currentMonth: z.string(),
  availableMonths: z.array(z.string()),
});

export type RadarResponse = z.infer<typeof radarResponseSchema>;

// Users table (kept for template compatibility)
import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

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
