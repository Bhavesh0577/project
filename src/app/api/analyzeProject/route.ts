import { NextRequest, NextResponse } from 'next/server';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    // Generate prompt for Perplexity
    const prompt = `Give a competitive analysis of this hackathon idea: "${title}". 
    Description: ${description}
    
    Compare it with recent winning ideas from platforms like Devpost/Devfolio. Suggest improvements to stand out.
    
    Format your response as valid JSON with exactly these fields:
    {
      "similarProjects": [
        { "title": "Project name", "year": "Year", "link": "URL to project" }
      ],
      "missingElements": "What the idea is missing compared to winning projects",
      "improvementTips": "Suggestions to make this idea stand out"
    }
    
    Give at least 3 similar projects if available, and at least 3 specific improvement suggestions.
    Return ONLY the JSON with NO additional text.`;

    // Call Perplexity API if key is available
    if (PERPLEXITY_API_KEY) {
      try {
        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
          },
          body: JSON.stringify({
            model: "sonar-pro",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
          })
        });

        if (!perplexityResponse.ok) {
          throw new Error(`Perplexity API error: ${perplexityResponse.statusText}`);
        }

        const data = await perplexityResponse.json();
        const content = data.choices[0].message.content;
        
        // Extract JSON from response
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          const jsonContent = jsonMatch ? jsonMatch[0] : content;
          
          const analysisData = JSON.parse(jsonContent);
          
          // Validate required fields
          if (!analysisData.similarProjects || !analysisData.missingElements || !analysisData.improvementTips) {
            throw new Error('Invalid response format from API');
          }
          
          return NextResponse.json(analysisData);
        } catch (parseError) {
          console.error('Error parsing API response:', parseError);
          return NextResponse.json(
            { error: 'Failed to parse analysis data' }, 
            { status: 500 }
          );
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        return NextResponse.json(
          { error: 'Failed to analyze project' }, 
          { status: 500 }
        );
      }
    } else {
      // If no API key, return error message
      return NextResponse.json(
        { error: 'Project analysis is currently unavailable' }, 
        { status: 503 }
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