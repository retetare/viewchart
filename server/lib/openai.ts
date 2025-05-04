/**
 * Advanced chart analysis system with learning capabilities
 * This version simulates AI that can learn from both user feedback and online knowledge
 * In a real implementation, this would use OpenAI's GPT-4o Vision API
 */
import { TAnalysisResult, TAnalysisHistoryItem } from '@shared/types';

// Pre-defined market patterns from our reference document
const MARKET_PATTERNS = {
  continuation: [
    "Higher Highs & Higher Lows (Uptrend)",
    "Lower Highs & Lower Lows (Downtrend)",
    "Moving Average Alignment (Price above EMAs)",
    "Moving Average Alignment (Price below EMAs)",
    "Bollinger Band Squeeze"
  ],
  reversal: [
    "Break of Structure (Failed Higher Highs)",
    "Break of Structure (Failed Lower Lows)",
    "RSI Divergence",
    "MACD Divergence",
    "Exhaustion Move (Overextension beyond Bollinger Bands)"
  ],
  consolidation: [
    "Inside Bar Pattern",
    "Narrow Range Bars",
    "Ascending Triangle Formation",
    "Descending Triangle Formation",
    "Symmetrical Triangle Formation"
  ],
  breakout: [
    "Range Breakout (Above Resistance)",
    "Range Breakout (Below Support)",
    "Moving Average Crossover (Bullish)",
    "Moving Average Crossover (Bearish)",
    "Volume Spike Breakout"
  ],
  candlestick: [
    "Bullish Engulfing Pattern",
    "Bearish Engulfing Pattern",
    "Hammer Candlestick",
    "Inverted Hammer Candlestick",
    "Morning Star Pattern",
    "Evening Star Pattern",
    "Doji Formation"
  ]
};

// Pre-defined explanation templates for different pattern types
const EXPLANATION_TEMPLATES = {
  bullish: [
    "The chart shows clear signs of bullish momentum with %PATTERN%. We can observe: \n- Price forming higher lows, indicating buyer strength\n- Volume increasing on upward moves\n- Key support level forming at recent lows\n- Momentum indicators showing positive divergence\n- Moving averages beginning to turn upward\n\nWhile resistance exists overhead at %RESISTANCE%, the strength of the current pattern suggests a high probability of breaking through this level. The pattern's historical win rate of %WINRATE%% supports a bullish bias for the next candle.",
    
    "Analysis of this chart reveals a %PATTERN% which is typically bullish. Key observations include: \n- Strong support level holding at %SUPPORT%\n- Volume concentration during accumulation phase\n- RSI showing bullish momentum\n- Price consolidating above key moving averages\n- Previous resistance level now acting as support\n\nThis pattern historically leads to upward movements in %WINRATE%% of cases with a sample size of %SAMPLESIZE% occurrences. The primary risk factor would be a break below the current support level."
  ],
  
  bearish: [
    "The chart displays a classic %PATTERN% indicating bearish continuation. Notable features include: \n- Lower highs and lower lows forming a downtrend\n- Volume increasing on downward moves\n- Price breaking below key support level\n- Momentum indicators showing continued weakness\n- Moving averages in bearish alignment\n\nThe next support level is at %SUPPORT%, but momentum suggests a test of this level is likely. Historical data shows this pattern has a %WINRATE%% reliability in signaling further downside.",
    
    "This chart shows a %PATTERN% which historically leads to bearish movement. Key observations: \n- Resistance firmly established at %RESISTANCE%\n- Volume diminishing on upward attempts\n- MACD showing bearish crossover\n- Price failing to hold above key moving averages\n- Previous support levels broken\n\nBased on analysis of %SAMPLESIZE% historical occurrences, this pattern leads to downward movement in %WINRATE%% of cases. The primary invalidation point would be a strong close above the recent high."
  ]
};

// Storage for learned pattern confidence
const learnedPatterns: Map<string, {
  confidenceAdjustment: number,
  feedbackCount: number,
  successCount: number,
  lastUpdated: Date
}> = new Map();

// Storage for trading pair characteristics
const tradingPairProfile: Map<string, {
  patterns: {[key: string]: number},
  volatility: number,
  lastSeenPrice: number,
  firstSeenDate: Date,
  lastUpdated: Date
}> = new Map();

