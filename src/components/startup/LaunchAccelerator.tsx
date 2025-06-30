'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rocket, DollarSign, Users, TrendingUp, FileText, Video, Mic, Download, Play, Edit } from 'lucide-react';
import { toast } from 'sonner';
import BoltBadge from '../BoltBadge';

type PitchSection = {
  id: string;
  title: string;
  content: string;
  duration: number;
  tips: string[];
  isCompleted: boolean;
};

type RevenueModel = {
  type: string;
  description: string;
  projectedRevenue: number;
  timeframe: string;
  confidence: number;
};

type StartupMetrics = {
  marketSize: number;
  targetUsers: number;
  revenueProjection: number;
  fundingNeeded: number;
  timeToMarket: number;
  competitorAnalysis: number;
};

const PITCH_SECTIONS: PitchSection[] = [
  {
    id: 'problem',
    title: 'Problem Statement',
    content: '',
    duration: 60,
    tips: [
      'Start with a relatable story or statistic',
      'Quantify the problem size',
      'Show urgency and pain points'
    ],
    isCompleted: false
  },
  {
    id: 'solution',
    title: 'Solution Overview',
    content: '',
    duration: 90,
    tips: [
      'Clearly explain your unique approach',
      'Show how it solves the problem',
      'Highlight key differentiators'
    ],
    isCompleted: false
  },
  {
    id: 'market',
    title: 'Market Opportunity',
    content: '',
    duration: 60,
    tips: [
      'Present TAM, SAM, and SOM',
      'Show market growth trends',
      'Identify target segments'
    ],
    isCompleted: false
  },
  {
    id: 'business',
    title: 'Business Model',
    content: '',
    duration: 75,
    tips: [
      'Explain revenue streams',
      'Show pricing strategy',
      'Demonstrate scalability'
    ],
    isCompleted: false
  },
  {
    id: 'traction',
    title: 'Traction & Validation',
    content: '',
    duration: 60,
    tips: [
      'Show user growth metrics',
      'Include customer testimonials',
      'Highlight key partnerships'
    ],
    isCompleted: false
  },
  {
    id: 'team',
    title: 'Team & Execution',
    content: '',
    duration: 45,
    tips: [
      'Highlight relevant experience',
      'Show complementary skills',
      'Demonstrate execution capability'
    ],
    isCompleted: false
  },
  {
    id: 'financials',
    title: 'Financial Projections',
    content: '',
    duration: 60,
    tips: [
      'Show 3-5 year projections',
      'Include key assumptions',
      'Highlight unit economics'
    ],
    isCompleted: false
  },
  {
    id: 'funding',
    title: 'Funding Ask',
    content: '',
    duration: 30,
    tips: [
      'Specify exact amount needed',
      'Show use of funds breakdown',
      'Include milestones and timeline'
    ],
    isCompleted: false
  }
];

const REVENUE_MODELS: RevenueModel[] = [
  {
    type: 'SaaS Subscription',
    description: 'Monthly/annual recurring revenue model',
    projectedRevenue: 500000,
    timeframe: '12 months',
    confidence: 85
  },
  {
    type: 'Freemium',
    description: 'Free tier with premium features',
    projectedRevenue: 750000,
    timeframe: '18 months',
    confidence: 70
  },
  {
    type: 'Marketplace Commission',
    description: 'Transaction-based revenue sharing',
    projectedRevenue: 1200000,
    timeframe: '24 months',
    confidence: 60
  },
  {
    type: 'Enterprise Licensing',
    description: 'B2B software licensing model',
    projectedRevenue: 2000000,
    timeframe: '36 months',
    confidence: 75
  }
];

