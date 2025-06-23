'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Leaf, Target, TrendingUp, Award, Globe, Users, Zap, Recycle, Heart, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

type SDGAlignment = {
  goal: number;
  title: string;
  relevance: number;
  justification: string;
};

type SustainabilityAnalysis = {
  sdgAlignment: SDGAlignment[];
  environmentalImpact: {
    carbonFootprint: number;
    resourceEfficiency: number;
    renewableEnergy: number;
    wasteReduction: number;
    details: string;
  };
  socialImpact: {
    beneficiaries: number;
    accessibilityScore: number;
    inclusivity: number;
    communityEngagement: number;
    details: string;
  };
  economicImpact: {
    valueCreated: number;
    costSavings: number;
    jobsCreated: number;
    marketPotential: number;
    details: string;
  };
  ethicalScore: {
    aiEthics: number;
    privacy: number;
    transparency: number;
    bias: number;
    overall: number;
    details: string;
  };
  sustainabilityRating: {
    grade: string;
    score: number;
    justification: string;
  };
  metrics: Array<{
    category: string;
    metric: string;
    value: number;
    unit: string;
    trend: string;
  }>;
  recommendations: string[];
};

type GlobalSustainabilityData = {
  globalMetrics: {
    co2Levels: number;
    globalTemperatureAnomaly: number;
    renewableEnergyShare: number;
    forestCoverLoss: number;
    oceanpHLevel: number;
    biodiversityIndex: number;
  };
  sdgProgress: Array<{
    goal: number;
    title: string;
    globalProgress: number;
    trend: string;
  }>;
  techImpactMetrics: {
    digitalCarbonFootprint: number;
    aiEnergyConsumption: number;
    greenTechInvestment: number;
    sustainableTechAdoption: number;
  };
};

