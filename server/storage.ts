import { nanoid } from "nanoid";
import { users, type User, type InsertUser, analyses, TradingPair, tradingPairs, tradingPatterns, patternLearning, pairPatterns, aiStats, tradingDetails } from "@shared/schema";
import { TAnalysisResult, TAnalysisHistoryItem } from "@shared/types";
import { db } from "./db";
import { eq, desc, sql, and, isNull } from "drizzle-orm";
import { updateLearningModel } from "./lib/openai";
import { generateId } from "@/lib/utils";

// Storage interface with all CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Analysis methods
  getAnalysisHistory(): Promise<TAnalysisHistoryItem[]>;
  getAnalysisById(id: string): Promise<TAnalysisResult | null>;
  saveAnalysis(analysis: Omit<TAnalysisResult, 'id'>): Promise<TAnalysisResult>;
  updateAnalysisFeedback(id: string, isCorrect: boolean): Promise<TAnalysisResult | null>;
  
  // AI learning methods
  getPatternById(patternName: string): Promise<any | null>;
  updatePatternLearning(patternId: number, isCorrect: boolean): Promise<void>;
  getTradingPairByName(pairName: string): Promise<TradingPair | null>;
  updateTradingPairStats(pairId: number, patternId: number, isCorrect: boolean): Promise<void>;
  updateAiStats(newAnalysis?: boolean, newFeedback?: boolean, isCorrect?: boolean): Promise<void>;
}

