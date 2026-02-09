'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * Index page for /hrms/[companyId]/attendance/leave
 * Redirects to the Overview tab so the base Leave Management URL never 404s.
 */
export default function AttendanceLeaveIndexPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params?.companyId;

  useEffect(() => {
    if (!companyId || companyId === 'undefined') {
      // If for some reason we don't have a valid companyId, go back to HRMS dashboard
      router.replace('/hrms/dashboard');
      return;
    }

    router.replace(`/hrms/${companyId}/attendance/leave/overview`);
  }, [companyId, router]);

  // Render nothing while redirecting
  return null;
}


