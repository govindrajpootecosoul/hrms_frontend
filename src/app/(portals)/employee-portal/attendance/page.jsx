'use client';

import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';

const EmployeeAttendancePage = () => {
  return (
    <div className="min-h-screen space-y-6">
      <PageHeader
        title="Attendance"
        description="View your attendance records and check-in/check-out history"
      />

      <Card className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Attendance Records</h2>
          <p className="text-neutral-600">Your attendance data will be displayed here.</p>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeAttendancePage;

