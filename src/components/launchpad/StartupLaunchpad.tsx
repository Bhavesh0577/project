'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import BoltBadge from '../BoltBadge';
import { 
  Presentation, 
  Volume2, 
  DollarSign, 
  Rocket, 
  FileText, 
  Mic, 
  Play, 
  Download, 
  Copy, 
  Check, 
  Loader2,
  Trash2
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';

type PitchData = {
  slides: Array<{
    title: string;
    content: string[];
  }>;
  pitchScript: {
    introduction: string;
    problem: string;
    solution: string;
    demo: string;
    business: string;
    closing: string;
  };
  demoStoryboard: Array<{
    scene: string;
    visual: string;
    narration: string;
  }>;
};

type MonetizationModel = 'subscription' | 'donation';

export default function StartupLaunchpad() {
  const { user } = useUser();
  
  // Project details state
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [keyFeatures, setKeyFeatures] = useState<string[]>([]);
  const [keyFeaturesInput, setKeyFeaturesInput] = useState('');
  
  // Pitch generation state
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [pitchData, setPitchData] = useState<PitchData | null>(null);
    // Audio generation state
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioData, setAudioData] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  
  // Monetization state
  const [monetizationModel, setMonetizationModel] = useState<MonetizationModel>('subscription');
  const [isGeneratingMonetization, setIsGeneratingMonetization] = useState(false);
  const [monetizationData, setMonetizationData] = useState<any>(null);
  const [subscriptionTiers, setSubscriptionTiers] = useState([
    { name: 'Basic', price: '4.99', features: ['Feature 1', 'Feature 2'] },
    { name: 'Pro', price: '9.99', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
    { name: 'Enterprise', price: '19.99', features: ['All features', 'Priority support'] }
  ]);
  const [donationOptions, setDonationOptions] = useState([
    { amount: '5.00', description: 'Small donation' },
    { amount: '10.00', description: 'Medium donation' },
    { amount: '25.00', description: 'Large donation' }
  ]);

  // Handle adding key features
  const addKeyFeature = () => {
    if (keyFeaturesInput.trim()) {
      setKeyFeatures([...keyFeatures, keyFeaturesInput.trim()]);
      setKeyFeaturesInput('');
    }
  };

  // Handle removing key features
  const removeKeyFeature = (index: number) => {
    setKeyFeatures(keyFeatures.filter((_, i) => i !== index));
  };

  // Generate AI pitch
  const generatePitch = async () => {
    if (!projectTitle || !projectDescription) {
      toast.error('Project title and description are required');
      return;
    }

    setIsGeneratingPitch(true);
    
    try {
      const response = await fetch('/api/launchpad/pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectTitle,
          projectDescription,
          targetAudience,
          keyFeatures
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate pitch');
      }
      
      const data = await response.json();
      setPitchData(data);
      toast.success('Pitch generated successfully!');
    } catch (error) {
      console.error('Error generating pitch:', error);
      toast.error('Failed to generate pitch. Please try again.');
    } finally {
      setIsGeneratingPitch(false);
    }
  };
  // Generate demo audio
  const generateAudio = async () => {
    if (!pitchData) {
      toast.error('Please generate a pitch first');
      return;
    }

    setIsGeneratingAudio(true);
    
    try {
      // Combine the pitch script sections into a single narration
      const narrationScript = Object.values(pitchData.pitchScript).join(' ');
      
      const response = await fetch('/api/launchpad/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectTitle,
          narrationScript,
          voiceId: selectedVoice || undefined
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate audio');
      }
      
      setAudioData(data);
      toast.success('Audio generated successfully!');
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate audio. Please try again.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Fetch available voices
  const fetchVoices = async () => {
    try {
      const response = await fetch('/api/launchpad/video');
      if (response.ok) {
        const data = await response.json();
        setAvailableVoices(data.voices || []);
        if (data.voices && data.voices.length > 0) {
          setSelectedVoice(data.voices[0].voice_id);
        }
      }
    } catch (error) {
      console.error('Error fetching voices:', error);
    }
  };

  // Download audio
  const downloadAudio = () => {
    if (audioData?.audioUrl && audioData?.metadata?.filename) {
      const link = document.createElement('a');
      link.href = audioData.audioUrl;
      link.download = audioData.metadata.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Audio download started!');
    }
  };  // Load voices when component mounts
  useEffect(() => {
    fetchVoices();
  }, []);

  // Generate monetization integration
  const generateMonetization = async () => {
    setIsGeneratingMonetization(true);
    
    try {
      const response = await fetch('/api/launchpad/monetization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: 'project-' + Date.now(),
          monetizationModel,
          subscriptionTiers: monetizationModel === 'subscription' ? subscriptionTiers : undefined,
          donationOptions: monetizationModel === 'donation' ? donationOptions : undefined
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate monetization integration');
      }
      
      const data = await response.json();
      setMonetizationData(data);
      toast.success('Monetization integration generated successfully!');
    } catch (error) {
      console.error('Error generating monetization integration:', error);
      toast.error('Failed to generate monetization integration. Please try again.');
    } finally {
      setIsGeneratingMonetization(false);
    }
  };

  // Copy code to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <Rocket className="h-8 w-8 text-primary" />
          Hackathon-to-Startup Launchpad
        </h1>
        <p className="text-muted-foreground">
          Transform your hackathon project into a viable startup with AI-powered tools
        </p>
      </div>

      <Tabs defaultValue="project" className="space-y-6">        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="project">Project Details</TabsTrigger>
          <TabsTrigger value="pitch">AI Pitch Creator</TabsTrigger>
          <TabsTrigger value="video">Demo Audio</TabsTrigger>
          <TabsTrigger value="monetization">Monetization</TabsTrigger>
        </TabsList>

        {/* Project Details Tab */}
        <TabsContent value="project">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project Details
              </CardTitle>
              <CardDescription>
                Provide information about your hackathon project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectTitle">Project Title</Label>
                <Input 
                  id="projectTitle" 
                  placeholder="Enter your project title" 
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Project Description</Label>
                <Textarea 
                  id="projectDescription" 
                  placeholder="Describe your project in detail" 
                  className="min-h-[120px]"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input 
                  id="targetAudience" 
                  placeholder="Who is your project for?" 
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="keyFeatures">Key Features</Label>
                <div className="flex gap-2">
                  <Input 
                    id="keyFeatures" 
                    placeholder="Add a key feature" 
                    value={keyFeaturesInput}
                    onChange={(e) => setKeyFeaturesInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyFeature();
                      }
                    }}
                  />
                  <Button type="button" onClick={addKeyFeature}>Add</Button>
                </div>
                
                {keyFeatures.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm font-medium">Added Features:</p>
                    <ul className="space-y-1">
                      {keyFeatures.map((feature, index) => (
                        <li key={index} className="flex items-center justify-between bg-secondary/30 p-2 rounded-md">
                          <span>{feature}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeKeyFeature(index)}
                          >
                            &times;
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => toast.success('Project details saved!')}
                className="w-full"
              >
                Save Project Details
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* AI Pitch Creator Tab */}
        <TabsContent value="pitch">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Presentation className="h-5 w-5" />
                AI Pitch Creator
              </CardTitle>
              <CardDescription>
                Generate a professional pitch deck, script, and demo storyboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!pitchData ? (
                <div className="text-center py-8">
                  <Presentation className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Pitch Generated Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Click the button below to generate a professional pitch deck, script, and demo storyboard based on your project details.
                  </p>
                  <Button 
                    onClick={generatePitch} 
                    disabled={isGeneratingPitch || !projectTitle || !projectDescription}
                  >
                    {isGeneratingPitch ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>Generate AI Pitch</>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Slide Deck */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Presentation className="h-5 w-5" />
                      Slide Deck Outline
                    </h3>
                    <div className="border rounded-md overflow-hidden">
                      {pitchData.slides.map((slide, index) => (
                        <div key={index} className="border-b last:border-b-0">
                          <div className="p-3 bg-secondary/30 font-medium">
                            Slide {index + 1}: {slide.title}
                          </div>
                          <div className="p-3">
                            <ul className="list-disc list-inside space-y-1">
                              {slide.content.map((point, i) => (
                                <li key={i} className="text-sm">{point}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" onClick={() => copyToClipboard(JSON.stringify(pitchData.slides, null, 2))}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Slides
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Pitch Script */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Mic className="h-5 w-5" />
                      Pitch Script
                    </h3>
                    <div className="border rounded-md overflow-hidden">
                      {Object.entries(pitchData.pitchScript).map(([section, content], index) => (
                        <div key={section} className="border-b last:border-b-0">
                          <div className="p-3 bg-secondary/30 font-medium capitalize">
                            {section}
                          </div>
                          <div className="p-3">
                            <p className="text-sm">{content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" onClick={() => copyToClipboard(JSON.stringify(pitchData.pitchScript, null, 2))}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Script
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Demo Storyboard */}
                  <div className="space-y-4">                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Demo Storyboard
                    </h3>
                    <div className="border rounded-md overflow-hidden">
                      {pitchData.demoStoryboard.map((scene, index) => (
                        <div key={index} className="border-b last:border-b-0">
                          <div className="p-3 bg-secondary/30 font-medium">
                            {scene.scene}
                          </div>
                          <div className="p-3 space-y-2">
                            <div>
                              <p className="text-sm font-medium">Visual:</p>
                              <p className="text-sm">{scene.visual}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Narration:</p>
                              <p className="text-sm">{scene.narration}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" onClick={() => copyToClipboard(JSON.stringify(pitchData.demoStoryboard, null, 2))}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Storyboard
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setPitchData(null)}
                disabled={!pitchData || isGeneratingPitch}
              >
                Reset
              </Button>
              <Button 
                onClick={generatePitch} 
                disabled={isGeneratingPitch || !projectTitle || !projectDescription}
              >
                {isGeneratingPitch ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>Regenerate Pitch</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Demo Audio Tab */}
        <TabsContent value="video">
          <Card>            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Demo Audio Generator
              </CardTitle>
              <CardDescription>
                Create a narrated demo audio for your project using AI-powered voice synthesis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">              {!audioData ? (
                <div className="text-center py-8">
                  <Volume2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Demo Audio Generated Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Generate a professional demo audio with AI-powered narration using ElevenLabs voice synthesis.
                  </p>
                  
                  {/* Voice Selection */}
                  {availableVoices.length > 0 && (
                    <div className="mb-6 max-w-sm mx-auto">
                      <Label htmlFor="voice-select" className="text-sm font-medium mb-2 block">
                        Select Voice
                      </Label>                      <select
                        id="voice-select"
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Select voice for audio generation"
                      >
                        {availableVoices.map((voice) => (
                          <option key={voice.voice_id} value={voice.voice_id}>
                            {voice.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <Button 
                    onClick={generateAudio} 
                    disabled={isGeneratingAudio || !pitchData}
                  >
                    {isGeneratingAudio ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Audio...
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Generate Demo Audio
                      </>
                    )}
                  </Button>
                  
                  {!pitchData && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      You need to generate a pitch first in the AI Pitch Creator tab.
                    </p>
                  )}
                </div>              ) : (
                <div className="space-y-6">
                  {/* Audio Preview */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Demo Audio Preview
                    </h3>
                    <div className="bg-card border rounded-md p-6">
                      <audio 
                        ref={audioRef}
                        controls 
                        className="w-full mb-4" 
                        src={audioData.audioUrl}
                      />
                      
                      {/* Audio Metadata */}
                      {audioData.metadata && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          {audioData.metadata.duration && (
                            <div>
                              <span className="font-medium">Duration:</span>
                              <br />
                              ~{audioData.metadata.duration}s
                            </div>
                          )}
                          {audioData.metadata.wordCount && (
                            <div>
                              <span className="font-medium">Words:</span>
                              <br />
                              {audioData.metadata.wordCount}
                            </div>
                          )}
                          {audioData.metadata.size && (
                            <div>
                              <span className="font-medium">Size:</span>
                              <br />
                              {audioData.metadata.size}
                            </div>
                          )}
                          {audioData.metadata.voiceName && (
                            <div>
                              <span className="font-medium">Voice:</span>
                              <br />
                              {audioData.metadata.voiceName}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-center gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setAudioData(null)}
                      disabled={isGeneratingAudio}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Discard
                    </Button>
                    <Button 
                      onClick={downloadAudio}
                      disabled={isGeneratingAudio}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Audio
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setAudioData(null)}
                disabled={!audioData || isGeneratingAudio}
              >
                Reset
              </Button>
              <Button 
                onClick={generateAudio} 
                disabled={isGeneratingAudio || !pitchData}
              >
                {isGeneratingAudio ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>Regenerate Audio</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Monetization Tab */}
        <TabsContent value="monetization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Monetization Integration
              </CardTitle>
              <CardDescription>
                Integrate monetization options using RevenueCat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Monetization Model</h3>
                <RadioGroup 
                  value={monetizationModel} 
                  onValueChange={(value) => setMonetizationModel(value as MonetizationModel)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="subscription" id="subscription" />
                    <Label htmlFor="subscription">Subscription</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="donation" id="donation" />
                    <Label htmlFor="donation">Donation</Label>
                  </div>
                </RadioGroup>
              </div>

              {!monetizationData ? (
                <div className="text-center py-8">
                  <DollarSign className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Monetization Integration Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Generate integration code for {monetizationModel === 'subscription' ? 'subscription-based' : 'donation-based'} monetization using RevenueCat.
                  </p>
                  <Button 
                    onClick={generateMonetization} 
                    disabled={isGeneratingMonetization}
                  >
                    {isGeneratingMonetization ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>Generate Integration Code</>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Integration Code */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Integration Code</h3>
                    <div className="bg-secondary/10 rounded-md p-4 overflow-x-auto">
                      <pre className="text-sm">
                        <code>{monetizationData.integrationCode}</code>
                      </pre>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" onClick={() => copyToClipboard(monetizationData.integrationCode)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Code
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Setup Instructions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Setup Instructions</h3>
                    <div className="bg-secondary/10 rounded-md p-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <pre className="text-sm whitespace-pre-wrap">
                          {monetizationData.setupInstructions}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setMonetizationData(null)}
                disabled={!monetizationData || isGeneratingMonetization}
              >
                Reset
              </Button>
              <Button 
                onClick={generateMonetization} 
                disabled={isGeneratingMonetization}
              >
                {isGeneratingMonetization ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>Regenerate Integration</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