// Extract information from trading chart images
function extractTradingInfo(imageBase64: string): { 
  pair: string; 
  entry?: number; 
  stopLoss?: number; 
  takeProfit?: number;
  volume?: string;
  timeframe?: string;
  indicators?: string[];
} {
  // In a real implementation, this would use OCR and image analysis
  // For this demo, we'll return simulated values
  
  // Generate a random trading pair from common crypto or forex pairs
  const tradingPairs = [
    "BTC/USD", "ETH/USD", "XRP/USD", "SOL/USD", "ADA/USD",
    "EUR/USD", "GBP/USD", "USD/JPY", "USD/CAD", "AUD/USD"
  ];
  
  const pair = tradingPairs[Math.floor(Math.random() * tradingPairs.length)];
  
  // Generate realistic price based on the pair
  let basePrice = 0;
  if (pair === "BTC/USD") basePrice = 60000 + (Math.random() * 5000);
  else if (pair === "ETH/USD") basePrice = 3000 + (Math.random() * 500);
  else if (pair === "XRP/USD") basePrice = 0.5 + (Math.random() * 0.2);
  else if (pair === "SOL/USD") basePrice = 100 + (Math.random() * 30);
  else if (pair === "ADA/USD") basePrice = 0.4 + (Math.random() * 0.1);
  else if (pair.includes("/USD")) basePrice = 1 + (Math.random() * 0.2);
  
  // Format basePrice appropriately based on magnitude
  const entry = basePrice > 1000 ? Math.round(basePrice) : 
               basePrice > 100 ? Math.round(basePrice * 10) / 10 :
               basePrice > 1 ? Math.round(basePrice * 100) / 100 :
               Math.round(basePrice * 10000) / 10000;
  
  // Calculate stop loss and take profit based on volatility
  const volatilityFactor = 0.01 + (Math.random() * 0.02); // 1-3% volatility
  const stopLoss = pair.includes("BTC") || pair.includes("ETH") ? 
                   Math.round((entry * (1 - volatilityFactor)) * 100) / 100 :
                   Math.round((entry * (1 - volatilityFactor)) * 10000) / 10000;
                   
  const takeProfit = pair.includes("BTC") || pair.includes("ETH") ? 
                     Math.round((entry * (1 + volatilityFactor * 1.5)) * 100) / 100 :
                     Math.round((entry * (1 + volatilityFactor * 1.5)) * 10000) / 10000;
  
  // Generate volume
  const volume = pair.includes("BTC") ? (Math.random() * 5 + 0.5).toFixed(2) + "M" :
                pair.includes("ETH") ? (Math.random() * 10 + 2).toFixed(2) + "M" :
                (Math.random() * 50 + 10).toFixed(2) + "M";
  
  // Randomly choose a timeframe
  const timeframes = ["1m", "5m", "15m", "1H", "4H", "1D"];
  const timeframe = timeframes[Math.floor(Math.random() * timeframes.length)];
  
  // Identify indicators in the chart (would be done via image analysis in real implementation)
  const possibleIndicators = ["RSI", "MACD", "Bollinger Bands", "Moving Averages", "Volume"];
  const indicatorCount = Math.floor(Math.random() * 3) + 1;
  const indicators = [];
  
  for (let i = 0; i < indicatorCount; i++) {
    const idx = Math.floor(Math.random() * possibleIndicators.length);
    indicators.push(possibleIndicators[idx]);
    possibleIndicators.splice(idx, 1);
  }
  
  return {
    pair,
    entry,
    stopLoss,
    takeProfit,
    volume,
    timeframe,
    indicators
  };
}

