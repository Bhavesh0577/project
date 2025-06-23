'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface SearchBarProps {
  onSearch: (interest: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [interest, setInterest] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!interest.trim()) return;
    
    setIsSearching(true);
    await onSearch(interest);
    setIsSearching(false);
  };

  // Popular search suggestions
  const suggestions = [
    'AI for healthcare',
    'Blockchain',
    'Climate tech',
    'Web3',
    'Education tech',
    'Fintech',
    'IoT',
    'AR/VR',
  ];

  return (
    <Card className="p-6 shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col space-y-2">
          <label htmlFor="interest" className="text-sm font-medium">
            What are you interested in building?
          </label>
          <div className="flex w-full space-x-2">
            <Input
              id="interest"
              placeholder="AI for healthcare, blockchain, climate tech..."
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isSearching || !interest.trim()}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-2">Popular searches:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  setInterest(suggestion);
                  onSearch(suggestion);
                }}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </form>
    </Card>
  );
} 