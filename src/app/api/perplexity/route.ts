import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get API key from environment variables
    const apiKey = process.env.PERPLEXITY_API_KEY || '';
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Perplexity API key is not configured' },
        { status: 500 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { title, prompt } = body;
    
    if (!title || !prompt) {
      return NextResponse.json(
        { error: 'Title and prompt are required' },
        { status: 400 }
      );
    }
    
    // Prepare the prompt for Perplexity API
    const fullPrompt = `Generate a detailed hackathon project idea based on the following:
Title: ${title}
Description: ${prompt}

Your response should include:
1. A refined project idea with clear goals
2. Key Features that should be implemented (list them with numbers)
3. Suggested Technology Stack (list as bullet points with - )
4. Development Milestones (list them with numbers)
5. Potential challenges and how to overcome them

Format your response as a structured document with clear sections using ## for headings.
For example:
# [Project Title]

## Project Overview
[Description]

## Key Features
1. Feature one
2. Feature two

## Technology Stack
- Frontend: React
- Backend: Node.js
`;

    // Call the Perplexity API
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI that generates detailed hackathon project ideas with technical details.',
          },
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
      }),
    });
    
    if (!perplexityResponse.ok) {
      const errorData = await perplexityResponse.json();
      return NextResponse.json(
        { error: `Perplexity API error: ${JSON.stringify(errorData)}` },
        { status: perplexityResponse.status }
      );
    }
    
    const data = await perplexityResponse.json();
    const generatedIdea = data.choices?.[0]?.message?.content || '';
    
    // Return just the idea text - the flowchart will be generated on the client
    return NextResponse.json({ idea: generatedIdea, flowchart: generatedIdea });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 