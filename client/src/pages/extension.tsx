import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

export default function ExtensionPage() {
  const isMobile = useIsMobile();

  return (
    <div className="container px-4 py-8 mx-auto max-w-6xl">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            ChartSense AI Chrome Extension
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            Analyze any trading chart with a single click and get instant predictions on whether the next candle will go up or down
          </p>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl p-8 md:p-12 shadow-md border border-blue-100 dark:border-blue-900">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-bold">Instant Chart Analysis Inside Your Browser</h2>
              <p className="text-lg text-muted-foreground">
                ChartSense AI's Chrome extension gives you professional-grade market analysis without leaving your trading platform.
              </p>
              <div className="flex flex-wrap gap-4 mt-6">
                <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <a href="/extension-files/chartsense-ai.zip" download>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download for Chrome
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/web">Try Online Version</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block max-w-md">
              <div className="w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-32 h-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <CardTitle>Capture Any Chart</CardTitle>
              <CardDescription>
                Easy screenshot capture directly from any trading platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Capture any chart from any trading platform with a single click or keyboard shortcut. Works with all major trading platforms including MT4, MT5, TradingView, and more.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <CardTitle>Instant Analysis</CardTitle>
              <CardDescription>
                Get trading signals in seconds with AI-powered pattern recognition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes chart patterns and market conditions to predict whether the next candle will go up or down. Perfect for binary options, forex, and crypto trading.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <CardTitle>Self-Learning AI</CardTitle>
              <CardDescription>
                AI that learns from your feedback and improves over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Provide feedback on predictions and our AI will learn and improve over time. The more you use it, the more accurate it becomes for your specific trading style.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Installation Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Install the Chrome Extension</CardTitle>
            <CardDescription>
              Follow these simple steps to install ChartSense AI on your Chrome browser
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-6 list-decimal list-inside">
              <li className="flex flex-col md:flex-row gap-4 md:items-center">
                <div className="flex-1">
                  <h3 className="font-semibold">Download the extension file</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click the download button to get the ChartSense AI extension package (.zip file).
                  </p>
                </div>
                <Button asChild className="md:flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <a href="/extension-files/chartsense-ai.zip" download>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Extension (.zip)
                  </a>
                </Button>
              </li>
              
              <li className="flex flex-col gap-2">
                <h3 className="font-semibold">Open Chrome Extensions page</h3>
                <p className="text-sm text-muted-foreground">
                  Open Chrome browser and enter <code className="bg-muted px-1 rounded">chrome://extensions</code> in the address bar.
                </p>
                <div className="mt-1 border rounded-md overflow-hidden">
                  <img src="https://i.imgur.com/JdQQJLs.png" alt="Chrome Extensions Page" className="w-full" />
                </div>
              </li>
              
              <li className="flex flex-col gap-2">
                <h3 className="font-semibold">Enable Developer Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Turn on the "Developer mode" toggle in the top-right corner of the Extensions page.
                </p>
              </li>
              
              <li className="flex flex-col gap-2">
                <h3 className="font-semibold">Install the extension</h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop the downloaded .zip file onto the Chrome Extensions page, or click "Load unpacked" button and select the unzipped extension folder.
                </p>
              </li>
              
              <li className="flex flex-col gap-2">
                <h3 className="font-semibold">Start using ChartSense AI</h3>
                <p className="text-sm text-muted-foreground">
                  The extension icon will appear in your Chrome toolbar. Click it to open the extension, or right-click on any chart to analyze it directly.
                </p>
              </li>
            </ol>
          </CardContent>
          <CardFooter className="border-t pt-6 flex justify-between">
            <p className="text-sm text-muted-foreground">
              Having trouble installing? Contact our support team for assistance.
            </p>
            <Button variant="outline" asChild>
              <Link href="/web">Try Web Version</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}