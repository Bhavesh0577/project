'use client';

import { CalendarIcon, EthernetPort, ExternalLinkIcon, TagIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Hackathon {
  id: string;
  title: string;
  theme: string;
  platform: string;
  deadline: string;
  link: string;
  description: string;
  mode: string;
}

interface HackathonCardProps {
  hackathon: Hackathon;
}

export default function HackathonCard({ hackathon }: HackathonCardProps) {
  const getPlatformColor = (platform: string): string => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes('devpost')) return 'bg-blue-500';
    if (platformLower.includes('devfolio')) return 'bg-purple-500';
    if (platformLower.includes('dorahacks')) return 'bg-green-500';
    if (platformLower.includes('unstop')) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const formatDeadline = (deadline: string): string => {
    try {
      if (deadline.toLowerCase().includes('ongoing')) return 'Ongoing';
      
      // Try to parse date if it looks like a date
      if (/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(deadline) || 
          /\d{4}-\d{2}-\d{2}/.test(deadline)) {
        const date = new Date(deadline);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
      
      return deadline;
    } catch (error) {
      return deadline; // If parsing fails, just return the original string
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{hackathon.title}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <span 
                className={`inline-block w-3 h-3 rounded-full mr-2 ${getPlatformColor(hackathon.platform)}`} 
              />
              {hackathon.platform}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <TagIcon className="mr-2 h-4 w-4" />
              Theme: {hackathon.theme}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <EthernetPort className="mr-2 h-4 w-4" />
              Mode: {hackathon.mode}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Deadline: {formatDeadline(hackathon.deadline)}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-3">
            {hackathon.description}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          className="w-full flex items-center justify-center" 
          onClick={() => window.open(hackathon.link, '_blank')}
        >
          Visit <ExternalLinkIcon className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
} 