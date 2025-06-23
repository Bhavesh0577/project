'use client';

import { useEffect, useState } from 'react';
import { getIdeasAction, Idea } from '../../lib/actions';
import FlowChart from '../../components/flowchart/FlowChart';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import WithAuth from '@/components/auth/WithAuth';

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const result = await getIdeasAction();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch ideas');
      }
      
      setIdeas(result.data);
    } catch (err) {
      console.error('Error fetching ideas:', err);
      setError('Failed to fetch ideas. Please try again later.');
      toast.error('Failed to fetch ideas');
    } finally {
      setLoading(false);
    }
  };

  const initializeDatabase = async () => {
    setIsInitializing(true);
    try {
      const response = await fetch('/api/setup');
      const data = await response.json();
      
      if (data.success) {
        toast.success('Database initialized successfully');
        // Refetch ideas after initialization
        fetchIdeas();
      } else {
        throw new Error(data.error || 'Failed to initialize database');
      }
    } catch (err) {
      console.error('Error initializing database:', err);
      toast.error('Failed to initialize database');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleViewIdea = (idea: Idea) => {
    setSelectedIdea(idea);
    setDialogOpen(true);
  };

  return (
    <WithAuth>
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saved Ideas</h1>
          <p className="text-muted-foreground">
            View and manage your hackathon ideas
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={initializeDatabase} 
            disabled={isInitializing}
          >
            {isInitializing ? 'Initializing...' : 'Setup Database'}
          </Button>
          <Button asChild>
            <Link href="/">Generate New Idea</Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-destructive/10 p-4 rounded-lg text-destructive">
          <p className="font-medium">Error: {error}</p>
          <p className="text-sm mt-1">Try clicking the "Setup Database" button to initialize the required database tables.</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
              <CardFooter className="pt-2">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="bg-destructive/10">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      ) : ideas.length === 0 ? (
        <Card className="text-center">
          <CardHeader>
            <CardTitle>No saved ideas yet</CardTitle>
            <CardDescription>Generate your first idea to get started</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-muted-foreground">
              Use the AI-powered idea generator to create and save your hackathon ideas
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/">Generate Your First Idea</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <Card key={idea.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{idea.title}</CardTitle>
                  <CardDescription>
                    {new Date(idea.created_at as string).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="line-clamp-3 text-muted-foreground">
                    {idea.description.substring(0, 150)}
                    {idea.description.length > 150 ? '...' : ''}
                  </p>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button variant="outline" className="w-full" onClick={() => handleViewIdea(idea)}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {selectedIdea && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-2xl">{selectedIdea.title}</DialogTitle>
                    <DialogDescription>
                      Created on {new Date(selectedIdea.created_at as string).toLocaleDateString()}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-medium">Description</h3>
                      <div className="p-4 bg-muted/50 rounded-md whitespace-pre-line">
                        {selectedIdea.description}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-medium">Flowchart</h3>
                      <div className="border rounded-md overflow-hidden">
                        <FlowChart ideaText={selectedIdea.description} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
    </WithAuth>
  );
} 