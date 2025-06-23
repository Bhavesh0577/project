'use client';

import { useState } from 'react';
import AnalysisForm from '@/components/analysis/AnalysisForm';
import AnalysisResultDisplay from '@/components/analysis/AnalysisResult';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3Icon, SparklesIcon, InfoIcon } from 'lucide-react';
import WithAuth from '@/components/auth/WithAuth';

export type AnalysisResult = {
  similarProjects: {
    title: string;
    year: string;
    link: string;
  }[];
  missingElements: string;
  improvementTips: string;
};

export default function AnalysisPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async (title: string, description: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyzeProject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze project');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error analyzing project:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WithAuth>
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Competitive Project Analysis</h1>
        <p className="text-muted-foreground">
          Compare your hackathon idea with other projects and get improvement suggestions
        </p>
      </div>

      <Tabs defaultValue="analyze" className="w-full">
        <TabsList className="mb-6 w-full sm:w-auto">
          <TabsTrigger value="analyze" className="flex gap-2 items-center">
            <BarChart3Icon className="h-4 w-4" />
            <span>Analyze Project</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex gap-2 items-center">
            <SparklesIcon className="h-4 w-4" />
            <span>Results</span>
          </TabsTrigger>
          <TabsTrigger value="info" className="flex gap-2 items-center">
            <InfoIcon className="h-4 w-4" />
            <span>How it Works</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyze">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <AnalysisForm onAnalyze={handleAnalysis} isLoading={isLoading} />
            </div>
            <div className="flex items-center justify-center">
              <Card className="w-full h-full">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                  <BarChart3Icon className="h-16 w-16 text-primary/40 mb-4" />
                  <h3 className="text-xl font-medium mb-2">Get Insights on Your Project</h3>
                  <p className="text-muted-foreground mb-6">
                    Our AI analysis will compare your project with successful hackathon entries and provide actionable feedback.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    {['Similar Projects', 'Missing Elements', 'Improvement Tips'].map((item) => (
                      <div key={item} className="bg-muted p-3 rounded-md text-center">
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-destructive mb-2">Error</h3>
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => document.querySelector('[data-value="analyze"]')?.dispatchEvent(new Event('click'))}
              >
                Back to Analysis
              </Button>
            </div>
          ) : result ? (
            <AnalysisResultDisplay result={result} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-muted-foreground mb-4">Enter your idea details in the Analysis tab to get results</p>
              <Button 
                variant="outline"
                onClick={() => document.querySelector('[data-value="analyze"]')?.dispatchEvent(new Event('click'))}
              >
                Go to Analysis
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="info">
          <div className="max-w-3xl space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">How the Analysis Works</h2>
                <p className="text-muted-foreground mb-4">
                  Our competitive analysis tool uses AI to analyze your project and provide insights in three key areas:
                </p>
                
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Similar Projects</h3>
                    <p className="text-sm text-muted-foreground">
                      We search through a database of past hackathon winners and trending projects to find ones similar to your idea,
                      helping you understand what's already out there and how yours compares.
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Missing Elements</h3>
                    <p className="text-sm text-muted-foreground">
                      By comparing your project to successful ones in the same category, we identify potential features or components
                      that might enhance your project's chances of standing out.
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Improvement Tips</h3>
                    <p className="text-sm text-muted-foreground">
                      Get actionable suggestions to make your project more competitive, innovative, and appealing to judges
                      and potential users.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-muted/30 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Tips for Best Results</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Be specific about your project's purpose and target audience</li>
                <li>Include key technologies or frameworks you plan to use</li>
                <li>Mention any unique features or innovations in your project</li>
                <li>Describe the problem your project solves and how it solves it</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </WithAuth>
  );
} 