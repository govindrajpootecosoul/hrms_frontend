'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Clock, CreditCard } from 'lucide-react';

const reportOptions = [
  {
    id: 'attendance',
    title: 'Attendance history',
    description: 'Daily presence, late marks, WFH logs.',
    icon: Clock,
    formats: ['CSV', 'PDF'],
  },
  {
    id: 'expenses',
    title: 'Expense submissions',
    description: 'All non-advance and advance-based claims.',
    icon: CreditCard,
    formats: ['CSV', 'XLSX'],
  },
  {
    id: 'requests',
    title: 'Leave & request log',
    description: 'Leaves, WFH, and support tickets filed.',
    icon: ClipboardList,
    formats: ['CSV'],
  },
];

export default function EmployeeReportsPage() {
  return (
    <div className="space-y-6">
      <Card className="border-none bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 shadow-lg shadow-violet-100/60">
        <CardHeader>
          <CardTitle className="text-violet-900">Download my reports</CardTitle>
          <CardDescription>
            Export personalised data for payroll queries, audits, or compliance needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {reportOptions.map((report) => {
            const Icon = report.icon;
            return (
              <div key={report.id} className="rounded-xl border border-violet-200/70 bg-white/95 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="rounded-full bg-slate-100 p-2 text-slate-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <Badge variant="outline">{report.formats.join(' / ')}</Badge>
                </div>
                <div>
                  <p className="font-semibold">{report.title}</p>
                  <p className="text-xs text-muted-foreground">{report.description}</p>
                </div>
                <div className="flex gap-2">
                  {report.formats.map((format) => (
                    <Button key={format} variant="outline" className="flex-1 text-xs">
                      Download {format}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-none bg-gradient-to-br from-amber-50 to-orange-100/60 shadow-lg shadow-amber-100/70">
        <CardHeader>
          <CardTitle className="text-amber-900">Need something else?</CardTitle>
          <CardDescription>
            For custom exports or corrections, contact HR/Finance with the reference IDs above.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-amber-900/80">
          Report generation is instant for the past 12 months. Older data will be delivered to your inbox within
          one business day.
        </CardContent>
      </Card>
    </div>
  );
}

