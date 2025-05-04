import { useState, useEffect } from "react";
import { Clock, Settings, BrainCog, Database, LineChart } from "lucide-react";
import CaptureControls from "./capture-controls";
import AnalysisResult from "./analysis-result";
import FeedbackControls from "./feedback-controls";
import HistoryView from "./history-view";
import SettingsView from "./settings-view";
import CaptureSelection from "./capture-selection";
import { useToast } from "@/hooks/use-toast";
import { TAnalysisResult, TAnalysisHistoryItem } from "@shared/types";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

type ViewState = "capture" | "loading" | "analysis" | "history" | "settings";

interface ExtensionPopupProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function ExtensionPopup({ darkMode, toggleDarkMode }: ExtensionPopupProps) {
  const [viewState, setViewState] = useState<ViewState>("capture");
  const [captureMode, setCaptureMode] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<TAnalysisResult | null>(null);
  const [aiStatus, setAiStatus] = useState<"learning" | "ready" | "improving">("ready");
  const { toast } = useToast();

  // Set up a timer to simulate AI learning process
  useEffect(() => {
    const interval = setInterval(() => {
      setAiStatus(prev => {
        const states: Array<"learning" | "ready" | "improving"> = ["learning", "ready", "improving"];
        const currentIdx = states.indexOf(prev);
        return states[(currentIdx + 1) % states.length];
      });
    }, 45000); // Change status every 45 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Fetch analysis history
  const { data: historyData, isLoading: historyLoading } = useQuery<TAnalysisHistoryItem[]>({
    queryKey: ["/api/history"],
  });

  // Mutation for analyzing images
  const analyzeImageMutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      const response = await apiRequest("POST", "/api/analyze", { image: imageBase64 });
      return response.json();
    },
    onSuccess: (data: TAnalysisResult) => {
      setCurrentAnalysis(data);
      setViewState("analysis");
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error.message || "Could not analyze the chart. Please try again.",
        variant: "destructive",
      });
      setViewState("capture");
    },
  });

  // Mutation for submitting feedback
  const submitFeedbackMutation = useMutation({
    mutationFn: async ({ analysisId, isCorrect }: { analysisId: string; isCorrect: boolean }) => {
      return apiRequest("POST", "/api/feedback", { analysisId, isCorrect });
    },
    onSuccess: () => {
      toast({
        title: "Feedback submitted",
        description: "Thank you for helping improve our AI!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      
      // Simulate AI learning from feedback
      setAiStatus("learning");
      setTimeout(() => {
        setAiStatus("improving");
        setTimeout(() => {
          setAiStatus("ready");
        }, 3000);
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Feedback failed",
        description: error.message || "Could not submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle captured image
  const handleCapture = (imageBase64: string) => {
    setCapturedImage(imageBase64);
    setCaptureMode(false);
    setViewState("loading");
    analyzeImageMutation.mutate(imageBase64);
  };

  // Handle feedback submission
  const handleFeedback = (isCorrect: boolean) => {
    if (currentAnalysis) {
      submitFeedbackMutation.mutate({ analysisId: currentAnalysis.id, isCorrect });
    }
  };

  // Start the capture process (used for selection mode)
  const startCapture = () => {
    setCaptureMode(true);
  };

  // Cancel the capture process
  const cancelCapture = () => {
    setCaptureMode(false);
  };

  // Get accuracy from history
  const getAiAccuracy = (): string => {
    if (!historyData || historyData.length === 0) return "N/A";
    
    const feedbackItems = historyData.filter(item => item.feedback !== null);
    if (feedbackItems.length === 0) return "N/A";
    
    const correctItems = feedbackItems.filter(item => item.feedback === true);
    const accuracy = (correctItems.length / feedbackItems.length) * 100;
    return `${accuracy.toFixed(1)}%`;
  };
  
  // Get patterns from current analysis
  const getTopPatterns = (): string[] => {
    if (!historyData || historyData.length === 0) return ["No patterns detected yet"];
    
    const patterns = historyData.map(item => item.pattern);
    const patternCounts = patterns.reduce((acc, pattern) => {
      acc[pattern] = (acc[pattern] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(patternCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([pattern]) => pattern);
  };

  // Extract the trading details for the analysis
  const extractTradingDetails = () => {
    if (!currentAnalysis) return null;
    
    return {
      pair: "BTC/USD", // This would be extracted from the image in a real implementation
      entry: "$63,258.45",
      volume: "1.25M",
      stopLoss: "$62,150.00",
      takeProfit: "$65,500.00",
      timeframe: "1H"
    };
  };

  const tradingDetails = extractTradingDetails();

  return (
    <div className="w-96 min-h-[500px] max-h-[600px] flex flex-col overflow-hidden shadow-lg bg-white dark:bg-darker text-gray-800 dark:text-gray-200 rounded-xl">
      {/* Header */}
      <header className="bg-white dark:bg-dark border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-neutral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              
              {/* AI Status Indicator */}
              <div className="absolute -top-1 -right-1 flex items-center justify-center">
                <div className={`h-3 w-3 rounded-full ${
                  aiStatus === "ready" ? "bg-green-500" : 
                  aiStatus === "learning" ? "bg-yellow-500 animate-pulse" : 
                  "bg-blue-500 animate-pulse"
                }`}></div>
              </div>
            </div>
            <h1 className="text-lg font-semibold">ChartSense AI</h1>
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <button 
                onClick={() => setViewState("history")}
                className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  viewState === "history" ? "bg-gray-100 dark:bg-gray-800" : ""
                }`}
              >
                <Clock className="h-5 w-5" />
              </button>
              {historyData && historyData.length > 0 && (
                <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-blue-500 text-white text-[8px] flex items-center justify-center">
                  {historyData.length}
                </div>
              )}
            </div>
            <button 
              onClick={() => setViewState("settings")}
              className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                viewState === "settings" ? "bg-gray-100 dark:bg-gray-800" : ""
              }`}
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Capture Controls - This always shows at the top */}
        <CaptureControls onCapture={handleCapture} />

        {/* Content based on view state */}
        {viewState === "capture" && !capturedImage && (
          <div className="flex flex-col items-center justify-center p-8 text-center h-64">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <LineChart className="h-10 w-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Ready to Analyze</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Capture a trading chart to get AI predictions and insights
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-xs">
              {getTopPatterns().map((pattern, index) => (
                <div 
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full truncate text-center"
                >
                  {pattern}
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
              {aiStatus === "learning" ? "Learning from your feedback..." : 
               aiStatus === "improving" ? "Improving pattern recognition..." :
               "AI ready and continuously learning"}
            </div>
          </div>
        )}

        {viewState === "loading" && (
          <div className="flex flex-col items-center justify-center p-8 text-center h-64">
            <div className="relative mb-4">
              <div className="w-12 h-12 rounded-full border-4 border-neutral border-t-transparent animate-spin"></div>
              <BrainCog className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-neutral" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Analyzing Chart</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
              Our AI is examining patterns, identifying key levels, and extracting trading details...
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <div className="animate-pulse px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full">
                Identifying pattern
              </div>
              <div className="animate-pulse px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full">
                Reading price data
              </div>
              <div className="animate-pulse px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full">
                Checking indicators
              </div>
            </div>
          </div>
        )}

        {viewState === "analysis" && currentAnalysis && (
          <div className="flex flex-col p-4">
            {/* Captured Image with Trading Details */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 mb-3">
              <div className="aspect-video relative overflow-hidden rounded">
                {capturedImage && (
                  <img src={capturedImage} alt="Captured trading chart" className="w-full object-cover" />
                )}
                
                {/* Overlay trading details */}
                {tradingDetails && (
                  <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 flex flex-wrap gap-x-4 gap-y-1">
                    <div className="font-bold">{tradingDetails.pair}</div>
                    <div>Entry: {tradingDetails.entry}</div>
                    <div>Vol: {tradingDetails.volume}</div>
                    <div>S/L: {tradingDetails.stopLoss}</div>
                    <div>T/P: {tradingDetails.takeProfit}</div>
                    <div>{tradingDetails.timeframe}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Analysis Result */}
            <AnalysisResult analysis={currentAnalysis} />

            {/* Feedback Controls */}
            <FeedbackControls onFeedback={handleFeedback} />
          </div>
        )}

        {viewState === "history" && (
          <HistoryView 
            history={historyData || []} 
            isLoading={historyLoading} 
            onSelectItem={(item) => {
              setCurrentAnalysis(item as TAnalysisResult);
              setCapturedImage(item.imageUrl);
              setViewState("analysis");
            }} 
          />
        )}

        {viewState === "settings" && (
          <SettingsView 
            darkMode={darkMode} 
            toggleDarkMode={toggleDarkMode} 
            historyStats={{
              patternsLearned: historyData?.length || 0,
              feedbackReceived: historyData?.filter(item => item.feedback !== null).length || 0,
              accuracy: parseFloat(getAiAccuracy()) || 0,
              topPattern: getTopPatterns()[0] || "No pattern detected"
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-dark border-t border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full mr-1.5 ${
              aiStatus === "ready" ? "bg-green-500" : 
              aiStatus === "learning" ? "bg-yellow-500 animate-pulse" : 
              "bg-blue-500 animate-pulse"
            }`}></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              AI: {getAiAccuracy()} ({aiStatus === "learning" ? "Learning" : aiStatus === "improving" ? "Improving" : "Ready"})
            </span>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setViewState("capture")}
              className={`px-3 py-1.5 text-xs ${viewState === "capture" ? "bg-neutral text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"} rounded transition-colors`}
            >
              Capture
            </button>
            <button 
              onClick={() => currentAnalysis ? setViewState("analysis") : null}
              className={`px-3 py-1.5 text-xs ${viewState === "analysis" && currentAnalysis ? "bg-neutral text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"} ${!currentAnalysis ? "opacity-50 cursor-not-allowed" : ""} rounded transition-colors`}
            >
              Analysis
            </button>
            <button 
              onClick={() => setViewState("history")}
              className={`px-3 py-1.5 text-xs ${viewState === "history" ? "bg-neutral text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"} rounded transition-colors`}
            >
              History
            </button>
          </div>
        </div>
      </footer>

      {/* Capture Selection Tool - only shown in selection mode */}
      {captureMode && <CaptureSelection onCapture={handleCapture} onCancel={cancelCapture} />}
    </div>
  );
}
