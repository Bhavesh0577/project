'use client';

import IntelligentMatching from '@/components/ai/IntelligentMatching';
import WithAuth from '@/components/auth/WithAuth';

export default function AIMatchingPage() {
  return (
    <WithAuth>
      <IntelligentMatching />
    </WithAuth>
  );
}