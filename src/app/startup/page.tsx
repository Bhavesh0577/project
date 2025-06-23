'use client';

import LaunchAccelerator from '@/components/startup/LaunchAccelerator';
import WithAuth from '@/components/auth/WithAuth';

export default function StartupPage() {
  return (
    <WithAuth>
      <LaunchAccelerator />
    </WithAuth>
  );
}