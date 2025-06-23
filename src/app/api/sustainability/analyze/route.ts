import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Real sustainability analysis using AI
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { projectTitle, projectDescription, industry, features } = body;

    if (!projectTitle || !projectDescription) {
      return NextResponse.json({ 
        error: 'Project title and description are required' 
      }, { status: 400 });
    }

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Perplexity API key is not configured' },
        { status: 500 }
      );
    }

    const prompt = `Analyze the sustainability and impact of this project:

Project: ${projectTitle}
Description: ${projectDescription}
Industry: ${industry || 'Technology'}
Features: ${features ? features.join(', ') : 'Not specified'}

Provide a comprehensive sustainability analysis in JSON format with:

1. SDG Alignment: Which UN Sustainable Development Goals (1-17) does this project address and their relevance scores (0-100)
2. Environmental Impact: Carbon footprint assessment, resource usage, environmental benefits/costs
3. Social Impact: Number of potential beneficiaries, accessibility, social equity considerations
4. Economic Impact: Economic value creation, cost savings, market potential
5. Ethical Considerations: AI ethics score, privacy implications, bias risks
6. Innovation Score: Technology innovation level, scalability, uniqueness
7. Risk Assessment: Environmental, social, economic risks
8. Sustainability Rating: Overall rating (A-F) with justification
9. Carbon Footprint: Estimated CO2 impact (positive/negative in tons per year)
10. Measurable Metrics: Specific quantifiable impact metrics

Use real-world data and research-based estimates. Be specific with numbers and provide realistic projections.

Format as JSON:
{
  "sdgAlignment": [
    { "goal": 3, "title": "Good Health", "relevance": 85, "justification": "..." },
    ...
  ],
  "environmentalImpact": {
    "carbonFootprint": -2.5,
    "resourceEfficiency": 78,
    "renewableEnergy": 65,
    "wasteReduction": 40,
    "details": "..."
  },
  "socialImpact": {
    "beneficiaries": 25000,
    "accessibilityScore": 85,
    "inclusivity": 75,
    "communityEngagement": 80,
    "details": "..."
  },
  "economicImpact": {
    "valueCreated": 1200000,
    "costSavings": 450000,
    "jobsCreated": 15,
    "marketPotential": 5000000,
    "details": "..."
  },
  "ethicalScore": {
    "aiEthics": 92,
    "privacy": 88,
    "transparency": 85,
    "bias": 90,
    "overall": 89,
    "details": "..."
  },
  "innovationScore": {
    "technological": 85,
    "scalability": 78,
    "uniqueness": 82,
    "overall": 82,
    "details": "..."
  },
  "riskAssessment": {
    "environmental": "low",
    "social": "medium",
    "economic": "low",
    "technical": "medium",
    "details": "..."
  },
  "sustainabilityRating": {
    "grade": "A",
    "score": 87,
    "justification": "..."
  },
  "metrics": [
    {
      "category": "Environmental",
      "metric": "CO2 Reduction",
      "value": 2.5,
      "unit": "tons/year",
      "trend": "positive"
    },
    ...
  ],
  "recommendations": [
    "Specific actionable recommendations for improving sustainability"
  ]
}`;

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
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
              content: 'You are a sustainability expert and impact assessment specialist with deep knowledge of UN SDGs, environmental science, social impact measurement, and ESG frameworks. Provide detailed, research-based analysis with realistic quantitative estimates.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const analysisData = JSON.parse(jsonMatch[0]);
      
      return NextResponse.json({
        success: true,
        analysis: analysisData,
        timestamp: new Date().toISOString()
      });

    } catch (apiError) {
      console.error('API Error:', apiError);
      return NextResponse.json(
        { error: 'Failed to analyze project sustainability', details: apiError.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error processing sustainability analysis:', error);
    return NextResponse.json(
      { error: 'Failed to process sustainability analysis' },
      { status: 500 }
    );
  }
}
