import { useEffect, useRef, useState } from "react";
import { XCircle, Check, RefreshCw, Camera, CropIcon, HelpCircle } from "lucide-react";

interface CaptureSelectionProps {
  onCapture: (imageBase64: string) => void;
  onCancel: () => void;
}

// Chart patterns to simulate
const CHART_PATTERNS = [
  "Bullish Trend (Higher Highs & Higher Lows)",
  "Bearish Trend (Lower Highs & Lower Lows)",
  "Bullish Engulfing Pattern",
  "Bearish Engulfing Pattern",
  "Double Top Pattern",
  "Double Bottom Pattern",
  "Moving Average Crossover",
  "Bollinger Band Squeeze"
];

export default function CaptureSelection({ onCapture, onCancel }: CaptureSelectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState({ x: 0, y: 0 });
  const [showHelp, setShowHelp] = useState(false);
  const [selectionComplete, setSelectionComplete] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState(CHART_PATTERNS[0]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const captureAreaRef = useRef<HTMLDivElement>(null);
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate a simulated chart
  useEffect(() => {
    // Generate a random pattern each time
    setSelectedPattern(CHART_PATTERNS[Math.floor(Math.random() * CHART_PATTERNS.length)]);
    
    drawSimulatedChart();
  }, []);
  
  // Function to draw a simulated chart for demonstration
  const drawSimulatedChart = () => {
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth - 200;
    canvas.height = window.innerHeight - 200;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      // Fill with a gradient background (simulating a website/trading platform)
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#1c2030");
      gradient.addColorStop(1, "#0f1520");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid lines
      ctx.strokeStyle = "#2a3040";
      ctx.lineWidth = 1;
      
      // Vertical grid lines
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal grid lines
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
      
      // Draw price labels
      ctx.fillStyle = "#8f9aab";
      ctx.font = "10px Arial";
      for (let i = 0; i < canvas.height; i += 50) {
        const price = 1000 - (i / 50) * 10;
        ctx.fillText(price.toFixed(2), 5, i + 10);
      }
      
      // Timestamp labels on bottom
      for (let i = 0; i < canvas.width; i += 100) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor((canvas.width - i) / 100));
        const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        ctx.fillText(dateStr, i, canvas.height - 5);
      }
      
      // Draw candlesticks based on selected pattern
      const candleWidth = 14;
      const candleSpacing = 6;
      const totalWidth = candleWidth + candleSpacing;
      const candleCount = Math.floor(canvas.width / totalWidth) - 5;
      const baseY = canvas.height / 2;
      
      let isUptrend = selectedPattern.includes("Bullish");
      let isDowntrend = selectedPattern.includes("Bearish");
      let isEngulfing = selectedPattern.includes("Engulfing");
      let isDoubleTop = selectedPattern.includes("Double Top");
      let isDoubleBottom = selectedPattern.includes("Double Bottom");
      let isMACrossover = selectedPattern.includes("Moving Average");
      let isBBSqueeze = selectedPattern.includes("Bollinger");
      
      // Draw MA lines if showing a crossover
      if (isMACrossover) {
        // Fast MA (20)
        ctx.strokeStyle = "#3e98ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        let fastMA = [];
        for (let i = 0; i < candleCount; i++) {
          const x = i * totalWidth + candleWidth / 2;
          const sineOffset = Math.sin(i / 10) * 40;
          const y = baseY + sineOffset - (i > candleCount * 0.7 ? (i - candleCount * 0.7) * 2 : 0);
          fastMA.push({ x, y });
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        
        // Slow MA (50)
        ctx.strokeStyle = "#ff6b3e";
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < candleCount; i++) {
          const x = i * totalWidth + candleWidth / 2;
          const sineOffset = Math.sin(i / 20) * 50;
          const y = baseY + sineOffset + (i < candleCount * 0.7 ? 20 : -10);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      
      // Draw Bollinger Bands if showing a squeeze
      if (isBBSqueeze) {
        const middleBand = [];
        const upperBand = [];
        const lowerBand = [];
        
        // Calculate bands
        for (let i = 0; i < candleCount; i++) {
          const x = i * totalWidth + candleWidth / 2;
          const sineOffset = Math.sin(i / 15) * 30;
          const middleY = baseY + sineOffset;
          
          // Bands get tighter in the middle (the squeeze)
          const multiplier = i < candleCount * 0.4 || i > candleCount * 0.7 
            ? 50 : 20 - (Math.abs(i - candleCount * 0.55) * 0.5);
          
          middleBand.push({ x, y: middleY });
          upperBand.push({ x, y: middleY - multiplier });
          lowerBand.push({ x, y: middleY + multiplier });
        }
        
        // Draw middle band (MA)
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        middleBand.forEach((point, i) => {
          if (i === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        
        // Draw upper band
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        upperBand.forEach((point, i) => {
          if (i === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        
        // Draw lower band
        ctx.beginPath();
        lowerBand.forEach((point, i) => {
          if (i === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      }
      
      // Generate candlestick data
      for (let i = 0; i < candleCount; i++) {
        const x = i * totalWidth;
        let isUp = false;
        
        // Determine if candle is up or down based on pattern
        if (isUptrend) {
          isUp = Math.random() > 0.3;
          if (i > candleCount * 0.5) {
            isUp = Math.random() > 0.1; // Stronger uptrend in second half
          }
        } else if (isDowntrend) {
          isUp = Math.random() > 0.7;
          if (i > candleCount * 0.5) {
            isUp = Math.random() > 0.9; // Stronger downtrend in second half
          }
        } else if (isEngulfing) {
          if (isUptrend) {
            // Bullish engulfing
            isUp = i < candleCount - 2 ? (Math.random() > 0.6) : (i === candleCount - 2 ? false : true);
          } else {
            // Bearish engulfing
            isUp = i < candleCount - 2 ? (Math.random() > 0.4) : (i === candleCount - 2 ? true : false);
          }
        } else if (isDoubleTop) {
          // Create a pattern with two peaks
          const phase = i / candleCount;
          if (phase < 0.33 || (phase > 0.5 && phase < 0.8)) {
            isUp = Math.random() > 0.3; // Uptrend phases
          } else {
            isUp = Math.random() > 0.7; // Downtrend phases
          }
        } else if (isDoubleBottom) {
          // Create a pattern with two valleys
          const phase = i / candleCount;
          if (phase < 0.33 || (phase > 0.5 && phase < 0.8)) {
            isUp = Math.random() > 0.7; // Downtrend phases
          } else {
            isUp = Math.random() > 0.3; // Uptrend phases
          }
        } else {
          // Random pattern
          isUp = Math.random() > 0.5;
        }
        
        // Calculate candle dimensions
        let candleHeight = 30 + Math.random() * 40;
        let wickHeight = candleHeight * (0.3 + Math.random() * 0.7);
        
        // Special case for engulfing pattern
        if (isEngulfing && i === candleCount - 1) {
          candleHeight = candleHeight * 1.8; // Make the engulfing candle larger
        }
        
        // Calculate Y position with trend
        let positionOffset = 0;
        if (isUptrend) {
          positionOffset = -i * 0.5;
        } else if (isDowntrend) {
          positionOffset = i * 0.5;
        } else if (isDoubleTop) {
          const phase = i / candleCount;
          if (phase < 0.33) {
            positionOffset = -i;
          } else if (phase < 0.5) {
            positionOffset = -(candleCount * 0.33) + (i - candleCount * 0.33) * 2;
          } else if (phase < 0.8) {
            positionOffset = -i * 0.5;
          } else {
            positionOffset = -(candleCount * 0.8 * 0.5) + (i - candleCount * 0.8) * 2;
          }
        } else if (isDoubleBottom) {
          const phase = i / candleCount;
          if (phase < 0.33) {
            positionOffset = i;
          } else if (phase < 0.5) {
            positionOffset = (candleCount * 0.33) - (i - candleCount * 0.33) * 2;
          } else if (phase < 0.8) {
            positionOffset = i * 0.5;
          } else {
            positionOffset = (candleCount * 0.8 * 0.5) - (i - candleCount * 0.8) * 2;
          }
        }
        
        const centerY = baseY + positionOffset;
        
        // Draw wicks
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + candleWidth / 2, centerY - wickHeight);
        ctx.lineTo(x + candleWidth / 2, centerY + wickHeight);
        ctx.stroke();
        
        // Draw candle body
        ctx.fillStyle = isUp ? "#26a69a" : "#ef5350";
        if (isUp) {
          ctx.fillRect(x, centerY, candleWidth, -candleHeight);
        } else {
          ctx.fillRect(x, centerY, candleWidth, candleHeight);
        }
        
        // Draw candle outline
        ctx.strokeStyle = isUp ? "#1c7d74" : "#cc3a36";
        ctx.lineWidth = 1;
        if (isUp) {
          ctx.strokeRect(x, centerY, candleWidth, -candleHeight);
        } else {
          ctx.strokeRect(x, centerY, candleWidth, candleHeight);
        }
      }
      
      // Draw volume bars at bottom
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      for (let i = 0; i < candleCount; i++) {
        const x = i * totalWidth;
        const volHeight = 5 + Math.random() * 25;
        const extraVol = isMACrossover && i > candleCount * 0.7 ? 40 : 0;
        ctx.fillRect(x, canvas.height - 30, candleWidth, -(volHeight + extraVol));
      }
      
      // Add pattern label
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px Arial";
      ctx.fillText(selectedPattern, 10, 20);
      ctx.font = "10px Arial";
      ctx.fillText("BTCUSD - 1 Hour", 10, 40);
    }
    
    if (chartCanvasRef.current) {
      const context = chartCanvasRef.current.getContext("2d");
      if (context) {
        chartCanvasRef.current.width = canvas.width;
        chartCanvasRef.current.height = canvas.height;
        context.drawImage(canvas, 0, 0);
      }
    }
    
    return canvas;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (containerRef.current && !selectionComplete) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setStartPos({ x, y });
      setEndPos({ x, y });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && containerRef.current && !selectionComplete) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
      const y = Math.min(Math.max(0, e.clientY - rect.top), rect.height);
      
      setEndPos({ x, y });
    }
  };

  const handleMouseUp = async () => {
    if (isDragging && !selectionComplete) {
      setIsDragging(false);
      const width = Math.abs(endPos.x - startPos.x);
      const height = Math.abs(endPos.y - startPos.y);
      
      if (width < 50 || height < 50) {
        // Too small selection, ignore
        return;
      }
      
      // Mark selection as complete
      setSelectionComplete(true);
    }
  };

  const completeCapture = () => {
    if (!selectionComplete) return;
    
    try {
      // Create a canvas for the cropped area
      const canvas = document.createElement("canvas");
      const width = Math.abs(endPos.x - startPos.x);
      const height = Math.abs(endPos.y - startPos.y);
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      
      if (ctx && chartCanvasRef.current) {
        // Calculate source coordinates
        const sourceX = Math.min(startPos.x, endPos.x);
        const sourceY = Math.min(startPos.y, endPos.y);
        
        // Draw the cropped portion of the original canvas
        ctx.drawImage(
          chartCanvasRef.current,
          sourceX, sourceY, width, height,
          0, 0, width, height
        );
        
        // Convert the canvas to a data URL and return it
        const imageBase64 = canvas.toDataURL("image/png");
        onCapture(imageBase64);
      }
    } catch (error) {
      console.error("Error capturing selection:", error);
    }
  };
  
  const regenerateChart = () => {
    setSelectionComplete(false);
    setIsDragging(false);
    drawSimulatedChart();
  };

  const getSelectionStyle = () => {
    if (!isDragging && !selectionComplete) {
      return { display: "none" };
    }
    
    const left = Math.min(startPos.x, endPos.x);
    const top = Math.min(startPos.y, endPos.y);
    const width = Math.abs(endPos.x - startPos.x);
    const height = Math.abs(endPos.y - startPos.y);
    
    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
      <div className="absolute top-0 left-0 right-0 bg-gray-900 p-3 flex items-center justify-between">
        <div className="flex items-center">
          <CropIcon className="h-5 w-5 text-blue-400 mr-2" />
          <h2 className="text-white font-medium">Chart Selection</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-gray-300 hover:text-white"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          <button
            onClick={regenerateChart}
            className="text-gray-300 hover:text-white flex items-center"
          >
            <RefreshCw className="h-5 w-5 mr-1" />
            <span className="text-sm">New Chart</span>
          </button>
          <button 
            onClick={onCancel}
            className="text-gray-300 hover:text-white"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {showHelp && (
        <div className="absolute top-14 left-0 right-0 bg-blue-900 bg-opacity-90 p-3 text-white">
          <h3 className="font-medium mb-1">How to capture a chart:</h3>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Click and drag to select the chart area you want to analyze</li>
            <li>Adjust your selection if needed</li>
            <li>Click the "Capture Selection" button when you're ready</li>
          </ol>
          <p className="text-xs mt-2 text-blue-200">Tip: For best results, include price movements and indicators but exclude unnecessary UI elements</p>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="relative w-full max-w-4xl rounded-lg overflow-hidden cursor-crosshair bg-gray-800 flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <canvas 
          ref={chartCanvasRef} 
          className="max-w-full max-h-[calc(100vh-120px)]"
        />
        
        {!selectionComplete && !isDragging && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 p-4 rounded-lg text-white text-center max-w-md">
              <p className="text-lg font-medium mb-2">Select Chart Area</p>
              <p className="text-sm">Click and drag to select the chart you want to analyze</p>
            </div>
          </div>
        )}
        
        <div 
          className={`absolute border-2 ${selectionComplete ? 'border-green-500' : 'border-blue-500'} ${
            selectionComplete ? 'bg-green-500 bg-opacity-10' : 'bg-blue-500 bg-opacity-20'
          }`}
          style={getSelectionStyle()}
        ></div>
      </div>
      
      {selectionComplete && (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 p-3 flex items-center justify-center">
          <button 
            onClick={completeCapture}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 flex items-center transition-colors"
          >
            <Camera className="h-5 w-5 mr-2" />
            Capture Selection
          </button>
        </div>
      )}
    </div>
  );
}
