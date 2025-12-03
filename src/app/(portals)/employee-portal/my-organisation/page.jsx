'use client';

import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';

const EmployeeMyOrganisationPage = () => {
  return (
    <div className="min-h-screen space-y-6">
      <PageHeader
        title="My Organisation"
        description="View your organization structure, team members, and company information"
      />

      <Card className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Organisation Information</h2>
          <p className="text-neutral-600">Your organisation details and team structure will be displayed here.</p>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeMyOrganisationPage;

