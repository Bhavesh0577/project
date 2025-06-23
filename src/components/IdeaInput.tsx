'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { saveIdeaAction, Idea } from '../lib/actions';
import FlowChart from './flowchart/FlowChart';
import StructuredIdea from './StructuredIdea';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const IdeaInput = () => {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState('');
  const [flowchart, setFlowchart] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [activeTab, setActiveTab] = useState<string>('input');

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
      setFlowchart(data.flowchart);
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

  const handleSaveIdea = async () => {
    if (!generatedIdea || !flowchart) {
      setError('Please generate an idea first');
      return;
    }
    
    setLoading(true);
    setError('');
    setWarning('');
    
    try {
      console.log('Saving idea with data:', { title, description: generatedIdea, flowchart });
      
      // Create idea object with all required fields
      const idea: Idea = {
        title,
        description: generatedIdea,
        flowchart: flowchart,
      };
      
      // Call the server action to save
      const result = await saveIdeaAction(idea);
      console.log('Save result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save idea');
      }
      
      // Check if there's a warning
      if (result.warning) {
        setWarning(result.warning);
        toast.warning('Idea saved with limitations');
      } else {
        toast.success('Idea saved successfully!');
      }
      
      // Reset form after successful save
      if (!result.warning) {
        setTitle('');
        setPrompt('');
        setGeneratedIdea('');
        setFlowchart('');
        setActiveTab('input');
      }
    } catch (err) {
      console.error('Error details:', err);
      setError(err instanceof Error ? err.message : 'Failed to save idea');
      toast.error('Failed to save idea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-neutral-200">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">AI Hackathon Idea Generator</CardTitle>
        <CardDescription>Generate innovative hackathon ideas with AI assistance</CardDescription>
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
                <Label htmlFor="title">Project Title</Label>
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
                <Label htmlFor="prompt">Idea Description</Label>
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
              {loading ? 'Generating...' : 'Generate Idea & Flowchart'}
            </Button>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="result">
          <CardContent className="space-y-6 pt-4">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-[400px] w-full" />
              </div>
            ) : (
              <>
                {warning && (
                  <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-700">
                    <AlertTitle className="text-amber-700">Limited Functionality</AlertTitle>
                    <AlertDescription className="text-amber-700">{warning}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <h3 className="text-xl font-medium">Generated Idea</h3>
                  <div className="p-6 bg-muted/50 rounded-md">
                    {generatedIdea ? (
                      <StructuredIdea ideaText={generatedIdea} />
                    ) : (
                      'No idea generated yet.'
                    )}
                  </div>
                </div>
                
                {flowchart && (
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">Flowchart</h3>
                    <div className="border rounded-md overflow-hidden">
                      <FlowChart ideaText={flowchart} />
                    </div>
                  </div>
                )}
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
              onClick={handleSaveIdea} 
              disabled={loading || !generatedIdea}
              className="w-1/2 ml-2"
            >
              {loading ? 'Saving...' : 'Save to Database'}
            </Button>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default IdeaInput; 