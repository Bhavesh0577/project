'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useUser, useClerk, SignInButton, UserButton } from '@clerk/nextjs';
import { RocketIcon, UsersIcon, SearchIcon, SparklesIcon, BarChartIcon, MessageSquareIcon, LogOutIcon, LogInIcon, UserIcon, XIcon, ChevronsLeftRightEllipsis, Globe, Brain, Target, DollarSign } from 'lucide-react';
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  // Primary navigation items (always visible)
  const primaryNavItems = [
    { label: 'Generate', path: '/generate-idea', icon: <SparklesIcon className="h-4 w-4" /> },
    { label: 'Ideas', path: '/idea', icon: <RocketIcon className="h-4 w-4" /> },
    { label: 'Teams', path: '/team', icon: <UsersIcon className="h-4 w-4" /> },
    { label: 'Finder', path: '/finder', icon: <SearchIcon className="h-4 w-4" /> },
  ];

  // Secondary navigation items (in dropdown on desktop)
  const secondaryNavItems = [
    { label: 'Analysis', path: '/analysis', icon: <BarChartIcon className="h-4 w-4" /> },
    { label: 'Resources Hub', path: '/resources', icon: <ChevronsLeftRightEllipsis className="h-4 w-4" />},
    { label: 'Team Chat', path: '/team/chat', icon: <MessageSquareIcon className="h-4 w-4" /> },
    { label: 'Global Collab', path: '/collaboration', icon: <Globe className="h-4 w-4" /> },
    { label: 'AI Matching', path: '/ai-matching', icon: <Brain className="h-4 w-4" /> },
    { label: 'Impact Tracker', path: '/sustainability', icon: <Target className="h-4 w-4" /> },
    { label: 'Startup Launch', path: '/launchpad', icon: <DollarSign className="h-4 w-4" /> },
  ];

  // All nav items for mobile
  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  const handleSignOut = () => {
    signOut();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="w-full max-w-none px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-all duration-300 group">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-300">
                <RocketIcon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent tracking-tight">
                Hackonnect
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-0.5 flex-1 justify-center max-w-2xl mx-4">
            {/* Primary Navigation Items */}
            {primaryNavItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`group flex items-center gap-2 text-sm font-medium transition-all duration-300 px-3 py-2 rounded-lg hover:bg-muted/70 hover:shadow-sm relative overflow-hidden ${
                  isActive(item.path) 
                    ? 'text-primary bg-primary/10 shadow-md border border-primary/20 hover:bg-primary/15' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className={`transition-all duration-300 group-hover:scale-110 ${
                  isActive(item.path) ? 'text-primary' : 'group-hover:text-primary'
                }`}>
                  {item.icon}
                </span>
                <span className="whitespace-nowrap">{item.label}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              </Link>
            ))}
            
            {/* More Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-muted/70 transition-all duration-300 rounded-lg px-3 py-2">
                  <ChevronsLeftRightEllipsis className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>More Tools</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {secondaryNavItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <DropdownMenuItem className={`cursor-pointer hover:bg-muted/70 transition-colors ${
                      isActive(item.path) ? 'bg-primary/10 text-primary' : ''
                    }`}>
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <ThemeToggle />
              {/* Authentication UI */}
            {!isLoaded ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
            ) : isSignedIn ? (
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover:bg-muted/70 transition-all duration-300 rounded-lg p-1">
                      <UserButton />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-center">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/sign-out">
                      <DropdownMenuItem className="cursor-pointer hover:bg-muted/70 transition-colors">
                        <LogOutIcon className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link href="/sign-in">
                <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-lg border-primary/30 hover:border-primary hover:shadow-lg hover:shadow-primary/25 text-xs px-3">
                  <LogInIcon className="mr-1 h-3 w-3" />
                  Sign In
                </Button>
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <motion.button 
                className="p-2 hover:bg-muted/70 rounded-lg transition-all duration-300" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                <motion.div
                  animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {mobileMenuOpen ? (
                    <XIcon className="h-5 w-5" />
                  ) : (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
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
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className="lg:hidden py-3 border-t mt-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {allNavItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link 
                      href={item.path}
                      className={`flex items-center gap-3 p-3 rounded-xl hover:bg-muted/70 text-sm transition-all duration-300 group relative overflow-hidden ${
                        isActive(item.path) 
                          ? 'text-primary bg-primary/10 border border-primary/20 shadow-sm' 
                          : 'text-foreground hover:text-primary'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className={`transition-all duration-300 group-hover:scale-110 ${
                        isActive(item.path) ? 'text-primary' : 'group-hover:text-primary'
                      }`}>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                      {/* Mobile hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}