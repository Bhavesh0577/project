'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { RocketIcon, LightbulbIcon, NetworkIcon, UsersIcon, BarChart3Icon, MessageSquareIcon, ArrowRightIcon, CheckIcon, CodeIcon, StarIcon, HeartIcon, Globe, Brain, Target, DollarSign, Zap, Shield } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import BoltBadge from '@/components/BoltBadge';

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [statsLoaded, setStatsLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Start stats counter animation after a delay
    const timer = setTimeout(() => {
      setStatsLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // If the user is not authenticated, redirect to sign in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // With Clerk we don't need to redirect, as the SignIn component will handle this
      // The user will be able to sign in via the UI
    }
  }, [isLoaded, isSignedIn, router]);

  // Handler for generate idea button that checks authentication
  const handleGenerateIdea = (e) => {
    if (!isSignedIn) {
      e.preventDefault();
      router.push('/sign-in');
    }
  };

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-3/4 mb-6" />
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-10 w-1/3 mx-auto" />
        </div>
      </div>
    );
  }

  // Stats counter animation
  const stats = [
    { label: "Hackathons", value: "500+" },
    { label: "Ideas Generated", value: "10k+" },
    { label: "Teams Formed", value: "2,500+" },
    { label: "Success Rate", value: "94%" }
  ];

  const features = [
    {
      icon: <LightbulbIcon className="h-10 w-10" />,
      title: "Generate Ideas",
      description: "Create innovative hackathon project ideas using AI assistance.",
      link: isSignedIn ? "/generate-idea" : "/sign-in",
      cta: "Generate Now"
    },
    {
      icon: <NetworkIcon className="h-10 w-10" />,
      title: "Create Flowcharts",
      description: "Visualize your project's architecture and data flow with interactive diagrams.",
      link: isSignedIn ? "/idea" : "/sign-in",
      cta: "View Saved Ideas"
    },
    {
      icon: <Icons.search className="h-10 w-10" />,
      title: "Resource Hub",
      description: "Discover APIs, datasets, tools, and learning resources tailored to your project.",
      link: isSignedIn ? "/resources" : "/sign-in",
      cta: "Find Resources"
    },
    {
      icon: <BarChart3Icon className="h-10 w-10" />,
      title: "Analyze Projects",
      description: "Get competitive analysis of your project compared to past winners.",
      link: isSignedIn ? "/analysis" : "/sign-in",
      cta: "Analyze Project"
    },
    {
      icon: <UsersIcon className="h-10 w-10" />,
      title: "Team Formation",
      description: "Find teammates with complementary skills for your project.",
      link: isSignedIn ? "/team" : "/sign-in",
      cta: "Find Team"
    },
    {
      icon: <MessageSquareIcon className="h-10 w-10" />,
      title: "Team Chat",
      description: "Collaborate in real-time with your team members.",
      link: isSignedIn ? "/team/chat" : "/sign-in",
      cta: "Start Chatting"
    },
    {
      icon: <RocketIcon className="h-10 w-10" />,
      title: "Hackathon Finder",
      description: "Discover upcoming hackathons that match your interests.",
      link: isSignedIn ? "/finder" : "/sign-in",
      cta: "Find Hackathons"
    },
    {
      icon: <Globe className="h-10 w-10" />,
      title: "Global Collaboration",
      description: "Connect with participants worldwide in real-time with translation.",
      link: isSignedIn ? "/collaboration" : "/sign-in",
      cta: "Join Global Hub"
    },
    {
      icon: <Brain className="h-10 w-10" />,
      title: "AI Team Matching",
      description: "Intelligent team formation based on skills and collaboration patterns.",
      link: isSignedIn ? "/ai-matching" : "/sign-in",
      cta: "Smart Matching"
    },
    {
      icon: <Target className="h-10 w-10" />,
      title: "Impact Tracker",
      description: "Measure your project's sustainability and social impact with blockchain verification.",
      link: isSignedIn ? "/sustainability" : "/sign-in",
      cta: "Track Impact"
    },
    {
      icon: <DollarSign className="h-10 w-10" />,
      title: "Startup Accelerator",
      description: "Transform your hackathon project into a fundable startup with AI tools.",
      link: isSignedIn ? "/startup" : "/sign-in",
      cta: "Launch Startup"
    }
  ];

  const testimonials = [
    {
      quote: "HackFlow's AI matching helped us form the perfect team. We won our first international hackathon!",
      author: "Sarah Chen",
      role: "Software Engineer"
    },
    {
      quote: "The global collaboration features connected me with amazing developers from 5 different countries.",
      author: "Michael Rodriguez",
      role: "UI/UX Designer"
    },
    {
      quote: "From idea to funded startup in 6 months - HackFlow's accelerator tools made it possible.",
      author: "Priya Sharma",
      role: "Startup Founder"
    }
  ];
  
  // Only render the original content if authenticated
  return (
    <div className="flex min-h-screen flex-col">
      {/* Official Bolt.new Badge - Top Right */}
      <BoltBadge />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background z-0"></div>
          {/* Floating Elements */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/4 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
          <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse [animation-delay:2s]"></div>
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMxODE4MTgiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0tMTAgMGgtMlYwaDF2MzB6bTIwIDBINDRWMGgxdjMwem0tMjAgMEgyNFYwaDJ2MzB6TTEyIDMwSDEwVjBoMnYzMHptMjAgMGgtMVYwaDF2MzB6TTIyIDMwaC0xVjBoMXYzMHptMjAgMGgtMlYwaDJ2MzB6IiBmaWxsPSIjMjkyOTI5IiBmaWxsLXJ1bGU9Im5vbnplcm8iIG9wYWNpdHk9Ii4yIi8+PHBhdGggZD0iTTYwIDMwSDMwVjBoMzB2MzB6IiBmaWxsPSIjMjkyOTI5IiBmaWxsLXJ1bGU9Im5vbnplcm8iIG9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-5 dark:opacity-[0.025]"></div>

          <div className="container relative z-10 px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-8 text-center">
              <div className={`space-y-4 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-primary bg-primary/10 rounded-full backdrop-blur-sm border border-primary/20">
                  <span className="mr-1">✨</span> Next-Generation Hackathon Platform
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl dark:text-white">
                  <span className="relative">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 dark:from-primary dark:to-primary/80">HackFlow</span>
                    <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent rounded-full"></span>
                  </span>
                </h1>
                <p className="mx-auto max-w-[700px] text-xl text-muted-foreground md:text-2xl">
                  AI-powered global collaboration platform with sustainability tracking, intelligent team formation, and startup acceleration tools.
                </p>
              </div>
              <div className={`transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="h-12 px-6 text-base group relative overflow-hidden" onClick={handleGenerateIdea} asChild>
                    <Link href={isSignedIn ? "/generate-idea" : "/sign-in"}>
                      <span className="relative z-10 flex items-center">
                        Generate Your Idea
                        <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 dark:from-primary dark:to-primary/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="h-12 px-6 text-base border-primary/20 dark:border-primary/20 group relative overflow-hidden" onClick={isSignedIn ? undefined : handleGenerateIdea} asChild>
                    <Link href={isSignedIn ? "/collaboration" : "/sign-in"}>
                      <span className="relative z-10 flex items-center">
                        <Globe className="mr-2 h-4 w-4" />
                        Join Global Hub
                      </span>
                      <span className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          {/* Feature Tags */}
          <div className={`container relative z-10 mt-16 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="flex gap-4 justify-center flex-wrap">
              {["AI-Powered", "Global Collaboration", "Sustainability Tracking", "Startup Acceleration"].map((tag, i) => (
                <div 
                  key={i} 
                  className={`px-4 py-2 bg-background/40 dark:bg-muted/10 backdrop-blur-lg rounded-lg border border-muted/30 dark:border-muted/10 text-sm font-medium transform-gpu hover:scale-105 transition-transform duration-300 animate-pulse [animation-delay:${i * 200}ms]`}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-16 md:py-20 border-y border-muted/10">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div 
                  key={i} 
                  className={`text-center transition-all duration-700 ease-out ${statsLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} [transition-delay:${i * 150}ms]`}
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm md:text-base text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Complete Hackathon Ecosystem</span>
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground">
                From idea generation to startup launch - everything you need for hackathon success
              </p>
            </div>

            {/* Enhanced Features Grid */}
            <div className="mx-auto max-w-[1400px] grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {features.map((feature, i) => (
                <div 
                  key={i} 
                  className="group relative h-full transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  <Card className="h-full border border-muted/30 dark:border-muted/10 bg-background/60 backdrop-blur-sm transition-all duration-300 group-hover:border-primary/20 group-hover:shadow-lg group-hover:shadow-primary/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="pb-2">
                      <div className="mb-2 bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
                      <CardDescription className="text-sm">{feature.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto pt-4">
                      <Button className="w-full group" variant="outline" asChild>
                        <Link href={feature.link} className="flex items-center justify-center">
                          {feature.cta}
                          <ArrowRightIcon className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* New Features Highlight */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-muted/10 dark:bg-muted/5">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3">
                🚀 Latest Features
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground">
                Cutting-edge tools for the next generation of hackathon participants
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden border-2 border-primary/20">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50"></div>
                <CardHeader>
                  <Globe className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Global Collaboration</CardTitle>
                
                  <CardDescription>Real-time translation and worldwide team formation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Live translation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Voice collaboration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Timezone optimization</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-2 border-blue-500/20">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-500/50"></div>
                <CardHeader>
                  <Brain className="h-8 w-8 text-blue-500 mb-2" />
                  <CardTitle className="text-lg">AI Team Matching</CardTitle>
                  <CardDescription>Intelligent algorithms for perfect team formation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Skill analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm">GitHub integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Mentorship matching</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-2 border-green-500/20">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-500/50"></div>
                <CardHeader>
                  <Target className="h-8 w-8 text-green-500 mb-2" />
                  <CardTitle className="text-lg">Impact Tracking</CardTitle>
                  <CardDescription>Sustainability metrics with blockchain verification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm">SDG alignment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Carbon tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Blockchain verified</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-2 border-orange-500/20">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-500/50"></div>
                <CardHeader>
                  <DollarSign className="h-8 w-8 text-orange-500 mb-2" />
                  <CardTitle className="text-lg">Startup Accelerator</CardTitle>
                  <CardDescription>Transform projects into fundable startups</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Pitch generation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Investor matching</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Revenue modeling</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3">
                Loved by Hackathon Enthusiasts Worldwide
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground">
                See what our global community has to say about their experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, i) => (
                <div 
                  key={i} 
                  className="relative bg-background dark:bg-card border border-muted/20 dark:border-muted/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="mb-6 text-primary">
                    {[...Array(5)].map((_, j) => (
                      <StarIcon key={j} className="inline-block h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-foreground mb-4">"{testimonial.quote}"</blockquote>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-3">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-[900px] relative overflow-hidden rounded-2xl border border-primary/20 bg-background dark:bg-card p-8 md:p-12 shadow-xl transition-transform hover:shadow-primary/10 hover:-translate-y-1 duration-300">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent"></div>
              <div className="absolute -top-40 -right-40 h-80 w-80 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent"></div>

              <div className="relative space-y-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
                  <HeartIcon className="h-8 w-8" />
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Ready to Build the Future?
                </h2>
                <p className="text-lg text-muted-foreground md:text-xl max-w-[600px] mx-auto">
                  Join thousands of innovators using HackFlow to create impactful projects, form global teams, and launch successful startups.
                </p>
                <div className="pt-4">
                  <Button size="lg" className="h-12 px-8 text-base group relative overflow-hidden" asChild>
                    <Link href="/generate-idea">
                      <span className="relative z-10 flex items-center">
                        Start Your Journey
                        <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="w-full border-t py-8">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <RocketIcon className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">HackFlow</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Building the next generation of tools for hackathon participants and global innovators.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Core Features</h3>
              <ul className="space-y-2">
                {features.slice(0, 4).map((feature, i) => (
                  <li key={i}>
                    <Link href={feature.link} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {feature.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">New Features</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/collaboration" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Global Collaboration
                  </Link>
                </li>
                <li>
                  <Link href="/ai-matching" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    AI Team Matching
                  </Link>
                </li>
                <li>
                  <Link href="/sustainability" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Impact Tracking
                  </Link>
                </li>
                <li>
                  <Link href="/startup" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Startup Accelerator
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-muted/20 pt-6 flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} HackFlow. All rights reserved.
              </p>
              <Link 
                href="https://bolt.new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group"
              >
                <span>Built with</span>
                <span className="text-primary group-hover:animate-pulse">⚡</span>
                <span className="font-semibold">Bolt.new</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}