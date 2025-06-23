

import { type Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import Navbar from '@/components/Navbar'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'HackFlow - AI-powered Hackathon Platform',
  description: 'Generate ideas, create flowcharts, and collaborate on hackathon projects',
}

// Check if Clerk is properly configured
const isClerkConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_your_publishable_key_here'
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const content = (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main>{children}</main>
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );

  // If Clerk is configured, wrap with ClerkProvider
  if (isClerkConfigured()) {
    return (
      <ClerkProvider>
        {content}
      </ClerkProvider>
    );
  }

  // Otherwise, show development warning and render without Clerk
  console.warn('Clerk is not configured. Running in development mode without authentication.');
  
  return content;
}