'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

export default function QueryTrackerPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push('/query-tracker/dashboard');
      } else {
        // Redirect to main login page if not authenticated
        router.push('/login');
      }
      setChecked(true);
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading Query Tracker...</p>
        </div>
      </div>
    );
  }

  return null;
}
