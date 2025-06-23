'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getTeamMatchesAction } from '@/lib/teamActions';
import { TeamProfile } from '@/lib/neonClient';
import { toast } from 'sonner';

interface TeamMatchSuggestionsProps {
  userProfile: TeamProfile & { id: string };
}

interface AvailabilityOption {
  id: string;
  label: string;
}

export default function TeamMatchSuggestions({ userProfile }: TeamMatchSuggestionsProps) {
  const [matches, setMatches] = useState<(TeamProfile & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        
        // Ensure we have a profile to match against
        if (!userProfile || !userProfile.id) {
          throw new Error('Invalid user profile');
        }
        
        const result = await getTeamMatchesAction(userProfile.id);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to find matches');
        }
        
        setMatches(result.data);
      } catch (err) {
        console.error('Error finding matches:', err);
        setError('Failed to find team matches. Please try again later.');
        toast.error('Failed to find team matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [userProfile]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (matches.length === 0) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>No matches found</CardTitle>
          <CardDescription>We couldn't find any teammates that match your criteria</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-muted-foreground">
            Try adjusting your profile or check back later as more people join
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Matches
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {matches.map(match => (
        <Card key={match.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">{match.name}</CardTitle>
            <CardDescription>
              {match.role}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Tech Stack</h4>
              <p className="text-sm text-muted-foreground">{match.techStack}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Skills</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{match.skills}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Availability</h4>
              <div className="flex flex-wrap gap-2">
                {match.availability.map((avail: string) => (
                  <Badge key={avail} variant="outline">{
                    availabilityOptions.find(opt => opt.id === avail)?.label || avail
                  }</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Looking For</h4>
              <div className="flex flex-wrap gap-2">
                {match.lookingFor.map((role: string) => (
                  <Badge key={role} variant="outline">{role}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => window.open(`mailto:${match.email}`)}>
              Contact
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// Same availability options as in ProfileForm to display labels
const availabilityOptions: AvailabilityOption[] = [
  { id: "weekdays", label: "Weekdays" },
  { id: "weekends", label: "Weekends" },
  { id: "mornings", label: "Mornings" },
  { id: "afternoons", label: "Afternoons" },
  { id: "evenings", label: "Evenings" },
  { id: "late_night", label: "Late Night" }
]; 