export default function ImpactTracker() {
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  
  const [analysisData, setAnalysisData] = useState<SustainabilityAnalysis | null>(null);
  const [globalData, setGlobalData] = useState<GlobalSustainabilityData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(true);
  
  const { user } = useUser();

  // Load global sustainability data on component mount
  useEffect(() => {
    fetchGlobalData();
  }, []);

  const fetchGlobalData = async () => {
    try {
      setIsLoadingGlobal(true);
      const response = await fetch('/api/sustainability/data?type=global');
      if (response.ok) {
        const result = await response.json();
        setGlobalData(result.data);
      } else {
        throw new Error('Failed to fetch global data');
      }
    } catch (error) {
      console.error('Error fetching global data:', error);
      toast.error('Failed to load global sustainability data');
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  const analyzeProject = async () => {
    if (!projectTitle || !projectDescription) {
      toast.error('Please provide project title and description');
      return;
    }

    setIsAnalyzing(true);
    toast.info('Analyzing project sustainability impact...');

    try {
      const response = await fetch('/api/sustainability/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectTitle,
          projectDescription,
          industry,
          features
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }

      const result = await response.json();
      setAnalysisData(result.analysis);
      toast.success('Sustainability analysis complete!');
    } catch (error) {
      console.error('Error analyzing project:', error);
      toast.error(`Analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const getSDGIcon = (goalNumber: number) => {
    const icons: Record<number, string> = {
      1: "🏠", 2: "🌾", 3: "❤️", 4: "📚", 5: "⚖️", 6: "💧", 
      7: "⚡", 8: "💼", 9: "🏭", 10: "📊", 11: "🏙️", 12: "♻️",
      13: "🌍", 14: "🐠", 15: "🌲", 16: "⚖️", 17: "🤝"
    };
    return icons[goalNumber] || "🎯";
  };

  const getSustainabilityColor = (grade: string) => {
    const colors = {
      'A': 'bg-green-500 text-white',
      'B': 'bg-blue-500 text-white', 
      'C': 'bg-yellow-500 text-black',
      'D': 'bg-orange-500 text-white',
      'F': 'bg-red-500 text-white'
    };
    return colors[grade as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving' || trend === 'positive') 
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'declining' || trend === 'negative') 
      return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
    return <div className="h-4 w-4 bg-yellow-400 rounded-full" />;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <Target className="h-8 w-8 text-green-500" />
          Real-Time Sustainability & Impact Tracker
        </h1>
        <p className="text-muted-foreground">
          AI-powered analysis of your project's environmental, social, and economic impact using real data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Context Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Global Sustainability Context
              </CardTitle>
              <CardDescription>
                Real-time global environmental and SDG data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingGlobal ? (
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                </div>
              ) : globalData ? (
                <>
                  {/* Critical Global Metrics */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Critical Planetary Indicators</h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span>CO₂ Levels</span>
                        <Badge variant="destructive">{globalData.globalMetrics.co2Levels} ppm</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                        <span>Temperature Anomaly</span>
                        <Badge variant="secondary">+{globalData.globalMetrics.globalTemperatureAnomaly}°C</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                        <span>Renewable Energy</span>
                        <Badge variant="outline">{globalData.globalMetrics.renewableEnergyShare}%</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                        <span>Biodiversity Index</span>
                        <Badge variant="secondary">{globalData.globalMetrics.biodiversityIndex}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Tech Impact Context */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Technology Impact</h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Digital Carbon Footprint</span>
                        <span>{globalData.techImpactMetrics.digitalCarbonFootprint}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Green Tech Investment</span>
                        <span>${globalData.techImpactMetrics.greenTechInvestment}T</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sustainable Tech Adoption</span>
                        <span>{globalData.techImpactMetrics.sustainableTechAdoption}%</span>
                      </div>
                    </div>
                  </div>

                  {/* SDG Progress Summary */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">SDG Progress Summary</h4>
                    <div className="space-y-2">
                      {globalData.sdgProgress.slice(0, 6).map(sdg => (
                        <div key={sdg.goal} className="flex items-center gap-2">
                          <span className="text-lg">{getSDGIcon(sdg.goal)}</span>
                          <div className="flex-1">
                            <div className="flex justify-between text-xs">
                              <span>{sdg.title}</span>
                              <span>{sdg.globalProgress}%</span>
                            </div>
                            <Progress value={sdg.globalProgress} className="h-1" />
                          </div>
                          {getTrendIcon(sdg.trend)}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Failed to load global data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analysis Panel */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="analyze" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analyze">Project Analysis</TabsTrigger>
              <TabsTrigger value="results">Impact Results</TabsTrigger>
              <TabsTrigger value="recommendations">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="analyze" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Sustainability Analysis</CardTitle>
                  <CardDescription>
                    Provide your project details for comprehensive impact assessment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Project Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter your project title"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry/Domain</Label>
                      <Input
                        id="industry"
                        placeholder="e.g., Healthcare, Education, FinTech"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Project Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project, its purpose, target users, and main functionality..."
                      className="min-h-[120px]"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="features">Key Features</Label>
                    <div className="flex gap-2">
                      <Input
                        id="features"
                        placeholder="Add a key feature"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      />
                      <Button type="button" onClick={addFeature}>Add</Button>
                    </div>
                    {features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeFeature(index)}>
                            {feature} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={analyzeProject} 
                    disabled={isAnalyzing || !projectTitle || !projectDescription}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                        Analyzing Sustainability Impact...
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Analyze Project Impact
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {!analysisData ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
                    <p className="text-muted-foreground">
                      Complete the project analysis to see detailed sustainability impact results
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Sustainability Rating */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Sustainability Rating</span>
                        <div className={`px-4 py-2 rounded-full text-2xl font-bold ${getSustainabilityColor(analysisData.sustainabilityRating.grade)}`}>
                          {analysisData.sustainabilityRating.grade}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Overall Score</span>
                            <span>{analysisData.sustainabilityRating.score}/100</span>
                          </div>
                          <Progress value={analysisData.sustainabilityRating.score} className="h-3" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {analysisData.sustainabilityRating.justification}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Impact Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {analysisData.metrics.map((metric, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{metric.category}</span>
                            {getTrendIcon(metric.trend)}
                          </div>
                          <div className="text-2xl font-bold mb-1">
                            {metric.value.toLocaleString()} <span className="text-sm font-normal">{metric.unit}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{metric.metric}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* SDG Alignment */}
                  <Card>
                    <CardHeader>
                      <CardTitle>UN SDG Alignment</CardTitle>
                      <CardDescription>
                        How your project contributes to UN Sustainable Development Goals
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysisData.sdgAlignment.map((sdg, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">{getSDGIcon(sdg.goal)}</span>
                              <div className="flex-1">
                                <h4 className="font-medium">SDG {sdg.goal}: {sdg.title}</h4>
                                <div className="flex justify-between text-sm">
                                  <span>Relevance</span>
                                  <span>{sdg.relevance}%</span>
                                </div>
                                <Progress value={sdg.relevance} className="h-2 mt-1" />
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{sdg.justification}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Impact Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Environmental Impact */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Leaf className="h-5 w-5 text-green-500" />
                          Environmental
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Carbon Impact</span>
                            <span className={analysisData.environmentalImpact.carbonFootprint < 0 ? 'text-green-600' : 'text-red-600'}>
                              {analysisData.environmentalImpact.carbonFootprint > 0 ? '+' : ''}
                              {analysisData.environmentalImpact.carbonFootprint} tons CO₂/year
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Resource Efficiency</span>
                            <span>{analysisData.environmentalImpact.resourceEfficiency}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Renewable Energy</span>
                            <span>{analysisData.environmentalImpact.renewableEnergy}%</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{analysisData.environmentalImpact.details}</p>
                      </CardContent>
                    </Card>

                    {/* Social Impact */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-500" />
                          Social
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Beneficiaries</span>
                            <span>{analysisData.socialImpact.beneficiaries.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Accessibility</span>
                            <span>{analysisData.socialImpact.accessibilityScore}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Inclusivity</span>
                            <span>{analysisData.socialImpact.inclusivity}%</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{analysisData.socialImpact.details}</p>
                      </CardContent>
                    </Card>

                    {/* Economic Impact */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-purple-500" />
                          Economic
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Value Created</span>
                            <span>${analysisData.economicImpact.valueCreated.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Cost Savings</span>
                            <span>${analysisData.economicImpact.costSavings.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Jobs Created</span>
                            <span>{analysisData.economicImpact.jobsCreated}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{analysisData.economicImpact.details}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Ethics & Innovation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-indigo-500" />
                          Ethical Assessment
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          {Object.entries(analysisData.ethicalScore).filter(([key]) => key !== 'details' && key !== 'overall').map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center">
                              <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                              <div className="flex items-center gap-2">
                                <Progress value={typeof value === 'number' ? value : 0} className="w-16 h-2" />
                                <span className="text-sm w-8">{value}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Overall Score</span>
                            <span className="text-lg font-bold">{analysisData.ethicalScore.overall}%</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{analysisData.ethicalScore.details}</p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              {!analysisData ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Recommendations Yet</h3>
                    <p className="text-muted-foreground">
                      Complete the analysis to receive personalized sustainability recommendations
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      Sustainability Action Plan
                    </CardTitle>
                    <CardDescription>
                      AI-generated recommendations to maximize your project's positive impact
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisData.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex gap-3 p-4 border rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm">{recommendation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}