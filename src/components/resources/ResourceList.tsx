'use client';
import { ExternalLinkIcon } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
type Resource = {
  name: string;
  description: string;
  url: string;
  relevance: string;
};
interface ResourceListProps {
  title: string;
  resources: Resource[];
  emptyMessage: string;
}
export default function ResourceList({ title, resources, emptyMessage }: ResourceListProps) {
  if (!resources || resources.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <Accordion type="multiple" className="space-y-2">
        {resources.map((resource, index) => (
          <AccordionItem 
            key={`${title}-${index}`} 
            value={`${title}-${index}`}
            className="border rounded-md px-4 py-2 shadow-sm"
          >
            <AccordionTrigger className="py-2 hover:no-underline">
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">{resource.name}</span>
                <span className="text-xs text-muted-foreground truncate w-full">
                  {resource.url.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              <div className="space-y-3">
                <p className="text-sm">{resource.description}</p>
                <div>
                  <h4 className="text-xs uppercase text-muted-foreground font-medium mb-1">Relevance</h4>
                  <p className="text-sm">{resource.relevance}</p>
                </div>
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  Visit resource <ExternalLinkIcon className="h-3 w-3 ml-1" />
                </a>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
} 