export default function LaunchAccelerator() {
  const [pitchSections, setPitchSections] = useState<PitchSection[]>(PITCH_SECTIONS);
  const [selectedSection, setSelectedSection] = useState<string>('problem');
  const [isGenerating, setIsGenerating] = useState(false);
  const [startupMetrics, setStartupMetrics] = useState<StartupMetrics>({
    marketSize: 50000000,
    targetUsers: 100000,
    revenueProjection: 1000000,
    fundingNeeded: 500000,
    timeToMarket: 6,
    competitorAnalysis: 78
  });
  const [selectedRevenueModel, setSelectedRevenueModel] = useState<string>('');

  const generatePitchContent = async (sectionId: string) => {
    setIsGenerating(true);
    toast.success('Generating AI-powered pitch content...');

    // Simulate AI content generation
    setTimeout(() => {
      const section = pitchSections.find(s => s.id === sectionId);
      if (section) {
        const generatedContent = getGeneratedContent(sectionId);
        setPitchSections(prev => 
          prev.map(s => 
            s.id === sectionId 
              ? { ...s, content: generatedContent, isCompleted: true }
              : s
          )
        );
      }
      setIsGenerating(false);
      toast.success('Pitch content generated successfully!');
    }, 2000);
  };

  const getGeneratedContent = (sectionId: string): string => {
    const templates = {
      problem: "In today's digital landscape, 73% of hackathon participants struggle to form effective teams, leading to $2.3B in lost innovation potential annually. Current solutions are fragmented, time-consuming, and fail to leverage AI for optimal matching.",
      solution: "HackFlow revolutionizes team formation through AI-powered matching algorithms that analyze skills, experience, and collaboration patterns. Our platform reduces team formation time by 80% while increasing project success rates by 65%.",
      market: "The global hackathon market is valued at $1.2B and growing at 15% CAGR. With 5M+ annual participants worldwide, our TAM represents a $500M opportunity in the collaboration tools space.",
      business: "Our freemium SaaS model generates revenue through premium team analytics ($29/month), enterprise hackathon management ($199/month), and marketplace commissions (5% of prize money).",
      traction: "Since launch, we've achieved 15K+ registered users, 500+ successful team formations, and partnerships with 25+ major hackathon organizers including MLH and Devpost.",
      team: "Our founding team combines 20+ years of experience in AI, product development, and hackathon organization. Led by former Google and Microsoft engineers with proven track records in scaling developer tools.",
      financials: "Projecting $1M ARR by year 2 with 40% gross margins. Unit economics show $15 CAC and $180 LTV. Break-even expected at 18 months with current growth trajectory.",
      funding: "Seeking $500K seed funding to accelerate product development, expand team, and scale marketing efforts. Funds will enable us to capture 10% market share within 24 months."
    };
    return templates[sectionId as keyof typeof templates] || '';
  };

  const exportPitchDeck = () => {
    toast.success('Exporting pitch deck as PDF...');
    // In a real implementation, this would generate and download a PDF
  };

  const generateDemoVideo = () => {
    toast.success('Generating demo video with AI narration...');
    // In a real implementation, this would create a video presentation
  };

  const completedSections = pitchSections.filter(s => s.isCompleted).length;
  const totalDuration = pitchSections.reduce((sum, s) => sum + s.duration, 0);
  const completionPercentage = (completedSections / pitchSections.length) * 100;

  return (
    <div className="container mx-auto py-8 px-4">
      <BoltBadge/>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <Rocket className="h-8 w-8 text-primary" />
          Startup Launch Accelerator
        </h1>
        <p className="text-muted-foreground">
          Transform your hackathon project into a fundable startup with AI-powered tools
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Progress Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pitch Progress</CardTitle>
              <CardDescription>
                {completedSections} of {pitchSections.length} sections complete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(completionPercentage)}%</span>
                </div>
                <Progress value={completionPercentage} />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Estimated Duration</p>
                <p className="text-2xl font-bold">{Math.round(totalDuration / 60)} min</p>
              </div>

              <div className="space-y-2">
                {pitchSections.map(section => (
                  <div 
                    key={section.id}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedSection === section.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedSection(section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{section.title}</span>
                      {section.isCompleted && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-xs opacity-70">{section.duration}s</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t space-y-2">
                <Button onClick={exportPitchDeck} className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Deck
                </Button>
                <Button onClick={generateDemoVideo} className="w-full">
                  <Video className="h-4 w-4 mr-2" />
                  Generate Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="pitch" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pitch">Pitch Builder</TabsTrigger>
              <TabsTrigger value="revenue">Revenue Model</TabsTrigger>
              <TabsTrigger value="metrics">Startup Metrics</TabsTrigger>
              <TabsTrigger value="funding">Funding Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="pitch" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {pitchSections.find(s => s.id === selectedSection)?.title}
                      </CardTitle>
                      <CardDescription>
                        Duration: {pitchSections.find(s => s.id === selectedSection)?.duration} seconds
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={() => generatePitchContent(selectedSection)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Generating...' : 'Generate with AI'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your pitch content or use AI generation..."
                    value={pitchSections.find(s => s.id === selectedSection)?.content || ''}
                    onChange={(e) => {
                      setPitchSections(prev =>
                        prev.map(s =>
                          s.id === selectedSection
                            ? { ...s, content: e.target.value, isCompleted: e.target.value.length > 50 }
                            : s
                        )
                      );
                    }}
                    className="min-h-32"
                  />

                  <div className="space-y-2">
                    <h4 className="font-medium">AI Tips for this section:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {pitchSections.find(s => s.id === selectedSection)?.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Mic className="h-4 w-4 mr-2" />
                      Practice Speech
                    </Button>
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Preview Slide
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Design
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Model Optimizer</CardTitle>
                  <CardDescription>
                    AI-recommended revenue models based on your project type
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {REVENUE_MODELS.map((model, index) => (
                      <div 
                        key={index}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedRevenueModel === model.type 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-muted-foreground'
                        }`}
                        onClick={() => setSelectedRevenueModel(model.type)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{model.type}</h4>
                          <Badge variant="outline">{model.confidence}% confidence</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{model.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Projected Revenue</span>
                            <span className="font-medium">${model.projectedRevenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Timeframe</span>
                            <span>{model.timeframe}</span>
                          </div>
                          <Progress value={model.confidence} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedRevenueModel && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Revenue Model Analysis</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Based on your project characteristics, the {selectedRevenueModel} model 
                        offers the best balance of scalability and market fit.
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">$15</p>
                          <p className="text-xs text-muted-foreground">Customer Acquisition Cost</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-600">$180</p>
                          <p className="text-xs text-muted-foreground">Lifetime Value</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">12:1</p>
                          <p className="text-xs text-muted-foreground">LTV:CAC Ratio</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Key Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Market Size (TAM)</label>
                      <Input
                        type="number"
                        value={startupMetrics.marketSize}
                        onChange={(e) => setStartupMetrics(prev => ({
                          ...prev,
                          marketSize: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Target Users (Year 1)</label>
                      <Input
                        type="number"
                        value={startupMetrics.targetUsers}
                        onChange={(e) => setStartupMetrics(prev => ({
                          ...prev,
                          targetUsers: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Revenue Projection (Year 2)</label>
                      <Input
                        type="number"
                        value={startupMetrics.revenueProjection}
                        onChange={(e) => setStartupMetrics(prev => ({
                          ...prev,
                          revenueProjection: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Financial Planning
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Funding Needed</label>
                      <Input
                        type="number"
                        value={startupMetrics.fundingNeeded}
                        onChange={(e) => setStartupMetrics(prev => ({
                          ...prev,
                          fundingNeeded: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Time to Market (months)</label>
                      <Input
                        type="number"
                        value={startupMetrics.timeToMarket}
                        onChange={(e) => setStartupMetrics(prev => ({
                          ...prev,
                          timeToMarket: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Competitive Advantage Score</label>
                      <div className="space-y-1">
                        <Progress value={startupMetrics.competitorAnalysis} />
                        <p className="text-xs text-muted-foreground">
                          {startupMetrics.competitorAnalysis}% - Based on AI analysis
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Projections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        ${(startupMetrics.revenueProjection / 1000).toFixed(0)}K
                      </p>
                      <p className="text-sm text-muted-foreground">Year 2 Revenue</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {startupMetrics.targetUsers.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Target Users</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        ${(startupMetrics.fundingNeeded / 1000).toFixed(0)}K
                      </p>
                      <p className="text-sm text-muted-foreground">Funding Needed</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {startupMetrics.timeToMarket}mo
                      </p>
                      <p className="text-sm text-muted-foreground">Time to Market</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="funding" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Investor Matching</CardTitle>
                    <CardDescription>
                      AI-powered investor recommendations based on your startup profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { name: 'TechStars', match: 92, focus: 'Early-stage tech startups', ticket: '$100K-$500K' },
                      { name: 'Y Combinator', match: 88, focus: 'Scalable tech companies', ticket: '$125K-$250K' },
                      { name: 'Andreessen Horowitz', match: 75, focus: 'AI/ML and developer tools', ticket: '$1M-$10M' },
                      { name: 'First Round Capital', match: 82, focus: 'B2B SaaS platforms', ticket: '$500K-$2M' }
                    ].map((investor, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{investor.name}</h4>
                          <Badge variant="outline">{investor.match}% match</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{investor.focus}</p>
                        <div className="flex justify-between text-sm">
                          <span>Typical Investment</span>
                          <span className="font-medium">{investor.ticket}</span>
                        </div>
                        <Progress value={investor.match} className="h-2 mt-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Funding Timeline</CardTitle>
                    <CardDescription>
                      Recommended funding strategy and milestones
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { stage: 'Pre-Seed', amount: '$50K', timeline: 'Month 1-3', status: 'current' },
                      { stage: 'Seed', amount: '$500K', timeline: 'Month 6-9', status: 'upcoming' },
                      { stage: 'Series A', amount: '$2M', timeline: 'Month 18-24', status: 'future' },
                      { stage: 'Series B', amount: '$8M', timeline: 'Month 36-42', status: 'future' }
                    ].map((round, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          round.status === 'current' ? 'bg-green-500' :
                          round.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium">{round.stage}</span>
                            <span className="text-sm text-muted-foreground">{round.timeline}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{round.amount}</p>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 border-t">
                      <Button className="w-full">
                        Generate Funding Roadmap
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}