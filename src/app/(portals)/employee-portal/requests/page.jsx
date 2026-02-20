'use client';

import { useEffect, useState } from 'react';
import { addDays, format } from 'date-fns';
import { mockData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ClipboardSignature, Receipt, Headphones, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils/constants';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/components/common/Toast';

const expenseTemplates = [
  { id: 'meal', label: 'Meal', amount: '₹750', hint: 'Dinner with client' },
  { id: 'travel', label: 'Travel', amount: '₹1,800', hint: 'City commute' },
  { id: 'supplies', label: 'Supplies', amount: '₹600', hint: 'Desk accessories' },
];

const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Work From Home', 'Compensatory Off', 'LOP'];

export default function EmployeeRequestsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('leave');
  const [leaveType, setLeaveType] = useState(undefined);
  const [dateRange, setDateRange] = useState({ from: new Date(), to: addDays(new Date(), 1) });
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestsData, setRequestsData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loadingLeaveRequests, setLoadingLeaveRequests] = useState(false);
  const requests = requestsData?.recentRequests || mockData.employeePortal.recentRequests;
  const leaveBalances = requestsData?.leaveBalances || mockData.employeePortal.leaveBalances;

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      try {
        setLoadingData(true);
        const token = localStorage.getItem('auth_token');
        const res = await fetch(
          `${API_BASE_URL}/employee-portal/requests?employeeId=${encodeURIComponent(user.employeeId || 'default')}`,
          { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } }
        );
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.data) {
            setRequestsData(json.data);
          }
        }
      } catch (err) {
        console.error('Requests fetch failed', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchRequests();
  }, [user]);

  // Fetch leave requests
  const fetchLeaveRequests = async () => {
    if (!user?.employeeId) return;
    try {
      setLoadingLeaveRequests(true);
      const token = localStorage.getItem('auth_token');
      const company = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null;
      
      const params = new URLSearchParams();
      params.append('employeeId', user.employeeId);
      if (company) {
        params.append('company', company);
      }

      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      if (company) {
        headers['x-company'] = company;
      }

      console.log('[Employee Portal] Fetching leave requests for:', user.employeeId, 'company:', company);

      // Use Next.js API proxy route
      const res = await fetch(
        `/api/employee-portal/attendance-requests?${params.toString()}`,
        { headers }
      );
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.data) {
          // Filter only time-off requests and sort by submittedAt
          const timeOffRequests = (json.data.requests || [])
            .filter(req => req.type === 'time-off')
            .sort((a, b) => {
              const dateA = new Date(a.submittedAt || 0);
              const dateB = new Date(b.submittedAt || 0);
              return dateB - dateA; // Most recent first
            });
          console.log('[Employee Portal] Fetched leave requests:', timeOffRequests.length, timeOffRequests);
          setLeaveRequests(timeOffRequests);
        }
      } else {
        console.error('[Employee Portal] Failed to fetch leave requests:', res.status, res.statusText);
      }
    } catch (err) {
      console.error('[Employee Portal] Leave requests fetch failed', err);
    } finally {
      setLoadingLeaveRequests(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [user]);

  // Refresh leave requests periodically (every 30 seconds) to get latest status
  useEffect(() => {
    if (!user?.employeeId) return;
    
    const interval = setInterval(() => {
      fetchLeaveRequests();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const handleLeaveSubmit = async () => {
    // Validation
    if (!leaveType) {
      toast.error('Please select a leave type');
      return;
    }

    if (!dateRange.from || !dateRange.to) {
      toast.error('Please select a date range');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for your leave request');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      const company = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null;

      const requestData = {
        employeeId: user?.employeeId || 'default',
        type: 'time-off',
        leaveType: leaveType,
        dateRange: `${format(dateRange.from, 'yyyy-MM-dd')} to ${format(dateRange.to, 'yyyy-MM-dd')}`,
        reason: reason.trim()
      };

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      if (company) {
        headers['x-company'] = company;
      }

      const res = await fetch('/api/employee-portal/attendance-request', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData)
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success('Leave request submitted successfully! Your manager will be notified.');
        
        // Reset form
        setLeaveType(undefined);
        setDateRange({ from: new Date(), to: addDays(new Date(), 1) });
        setReason('');
        
        // Refresh leave requests list
        await fetchLeaveRequests();
      } else {
        toast.error(json.error || 'Failed to submit leave request. Please try again.');
      }
    } catch (err) {
      console.error('Submit leave request error:', err);
      toast.error('An error occurred while submitting your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
          <Card className="border border-slate-200 bg-white shadow-lg">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-slate-900 text-2xl font-bold mb-1">Leave request</CardTitle>
                <CardDescription className="text-sm text-slate-600">Send time-off notifications and capture approvals</CardDescription>
              </div>
              <Badge variant="secondary" className="flex items-center gap-2 flex-shrink-0 bg-slate-100 text-slate-700">
                <ClipboardSignature className="h-4 w-4" /> Balance: 12 days
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="leave-type" className="text-sm font-medium text-slate-700">Leave type</Label>
                  <Select value={leaveType} onValueChange={(value) => setLeaveType(value)}>
                    <SelectTrigger id="leave-type" className="w-full h-10 bg-white">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      {LEAVE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-range" className="text-sm font-medium text-slate-700">Date range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        id="date-range"
                        variant="outline" 
                        className="w-full justify-start text-left font-normal h-10 overflow-hidden"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate text-sm">
                          {dateRange.from && dateRange.to
                            ? `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
                            : 'Select range'}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white border-slate-200 z-[100]" align="start">
                      <div className="bg-white">
                        <Calendar
                          mode="range"
                          selected={dateRange}
                          onSelect={(range) => setDateRange(range ?? { from: undefined, to: undefined })}
                          numberOfMonths={2}
                          initialFocus
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-sm font-medium text-slate-700">Reason</Label>
                  <Textarea 
                    id="reason"
                    placeholder="Add context that helps approvals" 
                    rows={4}
                    className="resize-none min-h-[100px]"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full h-10" 
                  onClick={handleLeaveSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit for approval'}
                </Button>
                <div className="rounded-xl border border-slate-200 bg-transparent p-4 text-sm text-slate-700 space-y-2">
                  <p className="font-semibold text-slate-900">Auto-routing</p>
                  <ul className="list-disc space-y-1 pl-4">
                    <li>Manager approval within 24h</li>
                    <li>HR gets notified on approved leaves</li>
                    <li>Calendar updates once approval is final</li>
                  </ul>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-transparent p-4 text-sm text-slate-700 space-y-4">
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
                    <Badge variant="outline">
                      Current: {leaveBalances.find((lb) => lb.type === 'Compensatory Off')?.balance ?? 0} day(s)
                    </Badge>
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

          {/* Leave Requests List */}
          <Card className="border border-slate-200 bg-white shadow-lg mt-6">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-slate-900 text-xl font-bold">My Leave Requests</CardTitle>
                <CardDescription className="text-sm text-slate-600">View all your submitted leave requests and their status</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLeaveRequests}
                disabled={loadingLeaveRequests}
                className="flex-shrink-0 flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loadingLeaveRequests ? 'animate-spin' : ''}`} />
                {loadingLeaveRequests ? 'Refreshing...' : 'Refresh'}
              </Button>
            </CardHeader>
            <CardContent>
              {loadingLeaveRequests ? (
                <div className="text-center py-8 text-sm text-slate-600">Loading leave requests...</div>
              ) : leaveRequests.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-600">No leave requests found</div>
              ) : (
                <div className="space-y-3">
                  {leaveRequests.map((req) => {
                    const statusColors = {
                      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                      'approved': 'bg-green-100 text-green-800 border-green-200',
                      'rejected': 'bg-red-100 text-red-800 border-red-200'
                    };
                    const statusColor = statusColors[req.status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
                    
                    return (
                      <div key={req.id} className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={`${statusColor} border font-medium`}>
                                {req.status || 'Pending'}
                              </Badge>
                              <span className="text-sm font-semibold text-slate-900">{req.leaveType || 'Time Off'}</span>
                            </div>
                            <div className="space-y-1 text-sm text-slate-600">
                              <p><span className="font-medium">Date Range:</span> {req.dateRange || 'N/A'}</p>
                              {req.reason && (
                                <p><span className="font-medium">Reason:</span> {req.reason}</p>
                              )}
                              {req.submittedAt && (
                                <p><span className="font-medium">Submitted:</span> {format(new Date(req.submittedAt), 'MMM dd, yyyy hh:mm a')}</p>
                              )}
                              {req.approvedAt && (
                                <p><span className="font-medium">Approved:</span> {format(new Date(req.approvedAt), 'MMM dd, yyyy hh:mm a')}</p>
                              )}
                              {req.rejectedAt && (
                                <p><span className="font-medium">Rejected:</span> {format(new Date(req.rejectedAt), 'MMM dd, yyyy hh:mm a')}</p>
                              )}
                              {req.rejectionReason && (
                                <p className="text-red-600"><span className="font-medium">Rejection Reason:</span> {req.rejectionReason}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
