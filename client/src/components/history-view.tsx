import { useState } from "react";
import { TAnalysisHistoryItem } from "@shared/types";
import { TrendingUp, TrendingDown, Check, X, Clock, Filter, Search, BarChart4, Calendar } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface HistoryViewProps {
  history: TAnalysisHistoryItem[];
  isLoading: boolean;
  onSelectItem: (item: TAnalysisHistoryItem) => void;
}

export default function HistoryView({ history, isLoading, onSelectItem }: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "bullish" | "bearish">("all");
  
  // Calculate summary stats
  const totalEntries = history.length;
  const bullishCount = history.filter(item => item.prediction === "bullish").length;
  const bearishCount = history.filter(item => item.prediction === "bearish").length;
  
  // Get filtered history
  const filteredHistory = history.filter(item => {
    // Apply prediction filter
    if (filter !== "all" && item.prediction !== filter) {
      return false;
    }
    
    // Apply search term filter
    if (searchTerm && !item.pattern.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Group history by date
  const groupHistoryByDate = () => {
    const groups: Record<string, TAnalysisHistoryItem[]> = {};
    
    filteredHistory.forEach(item => {
      const date = new Date(item.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });
    
    return groups;
  };
  
  const groupedHistory = groupHistoryByDate();
  const dates = Object.keys(groupedHistory).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Analysis History</h2>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>{totalEntries} entries</span>
        </div>
      </div>
      
      {/* Stats bar */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex-1 p-2 rounded-lg bg-white dark:bg-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center">
          <BarChart4 className="h-4 w-4 text-neutral mr-1.5" />
          <span className="text-xs font-medium">{totalEntries} Total</span>
        </div>
        <div className="flex-1 p-2 rounded-lg bg-white dark:bg-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-bullish mr-1.5" />
          <span className="text-xs font-medium">{bullishCount} Bullish</span>
        </div>
        <div className="flex-1 p-2 rounded-lg bg-white dark:bg-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center">
          <TrendingDown className="h-4 w-4 text-bearish mr-1.5" />
          <span className="text-xs font-medium">{bearishCount} Bearish</span>
        </div>
      </div>
      
      {/* Search and filter */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-9 block w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark py-1.5 text-sm text-gray-900 dark:text-gray-100"
            placeholder="Search patterns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-1">
          <button 
            onClick={() => setFilter("all")} 
            className={`px-2.5 py-1 text-xs rounded-md border ${
              filter === "all" 
                ? "bg-neutral text-white border-neutral" 
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-dark"
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter("bullish")} 
            className={`px-2.5 py-1 text-xs rounded-md border ${
              filter === "bullish" 
                ? "bg-bullish text-white border-bullish" 
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-dark"
            }`}
          >
            Bullish
          </button>
          <button 
            onClick={() => setFilter("bearish")} 
            className={`px-2.5 py-1 text-xs rounded-md border ${
              filter === "bearish" 
                ? "bg-bearish text-white border-bearish" 
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-dark"
            }`}
          >
            Bearish
          </button>
        </div>
      </div>
      
      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 rounded-full border-4 border-neutral border-t-transparent animate-spin"></div>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {searchTerm || filter !== "all" ? (
            <>
              <Search className="h-8 w-8 mx-auto mb-3 opacity-60" />
              <p>No results found</p>
              <p className="text-xs mt-2">Try adjusting your search or filters</p>
            </>
          ) : (
            <>
              <Clock className="h-8 w-8 mx-auto mb-3 opacity-60" />
              <p>No analysis history yet</p>
              <p className="text-xs mt-2">Capture and analyze charts to build your history</p>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-y-auto">
          {dates.map(date => (
            <div key={date} className="mb-4">
              <div className="flex items-center mb-2">
                <Calendar className="h-4 w-4 text-neutral mr-1.5" />
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                </h3>
              </div>
              
              <div className="space-y-3">
                {groupedHistory[date].map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onSelectItem(item)}
                  >
                    <div className="flex mb-2">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden mr-3 flex-shrink-0">
                        <img src={item.imageUrl} alt="Chart thumbnail" className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-1">
                          <div className={`px-1.5 py-0.5 rounded text-xs font-medium flex items-center ${
                            item.prediction === 'bullish' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {item.prediction === 'bullish' ? (
                              <>
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Bullish
                              </>
                            ) : (
                              <>
                                <TrendingDown className="h-3 w-3 mr-1" />
                                Bearish
                              </>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                            {format(new Date(item.timestamp), 'h:mm a')}
                          </span>
                        </div>
                        
                        <h3 className="font-medium text-sm truncate">{item.pattern}</h3>
                        
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Confidence:</span>
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                            <div 
                              className={`${item.prediction === 'bullish' ? 'bg-bullish' : 'bg-bearish'} h-1 rounded-full`} 
                              style={{ width: `${item.confidence}%` }}
                            ></div>
                          </div>
                          <span className="ml-1 text-xs font-medium">{item.confidence}%</span>
                          
                          {item.feedback !== null && (
                            <div className="ml-auto text-xs flex items-center">
                              {item.feedback === true ? (
                                <span className="text-bullish flex items-center">
                                  <Check className="h-3 w-3 mr-0.5" /> Correct
                                </span>
                              ) : (
                                <span className="text-bearish flex items-center">
                                  <X className="h-3 w-3 mr-0.5" /> Incorrect
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
