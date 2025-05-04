import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { analyzeChartImage, updateLearningModel } from "./lib/openai";

// Input validation schemas
const imageAnalysisSchema = z.object({
  image: z.string().startsWith('data:image/')
});

const feedbackSchema = z.object({
  analysisId: z.string(),
  isCorrect: z.boolean()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get analysis history
  app.get("/api/history", async (req, res) => {
    try {
      const history = await storage.getAnalysisHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analysis history" });
    }
  });

  // Analyze chart image with AI
  app.post("/api/analyze", async (req, res) => {
    try {
      const { image } = imageAnalysisSchema.parse(req.body);
      
      // Get previous analyses for AI learning context
      const history = await storage.getAnalysisHistory();
      
      // Analyze the chart image using our enhanced AI model
      const analysis = await analyzeChartImage(image, history);
      
      // Save the analysis to storage
      const savedAnalysis = await storage.saveAnalysis({
        ...analysis,
        imageUrl: image,
        timestamp: new Date().toISOString(),
        feedback: null
      });
      
      res.json(savedAnalysis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input format", details: error.errors });
      } else {
        console.error("Error analyzing chart:", error);
        res.status(500).json({ message: "Failed to analyze chart image" });
      }
    }
  });

  // Submit feedback on analysis (with AI learning)
  app.post("/api/feedback", async (req, res) => {
    try {
      const { analysisId, isCorrect } = feedbackSchema.parse(req.body);
      
      // Get the existing analysis
      const existingAnalysis = await storage.getAnalysisById(analysisId);
      
      if (!existingAnalysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      
      // Update AI learning model with this feedback
      updateLearningModel(existingAnalysis, isCorrect);
      
      // Update the analysis with user feedback in storage
      const updatedAnalysis = await storage.updateAnalysisFeedback(analysisId, isCorrect);
      
      res.json(updatedAnalysis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input format", details: error.errors });
      } else {
        console.error("Error submitting feedback:", error);
        res.status(500).json({ message: "Failed to submit feedback" });
      }
    }
  });

  // Get analysis by ID
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const analysisId = req.params.id;
      const analysis = await storage.getAnalysisById(analysisId);
      
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      res.status(500).json({ message: "Failed to fetch analysis" });
    }
  });
  
  // Get trading pair statistics (for patterns that work well with specific pairs)
  app.get("/api/pairs/stats", async (req, res) => {
    try {
      // In a full implementation, this would retrieve statistics about 
      // which patterns perform best for each trading pair
      // For now, we'll return a simulated response
      res.json({
        "BTC/USD": {
          topPatterns: ["Bollinger Band Squeeze", "Moving Average Crossover (Bullish)"],
          averageAccuracy: 78.5,
          volatility: "medium"
        },
        "ETH/USD": {
          topPatterns: ["Higher Highs & Higher Lows (Uptrend)", "RSI Divergence"],
          averageAccuracy: 72.3,
          volatility: "high"
        },
      });
    } catch (error) {
      console.error("Error fetching pair statistics:", error);
      res.status(500).json({ message: "Failed to fetch pair statistics" });
    }
  });
  
  // Get AI learning statistics (for transparency on learning progress)
  app.get("/api/ai/stats", async (req, res) => {
    try {
      const history = await storage.getAnalysisHistory();
      
      // Calculate overall accuracy
      const feedbackItems = history.filter(item => item.feedback !== null);
      const correctPredictions = feedbackItems.filter(item => item.feedback === true).length;
      const accuracy = feedbackItems.length ? 
                      (correctPredictions / feedbackItems.length) * 100 : 0;
      
      // Count patterns by type
      const patternCounts: Record<string, number> = {};
      history.forEach(item => {
        patternCounts[item.pattern] = (patternCounts[item.pattern] || 0) + 1;
      });
      
      // Find most successful patterns
      const patternSuccess: Record<string, {count: number, correct: number, rate: number}> = {};
      feedbackItems.forEach(item => {
        if (!patternSuccess[item.pattern]) {
          patternSuccess[item.pattern] = { count: 0, correct: 0, rate: 0 };
        }
        
        patternSuccess[item.pattern].count += 1;
        if (item.feedback === true) {
          patternSuccess[item.pattern].correct += 1;
        }
      });
      
      // Calculate success rates
      Object.keys(patternSuccess).forEach(pattern => {
        const { count, correct } = patternSuccess[pattern];
        patternSuccess[pattern].rate = (correct / count) * 100;
      });
      
      // Sort patterns by success rate
      const topPatterns = Object.entries(patternSuccess)
        .filter(([_, stats]) => stats.count >= 2) // Require at least 2 samples
        .sort((a, b) => b[1].rate - a[1].rate)
        .slice(0, 5)
        .map(([pattern, stats]) => ({
          pattern,
          accuracy: Math.round(stats.rate * 10) / 10,
          samples: stats.count
        }));
      
      res.json({
        totalAnalyses: history.length,
        feedbackCount: feedbackItems.length,
        overallAccuracy: Math.round(accuracy * 10) / 10,
        patternsLearned: Object.keys(patternCounts).length,
        topPatterns,
        learningStatus: feedbackItems.length < 5 ? "initializing" : 
                        feedbackItems.length < 20 ? "learning" : 
                        "optimized"
      });
    } catch (error) {
      console.error("Error fetching AI stats:", error);
      res.status(500).json({ message: "Failed to fetch AI statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
