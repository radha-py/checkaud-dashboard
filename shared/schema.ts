import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === MOCK DATA STRUCTURES (Simulating DB tables for type consistency) ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  // In a real app, we'd have password/auth fields.
  // For this mock, we just track the username.
});

// System Access Mapping
// In a real DB, this would be a many-to-many relation or jsonb column.
// Here we define the shape for our mock storage.
export const systemAccess = pgTable("system_access", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  systemId: text("system_id").notNull(),
});

export const scanRequests = pgTable("scan_requests", {
  id: serial("id").primaryKey(),
  systemId: text("system_id").notNull(),
  requestedBy: text("requested_by").notNull(),
  status: text("status").notNull(), // 'Pending', 'Running', 'Completed', 'Failed'
  requestedAt: timestamp("requested_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// === SCHEMAS ===

export const insertUserSchema = createInsertSchema(users);
export const insertScanRequestSchema = createInsertSchema(scanRequests).omit({ id: true, requestedAt: true, completedAt: true });

// === TYPES ===

export type User = typeof users.$inferSelect;
export type ScanRequest = typeof scanRequests.$inferSelect;
export type InsertScanRequest = z.infer<typeof insertScanRequestSchema>;

// Mock Data Types (Not in DB, but used in API)
export interface SystemNode {
  id: string;
  name: string;
  type: 'system' | 'folder' | 'file';
  children?: SystemNode[];
  metadata?: {
    lastScan?: string;
    complianceScore?: number;
  };
}

export interface KPI {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export interface AnalyticsData {
  systemId: string;
  systemName: string;
  kpis: KPI[];
  complianceOverTime: { date: string; score: number }[];
  issuesByCategory: { category: string; count: number }[];
}

export interface ChatbotMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export const chatbotQuerySchema = z.object({
  query: z.string(),
});
