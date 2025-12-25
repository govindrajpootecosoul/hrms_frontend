'use client';

import { useState } from 'react';
import { addDays, format } from 'date-fns';
import { mockData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ClipboardSignature, Receipt, Headphones, Calendar as CalendarIcon } from 'lucide-react';

const expenseTemplates = [
  { id: 'meal', label: 'Meal', amount: '₹750', hint: 'Dinner with client' },
  { id: 'travel', label: 'Travel', amount: '₹1,800', hint: 'City commute' },
  { id: 'supplies', label: 'Supplies', amount: '₹600', hint: 'Desk accessories' },
];

const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Work From Home', 'Compensatory Off', 'LOP'];

export default function EmployeeRequestsPage() {
  const [activeTab, setActiveTab] = useState('leave');
  const [leaveType, setLeaveType] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(),
    to: addDays(new Date(), 1),
  });
  const requests = mockData.employeePortal.recentRequests;
  const leaveBalances = mockData.employeePortal.leaveBalances;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Self service</p>
        <h1 className="text-2xl font-semibold">Create or track requests</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="leave">Leaves</TabsTrigger>
          <TabsTrigger value="expense">Expense</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="leave">
          <Card className="border-none bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 shadow-lg shadow-rose-100/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-rose-900">Leave request</CardTitle>
                <CardDescription>Send time-off notifications and capture approvals</CardDescription>
              </div>
              <Badge variant="secondary" className="flex items-center gap-2">
                <ClipboardSignature className="h-4 w-4" /> Balance: 12 days
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="leave-type">Leave type</Label>
                  <Select value={leaveType} onValueChange={(value) => setLeaveType(value)}>
                    <SelectTrigger id="leave-type">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAVE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from && dateRange.to
                          ? `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
                          : 'Select range'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => setDateRange(range ?? { from: undefined, to: undefined })}
                        numberOfMonths={2}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea placeholder="Add context that helps approvals" rows={4} />
                </div>
                <Button className="w-full">Submit for approval</Button>
                <div className="rounded-xl border border-rose-200/50 bg-white/90 p-4 text-sm text-rose-900/80 space-y-2 shadow-sm">
                  <p className="font-semibold text-rose-900">Auto-routing</p>
                  <ul className="list-disc space-y-1 pl-4">
                    <li>Manager approval within 24h</li>
                    <li>HR gets notified on approved leaves</li>
                    <li>Calendar updates once approval is final</li>
                  </ul>
                </div>
              </div>
              <div className="rounded-xl border border-rose-200/50 bg-white/90 p-4 text-sm text-rose-900/80 space-y-4 shadow-sm">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Leave balance by type
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {leaveBalances.map((balance) => (
                      <div key={balance.type} className="rounded-lg border bg-white px-3 py-2">
                        <p className="text-xs text-muted-foreground">{balance.type}</p>
                        <p className="text-base font-semibold">{balance.balance} days</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-dashed bg-white p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                    <span>Comp Off credit request</span>
                    <Badge variant="outline">Current: {leaveBalances.find(lb => lb.type === 'Compensatory Off')?.balance ?? 0} day(s)</Badge>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <Input type="date" placeholder="Worked date" />
                    <Textarea rows={2} placeholder="Explain why you earned the comp off" />
                    <Button variant="outline" className="w-full">
                      Send for HR approval
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Once HR approves, Comp Off balance auto-increments and becomes available for future leave requests.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense">
          <Card className="border-none bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 shadow-lg shadow-emerald-100/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-slate-900">File reimbursement</CardTitle>
                <CardDescription>Upload bills and share quick context</CardDescription>
              </div>
              <Badge variant="outline" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" /> Avg. payout 4 days
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="expense-category">Category</Label>
                  <Input id="expense-category" placeholder="Travel / Meals / Internet" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input placeholder="₹0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea placeholder="Add purpose or client details" rows={4} />
                </div>
                <Button className="w-full">Upload receipt & submit</Button>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">Templates</p>
                <div className="grid gap-2">
                  {expenseTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                      <div>
                        <p className="font-semibold">{template.label}</p>
                        <p className="text-xs text-muted-foreground">{template.hint}</p>
                      </div>
                      <Badge variant="outline">{template.amount}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card className="border-none bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-lg shadow-blue-200/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-slate-900">Ask for help</CardTitle>
                <CardDescription>Raise IT, payroll or HR support tickets</CardDescription>
              </div>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Headphones className="h-4 w-4" /> Avg. SLA 12h
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Topic</Label>
                  <Input placeholder="Hardware / Payroll / HR policy" />
                </div>
                <div className="space-y-2">
                  <Label>Describe the issue</Label>
                  <Textarea placeholder="Give the team enough context to resolve faster" rows={5} />
                </div>
                <Button className="w-full">Create ticket</Button>
              </div>
              <div className="rounded-lg border border-blue-200/50 bg-white/90 p-4 text-sm text-slate-700 space-y-2 shadow-sm">
                <p className="font-semibold text-slate-900">Recent tickets</p>
                {requests.slice(0, 3).map((req) => (
                  <div key={req.id} className="flex items-center justify-between rounded border bg-white p-2">
                    <div>
                      <p className="font-semibold text-slate-900">{req.id}</p>
                      <p className="text-xs text-muted-foreground">{req.details}</p>
                    </div>
                    <Badge variant="outline">{req.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

