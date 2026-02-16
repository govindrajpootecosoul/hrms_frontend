'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPortalPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin-portal/dashboard');
  }, [router]);

  return null;
}










































