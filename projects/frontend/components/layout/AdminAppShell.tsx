'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertOctagon, AlertTriangle, Bell, CheckCircle2, ChevronDown, LogOut, Send, Sparkles, User } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { adminMenuItems } from './admin-menu';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { mockData } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

type AdminAppShellProps = {
  children: ReactNode;
  user: { name: string; role: string; email: string } | null;
  onLogout: () => void;
};

export function AdminAppShell({ children, user, onLogout }: AdminAppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [aiOpen, setAiOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [insightMeta, setInsightMeta] = useState<Array<{ label: string; value: string }>>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const filteredMenu = adminMenuItems.filter((item) => (user?.role ? item.roles.includes(user.role) : true));

  const handleNavClick = (href: string) => {
    router.push(href);
  };

  const aiRecommendations = useMemo(
    () => [
      {
        title: 'Strong engagement',
        description: 'Sarah Johnson logged 98% attendance with consistent peer kudos this quarter.',
        intent: 'Continue recognition plan',
        tone: 'positive',
      },
      {
        title: 'Expenses trending high',
        description: 'John Doe submitted ₹46,000 in travel reimbursements, 18% above his team average.',
        intent: 'Review cost controls',
        tone: 'warning',
      },
      {
        title: 'Action needed',
        description: 'Priya Sharma has 3 pending leave clarifications and an overdue insurance update.',
        intent: 'Schedule 1:1 follow-up',
        tone: 'critical',
      },
    ],
    []
  );

  const chatActions = useMemo(
    () => ['Show trends', 'Identify issues', 'Recommendations', 'Forecast'] as const,
    []
  );

  const findEmployeeByQuery = (query: string) => {
    const normalized = query.toLowerCase();
    return (
      mockData.employees.find(
        (emp) =>
          normalized.includes(emp.name.toLowerCase()) ||
          normalized.includes(emp.employeeId.toLowerCase()) ||
          normalized.includes(emp.department.toLowerCase())
      ) ?? null
    );
  };

  const formatAiAnswer = (query: string) => {
    const employee = findEmployeeByQuery(query);
    if (!employee) {
      setInsightMeta([]);
      return `I couldn't match that question to a specific employee. Try mentioning their full name or employee ID so I can search HR, finance, and attendance records.`;
    }

    const expenses =
      mockData.expensesModule.overview.recentClaims?.filter((claim) =>
        claim.employee.toLowerCase().includes(employee.name.toLowerCase())
      ) ?? [];

    const upcomingLeaves =
      mockData.dashboard.upcomingLeavesAndFestivals?.filter((item) =>
        item.name.toLowerCase().includes(employee.name.toLowerCase())
      ) ?? [];

    const recentRequests =
      mockData.employeePortal.recentRequests?.filter((req) =>
        req.details.toLowerCase().includes(employee.name.toLowerCase())
      ) ?? [];

    const meta: Array<{ label: string; value: string }> = [
      { label: 'Role', value: employee.jobTitle },
      { label: 'Department', value: employee.department },
      { label: 'Status', value: employee.status },
    ];

    if (expenses.length) {
      meta.push({ label: 'Expense claims', value: `${expenses.length} in last cycle` });
    }
    if (upcomingLeaves.length) {
      meta.push({ label: 'Upcoming leave', value: upcomingLeaves.map((leave) => leave.date).join(', ') });
    }
    if (recentRequests.length) {
      meta.push({ label: 'Support tickets', value: `${recentRequests.length} mention this employee` });
    }

    setInsightMeta(meta);

    const expenseSummary = expenses.length
      ? `• Expenses: ${expenses
          .map((claim) => `${claim.type} (${claim.amount}) on ${claim.date} – ${claim.status}`)
          .join('; ')}`
      : '• Expenses: No open claims in the recent reports.';

    const leaveSummary = upcomingLeaves.length
      ? `• Leaves: ${upcomingLeaves
          .map((leave) => `${leave.reason} on ${leave.date} (${leave.department})`)
          .join('; ')}`
      : '• Leaves: No upcoming or pending leave entries.';

    const requestSummary = recentRequests.length
      ? `• Requests & Support: ${recentRequests
          .map((req) => `${req.id} – ${req.type} (${req.status})`)
          .join('; ')}`
      : '• Requests & Support: No recent tickets referencing this employee.';

    return `Here’s what I found for ${employee.name} (${employee.employeeId}):\n• Profile: ${employee.jobTitle} in ${employee.department}, located at ${employee.location} with ${employee.tenure} tenure.\n${expenseSummary}\n${leaveSummary}\n${requestSummary}\n• Guidance: You can open the employee profile from the Employees tab for deeper analytics or trigger workflow actions from the Requests module.`;
  };

  const handleAskAI = (prompt?: string) => {
    const effectiveQuestion = (prompt ?? question).trim();
    if (!effectiveQuestion) return;
    if (prompt) {
      setQuestion(prompt);
    }
    setAiLoading(true);
    setTimeout(() => {
      const answer = formatAiAnswer(effectiveQuestion);
      setAiResponse(answer);
      setAiLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="relative overflow-hidden border-b bg-gradient-to-r from-slate-900 via-indigo-900 to-sky-900 text-white">
        <div className="absolute -left-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-6 top-6 h-20 w-20 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-sky-200">
              Vectorlytics HRMS
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Admin Console</h1>
            <p className="mt-1 text-sm text-slate-200">
              Monitor employees, attendance, recruitment, and finances from a single workspace.
            </p>
            {user && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-full bg-white/15 px-3 py-1 capitalize">Role: {user.role}</span>
                <span className="rounded-full bg-white/15 px-3 py-1">{user.email}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm">
              <User className="h-4 w-4 text-white/80" />
              <span>{user?.name ?? 'Admin User'}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={onLogout} className="bg-white/15 text-white hover:bg-white/30">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
        <nav className="bg-white/10 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-2 px-4 py-2">
            {filteredMenu.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.subMenu && item.subMenu.some((sub) => pathname?.startsWith(sub.href)));

              if (item.subMenu && item.subMenu.length > 0) {
                return (
                  <DropdownMenu key={item.href}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white/80 hover:text-white',
                          isActive ? 'bg-white/20 text-white' : ''
                        )}
                      >
                        {item.name}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 rounded-xl border border-white/20 bg-white/95 backdrop-blur">
                      {item.subMenu.map((subItem) => (
                        <DropdownMenuItem
                          key={subItem.href}
                          onSelect={() => handleNavClick(subItem.href)}
                          className={cn(
                            'flex items-center gap-2',
                            pathname === subItem.href ? 'text-primary font-semibold' : ''
                          )}
                        >
                          <subItem.icon className="h-4 w-4 text-muted-foreground" />
                          {subItem.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium text-white/80 hover:text-white',
                    isActive ? 'bg-white/20 text-white' : ''
                  )}
                  onClick={() => handleNavClick(item.href)}
                >
                  {item.name}
                </Button>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 space-y-6">{children}</main>

      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        <span className="rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-slate-900/40">
          HR Copilot
        </span>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setAiOpen(true)}
          aria-label="Ask HR Copilot"
          className="h-14 w-14 rounded-full border border-indigo-200 bg-white text-indigo-600 shadow-2xl shadow-indigo-500/40 transition hover:-translate-y-1 hover:bg-indigo-50"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      </div>

      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-w-4xl overflow-hidden p-0">
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 px-6 py-4 text-white">
            <DialogHeader className="p-0">
              <DialogTitle className="flex items-center gap-2 text-xl text-white">
                <Sparkles className="h-5 w-5 text-sky-200" />
                Ask HR Copilot
              </DialogTitle>
              <DialogDescription className="text-sm text-sky-100">
                AI-powered recommendations and conversational analysis powered by employee data.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="grid gap-0 border-b md:grid-cols-2">
            <div className="space-y-4 border-r bg-white p-6">
              <p className="text-sm font-semibold text-slate-700">Recommendations</p>
              {aiRecommendations.map((rec) => (
                <div
                  key={rec.title}
                  className={cn(
                    'rounded-2xl border p-4 shadow-sm',
                    rec.tone === 'positive' && 'border-emerald-100 bg-emerald-50/70',
                    rec.tone === 'warning' && 'border-amber-100 bg-amber-50/70',
                    rec.tone === 'critical' && 'border-rose-100 bg-rose-50/70'
                  )}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    {rec.tone === 'positive' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    {rec.tone === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                    {rec.tone === 'critical' && <AlertOctagon className="h-4 w-4 text-rose-500" />}
                    {rec.title}
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{rec.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 rounded-full border-white/70 bg-white/80 text-xs font-semibold text-slate-700 shadow-sm"
                  >
                    {rec.intent}
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-4 bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-700">Chat analysis</p>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                I’m analyzing the latest HR and finance signals. What would you like to know about this employee?
              </div>
              <div className="space-y-2">
                {chatActions.map((action) => (
                  <Button
                    key={action}
                    variant="outline"
                    className="w-full justify-start border-0 bg-amber-50/80 text-amber-900 hover:bg-amber-100"
                    onClick={() => handleAskAI(action)}
                  >
                    {action}
                  </Button>
                ))}
              </div>
              {insightMeta.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {insightMeta.map((meta) => (
                    <Badge key={meta.label} variant="secondary" className="rounded-full bg-slate-200 text-slate-800">
                      <span className="font-semibold">{meta.label}:</span>&nbsp;{meta.value}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                {aiResponse ? (
                  <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800">{aiResponse}</pre>
                ) : (
                  <p className="text-slate-500">
                    Insights will appear here – trends, risks, and guidance synthesized across leaves, attendance, expenses, and
                    insurance data.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white px-6 py-4">
            <div className="flex items-center gap-3">
              <Input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask about this employee..."
                className="rounded-2xl"
              />
              <Button onClick={() => handleAskAI()} disabled={aiLoading} className="rounded-2xl px-5">
                {aiLoading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                    Thinking
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Ask
                  </>
                )}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Mention the employee name or ID for precise answers across HR, payroll, and attendance sources.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

