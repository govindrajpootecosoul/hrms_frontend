'use client';

import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';

const EmployeePortalHome = () => {
  return (
    <div className="min-h-screen space-y-6">
      <PageHeader
        title="Employee Portal"
        description="View your profile, leaves, and payroll information in one place."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Profile</h2>
          <p className="text-sm text-neutral-700">
            Review and update your personal details and contact information.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Leaves</h2>
          <p className="text-sm text-neutral-700">
            Check your leave balance and track your leave requests.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Payroll</h2>
          <p className="text-sm text-neutral-700">
            Access your payslips and payroll history securely.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default EmployeePortalHome;


