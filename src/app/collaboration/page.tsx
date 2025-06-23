'use client';

import GlobalCollabHub from '@/components/collaboration/GlobalCollabHub';
import WithAuth from '@/components/auth/WithAuth';

export default function CollaborationPage() {
  return (
    <WithAuth>
      <GlobalCollabHub />
    </WithAuth>
  );
}