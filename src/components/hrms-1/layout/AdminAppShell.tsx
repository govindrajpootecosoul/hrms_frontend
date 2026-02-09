'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/hrms-1/ui/button';
import { AlertOctagon, AlertTriangle, Bell, CheckCircle2, ChevronDown, LogOut, Send, Sparkles, User, Home } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/hrms-1/ui/dropdown-menu';
import { adminMenuItems } from './admin-menu';
import { cn } from '@/lib/hrms-1/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/hrms-1/ui/dialog';
import { Input } from '@/components/hrms-1/ui/input';
import { mockData } from '@/lib/hrms-1/api';
import { Badge } from '@/components/hrms-1/ui/badge';

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
  
  const [activeTab, setActiveTab] = useState<string>('/dashboard');

  const filteredMenu = adminMenuItems.filter((item) => (user?.role ? item.roles.includes(user.role) : true));

  // Initialize active tab based on pathname on mount
  useEffect(() => {
    if (pathname === '/dashboard' || pathname.startsWith('/dashboard')) {
      setActiveTab('/dashboard');
      return;
    }
    // Check if pathname matches any menu item
    const matchedItem = adminMenuItems.find(
      (item) => pathname === item.href || pathname.startsWith(item.href + '/')
    );
    if (matchedItem) {
      // Check if it's a submenu item
      const subItem = matchedItem.subMenu?.find((sub) => pathname === sub.href || pathname.startsWith(sub.href + '/'));
      setActiveTab(subItem ? subItem.href : matchedItem.href);
    } else {
      setActiveTab('/dashboard');
    }
  }, [pathname]);

  const handleNavClick = (href: string) => {
    // For now, just set the active tab without navigating
    setActiveTab(href);
  };
  
  const getActiveTabName = () => {
    // Check main menu items
    const mainItem = filteredMenu.find(item => item.href === activeTab);
    if (mainItem) return mainItem.name;
    
    // Check submenu items
    for (const item of filteredMenu) {
      if (item.subMenu) {
        const subItem = item.subMenu.find(sub => sub.href === activeTab);
        if (subItem) return subItem.name;
      }
    }
    
    return 'Page';
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
      <header className="relative overflow-hidden border-b bg-gradient-to-r from-slate-900 via-indigo-900 to-sky-900 text-white shadow-lg">
        <div className="absolute -left-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-6 top-6 h-20 w-20 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5" />
        <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-sky-300 font-semibold">
              VECTORLYTICS HRMS
            </p>
            <h1 className="mt-2 text-4xl lg:text-5xl font-bold text-white leading-tight">Admin Console</h1>
            <p className="mt-3 text-sm text-slate-200 leading-relaxed">
              Monitor employees, attendance, recruitment, and finances from a single workspace.
            </p>
            {user && (
              <div className="mt-4 flex flex-wrap gap-2.5">
                <span className="rounded-full bg-slate-800/70 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm border border-white/10">
                  Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <span className="rounded-full bg-slate-800/70 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm border border-white/10">
                  {user.email}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:mt-0">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-white/10 rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-blue-500/20 text-white hover:bg-blue-500/30 border border-blue-400/30 rounded-full px-4 py-2 text-sm font-medium backdrop-blur-sm"
            >
              <User className="mr-2 h-4 w-4" />
              Admin User
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={onLogout} 
              className="bg-blue-500/20 text-white hover:bg-blue-500/30 border border-blue-400/30 rounded-full px-4 py-2 text-sm font-medium backdrop-blur-sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
        <nav className="bg-white/10 backdrop-blur border-t border-white/5">
          <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-0.5 px-6 py-3">
            {filteredMenu.map((item) => {
              const isActive = activeTab === item.href ||
                (item.subMenu && item.subMenu.some((sub) => activeTab === sub.href));

              if (item.subMenu && item.subMenu.length > 0) {
                return (
                  <DropdownMenu key={item.href}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          'rounded-md px-4 py-2.5 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200',
                          isActive ? 'bg-slate-800/60 text-white shadow-sm backdrop-blur-sm' : ''
                        )}
                      >
                        {item.name}
                        <ChevronDown className="h-3.5 w-3.5 ml-1 inline" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 rounded-xl border border-white/20 bg-white/95 backdrop-blur shadow-lg">
                      {item.subMenu.map((subItem) => (
                        <DropdownMenuItem
                          key={subItem.href}
                          onSelect={() => handleNavClick(subItem.href)}
                          className={cn(
                            'flex items-center gap-2 cursor-pointer',
                            activeTab === subItem.href ? 'text-primary font-semibold bg-primary/10' : ''
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
                    'rounded-md px-4 py-2.5 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200',
                    isActive ? 'bg-slate-800/60 text-white shadow-sm backdrop-blur-sm' : ''
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

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 space-y-6">
        {activeTab === '/dashboard' ? (
          children
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">{getActiveTabName()}</h2>
              <p className="text-xl text-slate-600">Incoming</p>
              <p className="text-sm text-slate-500 mt-4">This section is coming soon. Design will be provided shortly.</p>
            </div>
          </div>
        )}
      </main>

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

