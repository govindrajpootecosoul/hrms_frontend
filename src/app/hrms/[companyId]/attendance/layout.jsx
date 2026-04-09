'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AttendanceLayout({ children }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const companyId = params.companyId;

  // Redirect to overview if on base attendance path
  useEffect(() => {
    if (pathname === `/hrms/${companyId}/attendance` || pathname === `/hrms/undefined/attendance`) {
      router.replace(`/hrms/${companyId}/attendance/overview`);
    }
  }, [pathname, companyId, router]);

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}

