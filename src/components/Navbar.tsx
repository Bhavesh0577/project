'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useUser, useClerk, SignInButton, UserButton } from '@clerk/nextjs';
import { RocketIcon, UsersIcon, SearchIcon, SparklesIcon, BarChartIcon, MessageSquareIcon, LogOutIcon, LogInIcon, UserIcon, XIcon, ChevronsLeftRightEllipsis, Globe, Brain, Target, DollarSign } from 'lucide-react';
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    if (!pathname) return false;
    return pathname === path || pathname.startsWith(path + '/');
  };

  const navItems = [
    { label: 'Generate Idea', path: '/generate-idea', icon: <SparklesIcon className="h-4 w-4" /> },
    { label: 'Saved Ideas', path: '/idea', icon: <RocketIcon className="h-4 w-4" /> },
    { label: 'Analysis', path: '/analysis', icon: <BarChartIcon className="h-4 w-4" /> },
    { label: 'Resources Hub', path: '/resources', icon: <ChevronsLeftRightEllipsis className="h-4 w-4" />},
    { label: 'Team Chat', path: '/team/chat', icon: <MessageSquareIcon className="h-4 w-4" /> },
    { label: 'Team Formation', path: '/team', icon: <UsersIcon className="h-4 w-4" /> },
    { label: 'Hackathon Finder', path: '/finder', icon: <SearchIcon className="h-4 w-4" /> },
    { label: 'Global Collab', path: '/collaboration', icon: <Globe className="h-4 w-4" /> },
    { label: 'AI Matching', path: '/ai-matching', icon: <Brain className="h-4 w-4" /> },
    { label: 'Impact Tracker', path: '/sustainability', icon: <Target className="h-4 w-4" /> },
    { label: 'Startup Launch', path: '/launchpad', icon: <DollarSign className="h-4 w-4" /> },
  ];

  const handleSignOut = () => {
    signOut();
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <RocketIcon className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold">HackFlow</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-1 text-xs font-medium transition-colors hover:text-primary px-2 py-1 rounded ${
                  isActive(item.path) ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                }`}
              >
                {item.icon}
                <span className="hidden xl:inline">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
              {/* Authentication UI */}
            {!isLoaded ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
            ) : isSignedIn ? (
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <UserButton />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/sign-out">
                      <DropdownMenuItem>
                        <LogOutIcon className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link href="/sign-in">
                <Button variant="outline" size="sm">
                  <LogInIcon className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button 
                className="p-2" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <XIcon className="h-6 w-6" />
                ) : (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 6h16M4 12h16M4 18h16" 
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t mt-3">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted text-sm ${
                    isActive(item.path) ? 'text-primary bg-primary/5' : 'text-foreground'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}