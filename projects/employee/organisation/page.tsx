'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { mockData } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function EmployeeOrganisationPage() {
  const { user } = useAuth();

  const myDepartment = useMemo(() => {
    if (!user?.employeeId) return null;
    const employee = mockData.employees.find((emp) => emp.employeeId === user.employeeId);
    if (!employee) return null;
    return mockData.orgChart.departments.find((dept) =>
      dept.name.toLowerCase().includes(employee.department.toLowerCase())
    );
  }, [user]);

  const otherDepartments = mockData.orgChart.departments.filter(
    (dept) => dept.id !== myDepartment?.id
  );
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  const toggleDepartment = (id: string) => {
    setExpandedDept((prev) => (prev === id ? null : id));
  };

  const renderTree = (dept: any) => (
    <div className="mt-3 space-y-3 rounded-lg bg-white/70 p-4 text-sm shadow-inner">
      <div className="rounded-lg bg-gradient-to-r from-sky-50 to-indigo-50 p-3">
        <p className="text-xs uppercase text-slate-500">CXO</p>
        <p className="font-semibold text-slate-900">{dept.cxo?.name}</p>
        <p className="text-xs text-slate-600">{dept.cxo?.title}</p>
      </div>
      <div>
        <p className="text-xs uppercase text-slate-500">Directors</p>
        <div className="mt-1 grid gap-2 md:grid-cols-2">
          {dept.directors?.map((leader: any) => (
            <div key={leader.name} className="rounded-md border border-indigo-100 bg-indigo-50/70 p-2">
              <p className="font-medium text-indigo-900">{leader.name}</p>
              <p className="text-xs text-indigo-700">{leader.title}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs uppercase text-slate-500">Senior Managers</p>
        <div className="mt-1 grid gap-2 md:grid-cols-2">
          {dept.seniorManagers?.map((leader: any) => (
            <div key={leader.name} className="rounded-md border border-purple-100 bg-purple-50/70 p-2">
              <p className="font-medium text-purple-900">{leader.name}</p>
              <p className="text-xs text-purple-700">{leader.title}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs uppercase text-slate-500">Managers / Leads</p>
        <div className="mt-1 grid gap-2 md:grid-cols-2">
          {dept.managers?.map((leader: any) => (
            <div key={leader.name} className="rounded-md border border-emerald-100 bg-emerald-50/70 p-2">
              <p className="font-medium text-emerald-900">{leader.name}</p>
              <p className="text-xs text-emerald-700">{leader.title}</p>
            </div>
          ))}
        </div>
        {dept.leads && (
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            {dept.leads.map((leader: any) => (
              <div key={leader.name} className="rounded-md border border-dashed border-slate-300 bg-slate-50/80 p-2 text-xs text-slate-600">
                <p className="font-medium text-slate-800">{leader.name}</p>
                <p>{leader.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="border-none bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 shadow-lg shadow-indigo-100/60">
        <CardHeader>
          <CardTitle className="text-indigo-900">My department hierarchy</CardTitle>
          <CardDescription>
            Snapshot of your business unit before exploring the full organisational tree.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {myDepartment ? (
            <>
              <div>
                <p className="text-sm text-muted-foreground">{myDepartment.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-white">
                    Headcount: {myDepartment.headcount}
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    CXO: {myDepartment.cxo?.name}
                  </Badge>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Directors</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {myDepartment.directors?.map((leader) => (
                      <li key={leader.name} className="rounded-md border border-indigo-100 bg-white/90 p-2">
                        <p className="font-semibold">{leader.name}</p>
                        <p className="text-xs text-muted-foreground">{leader.title}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Senior managers</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {myDepartment.seniorManagers?.map((leader) => (
                      <li key={leader.name} className="rounded-md border border-indigo-100 bg-white/90 p-2">
                        <p className="font-semibold">{leader.name}</p>
                        <p className="text-xs text-muted-foreground">{leader.title}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Managers & leads</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {myDepartment.managers?.map((leader) => (
                      <li key={leader.name} className="rounded-md border border-indigo-100 bg-white/90 p-2">
                        <p className="font-semibold">{leader.name}</p>
                        <p className="text-xs text-muted-foreground">{leader.title}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              We couldn’t find your department. Contact HR to map your profile to the org chart.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-none bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 shadow-lg shadow-slate-200/60">
        <CardHeader>
          <CardTitle className="text-slate-900">Complete organisation hierarchy</CardTitle>
          <CardDescription>
            Browse any department or jump to the org chart page for a detailed tree.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[myDepartment, ...otherDepartments].filter(Boolean).map((dept) => (
            <div key={dept?.id} className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
              <button
                className="flex w-full items-center justify-between text-left"
                onClick={() => dept && toggleDepartment(dept.id)}
              >
                <div>
                  <p className="font-semibold">{dept?.name}</p>
                  <p className="text-xs text-muted-foreground">{dept?.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{dept?.headcount} members</Badge>
                  {expandedDept === dept?.id ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>
              {dept && expandedDept === dept.id && renderTree(dept)}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

