'use client';

import AttendanceOverview from '../components/AttendanceOverview';

export default function AttendanceOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance Overview</h1>
        <p className="text-muted-foreground">Track and manage employee attendance</p>
      </div>
      <AttendanceOverview />
    </div>
  );
}

