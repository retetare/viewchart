import { TAnalysisResult } from "@shared/types";
import { TrendingUp, TrendingDown, Info, Check, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AnalysisResultProps {
  analysis: TAnalysisResult;
}

export default function AnalysisResult({ analysis }: AnalysisResultProps) {
  const isBullish = analysis.prediction === "bullish";
  
  // Function to determine the pattern category
  const getPatternCategory = (pattern: string) => {
    const patternLower = pattern.toLowerCase();
    if (patternLower.includes("higher high") || patternLower.includes("higher low") || 
        patternLower.includes("lower high") || patternLower.includes("lower low") || 
        patternLower.includes("moving average alignment") || patternLower.includes("bollinger band squeeze") ||
        patternLower.includes("uptrend") || patternLower.includes("downtrend")) {
      return "continuation";
    } else if (patternLower.includes("break of structure") || patternLower.includes("divergence") || 
              patternLower.includes("exhaustion") || patternLower.includes("reversal")) {
      return "reversal";
    } else if (patternLower.includes("inside bar") || patternLower.includes("narrow range") || 
              patternLower.includes("triangle") || patternLower.includes("consolidation")) {
      return "consolidation";
    } else if (patternLower.includes("breakout") || patternLower.includes("crossover") || 
              patternLower.includes("volume spike") || patternLower.includes("resistance") || 
              patternLower.includes("support")) {
      return "breakout";
    } else if (patternLower.includes("hammer") || patternLower.includes("engulfing") || 
              patternLower.includes("doji") || patternLower.includes("star") ||
              patternLower.includes("candle")) {
      return "candlestick";
    } else {
      return "candlestick"; // Default to candlestick if unable to categorize
    }
  };
  
  const patternCategory = getPatternCategory(analysis.pattern);
  
  // Format explanation for better readability
  const formatExplanation = (text: string) => {
    // Split by paragraphs or bullet points if they exist
    if (text.includes("- ")) {
      const segments = text.split("- ").filter(item => item.trim().length > 0);
      return (
        <>
          {segments.map((segment, index) => (
            <div key={index} className="flex items-start mb-2">
              <Check className="h-4 w-4 text-neutral mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400">{segment.trim()}</p>
            </div>
          ))}
        </>
      );
    }
    
    // If no bullet points, just return the text
    return <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>;
  };

  return (
    <div className="bg-white dark:bg-dark rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Analysis Results</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDistanceToNow(new Date(analysis.timestamp), { addSuffix: true })}
        </span>
      </div>

      {/* Main Prediction */}
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          isBullish ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
        }`}>
          {isBullish ? (
            <TrendingUp className="h-6 w-6 text-bullish" />
          ) : (
            <TrendingDown className="h-6 w-6 text-bearish" />
          )}
        </div>
        <div className="ml-3">
          <h3 className={`text-lg font-bold ${isBullish ? "text-bullish" : "text-bearish"}`}>
            {isBullish ? "Bullish Prediction" : "Bearish Prediction"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Next candle likely to move {isBullish ? "upward" : "downward"}
          </p>
        </div>
      </div>

      {/* Confidence Meter */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">Confidence Level</span>
          <span className={`text-sm font-bold ${
            analysis.confidence > 70 ? "text-bullish" : 
            analysis.confidence < 55 ? "text-bearish" : 
            "text-neutral"
          }`}>
            {analysis.confidence}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${
              isBullish ? "bg-gradient-to-r from-green-300 to-green-500" : 
                          "bg-gradient-to-r from-red-300 to-red-500"
            }`}
            style={{ width: `${analysis.confidence}%` }}
          ></div>
        </div>
      </div>

      {/* Pattern Information */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
        <div className="flex items-start">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium badge-${patternCategory}`}>
                {patternCategory.charAt(0).toUpperCase() + patternCategory.slice(1)}
              </span>
            </div>
            
            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {analysis.pattern}
            </h4>
            
            <div className="flex flex-wrap items-center mt-3 space-y-2">
              <div className="w-full flex items-center">
                <div className="w-28 mr-2 text-xs text-gray-500 dark:text-gray-400">Win Rate:</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                    <div 
                      className="bg-neutral h-1.5 rounded-full" 
                      style={{ width: `${analysis.winRate}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>50%</span>
                    <span className="font-medium">{analysis.winRate}%</span>
                    <span>90%</span>
                  </div>
                </div>
              </div>
              
              <div className="w-full flex items-center">
                <div className="w-28 mr-2 text-xs text-gray-500 dark:text-gray-400">Historical Data:</div>
                <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                  {analysis.sampleSize} occurrences
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <Info className="h-4 w-4 mr-1.5" />
          Analysis Explanation
        </h4>
        <div className="text-sm text-gray-600 dark:text-gray-400 ml-1.5">
          {formatExplanation(analysis.explanation)}
        </div>
      </div>
    </div>
  );
}
