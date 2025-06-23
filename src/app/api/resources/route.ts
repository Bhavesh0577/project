import { NextRequest, NextResponse } from 'next/server';
function extractFirstJsonObject(text: string): string | null {
  // This regex finds the first {...} or [...] block in the text
  const match = text.match(/({[\s\S]*})|\[([\s\S]*)\]/);
  return match ? match[0] : null;
}
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
    const { title, description, ideaType } = body;
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Project title and description are required' },
        { status: 400 }
      );
    }
    // Prepare the prompt for Perplexity API
    const fullPrompt = `Based on the following hackathon project idea, recommend useful resources:
Title: ${title}
Description: ${description}
Type: ${ideaType || 'Generated idea'}
Please provide recommendations in the following categories:
1. APIs - Public APIs that could be integrated into this project
2. Datasets - Relevant datasets to power this application
3. Development Tools - Tools, libraries or frameworks specifically helpful for this project
4. Learning Resources - Tutorials, courses, guides or documentation
For each resource:
- Provide a name
- A brief description (1-2 sentences)
- The official website/link
- Why it's useful for this specific project
Format your response as a structured JSON with these exact categories as keys, and arrays of resources for each category.
Example format:
{
  "apis": [
    {
      "name": "Example API",
      "description": "Brief description of the API",
      "url": "https://example.com/api",
      "relevance": "Why it's useful for this project"
    }
  ],
  "datasets": [...],
  "developmentTools": [...],
  "learningResources": [...]
}
Provide 3-5 highly relevant resources per category, focused on the project's specific needs and theme.`;
    // Call the Perplexity API
    console.log('Calling Perplexity API...');
    try {
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
              content: 'You are a helpful AI that recommends specific resources, APIs, datasets, and tools for hackathon projects, with accurate descriptions and URLs.',
            },
            {
              role: 'user',
              content: fullPrompt,
            },
          ],
          response_format: { type: "text" }
        }),
      });
      if (!perplexityResponse.ok) {
        const errorText = await perplexityResponse.text();
        console.error('Perplexity API error status:', perplexityResponse.status);
        console.error('Perplexity API error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        return NextResponse.json(
          { error: `Perplexity API error: ${perplexityResponse.status}`, details: errorData },
          { status: perplexityResponse.status }
        );
      }
      const data = await perplexityResponse.json();
      console.log('Perplexity API response received');
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Unexpected API response format:', data);
        return NextResponse.json(
          { error: 'Unexpected API response format', details: data },
          { status: 500 }
        );
      }
      const content = data.choices[0].message.content || '{}';
      // Extract the first valid JSON object from the response
      const jsonString = extractFirstJsonObject(content);
      let resourceData;
      try {
        resourceData = jsonString ? JSON.parse(jsonString) : null;
        if (!resourceData) throw new Error('No JSON found in response');
      } catch (e) {
        console.error('Error parsing JSON response:', e, 'Content:', content);
        resourceData = {
          apis: [],
          datasets: [],
          developmentTools: [],
          learningResources: [],
          raw: content
        };
      }
      return NextResponse.json(resourceData);
    } catch (fetchError) {
      console.error('Fetch error when calling Perplexity API:', fetchError);
      return NextResponse.json(
        { error: 'Failed to connect to Perplexity API', details: fetchError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
} 
