'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CandidateProvider } from './context/CandidateContext';
import Overview from './components/Overview';

export default function RecruitmentPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to analytics by default
    router.replace('/recruitment/analytics');
  }, [router]);

  // Show overview while redirecting
  return (
    <CandidateProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">HR Analytics</h1>
          <p className="text-muted-foreground">Comprehensive recruitment analytics and insights</p>
        </div>
        <Overview />
      </div>
    </CandidateProvider>
  );
}
