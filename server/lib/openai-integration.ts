import OpenAI from "openai";
import { TAnalysisResult, TAnalysisHistoryItem } from '@shared/types';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Initialize OpenAI API client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to analyze chart images with OpenAI vision
export async function analyzeChartWithOpenAI(
  base64Image: string,
  historicalAnalyses: TAnalysisHistoryItem[] = []
): Promise<Omit<TAnalysisResult, 'id' | 'imageUrl' | 'timestamp' | 'feedback'>> {
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    // Prepare the image for vision API
    const imageContent = base64Image.startsWith('data:image/')
      ? base64Image
      : `data:image/png;base64,${base64Image}`;

    // Create system prompt with trading expertise
    const systemPrompt = `You are an expert trading chart analyst with deep knowledge of technical analysis and chart patterns.
I'll provide you a chart image for analysis. For each chart image:

1. Identify the most prominent chart pattern (e.g., "Bullish Engulfing Pattern", "Head and Shoulders", "Double Top", etc.)
2. Determine if the likely next candle movement will be "bullish" or "bearish"
3. Assign a confidence level (1-100%) for your prediction
4. Provide an estimated historical win rate (50-90%) for this pattern based on your trading knowledge
5. Estimate a sample size (50-500) for how many historical occurrences support this win rate
6. Extract any visible trading details (pair name, timeframe, entry price, stop loss, etc.)
7. Write a detailed explanation for your prediction (150-250 words)

Respond ONLY with valid JSON in this exact format:
{
  "pattern": "Pattern Name",
  "prediction": "bullish" OR "bearish",
  "confidence": 75,
  "winRate": 70,
  "sampleSize": 250,
  "explanation": "Detailed explanation with insights...",
  "tradingDetails": {
    "pair": "BTC/USD", 
    "entry": 45000,
    "stopLoss": 44000,
    "takeProfit": 47000,
    "timeframe": "4H"
  }
}`;

    // Create conversation with image and instructions
    const response = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this trading chart and provide a prediction for the next price movement. Include specific details about the pattern identified, price levels, and any indicators visible in the chart."
            },
            {
              type: "image_url",
              image_url: {
                url: imageContent
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
    });

    // Parse the response
    let content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    // Parse the JSON response
    const result = JSON.parse(content);
    
    // Ensure the result has the required fields
    if (!result.pattern || !result.prediction || !result.confidence || !result.explanation) {
      throw new Error("Invalid response format from OpenAI");
    }

    // Process and normalize the result
    const analysis = {
      pattern: result.pattern,
      prediction: result.prediction as "bullish" | "bearish",
      confidence: Math.min(100, Math.max(1, Math.round(Number(result.confidence)))),
      winRate: Math.min(90, Math.max(50, Math.round(Number(result.winRate || 65)))),
      sampleSize: Math.min(500, Math.max(50, Math.round(Number(result.sampleSize || 200)))),
      explanation: result.explanation
    };
    
    // Enhance explanation with trading details if available
    if (result.tradingDetails && Object.keys(result.tradingDetails).length > 0) {
      const details = result.tradingDetails;
      let detailsText = "\n\n";
      
      if (details.pair) {
        detailsText += `For ${details.pair}`;
        if (details.timeframe) {
          detailsText += ` on the ${details.timeframe} timeframe`;
        }
        detailsText += ", ";
      }
      
      if (details.entry) {
        detailsText += `the current entry at ${details.entry}`;
        if (details.stopLoss && details.takeProfit) {
          detailsText += ` offers a favorable risk:reward ratio with stop loss at ${details.stopLoss} and take profit target at ${details.takeProfit}.`;
        } else {
          detailsText += ".";
        }
      }
      
      if (detailsText.length > 4) {
        analysis.explanation += detailsText;
      }
    }
    
    return analysis;
  } catch (error) {
    console.error("Error in OpenAI chart analysis:", error);
    throw new Error("Failed to analyze chart with OpenAI: " + (error instanceof Error ? error.message : String(error)));
  }
}