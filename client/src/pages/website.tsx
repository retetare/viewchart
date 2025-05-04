import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { TAnalysisHistoryItem, TAnalysisResult } from "@shared/types";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "wouter";

export default function Website() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<TAnalysisResult | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Fetch analysis history
  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useQuery<TAnalysisHistoryItem[]>({
    queryKey: ['/api/history'],
    refetchOnWindowFocus: false,
  });

  const history: TAnalysisHistoryItem[] = historyData || [];

  // Function to resize the image to reduce size
  const resizeImage = (imageUrl: string, maxWidth = 1200, maxHeight = 1200): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        // Calculate the new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
        }
        
        // Create a canvas and resize the image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with reduced quality
        const resizedImageUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(resizedImageUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = imageUrl;
    });
  };

  // Handle image file input
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    try {
      const file = e.target.files[0];
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        if (event.target && typeof event.target.result === 'string') {
          try {
            // Resize the image to reduce size
            const resizedImage = await resizeImage(event.target.result);
            setImageUrl(resizedImage);
          } catch (error) {
            setImageUrl(event.target.result);
          }
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Error uploading image",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle image paste from clipboard
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        setIsUploading(true);
        const blob = items[i].getAsFile();
        if (!blob) continue;
        
        // Check file size (max 10MB)
        if (blob.size > 10 * 1024 * 1024) {
          toast({
            title: "Image too large",
            description: "Please use an image smaller than 10MB",
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }
        
        const reader = new FileReader();
        reader.onload = async (event) => {
          if (event.target && typeof event.target.result === 'string') {
            try {
              // Resize the image to reduce size
              const resizedImage = await resizeImage(event.target.result);
              setImageUrl(resizedImage);
            } catch (error) {
              setImageUrl(event.target.result);
            }
            setIsUploading(false);
          }
        };
        
        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  // Handle image analysis
  const analyzeImage = async () => {
    if (!imageUrl) return;
    
    setIsAnalyzing(true);
    
    try {
      const result = await apiRequest<TAnalysisResult>('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64: imageUrl }),
      });
      
      setAnalysisResult(result);
      
      // Refetch history after successful analysis
      refetchHistory();
      
      toast({
        title: "Analysis complete",
        description: `Detected ${result.pattern} pattern with ${result.confidence}% confidence`,
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "There was a problem analyzing your chart. Please try again with a smaller image.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle feedback submission
  const submitFeedback = async (analysisId: string, isCorrect: boolean) => {
    try {
      await apiRequest<TAnalysisResult>(`/api/feedback/${analysisId}`, {
        method: 'POST',
        body: JSON.stringify({ isCorrect }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Refetch history after feedback
      refetchHistory();
      
      // If feedback is for current analysis, update the result
      if (analysisResult && analysisResult.id === analysisId) {
        setAnalysisResult({
          ...analysisResult,
          feedback: isCorrect,
        });
      }
      
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! This helps improve our AI.",
      });
    } catch (error) {
      toast({
        title: "Feedback failed",
        description: "There was a problem submitting your feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Reset analysis
  const resetAnalysis = () => {
    setImageUrl(null);
    setAnalysisResult(null);
  };

  // View a historical analysis
  const viewHistoryItem = (item: TAnalysisHistoryItem) => {
    // Fetch the full analysis
    const fetchFullAnalysis = async () => {
      try {
        const analysisData = await apiRequest<TAnalysisResult>(`/api/analysis/${item.id}`);
        setAnalysisResult(analysisData);
        setImageUrl(analysisData.imageUrl);
      } catch (error) {
        toast({
          title: "Error retrieving analysis",
          description: "Could not retrieve the full analysis details.",
          variant: "destructive",
        });
      }
    };
    
    fetchFullAnalysis();
  };

  return (
    <div className="container px-4 py-8 mx-auto max-w-6xl" onPaste={handlePaste}>
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            ChartSense AI - Binary Trading Predictor
          </h1>
          <p className="mt-2 text-muted-foreground">
            Get accurate predictions on whether the next candle will go up or down
          </p>
        </div>
        
        {/* Chrome Extension Download Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-6 shadow-md border border-blue-100 dark:border-blue-900">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 space-y-3">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Download the Chrome Extension
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg">
                Get instant chart analysis directly in your browser! Use our Chrome extension to analyze charts without leaving your trading platform. Just right-click on any chart or take a screenshot.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link href="/extension">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Add to Chrome
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-blue-200 dark:border-blue-800">
                  <Link href="/extension">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="analyze" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analyze">Analyze Chart</TabsTrigger>
            <TabsTrigger value="history">Analysis History</TabsTrigger>
          </TabsList>
          
          {/* Analysis Tab */}
          <TabsContent value="analyze" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chart Analysis</CardTitle>
                <CardDescription>
                  Upload a trading chart image or paste it from clipboard to predict the next candle movement
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Image upload/preview area */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-colors bg-muted/50">
                  {imageUrl ? (
                    <div className="space-y-4 w-full max-w-xl">
                      <img 
                        src={imageUrl} 
                        alt="Trading Chart" 
                        className="rounded-md w-full h-auto object-contain max-h-80"
                      />
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          onClick={resetAnalysis}
                        >
                          Clear
                        </Button>
                        <Button 
                          onClick={analyzeImage} 
                          disabled={isAnalyzing || !imageUrl}
                        >
                          {isAnalyzing ? "Analyzing..." : "Analyze Chart"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center space-y-2 cursor-pointer w-full">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-lg font-medium">Upload chart image</p>
                        <p className="text-sm text-muted-foreground">
                          Drag & drop or click to upload
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          You can also paste screenshot from clipboard (Ctrl+V)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>
                
                {isAnalyzing && (
                  <div className="space-y-2">
                    <p className="text-center text-sm text-muted-foreground">Analyzing chart pattern...</p>
                    <Progress value={70} className="h-2" />
                  </div>
                )}
                
                {/* Analysis Results */}
                {analysisResult && (
                  <Card className="border-2 border-blue-200 dark:border-blue-900">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle>Trading Signal</CardTitle>
                        <Badge 
                          variant={analysisResult.prediction === "bullish" ? "default" : "destructive"}
                          className="px-3 py-1 text-lg"
                        >
                          {analysisResult.prediction === "bullish" ? "BUY ↑" : "SELL ↓"}
                        </Badge>
                      </div>
                      <CardDescription>
                        {analysisResult.pattern} - {analysisResult.confidence}% confidence
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Win Rate:</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={analysisResult.winRate} className="h-2" />
                            <span className="font-medium">{analysisResult.winRate}%</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Confidence:</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={analysisResult.confidence} className="h-2" />
                            <span className="font-medium">{analysisResult.confidence}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold">Explanation:</h4>
                        <p className="text-sm whitespace-pre-line">{analysisResult.explanation}</p>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between">
                      <p className="text-sm text-muted-foreground">
                        {analysisResult.feedback === null 
                          ? "Was this prediction correct?" 
                          : "Thanks for your feedback!"}
                      </p>
                      {analysisResult.feedback === null && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => submitFeedback(analysisResult.id, false)}
                          >
                            No
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => submitFeedback(analysisResult.id, true)}
                          >
                            Yes
                          </Button>
                        </div>
                      )}
                      {analysisResult.feedback !== null && (
                        <Badge 
                          variant={analysisResult.feedback ? "default" : "outline"}
                          className={analysisResult.feedback ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {analysisResult.feedback ? "Correct Prediction" : "Incorrect Prediction"}
                        </Badge>
                      )}
                    </CardFooter>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Analysis History</CardTitle>
                <CardDescription>
                  View your previous chart analyses and predictions
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {historyLoading ? (
                  <div className="py-8 text-center">Loading history...</div>
                ) : history.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No analysis history yet</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {history.map((item) => (
                      <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => viewHistoryItem(item)}>
                        <div className="aspect-video relative">
                          <img 
                            src={item.imageUrl} 
                            alt={item.pattern} 
                            className="object-cover w-full h-full"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge 
                              variant={item.prediction === "bullish" ? "default" : "destructive"}
                            >
                              {item.prediction === "bullish" ? "BUY ↑" : "SELL ↓"}
                            </Badge>
                          </div>
                          {item.feedback !== null && (
                            <div className="absolute bottom-2 right-2">
                              <Badge 
                                variant={item.feedback ? "outline" : "secondary"}
                                className={`bg-opacity-80 ${item.feedback ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                              >
                                {item.feedback ? "Correct" : "Incorrect"}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <div className="space-y-1">
                            <p className="font-medium truncate">{item.pattern}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.timestamp).toLocaleString()} · {item.confidence}% confidence
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}