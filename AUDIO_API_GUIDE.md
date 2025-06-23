# Audio Generation API Usage Guide

## Generate Demo Audio

This API endpoint generates high-quality audio narration using ElevenLabs text-to-speech technology.

### Endpoint

- **POST** `/api/launchpad/video` (Generate audio)
- **GET** `/api/launchpad/video?action=voices` (Get available voices)

## Basic Usage

### 1. Generate Audio

```javascript
const generateDemoAudio = async (
  projectTitle,
  script,
  voiceId = "pNInz6obpgDQGcFmaJgB"
) => {
  try {
    const response = await fetch("/api/launchpad/video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectTitle: projectTitle,
        narrationScript: script,
        voiceId: voiceId,
      }),
    });

    const result = await response.json();

    if (result.success) {
      return result;
    } else {
      throw new Error(result.error || "Failed to generate audio");
    }
  } catch (error) {
    console.error("Error generating audio:", error);
    throw error;
  }
};
```

### 2. Play Audio in Browser

```javascript
const playAudio = (audioUrl) => {
  const audio = new Audio(audioUrl);
  audio.play().catch((error) => {
    console.error("Error playing audio:", error);
  });
};
```

### 3. Download Audio

```javascript
const downloadAudio = (audioUrl, filename) => {
  const link = document.createElement("a");
  link.href = audioUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

### 4. Complete Example Component

```jsx
import React, { useState } from "react";

const AudioGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioData, setAudioData] = useState(null);
  const [script, setScript] = useState("");
  const [projectTitle, setProjectTitle] = useState("");

  const handleGenerateAudio = async () => {
    if (!script.trim()) {
      alert("Please enter a script");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateDemoAudio(
        projectTitle || "Demo Project",
        script
      );
      setAudioData(result);
    } catch (error) {
      alert("Failed to generate audio: " + error.message);
    }
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (audioData) {
      downloadAudio(audioData.audioUrl, audioData.downloadFilename);
    }
  };

  const handleDiscard = () => {
    setAudioData(null);
  };

  return (
    <div className="audio-generator">
      <h2>Generate Demo Audio</h2>

      <div className="form-group">
        <label>Project Title:</label>
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          placeholder="Enter project title"
        />
      </div>

      <div className="form-group">
        <label>Script:</label>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Enter your narration script here..."
          rows={5}
        />
      </div>

      <button
        onClick={handleGenerateAudio}
        disabled={isGenerating || !script.trim()}
        className="generate-btn"
      >
        {isGenerating ? "Generating Audio..." : "Generate Demo Audio"}
      </button>

      {audioData && (
        <div className="audio-result">
          <h3>Generated Audio</h3>
          <p>{audioData.message}</p>

          {/* Audio Player */}
          <audio controls className="audio-player">
            <source src={audioData.audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>

          {/* Metadata */}
          {audioData.metadata && (
            <div className="audio-metadata">
              <p>
                <strong>Duration:</strong> ~
                {audioData.metadata.estimatedDurationSeconds}s
              </p>
              <p>
                <strong>Words:</strong> {audioData.metadata.wordCount}
              </p>
              <p>
                <strong>Size:</strong>{" "}
                {(audioData.metadata.sizeBytes / 1024).toFixed(1)} KB
              </p>
              <p>
                <strong>Quality:</strong> {audioData.metadata.quality}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="audio-actions">
            <button onClick={handleDownload} className="download-btn">
              Download Audio
            </button>
            <button onClick={handleDiscard} className="discard-btn">
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioGenerator;
```

### 5. Get Available Voices

```javascript
const getAvailableVoices = async () => {
  try {
    const response = await fetch("/api/launchpad/video?action=voices");
    const result = await response.json();

    if (result.success) {
      return result.voices;
    } else {
      throw new Error(result.error || "Failed to fetch voices");
    }
  } catch (error) {
    console.error("Error fetching voices:", error);
    throw error;
  }
};
```

## CSS Styling Example

```css
.audio-generator {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.generate-btn {
  background-color: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.generate-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.audio-result {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.audio-player {
  width: 100%;
  margin: 15px 0;
}

.audio-metadata {
  background-color: #e9ecef;
  padding: 10px;
  border-radius: 4px;
  margin: 15px 0;
}

.audio-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.download-btn {
  background-color: #28a745;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.discard-btn {
  background-color: #dc3545;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
```

## API Response Examples

### Successful Audio Generation

```json
{
  "success": true,
  "audioUrl": "data:audio/mpeg;base64,UklGRiQAAABXQVZFZm10...",
  "projectTitle": "My Awesome Project",
  "script": "Welcome to our revolutionary app...",
  "voiceId": "pNInz6obpgDQGcFmaJgB",
  "audioFormat": "mp3",
  "metadata": {
    "sizeBytes": 156800,
    "estimatedDurationSeconds": 45,
    "wordCount": 112,
    "voiceId": "pNInz6obpgDQGcFmaJgB",
    "model": "eleven_multilingual_v2",
    "format": "mp3",
    "quality": "44.1kHz 128kbps"
  },
  "downloadFilename": "My_Awesome_Project_demo_audio.mp3",
  "message": "Demo audio generated successfully! You can now listen and download if you like it."
}
```

### Available Voices Response

```json
{
  "success": true,
  "voices": [
    {
      "voice_id": "pNInz6obpgDQGcFmaJgB",
      "name": "Adam",
      "category": "premade",
      "description": "Middle aged American male",
      "preview_url": "https://storage.googleapis.com/..."
    }
  ],
  "defaultVoice": "pNInz6obpgDQGcFmaJgB"
}
```

## Features

✅ **High-Quality Audio:** Uses ElevenLabs' advanced AI voice technology  
✅ **Multiple Voices:** Access to various voice options  
✅ **Instant Preview:** Listen to audio immediately after generation  
✅ **Easy Download:** One-click download with proper filename  
✅ **Metadata:** Get detailed information about the generated audio  
✅ **Error Handling:** Comprehensive error messages  
✅ **Responsive Design:** Works on all devices
