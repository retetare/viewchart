import { create } from "zustand";
import { TAnalysisResult, TAnalysisHistoryItem } from "@shared/types";

interface AnalysisState {
  currentImage: string | null;
  currentAnalysis: TAnalysisResult | null;
  isCapturing: boolean;
  isAnalyzing: boolean;
  history: TAnalysisHistoryItem[];
  
  // Actions
  setCapturing: (isCapturing: boolean) => void;
  setCurrentImage: (image: string | null) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setCurrentAnalysis: (analysis: TAnalysisResult | null) => void;
  setHistory: (history: TAnalysisHistoryItem[]) => void;
  addToHistory: (item: TAnalysisHistoryItem) => void;
  updateFeedback: (id: string, isCorrect: boolean) => void;
  clearCurrent: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  currentImage: null,
  currentAnalysis: null,
  isCapturing: false,
  isAnalyzing: false,
  history: [],
  
  setCapturing: (isCapturing) => set({ isCapturing }),
  setCurrentImage: (image) => set({ currentImage: image }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  setHistory: (history) => set({ history }),
  clearCurrent: () => set({ currentImage: null, currentAnalysis: null }),
  
  addToHistory: (item) => set((state) => ({
    history: [item, ...state.history]
  })),
  
  updateFeedback: (id, isCorrect) => set((state) => ({
    history: state.history.map(item => 
      item.id === id ? { ...item, feedback: isCorrect } : item
    ),
    currentAnalysis: state.currentAnalysis?.id === id 
      ? { ...state.currentAnalysis, feedback: isCorrect } 
      : state.currentAnalysis
  }))
}));
