// Analysis result returned from AI
export type TAnalysisResult = {
  id: string;
  imageUrl: string;
  pattern: string;
  prediction: "bullish" | "bearish";
  confidence: number;
  winRate: number;
  sampleSize: number;
  explanation: string;
  timestamp: string;
  feedback: boolean | null;
};

// History item for displaying past analyses
export type TAnalysisHistoryItem = {
  id: string;
  imageUrl: string;
  pattern: string;
  prediction: "bullish" | "bearish";
  confidence: number;
  timestamp: string;
  feedback: boolean | null;
};

// Learning statistics
export type TLearningStats = {
  patternsLearned: number;
  feedbackReceived: number;
  accuracy: number;
  topPattern: string;
  topPatternWinRate: number;
};

// Settings configuration
export type TSettings = {
  confidenceThreshold: number;
  learningMode: "disabled" | "active" | "aggressive";
  darkMode: boolean;
};
