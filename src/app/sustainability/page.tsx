'use client';

import ImpactTracker from '@/components/sustainability/ImpactTracker';
import WithAuth from '@/components/auth/WithAuth';

export default function SustainabilityPage() {
  return (
    <WithAuth>
      <ImpactTracker />
    </WithAuth>
  );
}