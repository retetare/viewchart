import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon for use with WebSockets
neonConfig.webSocketConstructor = ws;

// Check if we have a database URL
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a connection pool to the database
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize Drizzle ORM with our schema
export const db = drizzle({ client: pool, schema });

// Function to initialize the database with default pattern data
export async function initializeDatabase() {
  try {
    console.log("Initializing database with default trading patterns...");
    
    // First, check if we already have pattern data
    const existingPatterns = await db.select().from(schema.tradingPatterns);
    
    if (existingPatterns.length > 0) {
      console.log(`Database already contains ${existingPatterns.length} trading patterns.`);
      return;
    }
    
    // Define pattern categories and their associated patterns
    const patternData = {
      continuation: [
        { name: "Higher Highs & Higher Lows (Uptrend)", defaultWinRate: 75, description: "A series of higher highs and higher lows, indicating a strong uptrend." },
        { name: "Lower Highs & Lower Lows (Downtrend)", defaultWinRate: 72, description: "A series of lower highs and lower lows, indicating a strong downtrend." },
        { name: "Moving Average Alignment (Price above EMAs)", defaultWinRate: 68, description: "Price trading above major moving averages that are aligned in bullish order." },
        { name: "Moving Average Alignment (Price below EMAs)", defaultWinRate: 67, description: "Price trading below major moving averages that are aligned in bearish order." },
        { name: "Bollinger Band Squeeze", defaultWinRate: 64, description: "Narrowing of Bollinger Bands indicating decreased volatility before a potential breakout." }
      ],
      reversal: [
        { name: "Break of Structure (Failed Higher Highs)", defaultWinRate: 66, description: "Failure to make a new higher high after an uptrend, suggesting a potential reversal." },
        { name: "Break of Structure (Failed Lower Lows)", defaultWinRate: 64, description: "Failure to make a new lower low after a downtrend, suggesting a potential reversal." },
        { name: "RSI Divergence", defaultWinRate: 70, description: "Price makes a higher high but RSI makes a lower high, or vice versa, indicating potential reversal." },
        { name: "MACD Divergence", defaultWinRate: 68, description: "Price makes a higher high but MACD makes a lower high, or vice versa, indicating potential reversal." },
        { name: "Exhaustion Move (Overextension beyond Bollinger Bands)", defaultWinRate: 60, description: "Price moves significantly outside Bollinger Bands, suggesting potential exhaustion and reversal." }
      ],
      consolidation: [
        { name: "Inside Bar Pattern", defaultWinRate: 55, description: "A bar that is completely within the range of the previous bar, indicating consolidation." },
        { name: "Narrow Range Bars", defaultWinRate: 53, description: "A series of bars with progressively smaller ranges, indicating consolidation." },
        { name: "Ascending Triangle Formation", defaultWinRate: 68, description: "A chart pattern characterized by a flat upper trendline and an upward-sloping lower trendline." },
        { name: "Descending Triangle Formation", defaultWinRate: 65, description: "A chart pattern characterized by a flat lower trendline and a downward-sloping upper trendline." },
        { name: "Symmetrical Triangle Formation", defaultWinRate: 60, description: "A chart pattern characterized by converging trendlines of similar slope." }
      ],
      breakout: [
        { name: "Range Breakout (Above Resistance)", defaultWinRate: 72, description: "Price breaking above a clearly defined resistance level with increased volume." },
        { name: "Range Breakout (Below Support)", defaultWinRate: 70, description: "Price breaking below a clearly defined support level with increased volume." },
        { name: "Moving Average Crossover (Bullish)", defaultWinRate: 65, description: "Faster MA crosses above slower MA, indicating potential upward momentum." },
        { name: "Moving Average Crossover (Bearish)", defaultWinRate: 64, description: "Faster MA crosses below slower MA, indicating potential downward momentum." },
        { name: "Volume Spike Breakout", defaultWinRate: 68, description: "Price breaking a significant level with a large increase in volume." }
      ],
      candlestick: [
        { name: "Bullish Engulfing Pattern", defaultWinRate: 73, description: "A bearish candle followed by a larger bullish candle that completely 'engulfs' the previous one." },
        { name: "Bearish Engulfing Pattern", defaultWinRate: 72, description: "A bullish candle followed by a larger bearish candle that completely 'engulfs' the previous one." },
        { name: "Hammer Candlestick", defaultWinRate: 65, description: "A candle with a small body, little or no upper shadow, and a long lower shadow." },
        { name: "Inverted Hammer Candlestick", defaultWinRate: 60, description: "A candle with a small body, little or no lower shadow, and a long upper shadow." },
        { name: "Morning Star Pattern", defaultWinRate: 70, description: "A three-candle pattern consisting of a large bearish candle, a small-bodied candle, and a large bullish candle." },
        { name: "Evening Star Pattern", defaultWinRate: 68, description: "A three-candle pattern consisting of a large bullish candle, a small-bodied candle, and a large bearish candle." },
        { name: "Doji Formation", defaultWinRate: 55, description: "A candle with a very small body, indicating indecision in the market." }
      ]
    };
    
    // Insert patterns into the database
    for (const [category, patterns] of Object.entries(patternData)) {
      for (const pattern of patterns) {
        await db.insert(schema.tradingPatterns).values({
          category,
          name: pattern.name,
          description: pattern.description,
          defaultWinRate: pattern.defaultWinRate
        });
      }
    }
    
    // Initialize AI stats
    await db.insert(schema.aiStats).values({
      totalAnalyses: 0,
      feedbackCount: 0,
      overallAccuracy: 0,
      patternsLearned: Object.values(patternData).flat().length
    });
    
    console.log("Database initialized successfully with trading patterns!");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}