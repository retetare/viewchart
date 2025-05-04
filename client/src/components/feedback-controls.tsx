import { useState } from "react";
import { Check, X, ThumbsUp, AlertTriangle, BrainCircuit } from "lucide-react";

interface FeedbackControlsProps {
  onFeedback: (isCorrect: boolean) => void;
}

export default function FeedbackControls({ onFeedback }: FeedbackControlsProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);
  
  const handleFeedback = (isCorrect: boolean) => {
    setFeedbackGiven(isCorrect);
    onFeedback(isCorrect);
  };
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <BrainCircuit className="h-5 w-5 text-neutral mr-2" />
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
          AI Learning System
        </h3>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Your feedback helps our AI improve. Each time you provide feedback on a prediction, the model adjusts its pattern recognition to become more accurate.
      </p>
      
      {feedbackGiven === null ? (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Was this analysis accurate?
          </h4>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleFeedback(true)}
              className="flex-1 bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-200 dark:border-gray-600 rounded-lg py-2.5 px-4 flex items-center justify-center transition-colors"
            >
              <Check className="h-5 w-5 text-bullish mr-2" />
              <span className="font-medium">Correct Prediction</span>
            </button>
            
            <button 
              onClick={() => handleFeedback(false)}
              className="flex-1 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-600 rounded-lg py-2.5 px-4 flex items-center justify-center transition-colors"
            >
              <X className="h-5 w-5 text-bearish mr-2" />
              <span className="font-medium">Incorrect Prediction</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-700">
          <div className="flex items-center">
            {feedbackGiven ? (
              <>
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                  <ThumbsUp className="h-5 w-5 text-bullish" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Feedback Recorded: Correct
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Thank you! The AI will strengthen this pattern recognition.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
                  <AlertTriangle className="h-5 w-5 text-bearish" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Feedback Recorded: Incorrect
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Thank you! The AI will refine this pattern analysis.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
