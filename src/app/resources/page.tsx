'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
import { Icons } from "@/components/icons";
import { useUser } from '@clerk/nextjs';
import WithAuth from '@/components/auth/WithAuth';
import ResourceList from '@/components/resources/ResourceList';
import Link from 'next/link';
import BoltBadge from '@/components/BoltBadge';
// Types for resource recommendations
type Resource = {
  name: string;
  description: string;
  url: string;
  relevance: string;
};
type ResourcesData = {
  apis: Resource[];
  datasets: Resource[];
  developmentTools: Resource[];
  learningResources: Resource[];
};
type Idea = {
  id: string;
  title: string;
  description: string;
};
export default function ResourceHubPage() {
  const [activeTab, setActiveTab] = useState('existing');
  const [loading, setLoading] = useState(false);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [resources, setResources] = useState<ResourcesData | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const { isLoaded, user } = useUser();
  // Load saved ideas when component mounts
  useEffect(() => {
    const fetchIdeas = async () => {
      if (!user?.id) return; // Wait for user to be loaded
      
      try {
        const response = await fetch(`/api/ideas?user_id=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch ideas');
        }
        const data = await response.json();
        setIdeas(data.data || []);
      } catch (error) {
        console.error('Error fetching ideas:', error);
        toast.error('Failed to load saved ideas');
      } finally {
        setLoadingIdeas(false);
      }
    };
    
    if (isLoaded) {
      fetchIdeas();
    }
  }, [user?.id, isLoaded]);
  const fetchResources = async (title: string, description: string, ideaType: string) => {
    setLoading(true);
    setResources(null);
    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, ideaType }),
      });
      const data = await response.json();
      if (!response.ok) {
        const errorMessage = data.error || 'Unknown error occurred';
        const errorDetails = data.details ? `: ${JSON.stringify(data.details)}` : '';
        console.error(`API Error: ${errorMessage}${errorDetails}`);
        throw new Error(errorMessage);
      }
      setResources(data);
      toast.success('Resource recommendations generated!');
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error(`Failed to generate resource recommendations: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleExistingIdeaSubmit = () => {
    if (!selectedIdeaId) {
      toast.error('Please select an idea first');
      return;
    }
    const selectedIdea = ideas.find(idea => idea.id === selectedIdeaId);
    if (!selectedIdea) {
      toast.error('Selected idea not found');
      return;
    }
    fetchResources(selectedIdea.title, selectedIdea.description, 'Existing idea');
  };
  const handleCustomIdeaSubmit = () => {
    if (!customTitle.trim() || !customDescription.trim()) {
      toast.error('Please provide both a title and description');
      return;
    }
    fetchResources(customTitle, customDescription, 'Custom idea');
  };
  return (
    <WithAuth>
      <div className="container mx-auto py-10 px-4">
        <BoltBadge/>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Resource Hub</h1>
          <p className="text-muted-foreground">
            Discover APIs, datasets, tools, and learning resources tailored to your project
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Find Resources</CardTitle>
                <CardDescription>
                  Select an idea or enter custom details to find relevant resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="existing">Saved Ideas</TabsTrigger>
                    <TabsTrigger value="custom">Custom</TabsTrigger>
                  </TabsList>
                  <TabsContent value="existing" className="space-y-4 mt-4">
                    {loadingIdeas ? (
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : ideas.length > 0 ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="idea-select">Select an Idea</Label>
                          <Select value={selectedIdeaId} onValueChange={setSelectedIdeaId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an idea" />
                            </SelectTrigger>
                            <SelectContent>
                              {ideas.map((idea) => (
                                <SelectItem key={idea.id} value={idea.id}>
                                  {idea.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {selectedIdeaId && (
                          <div className="rounded-md bg-muted p-4">
                            <h3 className="font-medium mb-1">
                              {ideas.find(i => i.id === selectedIdeaId)?.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {ideas.find(i => i.id === selectedIdeaId)?.description.substring(0, 150)}...
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No saved ideas found</p>
                        <Button asChild variant="outline">
                          <Link href="/generate-idea">Generate an Idea</Link>
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="custom" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="custom-title">Project Title</Label>
                      <Input
                        id="custom-title"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="Enter your project title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custom-description">Project Description</Label>
                      <textarea
                        id="custom-description"
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        placeholder="Describe your project idea..."
                        className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={activeTab === 'existing' ? handleExistingIdeaSubmit : handleCustomIdeaSubmit}
                  disabled={loading || (activeTab === 'existing' ? !selectedIdeaId : !customTitle || !customDescription)}
                >
                  {loading ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Finding Resources...
                    </>
                  ) : 'Find Resources'}
                </Button>
              </CardFooter>
            </Card>
          </div>
          <div className="lg:col-span-2">
            {loading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-7 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-6 w-1/3" />
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="space-y-2">
                          <Skeleton className="h-5 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      ))}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : resources ? (
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Resources</CardTitle>
                  <CardDescription>
                    Tailored resources for {activeTab === 'existing' 
                      ? ideas.find(i => i.id === selectedIdeaId)?.title 
                      : customTitle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ResourceList 
                    title="APIs" 
                    resources={resources.apis} 
                    emptyMessage="No relevant APIs found for this project idea."
                  />
                  <ResourceList 
                    title="Datasets" 
                    resources={resources.datasets} 
                    emptyMessage="No relevant datasets found for this project idea."
                  />
                  <ResourceList 
                    title="Development Tools" 
                    resources={resources.developmentTools} 
                    emptyMessage="No specific development tools found for this project idea."
                  />
                  <ResourceList 
                    title="Learning Resources" 
                    resources={resources.learningResources} 
                    emptyMessage="No learning resources found for this project idea."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center bg-muted/40 rounded-lg border-2 border-dashed border-muted">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Icons.search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Find Project Resources</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Select a saved idea or provide custom project details to discover APIs, datasets, tools, and learning resources tailored to your needs.
                </p>
                <p className="text-sm text-muted-foreground">
                  Resource recommendations are powered by AI to match your specific project requirements.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </WithAuth>
  );
} 
