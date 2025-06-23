import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { projectTitle, projectDescription, targetAudience, keyFeatures } = body;

    if (!projectTitle || !projectDescription) {
      return NextResponse.json({ error: 'Project title and description are required' }, { status: 400 });
    }

    // Get API key from environment variables
    const apiKey = process.env.PERPLEXITY_API_KEY || '';
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Perplexity API key is not configured' },
        { status: 500 }
      );
    }
    
    // Prepare the prompt for Perplexity API
    const fullPrompt = `Generate a comprehensive pitch package for a hackathon project that's transitioning to a startup:

Project Title: ${projectTitle}
Project Description: ${projectDescription}
Target Audience: ${targetAudience || 'General users'}
Key Features: ${keyFeatures ? keyFeatures.join(', ') : 'Not specified'}

Please create the following components in JSON format:

1. Slide Deck Outline (10 slides):
   - Include title, problem statement, solution, market opportunity, product demo, business model, team, roadmap, and call to action
   - For each slide, provide a title and bullet points of content

2. Pitch Script:
   - A 2-minute script that covers the key points
   - Should be conversational and engaging

3. Demo Storyboard:
   - A sequence of 5-7 scenes showing how to demonstrate the product
   - Each scene should include a description of what to show and what to say

Format your response as a structured JSON with these exact categories as keys:
{
  "slides": [
    {
      "title": "Slide Title",
      "content": ["Bullet point 1", "Bullet point 2", ...]
    },
    ...
  ],
  "pitchScript": {
    "introduction": "Script text...",
    "problem": "Script text...",
    "solution": "Script text...",
    "demo": "Script text...",
    "business": "Script text...",
    "closing": "Script text..."
  },
  "demoStoryboard": [
    {
      "scene": "Scene title/number",
      "visual": "Description of what to show",
      "narration": "What to say during this scene"
    },
    ...
  ]
}`;

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
            content: 'You are an expert pitch consultant who helps hackathon projects transition to startups.',
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
    const content = data.choices?.[0]?.message?.content || '';
    
    // Extract JSON from the response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonContent = jsonMatch ? jsonMatch[0] : content;
      const pitchData = JSON.parse(jsonContent);
      
      return NextResponse.json(pitchData);
    } catch (error) {
      console.error('Error parsing pitch data:', error);
      return NextResponse.json(
        { error: 'Failed to parse pitch data', rawContent: content },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 