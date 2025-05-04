import { useState, useRef, useEffect } from "react";
import { Camera, Upload, Info, ScreenShare, LayoutGrid, Clipboard, FastForward } from "lucide-react";

interface CaptureControlsProps {
  onCapture: (imageBase64: string) => void;
}

export default function CaptureControls({ onCapture }: CaptureControlsProps) {
  const [showTips, setShowTips] = useState(false);
  const [isPasteEnabled, setIsPasteEnabled] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureCountdown, setCaptureCountdown] = useState(0);
  const pasteAreaRef = useRef<HTMLDivElement>(null);
  
  // Enable paste event listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const imageDataUrl = event.target?.result as string;
              onCapture(imageDataUrl);
            };
            reader.readAsDataURL(blob);
            e.preventDefault();
            break;
          }
        }
      }
    };
    
    if (pasteAreaRef.current) {
      pasteAreaRef.current.addEventListener('paste', handlePaste);
    }
    
    // Check if clipboard API is available
    setIsPasteEnabled(!!navigator.clipboard);
    
    // Enable global paste
    document.addEventListener('paste', handlePaste);
    
    return () => {
      document.removeEventListener('paste', handlePaste);
      if (pasteAreaRef.current) {
        pasteAreaRef.current.removeEventListener('paste', handlePaste);
      }
    };
  }, [onCapture]);
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Read the file as a data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      onCapture(imageDataUrl);
    };
    reader.readAsDataURL(file);
  };
  
  // Capture entire webpage
  const captureEntirePage = () => {
    setIsCapturing(true);
    setCaptureCountdown(3);
    
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCaptureCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          
          // In a real Chrome extension, we would use:
          // chrome.tabs.captureVisibleTab({ format: 'png' }, dataUrl => {
          //   onCapture(dataUrl);
          // });
          
          // For this demo, we'll create a screenshot of the visible viewport
          setTimeout(() => {
            captureVisibleArea();
            setIsCapturing(false);
          }, 100);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Capture the visible viewport
  const captureVisibleArea = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // In a real extension, this would directly capture the DOM
        // For our demo, we'll create a simulated screenshot
        
        // First draw a background resembling a trading platform
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#151924");
        gradient.addColorStop(1, "#0f1520");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw header bar
        ctx.fillStyle = "#1e2333";
        ctx.fillRect(0, 0, canvas.width, 50);
        
        // Draw logo area
        ctx.fillStyle = "#2a3042";
        ctx.fillRect(20, 10, 120, 30);
        
        // Sidebar
        ctx.fillStyle = "#1a1f2e";
        ctx.fillRect(0, 50, 60, canvas.height - 50);
        
        // Draw some sidebar icons
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = "#3a4156";
          ctx.fillRect(15, 80 + i * 60, 30, 30);
        }
        
        // Draw main chart area
        ctx.fillStyle = "#0d1117";
        ctx.fillRect(70, 60, canvas.width - 80, canvas.height - 70);
        
        // Draw grid lines
        ctx.strokeStyle = "#1a2335";
        ctx.lineWidth = 1;
        
        // Vertical grid
        for (let i = 100; i < canvas.width - 80; i += 60) {
          ctx.beginPath();
          ctx.moveTo(i, 60);
          ctx.lineTo(i, canvas.height - 20);
          ctx.stroke();
        }
        
        // Horizontal grid
        for (let i = 100; i < canvas.height - 20; i += 60) {
          ctx.beginPath();
          ctx.moveTo(70, i);
          ctx.lineTo(canvas.width - 20, i);
          ctx.stroke();
        }
        
        // Draw pair name and metadata at top
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px Arial";
        ctx.fillText("BTC/USD", 80, 85);
        
        ctx.fillStyle = "#8a9aaa";
        ctx.font = "12px Arial";
        ctx.fillText("1 Hour", 180, 85);
        ctx.fillText("Entry: $63,258.45", 250, 85);
        ctx.fillText("Volume: 1.25M", 400, 85);
        ctx.fillText("S/L: $62,150.00", 520, 85);
        ctx.fillText("T/P: $65,500.00", 650, 85);
        
        // Price scale on right side
        for (let i = 100; i < canvas.height - 100; i += 80) {
          const price = 63000 - ((i - 100) * 0.8);
          ctx.fillStyle = "#8a9aaa";
          ctx.font = "10px Arial";
          ctx.fillText(price.toFixed(2), canvas.width - 70, i);
        }
        
        // Draw time labels at bottom
        const now = new Date();
        for (let i = 150; i < canvas.width - 100; i += 100) {
          const date = new Date(now);
          date.setHours(date.getHours() - Math.floor((canvas.width - i) / 100));
          ctx.fillStyle = "#8a9aaa";
          ctx.font = "10px Arial";
          ctx.fillText(date.getHours() + ":00", i, canvas.height - 30);
        }
        
        // Draw candlesticks
        const candleWidth = 12;
        const spacing = 12;
        const totalCandleWidth = candleWidth + spacing;
        const candles = Math.floor((canvas.width - 200) / totalCandleWidth);
        const midY = (canvas.height) / 2;
        
        for (let i = 0; i < candles; i++) {
          const x = 80 + i * totalCandleWidth;
          
          // Generate price trend (uptrend on left, downtrend, then uptrend again)
          let priceOffset = 0;
          const position = i / candles;
          
          if (position < 0.25) {
            priceOffset = -position * 200;
          } else if (position < 0.75) {
            priceOffset = -50 + (position - 0.25) * 400;
          } else {
            priceOffset = 250 - (position - 0.75) * 150;
          }
          
          const centerY = midY + priceOffset;
          
          // Is this candle bullish or bearish?
          let isBullish = Math.random() > 0.5;
          if (position < 0.25) {
            isBullish = Math.random() > 0.3; // More likely bullish
          } else if (position < 0.75) {
            isBullish = Math.random() > 0.7; // More likely bearish
          } else {
            isBullish = Math.random() > 0.2; // Strong bullish trend
          }
          
          const candleHeight = 20 + Math.random() * 60;
          const wickHeight = candleHeight * (0.3 + Math.random() * 0.8);
          
          // Draw wick
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + candleWidth / 2, centerY - wickHeight);
          ctx.lineTo(x + candleWidth / 2, centerY + wickHeight);
          ctx.stroke();
          
          // Draw candle body
          ctx.fillStyle = isBullish ? "#26a69a" : "#ef5350";
          if (isBullish) {
            ctx.fillRect(x, centerY, candleWidth, -candleHeight);
            ctx.strokeStyle = "#1b7269";
            ctx.strokeRect(x, centerY, candleWidth, -candleHeight);
          } else {
            ctx.fillRect(x, centerY, candleWidth, candleHeight);
            ctx.strokeStyle = "#c73a37";
            ctx.strokeRect(x, centerY, candleWidth, candleHeight);
          }
        }
        
        // Draw moving averages
        ctx.strokeStyle = "#ff9800";
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < candles; i++) {
          const x = 80 + i * totalCandleWidth + candleWidth / 2;
          const position = i / candles;
          
          let maY = 0;
          if (position < 0.3) {
            maY = midY - position * 200 + Math.sin(position * 20) * 20;
          } else if (position < 0.75) {
            maY = midY - 60 + (position - 0.3) * 400 + Math.sin(position * 20) * 20;
          } else {
            maY = midY + 220 - (position - 0.75) * 150 + Math.sin(position * 20) * 20;
          }
          
          if (i === 0) {
            ctx.moveTo(x, maY);
          } else {
            ctx.lineTo(x, maY);
          }
        }
        ctx.stroke();
        
        // Draw another MA
        ctx.strokeStyle = "#2196f3";
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < candles; i++) {
          const x = 80 + i * totalCandleWidth + candleWidth / 2;
          const position = i / candles;
          
          let maY = 0;
          if (position < 0.3) {
            maY = midY - position * 160 + Math.sin(position * 15) * 30;
          } else if (position < 0.75) {
            maY = midY - 48 + (position - 0.3) * 350 + Math.sin(position * 15) * 30;
          } else {
            maY = midY + 190 - (position - 0.75) * 120 + Math.sin(position * 15) * 30;
          }
          
          if (i === 0) {
            ctx.moveTo(x, maY);
          } else {
            ctx.lineTo(x, maY);
          }
        }
        ctx.stroke();
        
        // Draw volume at bottom
        for (let i = 0; i < candles; i++) {
          const x = 80 + i * totalCandleWidth;
          const position = i / candles;
          let volHeight = 5 + Math.random() * 40;
          
          // Higher volume at trend changes
          if (position > 0.23 && position < 0.29) volHeight += 40;
          if (position > 0.72 && position < 0.78) volHeight += 50;
          
          ctx.fillStyle = position < 0.25 || position > 0.75 
            ? "rgba(38, 166, 154, 0.3)" 
            : "rgba(239, 83, 80, 0.3)";
            
          ctx.fillRect(x, canvas.height - 60, candleWidth, -volHeight);
        }
        
        // Create indicators section
        ctx.fillStyle = "#1a1f2e";
        ctx.fillRect(70, canvas.height - 200, canvas.width - 80, 130);
        
        // Draw RSI
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(80, canvas.height - 130);
        ctx.lineTo(canvas.width - 20, canvas.height - 130);
        ctx.stroke();
        
        // RSI label
        ctx.fillStyle = "#8a9aaa";
        ctx.font = "12px Arial";
        ctx.fillText("RSI(14): 58.24", 80, canvas.height - 170);
        
        // Draw RSI line
        ctx.strokeStyle = "#f48fb1";
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < candles; i++) {
          const x = 80 + i * totalCandleWidth + candleWidth / 2;
          const position = i / candles;
          
          // RSI line fluctuating between 30-70
          let rsiY = canvas.height - 130 + Math.sin(position * 30) * 20;
          
          // Make RSI match price trends
          if (position < 0.25) {
            rsiY -= position * 50;
          } else if (position < 0.75) {
            rsiY -= 12.5 + (0.75 - position) * 50;
          } else {
            rsiY -= (position - 0.5) * 80;
          }
          
          if (i === 0) {
            ctx.moveTo(x, rsiY);
          } else {
            ctx.lineTo(x, rsiY);
          }
        }
        ctx.stroke();
        
        // Convert the canvas to a data URL and pass it to the capture handler
        const screenshot = canvas.toDataURL("image/png");
        onCapture(screenshot);
      }
    } catch (error) {
      console.error("Error capturing screen:", error);
    }
  };
  
  const captureHints = [
    "Click 'Capture Screen' to automatically capture the entire trading chart.",
    "All chart details like pair name, entry price, and indicators will be analyzed.",
    "You can also paste a chart image directly (Ctrl+V or Command+V).",
    "For best results, ensure price action and indicators are clearly visible.",
  ];
  
  return (
    <div className="p-4 bg-gray-50 dark:bg-dark border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium flex items-center">
          <ScreenShare className="h-4 w-4 text-neutral mr-1.5" />
          Trading Chart Analysis
        </h3>
        <button 
          onClick={() => setShowTips(!showTips)}
          className="text-xs flex items-center text-neutral hover:underline"
        >
          <Info className="h-3.5 w-3.5 mr-1" />
          {showTips ? "Hide Tips" : "Show Tips"}
        </button>
      </div>
      
      {showTips && (
        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
            <div className="font-medium text-sm mb-1 text-blue-700 dark:text-blue-400">Analysis Tips</div>
            {captureHints.map((hint, index) => (
              <div key={index} className="flex items-start">
                <div className="h-4 w-4 text-blue-500 mr-1.5 flex-shrink-0 mt-0.5">•</div>
                <p>{hint}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Capture area - hidden but captures paste events */}
      <div 
        ref={pasteAreaRef} 
        className="absolute opacity-0 pointer-events-none" 
        contentEditable 
        tabIndex={-1}
      />
      
      <div className="flex items-center justify-center space-x-3 mb-4">
        <button 
          onClick={captureEntirePage}
          disabled={isCapturing}
          className={`flex-1 ${
            isCapturing 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-neutral hover:bg-blue-600"
          } text-white rounded-lg py-2.5 px-4 flex items-center justify-center transition-colors`}
        >
          {isCapturing ? (
            <>
              <FastForward className="h-5 w-5 mr-2 animate-pulse" />
              Capturing in {captureCountdown}...
            </>
          ) : (
            <>
              <Camera className="h-5 w-5 mr-2" />
              Capture Screen
            </>
          )}
        </button>
        
        <div className="relative">
          <input
            type="file"
            id="chart-upload"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileUpload}
          />
          <button 
            className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg py-2.5 px-4 flex items-center justify-center transition-colors"
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload
          </button>
        </div>
      </div>
      
      <button
        onClick={() => pasteAreaRef.current?.focus()}
        className="w-full py-2 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center mb-3"
      >
        <Clipboard className="h-4 w-4 text-neutral mr-2" />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Click here and paste image (Ctrl+V)
        </span>
      </button>
      
      <div className="flex items-center justify-center">
        <div className="flex items-center px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full">
          <div className="flex items-center mr-3">
            <LayoutGrid className="h-3.5 w-3.5 text-neutral mr-1" />
            <span className="text-xs font-medium">Automatic Detection:</span>
          </div>
          <div className="text-xs text-gray-500 truncate">
            Trading Pair, Entry Price, Volume, Stop Loss, Take Profit
          </div>
        </div>
      </div>
    </div>
  );
}
