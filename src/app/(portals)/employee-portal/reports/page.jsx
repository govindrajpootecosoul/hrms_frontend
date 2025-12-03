'use client';

import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';

const EmployeeReportsPage = () => {
  return (
    <div className="min-h-screen space-y-6">
      <PageHeader
        title="Reports"
        description="Access your personal reports, analytics, and insights"
      />

      <Card className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">My Reports</h2>
          <p className="text-neutral-600">Your personal reports and analytics will be displayed here.</p>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeReportsPage;

