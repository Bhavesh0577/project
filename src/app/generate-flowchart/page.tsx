'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { saveIdeaAction, Idea } from '@/lib/actions';
import FlowChart from '@/components/flowchart/FlowChart';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WithAuth from '@/components/auth/WithAuth';

export default function FlowchartGenerationPage() {
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Load idea from session storage
  useEffect(() => {
    try {
      const storedIdea = sessionStorage.getItem('generatedIdea');
      if (storedIdea) {
        setIdea(JSON.parse(storedIdea));
      } else {
        setError('No idea found. Please generate an idea first.');
      }
    } catch (err) {
      console.error('Error loading stored idea:', err);
      setError('Failed to load stored idea. Please generate a new idea.');
    }
  }, []);

  const handleSaveIdea = async () => {
    if (!idea) {
      setError('No idea data available');
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      const result = await saveIdeaAction(idea);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save idea');
      }
      
      toast.success('Idea saved successfully! Redirecting...');
      
      // Wait a moment before redirecting
      setTimeout(() => {
        router.push('/idea');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save idea');
      toast.error('Failed to save idea');
      console.error('Error saving idea:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <WithAuth>
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Project Flowchart</h1>
        <p className="text-muted-foreground">
          Visualize your hackathon project architecture and components
        </p>
      </div>

      {error ? (
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-6 flex justify-center">
              <Button asChild>
                <Link href="/generate-idea">Generate New Idea</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : idea ? (
        <Card className="w-full max-w-5xl mx-auto shadow-lg border-neutral-200">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{idea.title}</CardTitle>
            <CardDescription>Step 2: Review and save your project flowchart</CardDescription>
          </CardHeader>

          <Tabs defaultValue="flowchart" className="w-full">
            <TabsList className="grid grid-cols-2 mx-6">
              <TabsTrigger value="flowchart">Flowchart</TabsTrigger>
              <TabsTrigger value="ideaDetails">Idea Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="flowchart">
              <CardContent className="pt-6">
                <div className="border rounded-md overflow-hidden mb-6 h-[600px]">
                  <FlowChart ideaText={idea.flowchart} />
                </div>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="ideaDetails">
              <CardContent className="pt-6">
                <div className="p-6 bg-muted/50 rounded-md mb-6 max-h-[500px] overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    {idea.description.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
          
          <CardFooter className="flex justify-between pt-2 pb-6">
            <Button 
              variant="outline"
              onClick={() => router.push('/generate-idea')}
              className="w-1/2 mr-2"
            >
              Back to Idea
            </Button>
            <Button 
              onClick={handleSaveIdea} 
              disabled={saving}
              className="w-1/2 ml-2"
            >
              {saving ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save Project'}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="flex justify-center items-center h-64">
          <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
    </WithAuth>
  );
} 