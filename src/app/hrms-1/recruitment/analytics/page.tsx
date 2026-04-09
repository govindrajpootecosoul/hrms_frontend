'use client';

import { CandidateProvider } from '../context/CandidateContext';
import Overview from '../components/Overview';

export default function HRAnalyticsPage() {
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