// In-memory storage implementation (fallback)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private analyses: Map<string, TAnalysisResult>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.analyses = new Map();
    this.currentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Analysis methods
  async getAnalysisHistory(): Promise<TAnalysisHistoryItem[]> {
    const analyses = Array.from(this.analyses.values());
    
    // Sort by timestamp descending (newest first)
    analyses.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    // Convert to history item format (limited fields)
    return analyses.map(analysis => ({
      id: analysis.id,
      imageUrl: analysis.imageUrl,
      pattern: analysis.pattern,
      prediction: analysis.prediction,
      confidence: analysis.confidence,
      timestamp: analysis.timestamp,
      feedback: analysis.feedback
    }));
  }
  
  async getAnalysisById(id: string): Promise<TAnalysisResult | null> {
    return this.analyses.get(id) || null;
  }
  
  async saveAnalysis(analysis: Omit<TAnalysisResult, 'id'>): Promise<TAnalysisResult> {
    const id = generateId();
    const newAnalysis: TAnalysisResult = {
      id,
      ...analysis
    };
    
    this.analyses.set(id, newAnalysis);
    return newAnalysis;
  }
  
  async updateAnalysisFeedback(id: string, isCorrect: boolean): Promise<TAnalysisResult | null> {
    const analysis = this.analyses.get(id);
    
    if (!analysis) {
      return null;
    }
    
    const updatedAnalysis: TAnalysisResult = {
      ...analysis,
      feedback: isCorrect
    };
    
    this.analyses.set(id, updatedAnalysis);
    return updatedAnalysis;
  }
  
  // AI learning methods (stubs for MemStorage)
  async getPatternById(patternName: string): Promise<any | null> {
    return null;
  }
  
  async updatePatternLearning(patternId: number, isCorrect: boolean): Promise<void> {
    // No-op for MemStorage
  }
  
  async getTradingPairByName(pairName: string): Promise<TradingPair | null> {
    return null;
  }
  
  async updateTradingPairStats(pairId: number, patternId: number, isCorrect: boolean): Promise<void> {
    // No-op for MemStorage
  }
  
  async updateAiStats(newAnalysis?: boolean, newFeedback?: boolean, isCorrect?: boolean): Promise<void> {
    // No-op for MemStorage
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getAnalysisHistory(): Promise<TAnalysisHistoryItem[]> {
    try {
      const dbAnalyses = await db.select({
        id: analyses.id,
        imageUrl: analyses.imageUrl,
        pattern: analyses.pattern,
        prediction: analyses.prediction,
        confidence: analyses.confidence,
        timestamp: analyses.timestamp,
        feedback: analyses.feedback,
      })
      .from(analyses)
      .orderBy(desc(analyses.timestamp));
      
      return dbAnalyses.map(analysis => ({
        id: analysis.id,
        imageUrl: analysis.imageUrl,
        pattern: analysis.pattern,
        prediction: analysis.prediction as "bullish" | "bearish",
        confidence: Number(analysis.confidence),
        timestamp: analysis.timestamp.toISOString(),
        feedback: analysis.feedback
      }));
    } catch (error) {
      console.error("Error getting analysis history:", error);
      return [];
    }
  }

  async getAnalysisById(id: string): Promise<TAnalysisResult | null> {
    try {
      const [dbAnalysis] = await db.select().from(analyses).where(eq(analyses.id, id));
      
      if (!dbAnalysis) return null;
      
      return {
        id: dbAnalysis.id,
        imageUrl: dbAnalysis.imageUrl,
        pattern: dbAnalysis.pattern,
        prediction: dbAnalysis.prediction as "bullish" | "bearish",
        confidence: Number(dbAnalysis.confidence),
        winRate: Number(dbAnalysis.winRate),
        sampleSize: Number(dbAnalysis.sampleSize),
        explanation: dbAnalysis.explanation,
        timestamp: dbAnalysis.timestamp.toISOString(),
        feedback: dbAnalysis.feedback
      };
    } catch (error) {
      console.error("Error getting analysis by ID:", error);
      return null;
    }
  }

  async saveAnalysis(analysis: Omit<TAnalysisResult, 'id'>): Promise<TAnalysisResult> {
    try {
      const id = nanoid();
      
      // Find pattern ID if exists
      let patternId = null;
      const [pattern] = await db.select().from(tradingPatterns).where(eq(tradingPatterns.name, analysis.pattern));
      if (pattern) {
        patternId = pattern.id;
      }
      
      // Find or create trading pair if applicable
      let pairId = null;
      let tradingPairName = null;
      
      // Extract pair name from explanation if possible
      const pairMatch = analysis.explanation.match(/For ([A-Z]+\/[A-Z]+)/);
      if (pairMatch && pairMatch[1]) {
        tradingPairName = pairMatch[1];
        
        // Check if pair exists
        const [existingPair] = await db.select().from(tradingPairs).where(eq(tradingPairs.name, tradingPairName));
        
        if (existingPair) {
          pairId = existingPair.id;
        } else {
          // Create new pair
          const [newPair] = await db.insert(tradingPairs).values({
            name: tradingPairName,
            volatility: 0.02
          }).returning();
          
          pairId = newPair.id;
        }
      }
      
      // Insert analysis
      const [dbAnalysis] = await db.insert(analyses).values({
        id,
        imageUrl: analysis.imageUrl,
        pattern: analysis.pattern,
        patternId,
        tradingPair: tradingPairName,
        pairId,
        prediction: analysis.prediction,
        confidence: analysis.confidence,
        winRate: analysis.winRate,
        sampleSize: analysis.sampleSize,
        explanation: analysis.explanation,
        timestamp: new Date(analysis.timestamp),
        feedback: null
      }).returning();
      
      // Extract trading details if possible
      const entryMatch = analysis.explanation.match(/entry at (\d+[\.,]?\d*)/);
      const stopLossMatch = analysis.explanation.match(/stop loss at (\d+[\.,]?\d*)/);
      const takeProfitMatch = analysis.explanation.match(/take profit (?:target )?at (\d+[\.,]?\d*)/);
      const timeframeMatch = analysis.explanation.match(/on the (\d+[mhHD]) timeframe/);
      
      if (tradingPairName && (entryMatch || stopLossMatch || takeProfitMatch || timeframeMatch)) {
        await db.insert(tradingDetails).values({
          analysisId: id,
          pair: tradingPairName,
          entry: entryMatch ? parseFloat(entryMatch[1].replace(',', '.')) : null,
          stopLoss: stopLossMatch ? parseFloat(stopLossMatch[1].replace(',', '.')) : null,
          takeProfit: takeProfitMatch ? parseFloat(takeProfitMatch[1].replace(',', '.')) : null,
          timeframe: timeframeMatch ? timeframeMatch[1] : null,
          indicators: []
        });
      }
      
      // Update AI stats
      await this.updateAiStats(true);
      
      return {
        id,
        imageUrl: analysis.imageUrl,
        pattern: analysis.pattern,
        prediction: analysis.prediction,
        confidence: analysis.confidence,
        winRate: analysis.winRate,
        sampleSize: analysis.sampleSize,
        explanation: analysis.explanation,
        timestamp: analysis.timestamp,
        feedback: null
      };
    } catch (error) {
      console.error("Error saving analysis:", error);
      throw error;
    }
  }

  async updateAnalysisFeedback(id: string, isCorrect: boolean): Promise<TAnalysisResult | null> {
    try {
      // First get the current analysis
      const [existingAnalysis] = await db.select().from(analyses).where(eq(analyses.id, id));
      
      if (!existingAnalysis) {
        return null;
      }
      
      // Update the analysis with feedback
      const [updatedAnalysis] = await db.update(analyses)
        .set({ feedback: isCorrect })
        .where(eq(analyses.id, id))
        .returning();
      
      // Update pattern learning if we have pattern ID
      if (existingAnalysis.patternId) {
        await this.updatePatternLearning(existingAnalysis.patternId, isCorrect);
      }
      
      // Update trading pair stats if we have both pair and pattern IDs
      if (existingAnalysis.pairId && existingAnalysis.patternId) {
        await this.updateTradingPairStats(existingAnalysis.pairId, existingAnalysis.patternId, isCorrect);
      }
      
      // Update AI stats
      await this.updateAiStats(false, true, isCorrect);
      
      return {
        id: updatedAnalysis.id,
        imageUrl: updatedAnalysis.imageUrl,
        pattern: updatedAnalysis.pattern,
        prediction: updatedAnalysis.prediction as "bullish" | "bearish",
        confidence: Number(updatedAnalysis.confidence),
        winRate: Number(updatedAnalysis.winRate),
        sampleSize: Number(updatedAnalysis.sampleSize),
        explanation: updatedAnalysis.explanation,
        timestamp: updatedAnalysis.timestamp.toISOString(),
        feedback: updatedAnalysis.feedback
      };
    } catch (error) {
      console.error("Error updating analysis feedback:", error);
      return null;
    }
  }
  
  // AI learning methods
  async getPatternById(patternName: string): Promise<any | null> {
    try {
      const [pattern] = await db.select().from(tradingPatterns).where(eq(tradingPatterns.name, patternName));
      return pattern || null;
    } catch (error) {
      console.error("Error getting pattern by name:", error);
      return null;
    }
  }
  
  async updatePatternLearning(patternId: number, isCorrect: boolean): Promise<void> {
    try {
      // Check if we already have a learning record for this pattern
      const [existingLearning] = await db.select()
        .from(patternLearning)
        .where(eq(patternLearning.patternId, patternId));
      
      if (existingLearning) {
        // Update existing record
        await db.update(patternLearning)
          .set({
            feedbackCount: existingLearning.feedbackCount + 1,
            successCount: isCorrect ? existingLearning.successCount + 1 : existingLearning.successCount,
            confidenceAdjustment: isCorrect 
              ? Math.min(existingLearning.confidenceAdjustment + 1, 10) 
              : Math.max(existingLearning.confidenceAdjustment - 1, -10),
            lastUpdated: new Date()
          })
          .where(eq(patternLearning.id, existingLearning.id));
      } else {
        // Create new learning record
        await db.insert(patternLearning).values({
          patternId,
          feedbackCount: 1,
          successCount: isCorrect ? 1 : 0,
          confidenceAdjustment: isCorrect ? 1 : -1,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error("Error updating pattern learning:", error);
    }
  }
  
  async getTradingPairByName(pairName: string): Promise<TradingPair | null> {
    try {
      const [pair] = await db.select().from(tradingPairs).where(eq(tradingPairs.name, pairName));
      return pair || null;
    } catch (error) {
      console.error("Error getting trading pair by name:", error);
      return null;
    }
  }
  
  async updateTradingPairStats(pairId: number, patternId: number, isCorrect: boolean): Promise<void> {
    try {
      // Check if we already have a pair-pattern relationship
      const [existingRelationship] = await db.select()
        .from(pairPatterns)
        .where(and(
          eq(pairPatterns.pairId, pairId),
          eq(pairPatterns.patternId, patternId)
        ));
      
      if (existingRelationship) {
        // Update occurrence count and success rate
        const newOccurrenceCount = existingRelationship.occurrenceCount + 1;
        const totalSuccesses = isCorrect 
          ? (existingRelationship.successRate * existingRelationship.occurrenceCount) + 1
          : (existingRelationship.successRate * existingRelationship.occurrenceCount);
        const newSuccessRate = totalSuccesses / newOccurrenceCount;
        
        await db.update(pairPatterns)
          .set({
            occurrenceCount: newOccurrenceCount,
            successRate: newSuccessRate,
            lastUpdated: new Date()
          })
          .where(eq(pairPatterns.id, existingRelationship.id));
      } else {
        // Create new relationship
        await db.insert(pairPatterns).values({
          pairId,
          patternId,
          occurrenceCount: 1,
          successRate: isCorrect ? 1.0 : 0.0,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error("Error updating trading pair stats:", error);
    }
  }
  
  async updateAiStats(newAnalysis: boolean = false, newFeedback: boolean = false, isCorrect: boolean = false): Promise<void> {
    try {
      // Get current stats
      const [currentStats] = await db.select().from(aiStats).orderBy(desc(aiStats.id)).limit(1);
      
      if (!currentStats) {
        // Create initial stats if none exist
        await db.insert(aiStats).values({
          totalAnalyses: newAnalysis ? 1 : 0,
          feedbackCount: newFeedback ? 1 : 0,
          overallAccuracy: newFeedback && isCorrect ? 1.0 : 0.0,
          patternsLearned: 0,
          lastUpdated: new Date()
        });
        return;
      }
      
      // Calculate new values
      const newTotalAnalyses = newAnalysis ? currentStats.totalAnalyses + 1 : currentStats.totalAnalyses;
      const newFeedbackCount = newFeedback ? currentStats.feedbackCount + 1 : currentStats.feedbackCount;
      
      let newAccuracy = currentStats.overallAccuracy;
      if (newFeedback) {
        const totalCorrect = (currentStats.overallAccuracy * currentStats.feedbackCount) + (isCorrect ? 1 : 0);
        newAccuracy = totalCorrect / newFeedbackCount;
      }
      
      // Count unique patterns with feedback
      const patternQuery = await db.select({ count: sql<number>`count(distinct ${analyses.pattern})` })
        .from(analyses)
        .where(sql`${analyses.feedback} is not null`);
        
      const patternsLearned = patternQuery[0]?.count || 0;
      
      // Update stats
      await db.update(aiStats)
        .set({
          totalAnalyses: newTotalAnalyses,
          feedbackCount: newFeedbackCount,
          overallAccuracy: newAccuracy,
          patternsLearned,
          lastUpdated: new Date()
        })
        .where(eq(aiStats.id, currentStats.id));
    } catch (error) {
      console.error("Error updating AI stats:", error);
    }
  }
}

// Use database storage
export const storage = new DatabaseStorage();