// Enhanced pattern recognition based on image and previous feedback
function enhancedPatternRecognition(
  imageBase64: string, 
  tradingInfo: ReturnType<typeof extractTradingInfo>,
  historicalAnalyses: TAnalysisHistoryItem[] = []
): { 
  pattern: string; 
  prediction: "bullish" | "bearish";
  confidence: number;
} {
  // Pattern recognition would be done via the vision model in a real implementation
  // For now, we'll simulate pattern recognition with learning capabilities
  
  // Random selection process but biased by learning
  const categories = Object.keys(MARKET_PATTERNS);
  const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
  const patterns = MARKET_PATTERNS[selectedCategory as keyof typeof MARKET_PATTERNS];
  
  // Implement pattern selection with bias from feedback history
  let patternWeights = patterns.map(pattern => {
    // Default weight
    let weight = 1;
    
    // If we have learned about this pattern, adjust weight
    if (learnedPatterns.has(pattern)) {
      const patternData = learnedPatterns.get(pattern)!;
      weight += patternData.confidenceAdjustment;
      
      // Adjust based on success rate
      if (patternData.feedbackCount > 0) {
        const successRate = patternData.successCount / patternData.feedbackCount;
        weight *= (0.5 + successRate);
      }
    }
    
    // Check if this pair tends to form this pattern
    if (tradingPairProfile.has(tradingInfo.pair)) {
      const pairData = tradingPairProfile.get(tradingInfo.pair)!;
      if (pairData.patterns[pattern]) {
        weight *= (1 + pairData.patterns[pattern] / 10);
      }
    }
    
    // Check if we've seen this pattern in historical analyses
    const patternInHistory = historicalAnalyses.filter(item => 
      item.pattern === pattern && item.feedback === true
    ).length;
    
    weight *= (1 + patternInHistory / 10);
    
    return { pattern, weight };
  });
  
  // Normalize weights
  const totalWeight = patternWeights.reduce((sum, item) => sum + item.weight, 0);
  patternWeights = patternWeights.map(item => ({
    ...item,
    weight: item.weight / totalWeight
  }));
  
  // Weighted random selection
  const rand = Math.random();
  let cumulativeWeight = 0;
  let selectedPattern = patterns[0];
  
  for (const item of patternWeights) {
    cumulativeWeight += item.weight;
    if (rand <= cumulativeWeight) {
      selectedPattern = item.pattern;
      break;
    }
  }
  
  // Determine if bullish or bearish
  // Use price history for this pair if available
  let prediction: "bullish" | "bearish";
  let confidence = 60 + Math.floor(Math.random() * 30); // Base confidence 60-90
  
  if (tradingPairProfile.has(tradingInfo.pair)) {
    const pairData = tradingPairProfile.get(tradingInfo.pair)!;
    
    // If we know the last price, see if the current one is higher (bullish) or lower (bearish)
    if (pairData.lastSeenPrice && tradingInfo.entry) {
      prediction = tradingInfo.entry > pairData.lastSeenPrice ? "bullish" : "bearish";
      
      // Adjust confidence based on the strength of the move
      const priceChange = Math.abs((tradingInfo.entry / pairData.lastSeenPrice) - 1);
      confidence += Math.min(priceChange * 100, 10);
    } else {
      prediction = Math.random() > 0.5 ? "bullish" : "bearish";
    }
    
    // Consider pair volatility - higher volatility means lower confidence
    confidence -= Math.min(pairData.volatility * 10, 15);
  } else {
    prediction = Math.random() > 0.5 ? "bullish" : "bearish";
  }
  
  // Adjust confidence if we have data about this pattern
  if (learnedPatterns.has(selectedPattern)) {
    const patternData = learnedPatterns.get(selectedPattern)!;
    confidence += patternData.confidenceAdjustment;
    
    // Adjust based on pattern success rate
    if (patternData.feedbackCount > 0) {
      const successRate = patternData.successCount / patternData.feedbackCount;
      confidence += (successRate - 0.5) * 20; // Adjust up to +/-10 points
    }
  }
  
  // Cap confidence between 50-95
  confidence = Math.max(50, Math.min(95, confidence));
  
  return {
    pattern: selectedPattern,
    prediction,
    confidence
  };
}

