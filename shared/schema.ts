import { pgTable, text, serial, integer, boolean, timestamp, jsonb, foreignKey, uniqueIndex, real, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Trading pairs table for storing info about each pair
export const tradingPairs = pgTable("trading_pairs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  volatility: real("volatility").default(0.02).notNull(),
  lastPrice: real("last_price"),
  firstSeenDate: timestamp("first_seen_date").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Trading patterns table for storing all recognized patterns
export const tradingPatterns = pgTable("trading_patterns", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // continuation, reversal, breakout, etc.
  name: text("name").notNull().unique(),
  description: text("description"),
  defaultWinRate: integer("default_win_rate").default(70).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Pattern learning table for AI learning system
export const patternLearning = pgTable("pattern_learning", {
  id: serial("id").primaryKey(),
  patternId: integer("pattern_id").notNull().references(() => tradingPatterns.id),
  feedbackCount: integer("feedback_count").default(0).notNull(),
  successCount: integer("success_count").default(0).notNull(),
  confidenceAdjustment: integer("confidence_adjustment").default(0).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Pair-pattern relationship table for tracking which patterns work for which pairs
export const pairPatterns = pgTable("pair_patterns", {
  id: serial("id").primaryKey(),
  pairId: integer("pair_id").notNull().references(() => tradingPairs.id),
  patternId: integer("pattern_id").notNull().references(() => tradingPatterns.id),
  occurrenceCount: integer("occurrence_count").default(1).notNull(),
  successRate: real("success_rate").default(0.7).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
}, (table) => {
  return {
    unq: uniqueIndex("pair_pattern_unique_idx").on(table.pairId, table.patternId),
  };
});

// Analysis table for storing chart analyses
export const analyses = pgTable("analyses", {
  id: text("id").primaryKey(), // Using text ID for compatibility with previous system
  userId: integer("user_id").references(() => users.id),
  imageUrl: text("image_url").notNull(),
  pattern: text("pattern").notNull(),
  patternId: integer("pattern_id").references(() => tradingPatterns.id),
  tradingPair: text("trading_pair"),
  pairId: integer("pair_id").references(() => tradingPairs.id),
  prediction: text("prediction").notNull(),
  confidence: integer("confidence").notNull(),
  winRate: integer("win_rate").notNull(),
  sampleSize: integer("sample_size").notNull(),
  explanation: text("explanation").notNull(),
  entryPrice: real("entry_price"),
  stopLoss: real("stop_loss"),
  takeProfit: real("take_profit"),
  timeframe: text("timeframe"),
  indicators: text("indicators").array(),
  feedback: boolean("feedback"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Trading details table for extracted data from charts
export const tradingDetails = pgTable("trading_details", {
  id: serial("id").primaryKey(),
  analysisId: text("analysis_id").notNull().references(() => analyses.id),
  pair: text("pair").notNull(),
  entry: real("entry"),
  stopLoss: real("stop_loss"),
  takeProfit: real("take_profit"),
  volume: text("volume"),
  timeframe: text("timeframe"),
  indicators: jsonb("indicators"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// AI stats table for tracking learning progress
export const aiStats = pgTable("ai_stats", {
  id: serial("id").primaryKey(),
  totalAnalyses: integer("total_analyses").default(0).notNull(),
  feedbackCount: integer("feedback_count").default(0).notNull(),
  overallAccuracy: real("overall_accuracy").default(0).notNull(),
  patternsLearned: integer("patterns_learned").default(0).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  feedback: true,
  patternId: true,
  pairId: true,
  indicators: true,
});

export const insertTradingPairSchema = createInsertSchema(tradingPairs).omit({
  id: true,
  firstSeenDate: true,
  lastUpdated: true,
});

export const insertTradingPatternSchema = createInsertSchema(tradingPatterns).omit({
  id: true,
  lastUpdated: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;

export type InsertTradingPair = z.infer<typeof insertTradingPairSchema>;
export type TradingPair = typeof tradingPairs.$inferSelect;

export type InsertTradingPattern = z.infer<typeof insertTradingPatternSchema>;
export type TradingPattern = typeof tradingPatterns.$inferSelect;
