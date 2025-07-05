'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InsightsDashboardRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/discover');
  }, [router]);
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Redirecting to Discover page...</p>
    </div>
  );
} 