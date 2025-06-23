'use client';

import { SignIn } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect_url') || '/';
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center">
          <Link href="/" className="text-sm flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
        
        <div className="bg-card border rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
          <SignIn 
            path="/sign-in" 
            routing="path" 
            signUpUrl="/sign-up"
            redirectUrl={redirectUrl}
          />
        </div>
      </div>
    </div>
  );
}
