'use client';

import Card from '@/components/common/Card';

const AttendanceManagePage = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">
          Manage Attendance
        </h1>
        <p className="text-lg text-slate-600">
          Manage and configure attendance settings
        </p>
      </div>

      <Card className="border-2 p-6">
        <p className="text-slate-600">Attendance management features coming soon...</p>
      </Card>
    </div>
  );
};

export default AttendanceManagePage;

