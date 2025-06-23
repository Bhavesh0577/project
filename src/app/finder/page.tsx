'use client';

import { useState } from 'react';
import SearchBar from '@/components/finder/SearchBar';
import HackathonCard from '@/components/finder/HackathonCard';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import WithAuth from '@/components/auth/WithAuth';

type Hackathon = {
  id: string;
  title: string;
  theme: string;
  platform: string;
  deadline: string;
  link: string;
  description: string;
  mode: string;
};

export default function HackathonFinderPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const searchHackathons = async (interest: string) => {
    if (!interest.trim()) {
      toast.error('Please enter an interest to search for hackathons');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/findHackathons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interest }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setHackathons(data.hackathons);
    } catch (err) {
      console.error('Error searching hackathons:', err);
      setError('Failed to search for hackathons. Please try again later.');
      toast.error('Failed to search for hackathons');
    } finally {
      setLoading(false);
    }
  };

  const filteredHackathons = hackathons.filter(hackathon => {
    if (activeFilter === 'all') return true;
    return hackathon.platform.toLowerCase() === activeFilter.toLowerCase();
  });

  const platforms = [...new Set(hackathons.map(h => h.platform))];

  return (
    <WithAuth>
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Hackathon Finder</h1>
        <p className="text-muted-foreground">
          Find ongoing or upcoming hackathons that match your interests
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-10">
        <SearchBar onSearch={searchHackathons} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
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
        </Card>
      ) : hackathons.length > 0 ? (
        <>
          <div className="mb-6">
            <Tabs defaultValue="all" value={activeFilter} onValueChange={setActiveFilter}>
              <TabsList>
                <TabsTrigger value="all">All Platforms</TabsTrigger>
                {platforms.map(platform => (
                  <TabsTrigger key={platform} value={platform.toLowerCase()}>
                    {platform}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHackathons.map(hackathon => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}
          </div>
        </>
      ) : (
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Search for hackathons</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Enter your interests above to find relevant hackathons
            </p>
          </CardContent>
        </Card>
      )}
    </div>
    </WithAuth>
  );
} 