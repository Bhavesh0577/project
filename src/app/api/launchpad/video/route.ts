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
    const { 
      projectTitle, 
      narrationScript, 
      scenes, 
      voiceId = 'pNInz6obpgDQGcFmaJgB' // Default ElevenLabs voice ID (Adam)
    } = body;

    if (!narrationScript) {
      return NextResponse.json({ 
        error: 'Narration script is required' 
      }, { status: 400 });
    }

    // Get API keys from environment variables
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY || '';
    
    if (!elevenLabsApiKey) {
      return NextResponse.json({ error: 'ElevenLabs API key is not configured' }, { status: 500 });
    }

    // Generate audio narration using ElevenLabs API
    const audioResponse = await generateAudioNarration(narrationScript, voiceId, elevenLabsApiKey);
    
    if (!audioResponse.success || !audioResponse.audioUrl) {
      return NextResponse.json({ error: audioResponse.error || 'Failed to generate audio narration' }, { status: 500 });
    }    return NextResponse.json({
      success: true,
      audioUrl: audioResponse.audioUrl,
      projectTitle: projectTitle,
      script: narrationScript,
      voiceId: voiceId,
      audioFormat: 'mp3',
      metadata: audioResponse.metadata,
      downloadFilename: `${projectTitle.replace(/[^a-zA-Z0-9]/g, '_')}_demo_audio.mp3`,
      message: 'Demo audio generated successfully! You can now listen and download if you like it.'
    });
  } catch (error) {
    console.error('Error processing audio generation request:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to process audio generation request' }, { status: 500 });
  }
}

async function generateAudioNarration(
  script: string, 
  voiceId: string, 
  apiKey: string
): Promise<{ success: boolean; audioUrl?: string; error?: string; metadata?: any }> {
  try {
    console.log(`Generating audio with voice ${voiceId} for script: ${script.substring(0, 100)}...`);
    
    // Call ElevenLabs API to generate audio
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: script,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        },
        output_format: 'mp3_44100_128'
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('ElevenLabs API error:', response.status, errorData);
      return { success: false, error: `ElevenLabs API error: ${response.status} - ${errorData}` };
    }

    // Create a data URL from the audio blob
    const audioBlob = await response.blob();
    if (!audioBlob || audioBlob.size === 0) {
      return { success: false, error: 'No audio data received from ElevenLabs.' };
    }
    
    const audioBuffer = await audioBlob.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
    
    if (!audioUrl || audioUrl.length < 100) {
      return { success: false, error: 'Audio data is empty or invalid.' };
    }

    // Calculate approximate duration (rough estimate)
    const wordsPerMinute = 150; // Average speaking rate
    const wordCount = script.split(' ').length;
    const estimatedDurationSeconds = Math.round((wordCount / wordsPerMinute) * 60);

    const metadata = {
      sizeBytes: audioBlob.size,
      estimatedDurationSeconds,
      wordCount,
      voiceId,
      model: 'eleven_multilingual_v2',
      format: 'mp3',
      quality: '44.1kHz 128kbps'
    };

    console.log('Audio generation successful:', metadata);
    
    return { 
      success: true, 
      audioUrl,
      metadata
    };
  } catch (error) {
    console.error('Error generating audio narration:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error generating audio' };
  }
}

// Add a GET endpoint to get available voices
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // Get available ElevenLabs voices
    if (action === 'voices') {
      const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY || '';
      
      if (!elevenLabsApiKey) {
        return NextResponse.json({ error: 'ElevenLabs API key is not configured' }, { status: 500 });
      }

      try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: {
            'xi-api-key': elevenLabsApiKey,
          },
        });

        if (!response.ok) {
          return NextResponse.json({ error: 'Failed to fetch voices' }, { status: response.status });
        }

        const data = await response.json();
        
        // Return simplified voice data
        const voices = data.voices?.map((voice: any) => ({
          voice_id: voice.voice_id,
          name: voice.name,
          category: voice.category,
          description: voice.description,
          preview_url: voice.preview_url
        })) || [];

        return NextResponse.json({
          success: true,
          voices: voices,
          defaultVoice: 'pNInz6obpgDQGcFmaJgB' // Adam
        });
      } catch (error) {
        console.error('Error fetching voices:', error);
        return NextResponse.json({ error: 'Failed to fetch available voices' }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      error: 'Invalid action. Use ?action=voices to get available voices' 
    }, { status: 400 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}