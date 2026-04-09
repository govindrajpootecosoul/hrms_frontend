'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AttendanceOverview from './components/AttendanceOverview';

export default function AttendancePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to overview by default
    router.replace('/attendance/overview');
  }, [router]);

  // Show overview while redirecting
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance Overview</h1>
        <p className="text-muted-foreground">Track and manage employee attendance</p>
      </div>
      <AttendanceOverview />
    </div>
  );
}
