'use client';

import { ExternalLinkIcon, AlertTriangleIcon, LightbulbIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type AnalysisResult } from '@/app/analysis/page';

interface AnalysisResultProps {
  result: AnalysisResult;
}

export default function AnalysisResultDisplay({ result }: AnalysisResultProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Similar Projects</span>
            <Badge variant="outline">{result.similarProjects.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {result.similarProjects.length > 0 ? (
            <ul className="space-y-3">
              {result.similarProjects.map((project, index) => (
                <li key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{project.title}</h3>
                      <p className="text-sm text-muted-foreground">Year: {project.year}</p>
                    </div>
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center"
                    >
                      View <ExternalLinkIcon className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No similar projects found.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
            <span>Missing Elements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted/50 rounded-md">
            <p className="whitespace-pre-line">{result.missingElements}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LightbulbIcon className="h-5 w-5 text-yellow-500" />
            <span>Improvement Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted/50 rounded-md">
            <p className="whitespace-pre-line">{result.improvementTips}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 