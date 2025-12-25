'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExpensesIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/expenses/overview');
  }, [router]);

  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-muted-foreground">Redirecting to Expense Overview...</p>
    </div>
  );
}


