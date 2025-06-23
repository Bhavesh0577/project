'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node styles
const nodeStyles = {
  primary: {
    background: '#3b82f6', // blue-500
    color: 'white',
    border: '1px solid #2563eb', // blue-600
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    fontSize: '14px',
    fontWeight: 'bold',
    width: 180,
    textAlign: 'center' as const,
  },
  secondary: {
    background: '#f59e0b', // amber-500
    color: 'white',
    border: '1px solid #d97706', // amber-600
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    fontSize: '14px',
    fontWeight: 'bold',
    width: 160,
    textAlign: 'center' as const,
  },
  tertiary: {
    background: '#10b981', // emerald-500
    color: 'white',
    border: '1px solid #059669', // emerald-600
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    fontSize: '14px',
    fontWeight: 'bold',
    width: 140,
    textAlign: 'center' as const,
  }
};

// Custom edge style
const edgeStyles = {
  stroke: '#64748b', // slate-500
  strokeWidth: 2,
};

// Parse idea text to generate flow chart nodes and edges
const parseIdeaToFlow = (idea: string) => {
  // Extract title from the idea (first line with # prefix)
  const titleMatch = idea.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : 'Project';
  
  // Extract project overview
  const overviewMatch = idea.match(/## Project Overview\s+([\s\S]*?)(?=##|$)/);
  const overview = overviewMatch 
    ? overviewMatch[1].trim().substring(0, 100) + '...' 
    : '';
  
  // Extract features, tech stack, and milestones with better regex patterns
  const featuresMatch = idea.match(/## Key Features\s+([\s\S]*?)(?=##|$)/);
  const techStackMatch = idea.match(/## Technology Stack\s+([\s\S]*?)(?=##|$)/);
  const milestonesMatch = idea.match(/## Development Milestones\s+([\s\S]*?)(?=##|$)/);
  const challengesMatch = idea.match(/## Potential Challenges([\s\S]*?)(?=##|$)/);

  // Parse features - support both numbered and bulleted lists
  const features = featuresMatch 
    ? featuresMatch[1]
        .split('\n')
        .filter(line => line.trim().match(/^(\d+\.|\*|\-)\s+/))
        .map(f => {
          // Extract feature title from bold text or whole line
          const boldMatch = f.match(/\*\*(.*?)\*\*/);
          if (boldMatch) return boldMatch[1];
          return f.replace(/^(\d+\.|\*|\-)\s+/, '').split(':')[0];
        })
    : ['Feature 1', 'Feature 2', 'Feature 3'];
    
  // Parse tech stack - support both bullet points and regular text
  const techStack = techStackMatch
    ? techStackMatch[1]
        .split('\n')
        .filter(line => line.trim().match(/^(\-|\*)\s+/))
        .map(t => {
          // Extract the technology name in bold if present
          const boldMatch = t.match(/\*\*(.*?)\*\*/);
          if (boldMatch) return boldMatch[1];
          // Otherwise, get the first part before "for" or colon
          return t.replace(/^(\-|\*)\s+/, '').split(/\s+for\s+|:/)[0];
        })
    : ['Frontend', 'Backend', 'Database'];
    
  // Parse milestones - support both numbered and bulleted lists
  const milestones = milestonesMatch
    ? milestonesMatch[1]
        .split('\n')
        .filter(line => line.trim().match(/^(\d+\.|\*|\-)\s+/))
        .map(m => {
          // Extract milestone title from bold text or whole line
          const boldMatch = m.match(/\*\*(.*?)\*\*/);
          if (boldMatch) return boldMatch[1];
          return m.replace(/^(\d+\.|\*|\-)\s+/, '').split(':')[0];
        })
    : ['Planning', 'Development', 'Testing', 'Deployment'];
    
  // Parse challenges
  const challenges = challengesMatch
    ? challengesMatch[1]
        .split('\n')
        .filter(line => line.match(/Challenge \d+|^\*\*Challenge/))
        .map(c => {
          const challengeMatch = c.match(/Challenge \d+:\s*(.*)|^\*\*Challenge.*?\*\*\s*(.*)/);
          return challengeMatch ? (challengeMatch[1] || challengeMatch[2]) : c;
        })
    : [];

  // Create nodes and edges
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Project node (center, top)
  nodes.push({
    id: 'project',
    data: { label: title },
    position: { x: 250, y: 0 },
    style: nodeStyles.primary,
  });
  
  // Overview node (if available)
  if (overview) {
    nodes.push({
      id: 'overview',
      data: { label: 'Overview' },
      position: { x: 250, y: 80 },
      style: {
        ...nodeStyles.primary,
        width: 300,
        fontSize: '12px',
        padding: '8px',
        background: '#f8fafc', // slate-50
        color: '#0f172a', // slate-900
        border: '1px solid #e2e8f0', // slate-200
      },
    });
    
    edges.push({
      id: 'project-overview',
      source: 'project',
      target: 'overview',
      style: edgeStyles,
    });
  }
  
  // Features nodes (left branch)
  nodes.push({
    id: 'features',
    data: { label: 'Key Features' },
    position: { x: 50, y: 160 },
    style: nodeStyles.secondary,
  });
  
  edges.push({
    id: 'project-features',
    source: 'project',
    target: 'features',
    style: edgeStyles,
    markerEnd: { type: MarkerType.ArrowClosed },
  });
  
  features.slice(0, 4).forEach((feature, i) => {
    nodes.push({
      id: `feature-${i}`,
      data: { label: feature.substring(0, 30) },
      position: { x: 0, y: 240 + (i * 70) },
      style: nodeStyles.tertiary,
    });
    
    edges.push({
      id: `features-feature-${i}`,
      source: 'features',
      target: `feature-${i}`,
      style: edgeStyles,
      markerEnd: { type: MarkerType.ArrowClosed },
    });
  });
  
  // Tech stack nodes (center branch)
  nodes.push({
    id: 'tech-stack',
    data: { label: 'Tech Stack' },
    position: { x: 250, y: 160 },
    style: nodeStyles.secondary,
  });
  
  edges.push({
    id: 'project-tech-stack',
    source: 'project',
    target: 'tech-stack',
    style: edgeStyles,
    markerEnd: { type: MarkerType.ArrowClosed },
  });
  
  techStack.slice(0, 4).forEach((tech, i) => {
    nodes.push({
      id: `tech-${i}`,
      data: { label: tech.substring(0, 30) },
      position: { x: 250, y: 240 + (i * 70) },
      style: nodeStyles.tertiary,
    });
    
    edges.push({
      id: `tech-stack-tech-${i}`,
      source: 'tech-stack',
      target: `tech-${i}`,
      style: edgeStyles,
      markerEnd: { type: MarkerType.ArrowClosed },
    });
  });
  
  // Milestones nodes (right branch)
  nodes.push({
    id: 'milestones',
    data: { label: 'Milestones' },
    position: { x: 450, y: 160 },
    style: nodeStyles.secondary,
  });
  
  edges.push({
    id: 'project-milestones',
    source: 'project',
    target: 'milestones',
    style: edgeStyles,
    markerEnd: { type: MarkerType.ArrowClosed },
  });
  
  milestones.slice(0, 5).forEach((milestone, i) => {
    nodes.push({
      id: `milestone-${i}`,
      data: { label: milestone.substring(0, 30) },
      position: { x: 450, y: 240 + (i * 70) },
      style: nodeStyles.tertiary,
    });
    
    // Connect milestones sequentially to show the progression
    if (i > 0) {
      edges.push({
        id: `milestone-${i-1}-milestone-${i}`,
        source: `milestone-${i-1}`,
        target: `milestone-${i}`,
        style: edgeStyles,
        markerEnd: { type: MarkerType.ArrowClosed },
      });
    }
    
    edges.push({
      id: `milestones-milestone-${i}`,
      source: 'milestones',
      target: `milestone-${i}`,
      style: edgeStyles,
      markerEnd: { type: MarkerType.ArrowClosed },
    });
  });
  
  // Add challenges if available
  if (challenges.length > 0) {
    nodes.push({
      id: 'challenges',
      data: { label: 'Challenges' },
      position: { x: 650, y: 160 },
      style: {
        ...nodeStyles.secondary,
        background: '#f97316', // orange-500
        border: '1px solid #ea580c', // orange-600
      },
    });
    
    edges.push({
      id: 'project-challenges',
      source: 'project',
      target: 'challenges',
      style: edgeStyles,
      markerEnd: { type: MarkerType.ArrowClosed },
    });
    
    challenges.slice(0, 3).forEach((challenge, i) => {
      nodes.push({
        id: `challenge-${i}`,
        data: { label: challenge.substring(0, 30) },
        position: { x: 650, y: 240 + (i * 70) },
        style: {
          ...nodeStyles.tertiary,
          background: '#fdba74', // orange-300
          border: '1px solid #f97316', // orange-500
          color: '#7c2d12', // orange-900
        },
      });
      
      edges.push({
        id: `challenges-challenge-${i}`,
        source: 'challenges',
        target: `challenge-${i}`,
        style: edgeStyles,
        markerEnd: { type: MarkerType.ArrowClosed },
      });
    });
  }
  
  return { nodes, edges };
};

interface FlowChartProps {
  ideaText: string;
  className?: string;
}

const FlowChart = ({ ideaText, className = '' }: FlowChartProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Parse idea text and generate nodes/edges
  useEffect(() => {
    if (ideaText && !isInitialized) {
      const { nodes: parsedNodes, edges: parsedEdges } = parseIdeaToFlow(ideaText);
      setNodes(parsedNodes);
      setEdges(parsedEdges);
      setIsInitialized(true);
    }
  }, [ideaText, setNodes, setEdges, isInitialized]);

  return (
    <div className={`flow-chart-container ${className}`} style={{ height: 600, border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      {isInitialized ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#f1f5f9" gap={16} />
          <Controls />
        </ReactFlow>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          Loading flowchart...
        </div>
      )}
    </div>
  );
};

export default FlowChart; 