// Generate statistics for the identified pattern
function generatePatternStatistics(pattern: string, historicalAnalyses: TAnalysisHistoryItem[] = []): {
  winRate: number;
  sampleSize: number;
} {
  // In a real implementation, this would use actual historical trading data
  // For this demo, we'll use a combination of simulated data and feedback history
  let winRate = 65 + Math.floor(Math.random() * 20); // Base win rate 65-85%
  let sampleSize = 150 + Math.floor(Math.random() * 350); // Base sample size 150-500
  
  // Adjust based on learned pattern data
  if (learnedPatterns.has(pattern)) {
    const patternData = learnedPatterns.get(pattern)!;
    
    if (patternData.feedbackCount > 0) {
      // Blend the learned success rate with base win rate
      const learnedRate = patternData.successCount / patternData.feedbackCount * 100;
      const blendFactor = Math.min(patternData.feedbackCount / 10, 0.8);
      winRate = Math.round((winRate * (1 - blendFactor)) + (learnedRate * blendFactor));
      
      // Add the feedback count to the sample size
      sampleSize += patternData.feedbackCount;
    }
  }
  
  // Further adjust based on historical analyses
  const patternHistory = historicalAnalyses.filter(item => item.pattern === pattern);
  if (patternHistory.length > 0) {
    const correctPredictions = patternHistory.filter(item => item.feedback === true).length;
    const historyRate = correctPredictions / patternHistory.length * 100;
    
    // Blend with increasing weight as we get more historical data
    const historyFactor = Math.min(patternHistory.length / 20, 0.6);
    winRate = Math.round((winRate * (1 - historyFactor)) + (historyRate * historyFactor));
    
    // Add to sample size
    sampleSize += patternHistory.length;
  }
  
  return {
    winRate,
    sampleSize
  };
}

// Generate price levels for explanation context
function generatePriceLevels(tradingInfo: ReturnType<typeof extractTradingInfo>): {
  support: string;
  resistance: string;
} {
  let support: number, resistance: number;
  
  if (tradingInfo.entry && tradingInfo.stopLoss && tradingInfo.takeProfit) {
    // Use the extracted values when available
    support = tradingInfo.stopLoss;
    resistance = tradingInfo.takeProfit;
  } else {
    // Generate random levels
    const basePrice = Math.floor(Math.random() * 100) + 50;
    support = basePrice * 0.95;
    resistance = basePrice * 1.05;
  }
  
  // Format numbers appropriately
  const supportStr = support > 1000 ? support.toFixed(0) : 
                     support > 100 ? support.toFixed(1) : 
                     support > 1 ? support.toFixed(2) : 
                     support.toFixed(4);
                     
  const resistanceStr = resistance > 1000 ? resistance.toFixed(0) : 
                         resistance > 100 ? resistance.toFixed(1) : 
                         resistance > 1 ? resistance.toFixed(2) : 
                         resistance.toFixed(4);
  
  return {
    support: supportStr,
    resistance: resistanceStr
  };
}

// Create detailed explanations with trading context
function createDetailedExplanation(
  pattern: string, 
  prediction: "bullish" | "bearish", 
  winRate: number, 
  sampleSize: number,
  priceLevels: { support: string; resistance: string },
  tradingInfo: ReturnType<typeof extractTradingInfo>
): string {
  // Select explanation template
  const explanationTemplates = EXPLANATION_TEMPLATES[prediction];
  const templateIndex = Math.floor(Math.random() * explanationTemplates.length);
  let explanation = explanationTemplates[templateIndex]
    .replace("%PATTERN%", pattern)
    .replace("%WINRATE%", winRate.toString())
    .replace("%SAMPLESIZE%", sampleSize.toString())
    .replace("%SUPPORT%", priceLevels.support)
    .replace("%RESISTANCE%", priceLevels.resistance);
  
  // Add trading pair specific context
  explanation += `\n\nFor ${tradingInfo.pair}${tradingInfo.timeframe ? ` on the ${tradingInfo.timeframe} timeframe` : ""}, this pattern is particularly significant.`;
  
  // Add indicator context if available
  if (tradingInfo.indicators && tradingInfo.indicators.length > 0) {
    explanation += ` The presence of ${tradingInfo.indicators.join(", ")} confirms this analysis.`;
  }
  
  // Add entry/exit advice
  if (tradingInfo.entry && tradingInfo.stopLoss && tradingInfo.takeProfit) {
    explanation += `\n\nThe current entry at ${tradingInfo.entry} offers a favorable risk:reward ratio with stop loss at ${tradingInfo.stopLoss} and take profit target at ${tradingInfo.takeProfit}.`;
  }
  
  return explanation;
}

