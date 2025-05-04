import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Moon, Sun, BrainCircuit, BarChart4, Sliders, 
  CheckCircle2, Lightbulb, PieChart
} from "lucide-react";

interface SettingsViewProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  historyStats: {
    patternsLearned: number;
    feedbackReceived: number;
    accuracy: number;
    topPattern: string;
  };
}

export default function SettingsView({ 
  darkMode, 
  toggleDarkMode,
  historyStats 
}: SettingsViewProps) {
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [learningMode, setLearningMode] = useState("active");
  
  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Settings</h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">ChartSense AI v1.0</span>
      </div>
      
      {/* Theme Toggle */}
      <div className="mb-5 bg-white dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center mb-3">
          {darkMode ? (
            <Moon className="h-5 w-5 text-neutral mr-2" />
          ) : (
            <Sun className="h-5 w-5 text-neutral mr-2" />
          )}
          <h3 className="font-medium">Appearance</h3>
        </div>
        
        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div>
            <div className="flex items-center">
              <h4 className="text-sm font-medium">Dark Mode</h4>
              <div className={`ml-2 px-1.5 py-0.5 text-[10px] font-medium uppercase rounded ${darkMode ? 'bg-neutral text-white' : 'bg-gray-200 text-gray-700'}`}>
                {darkMode ? 'ON' : 'OFF'}
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            </p>
          </div>
          <Switch 
            checked={darkMode} 
            onCheckedChange={toggleDarkMode} 
            id="dark-mode" 
          />
        </div>
      </div>
      
      {/* AI Engine Settings */}
      <div className="mb-5 bg-white dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <BrainCircuit className="h-5 w-5 text-neutral mr-2" />
          <h3 className="font-medium">AI Engine Settings</h3>
        </div>
        
        <div className="space-y-4">
          {/* Confidence Threshold */}
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="confidence-slider" className="text-sm font-medium">
                Confidence Threshold
              </Label>
              <span className="text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded">
                {confidenceThreshold}%
              </span>
            </div>
            
            <Slider
              id="confidence-slider"
              min={50}
              max={95}
              step={5}
              value={[confidenceThreshold]}
              onValueChange={(value) => setConfidenceThreshold(value[0])}
              className="mb-2"
            />
            
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Show All (50%)</span>
              <span>High Confidence (95%)</span>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Only show predictions with confidence above this threshold
            </p>
          </div>
          
          {/* Learning Mode */}
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <Label htmlFor="learning-mode" className="block text-sm font-medium mb-2">
              Learning Mode
            </Label>
            <Select 
              defaultValue={learningMode}
              onValueChange={setLearningMode}
            >
              <SelectTrigger id="learning-mode" className="w-full border border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Select learning mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disabled">Disabled (No learning)</SelectItem>
                <SelectItem value="active">Active (Learn from feedback)</SelectItem>
                <SelectItem value="aggressive">Aggressive (Learn faster)</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="mt-3 flex items-start text-xs">
              <Lightbulb className="h-4 w-4 text-neutral mt-0.5 mr-1.5 flex-shrink-0" />
              <p className="text-gray-500 dark:text-gray-400">
                {learningMode === "disabled" ? (
                  "AI will not learn from your feedback"
                ) : learningMode === "active" ? (
                  "AI will gradually learn from your feedback (recommended)"
                ) : (
                  "AI will learn rapidly from feedback but may be less stable"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Statistics */}
      <div className="bg-white dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <BarChart4 className="h-5 w-5 text-neutral mr-2" />
          <h3 className="font-medium">AI Learning Statistics</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center">
            <div className="text-lg font-bold text-neutral">{historyStats.patternsLearned}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Patterns Learned</div>
          </div>
          
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center">
            <div className="text-lg font-bold text-neutral">{historyStats.feedbackReceived}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Feedback Received</div>
          </div>
          
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center">
            <div className="flex items-center">
              <div className={`text-lg font-bold ${
                historyStats.accuracy > 70 ? "text-bullish" : 
                historyStats.accuracy < 50 ? "text-bearish" : 
                "text-neutral"
              }`}>
                {historyStats.accuracy.toFixed(1)}%
              </div>
              <CheckCircle2 className="h-4 w-4 text-bullish ml-1" />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Accuracy</div>
          </div>
          
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center">
            <div className="text-sm font-medium text-center text-neutral truncate max-w-full px-2">
              {historyStats.topPattern || "N/A"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Top Pattern</div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
          <PieChart className="h-3.5 w-3.5 mr-1.5" />
          <span>
            Statistics are based on your feedback and history
          </span>
        </div>
      </div>
    </div>
  );
}
