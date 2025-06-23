'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import StructuredIdea from '@/components/StructuredIdea';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/icons";
import WithAuth from '@/components/auth/WithAuth';

export default function IdeaGenerationPage() {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [activeTab, setActiveTab] = useState<string>('input');
  const router = useRouter();

  const generateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !prompt.trim()) {
      setError('Please provide both a title and a description for your idea.');
      return;
    }

    setLoading(true);
    setError('');
    setWarning('');
    
    try {
      const response = await fetch('/api/perplexity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, prompt }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setGeneratedIdea(data.idea);
      
      // Store the generated data in sessionStorage for the flowchart page
      sessionStorage.setItem('generatedIdea', JSON.stringify({
        title,
        description: data.idea,
        flowchart: data.flowchart
      }));
      
      setActiveTab('result');
      toast.success('Idea generated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate idea');
      toast.error('Failed to generate idea');
      console.error('Error generating idea:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToFlowchart = () => {
    if (!generatedIdea) {
      setError('Please generate an idea first');
      return;
    }
    
    router.push('/generate-flowchart');
  };

  return (
    
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Generate Project Idea</h1>
          <p className="text-muted-foreground">
            Create an innovative hackathon project idea with AI assistance
          </p>
        </div>

        <Card className="w-full max-w-4xl mx-auto shadow-lg border-neutral-200 dark:border-neutral-800 bg-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-card-foreground">AI Hackathon Idea Generator</CardTitle>
            <CardDescription>Step 1: Generate your innovative idea with AI assistance</CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mx-6">
              <TabsTrigger value="input">Input</TabsTrigger>
              <TabsTrigger value="result" disabled={!generatedIdea}>Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="input">
              <CardContent className="space-y-4 pt-4">
                <form onSubmit={generateIdea} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-foreground">Project Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a title for your project"
                      disabled={loading}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="prompt" className="text-foreground">Idea Description</Label>
                    <Textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe your hackathon idea or area of interest..."
                      disabled={loading}
                      className="min-h-32 w-full"
                    />
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </form>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  type="submit" 
                  onClick={generateIdea} 
                  disabled={loading || !title.trim() || !prompt.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : 'Generate Idea'}
                </Button>
              </CardFooter>
            </TabsContent>
            
            <TabsContent value="result">
              <CardContent className="space-y-6 pt-4">
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : (
                  <>
                    {warning && (
                      <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300">
                        <AlertTitle className="text-amber-700 dark:text-amber-300">Limited Functionality</AlertTitle>
                        <AlertDescription className="text-amber-700 dark:text-amber-300">{warning}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-medium text-foreground">Generated Idea</h3>
                      <div className="p-6 bg-muted/50 dark:bg-muted/20 rounded-md border border-muted/30 dark:border-muted/10">
                        {generatedIdea ? (
                          <StructuredIdea ideaText={generatedIdea} />
                        ) : (
                          <span className="text-muted-foreground">No idea generated yet.</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('input')}
                  className="w-1/2 mr-2"
                >
                  Back to Input
                </Button>
                <Button 
                  onClick={handleContinueToFlowchart} 
                  disabled={loading || !generatedIdea}
                  className="w-1/2 ml-2"
                >
                  Continue to Flowchart
                </Button>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    
  );
} 