// Update learning model with feedback
export function updateLearningModel(
  analysis: TAnalysisResult, 
  isCorrect: boolean
): void {
  const { pattern, prediction } = analysis;
  
  // Update pattern learning data
  if (!learnedPatterns.has(pattern)) {
    learnedPatterns.set(pattern, {
      confidenceAdjustment: 0,
      feedbackCount: 0,
      successCount: 0,
      lastUpdated: new Date()
    });
  }
  
  const patternData = learnedPatterns.get(pattern)!;
  patternData.feedbackCount += 1;
  
  if (isCorrect) {
    patternData.successCount += 1;
    patternData.confidenceAdjustment += 1;
  } else {
    patternData.confidenceAdjustment -= 1;
  }
  
  // Cap adjustment
  patternData.confidenceAdjustment = Math.max(-10, Math.min(10, patternData.confidenceAdjustment));
  patternData.lastUpdated = new Date();
  
  console.log(`AI learning updated for pattern "${pattern}": ${isCorrect ? 'Correct' : 'Incorrect'} prediction`);
}

/**
 * Analyze chart image and provide trading prediction
 * This enhanced version simulates learning from feedback and incorporating online knowledge
 */
export async function analyzeChartImage(
  base64Image: string, 
  historicalAnalyses: TAnalysisHistoryItem[] = []
): Promise<Omit<TAnalysisResult, 'id' | 'imageUrl' | 'timestamp' | 'feedback'>> {
  try {
    // In a production version with OpenAI, we would:
    // 1. Use Vision API to analyze the chart image
    // 2. Extract trading pair, indicators, and pattern
    // 3. Generate a prediction with explanation
    
    // For this simulation, we'll create a sophisticated result that demonstrates learning capabilities
    
    // Add a realistic processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Step 1: Extract trading information from the image
    const tradingInfo = extractTradingInfo(base64Image);
    
    // Step 2: Identify patterns with enhanced recognition
    const { pattern, prediction, confidence } = enhancedPatternRecognition(base64Image, tradingInfo, historicalAnalyses);
    
    // Step 3: Generate statistics for the pattern
    const { winRate, sampleSize } = generatePatternStatistics(pattern, historicalAnalyses);
    
    // Step 4: Generate price levels for context
    const priceLevels = generatePriceLevels(tradingInfo);
    
    // Step 5: Create a detailed explanation
    const explanation = createDetailedExplanation(
      pattern, 
      prediction, 
      winRate, 
      sampleSize, 
      priceLevels,
      tradingInfo
    );
    
    // Step 6: Update trading pair profile
    if (!tradingPairProfile.has(tradingInfo.pair)) {
      tradingPairProfile.set(tradingInfo.pair, {
        patterns: {},
        volatility: 0.02,
        lastSeenPrice: tradingInfo.entry || 0,
        firstSeenDate: new Date(),
        lastUpdated: new Date()
      });
    } else {
      const pairData = tradingPairProfile.get(tradingInfo.pair)!;
      
      // Update price and calculate volatility
      if (tradingInfo.entry && pairData.lastSeenPrice) {
        const priceChange = Math.abs((tradingInfo.entry / pairData.lastSeenPrice) - 1);
        // Exponential moving average for volatility
        pairData.volatility = pairData.volatility * 0.7 + priceChange * 0.3;
      }
      
      pairData.lastSeenPrice = tradingInfo.entry || pairData.lastSeenPrice;
      pairData.lastUpdated = new Date();
      
      // Update pattern frequency for this pair
      pairData.patterns[pattern] = (pairData.patterns[pattern] || 0) + 1;
    }
    
    // Log some info about the learning model
    console.log(`Generated analysis for ${tradingInfo.pair} with pattern "${pattern}" (confidence: ${confidence}%)`);
    
    return {
      pattern,
      prediction,
      confidence,
      winRate,
      sampleSize,
      explanation
    };
  } catch (error) {
    console.error("Error in chart analysis:", error);
    throw new Error("Failed to analyze chart image: " + (error instanceof Error ? error.message : String(error)));
  }
}
