'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StructuredIdeaProps {
  ideaText: string;
}

/**
 * Component to display a structured idea with proper formatting for different sections
 */
const StructuredIdea = ({ ideaText }: StructuredIdeaProps) => {
  // Parse the ideaText to extract different sections
  const sections = {
    title: '',
    overview: '',
    description: '',
    keyFeatures: '',
    techStack: '',
    milestones: '',
    challenges: '',
  };

  // Extract the title (first heading)
  const titleMatch = ideaText.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    sections.title = titleMatch[1].trim();
  }

  // Extract each section using regex
  const overviewMatch = ideaText.match(/## Project Overview\s+([\s\S]*?)(?=##|$)/);
  if (overviewMatch) {
    sections.overview = overviewMatch[1].trim();
  }

  const descriptionMatch = ideaText.match(/## Project Description\s+([\s\S]*?)(?=##|$)/);
  if (descriptionMatch) {
    sections.description = descriptionMatch[1].trim();
  }

  const featuresMatch = ideaText.match(/## Key Features\s+([\s\S]*?)(?=##|$)/);
  if (featuresMatch) {
    sections.keyFeatures = featuresMatch[1].trim();
  }

  const techStackMatch = ideaText.match(/## Technology Stack\s+([\s\S]*?)(?=##|$)/);
  if (techStackMatch) {
    sections.techStack = techStackMatch[1].trim();
  }

  const milestonesMatch = ideaText.match(/## Development Milestones\s+([\s\S]*?)(?=##|$)/);
  if (milestonesMatch) {
    sections.milestones = milestonesMatch[1].trim();
  }

  const challengesMatch = ideaText.match(/## Potential Challenges(?:\s+and Solutions)?\s+([\s\S]*?)(?=##|$)/);
  if (challengesMatch) {
    sections.challenges = challengesMatch[1].trim();
  }

  // Custom components for markdown rendering
  const markdownComponents = {
    h1: ({ node, ...props }: any) => (
      <h1 className="text-2xl font-bold text-primary mt-4 mb-2" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-xl font-semibold text-primary-700 dark:text-primary-300 mt-4 mb-2" {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-lg font-medium mt-3 mb-1" {...props} />
    ),
    ul: ({ node, ...props }: any) => (
      <ul className="list-disc ml-5 my-2 space-y-1" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="list-decimal ml-5 my-2 space-y-1" {...props} />
    ),
    li: ({ node, ...props }: any) => (
      <li className="my-1" {...props} />
    ),
    p: ({ node, ...props }: any) => (
      <p className="my-2 text-foreground" {...props} />
    ),
    strong: ({ node, ...props }: any) => (
      <strong className="font-semibold" {...props} />
    ),
  };

  // Only render sections that exist
  return (
    <div className="space-y-4">
      {sections.title && (
        <div className="flex justify-center">
          <h1 className="text-2xl font-bold text-center text-foreground">{sections.title}</h1>
        </div>
      )}

      {/* Project Overview */}
      {sections.overview && (
        <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-4 border border-blue-100 dark:border-blue-900">
          <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">Project Overview</h2>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
              {sections.overview}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Project Description (if different from overview) */}
      {sections.description && (
        <div className="rounded-md bg-purple-50 dark:bg-purple-950 p-4 border border-purple-100 dark:border-purple-900">
          <h2 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">Project Description</h2>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
              {sections.description}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Key Features */}
      {sections.keyFeatures && (
        <div className="rounded-md bg-emerald-50 dark:bg-emerald-950 p-4 border border-emerald-100 dark:border-emerald-900">
          <h2 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Key Features</h2>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
              {sections.keyFeatures}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Technology Stack */}
      {sections.techStack && (
        <div className="rounded-md bg-amber-50 dark:bg-amber-950 p-4 border border-amber-100 dark:border-amber-900">
          <h2 className="text-lg font-semibold text-amber-700 dark:text-amber-300 mb-2">Technology Stack</h2>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
              {sections.techStack}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Development Milestones */}
      {sections.milestones && (
        <div className="rounded-md bg-indigo-50 dark:bg-indigo-950 p-4 border border-indigo-100 dark:border-indigo-900">
          <h2 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Development Milestones</h2>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
              {sections.milestones}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Challenges and Solutions */}
      {sections.challenges && (
        <div className="rounded-md bg-rose-50 dark:bg-rose-950 p-4 border border-rose-100 dark:border-rose-900">
          <h2 className="text-lg font-semibold text-rose-700 dark:text-rose-300 mb-2">Challenges & Solutions</h2>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
              {sections.challenges}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* If no sections were found, render the full content */}
      {Object.values(sections).every(section => !section) && (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
            {ideaText}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default StructuredIdea; 