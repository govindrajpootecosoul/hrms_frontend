'use client';

import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';

const EmployeeRequestsPage = () => {
  return (
    <div className="min-h-screen space-y-6">
      <PageHeader
        title="Requests"
        description="Manage your leave requests, time-off, and other employee requests"
      />

      <Card className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">My Requests</h2>
          <p className="text-neutral-600">Your leave and time-off requests will be displayed here.</p>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeRequestsPage;

