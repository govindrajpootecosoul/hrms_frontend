'use client';

import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';

export default function PayrollPage() {
  return (
    <div className="min-h-screen space-y-8">
      <PageHeader
        title="Payroll"
        description="Manage payroll for your employees"
      />

      <Card className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Coming Soon</h2>
          <p className="text-neutral-600">We're building an awesome payroll experience.</p>
        </div>
      </Card>
    </div>
  );
}


