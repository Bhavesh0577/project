'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function BoltBadge() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-18 right-4 z-50">
      <Link 
        href="https://bolt.new" 
        target="_blank" 
        rel="noopener noreferrer"
        className="group block"
        aria-label="Powered by Bolt.new"
      >
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 transition-all duration-300 hover:scale-110 drop-shadow-lg hover:drop-shadow-xl">
          {/* Black badge for light backgrounds */}
          <img 
            src="/bolt-logo-black.svg" 
            alt="Powered by Bolt.new" 
            className="w-full h-full dark:hidden transition-opacity duration-300 group-hover:opacity-90"
          />
          {/* White badge for dark backgrounds */}
          <img 
            src="/bolt-logo-white.svg" 
            alt="Powered by Bolt.new" 
            className="w-full h-full hidden dark:block transition-opacity duration-300 group-hover:opacity-90"
          />
          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-primary/20 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-300 animate-pulse"></div>
          
          {/* Optional tooltip on hover */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-black dark:bg-white text-white dark:text-black text-xs px-2 py-1 rounded whitespace-nowrap">
              Powered by Bolt.new
            </div>
            <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black dark:border-t-white"></div>
          </div>
        </div>
      </Link>
    </div>
  );
}
