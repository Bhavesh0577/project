import { NextRequest, NextResponse } from 'next/server';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';

// Define Hackathon type
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

export async function POST(request: NextRequest) {
  try {
    // Check for valid request
    if (!request.body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Parse the request body
    const requestBody = await request.json();
    const { interest } = requestBody;

    if (!interest || typeof interest !== 'string') {
      return NextResponse.json({ error: 'Interest is required' }, { status: 400 });
    }

    // Generate prompt for Perplexity
    const prompt = `You are an expert hackathon aggregator. Find ongoing or upcoming hackathons specifically related to "${interest}". 
    Search across major platforms such as Devpost, Devfolio, DoraHacks, and MLH, and include any other reputable sources. 
    Return ONLY a valid JSON array of hackathon objects, where each object has EXACTLY these fields (all as strings): title, theme, platform, deadline, link, description and mode. 
    Ensure each hackathon is currently open for registration or will open soon. 
    Verify that the 'link' provided for each hackathon is accurate and directly leads to the hackathon's main page.
    Provide at least 10 relevant hackathons if possible, prioritizing diversity in platforms and themes. 
    Do not include any explanation, markdown, or extra text—respond with a valid JSON array only, with no additional formatting or commentary. The JSON format must be strictly adhered to.`;


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
        
        // Extract and parse the JSON from the response
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const jsonContent = jsonMatch ? jsonMatch[0] : content;
        
        const hackathonsData = JSON.parse(jsonContent);
        
        if (hackathonsData.length === 0) {
          return NextResponse.json({ message: 'No hackathons found for the given interest.' });
        }
        
        // Add an ID to each hackathon
        const hackathonsWithIds = hackathonsData.map((hackathon: Omit<Hackathon, 'id'>, index: number) => ({
          id: `hack-${index}`,
          ...hackathon
        }));
        
        return NextResponse.json({ hackathons: hackathonsWithIds });
      } catch (apiError) {
        console.error('API error:', apiError);
        return NextResponse.json({ error: 'Failed to fetch hackathon data' }, { status: 500 });
      }
    } else {
      // If no API key, return not found message
      return NextResponse.json({ message: 'Hackathon data is currently unavailable.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to find hackathons' }, { status: 500 });
  }
}
