# Video Generation Feature Setup

This document provides instructions on how to set up the video and audio generation features in the project.

## Environment Variables

You need to add the following environment variables to your `.env.local` file:

```
# ElevenLabs API Key
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Tavus API Key
TAVUS_API_KEY=your_tavus_api_key_here

# Tavus Default Replica ID
TAVUS_DEFAULT_REPLICA_ID=your_tavus_replica_id_here
```

## How to Get API Keys

### ElevenLabs API Key
1. Create an account at [ElevenLabs](https://elevenlabs.io/)
2. Go to your profile settings
3. Find your API key in the "API" section
4. Copy and paste it into your `.env.local` file

### Tavus API Key and Replica ID
1. Create an account at [Tavus](https://www.tavus.io/)
2. Go to the Developer Portal
3. Generate an API key
4. Copy and paste it into your `.env.local` file
5. To get a replica ID:
   - Go to the Replicas section in the Tavus dashboard
   - Select or create a replica
   - Copy the replica ID from the URL or details page
   - Add it to your `.env.local` file

## API Changes Made

The following changes were made to fix the video and audio generation features:

1. Updated ElevenLabs API implementation:
   - Changed the model from `eleven_monolingual_v1` to `eleven_multilingual_v2`
   - Added explicit output format specification

2. Updated Tavus API implementation:
   - Changed the API endpoint from `https://api.tavus.io/v1/videos` to `https://tavusapi.com/v2/videos`
   - Updated the authentication header from `Authorization: Bearer` to `x-api-key`
   - Updated the request body format to match the current Tavus API requirements
   - Added support for using audio URL generated from ElevenLabs
   - Added proper error handling and response parsing

## Testing the Feature

After setting up the environment variables, you can test the video generation feature by:

1. Making a POST request to `/api/launchpad/video` with the following JSON body:
```json
{
  "narrationScript": "This is a test narration",
  "scenes": [
    {
      "visual": "https://example.com/image.jpg"
    }
  ],
  "voiceId": "pNInz6obpgDQGcFmaJgB" // Optional, defaults to Adam voice
}
```

2. The API will return a JSON response with `audioUrl` and `videoUrl` if successful.

## Troubleshooting

If you encounter any issues:

1. Check that your API keys are correct and have sufficient credits
2. Verify that your Tavus replica ID exists and is properly trained
3. Check the server logs for detailed error messages
4. Make sure your narration script is not empty and follows any content guidelines from ElevenLabs and Tavus 