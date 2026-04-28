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
import { Calendar as CalendarIcon, ClipboardSignature, Headphones, Receipt, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils/constants';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/components/common/Toast';

const expenseTemplates = [
  { id: 'meal', label: 'Meal', amount: '₹750', hint: 'Dinner with client' },
  { id: 'travel', label: 'Travel', amount: '₹1,800', hint: 'City commute' },
  { id: 'supplies', label: 'Supplies', amount: '₹600', hint: 'Desk accessories' },
];

const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Work From Home', 'Compensatory Off', 'LOP'];

function FloatingField({ id, label, children }) {
  return (
    <div className="group relative">
      {children}
      <label
        htmlFor={id}
        className={[
          'pointer-events-none absolute left-3 top-2 text-[11px] font-semibold text-slate-500 transition',
          'group-focus-within:text-slate-700',
        ].join(' ')}
      >
        {label}
      </label>
    </div>
  );
}

function Timeline({ status }) {
  const s = String(status || '').toLowerCase();
  const steps = [
    { key: 'submitted', label: 'Submitted' },
    { key: 'manager', label: 'Manager approved' },
    { key: 'hr', label: 'HR approved' },
  ];

  // Current system only exposes pending/approved/rejected. Map:
  // - pending => submitted
  // - approved => hr (best-effort)
  // - rejected => submitted (failed)
  const activeIdx = s === 'approved' ? 2 : 0;
  const rejected = s === 'rejected';

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2">
        {steps.map((st, idx) => {
          const done = idx <= activeIdx && !rejected;
          const dot = rejected
            ? idx === 0
              ? 'bg-rose-500'
              : 'bg-slate-200'
            : done
              ? 'bg-emerald-500'
              : 'bg-slate-200';
          const line = rejected ? 'bg-slate-200' : done ? 'bg-emerald-200' : 'bg-slate-200';
          return (
            <div key={st.key} className="flex flex-1 items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
              <span className={`text-[11px] font-semibold ${done && !rejected ? 'text-slate-700' : 'text-slate-500'}`}>
                {st.label}
              </span>
              {idx < steps.length - 1 ? <span className={`mx-2 h-px flex-1 ${line}`} /> : null}
            </div>
          );
        })}
      </div>
      {rejected ? <p className="mt-2 text-xs font-semibold text-rose-700">Rejected</p> : null}
    </div>
  );
}

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
  const [attendanceRequests, setAttendanceRequests] = useState([]);
  const [loadingLeaveRequests, setLoadingLeaveRequests] = useState(false);
  const [managerScope, setManagerScope] = useState({ isManager: false, departments: [] });
  const [loadingManagerScope, setLoadingManagerScope] = useState(false);
  const [teamRequests, setTeamRequests] = useState([]);
  const [loadingTeamRequests, setLoadingTeamRequests] = useState(false);
  const [decisionBusyId, setDecisionBusyId] = useState(null);
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
      const company =
        (user?.company && String(user.company).trim()) ||
        (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);
      
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
        `/api/portals/employee-portal/attendance-requests?${params.toString()}`,
        { headers }
      );
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.data) {
          const all = (json.data.requests || []).slice();
          all.sort((a, b) => {
            const dateA = new Date(a.submittedAt || 0);
            const dateB = new Date(b.submittedAt || 0);
            return dateB - dateA;
          });

          const timeOffRequests = all.filter((req) => req.type === 'time-off');
          const attendanceAdj = all.filter((req) => req.type === 'regularization' || req.type === 'on-duty');

          console.log('[Employee Portal] Fetched requests:', { total: all.length, timeOff: timeOffRequests.length, attendance: attendanceAdj.length });
          setLeaveRequests(timeOffRequests);
          setAttendanceRequests(attendanceAdj);
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

  const fetchManagerScope = async () => {
    if (!user?.id) return;
    try {
      setLoadingManagerScope(true);
      const token = localStorage.getItem('auth_token');
      const company =
        (user?.company && String(user.company).trim()) ||
        (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);

      const params = new URLSearchParams();
      params.append('userId', user.id);
      if (company) params.append('company', company);

      const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      if (company) headers['x-company'] = company;

      const res = await fetch(`/api/portals/employee-portal/manager-scope?${params.toString()}`, { headers });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && json?.data) {
        setManagerScope(json.data);
      } else {
        setManagerScope({ isManager: false, departments: [] });
      }
    } catch (e) {
      setManagerScope({ isManager: false, departments: [] });
    } finally {
      setLoadingManagerScope(false);
    }
  };

  const fetchTeamRequests = async () => {
    if (!user?.id) return;
    try {
      setLoadingTeamRequests(true);
      const token = localStorage.getItem('auth_token');
      const company =
        (user?.company && String(user.company).trim()) ||
        (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);

      const params = new URLSearchParams();
      params.append('managerUserId', user.id);
      params.append('status', 'pending');
      params.append('type', 'time-off');
      if (company) params.append('company', company);

      const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      if (company) headers['x-company'] = company;

      const res = await fetch(`/api/portals/employee-portal/team-attendance-requests?${params.toString()}`, { headers });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && json?.data) {
        const raw = Array.isArray(json.data.requests) ? json.data.requests : [];
        const normalized = raw
          .map((r) => {
            const id = r?.id || r?._id || r?.requestId;
            const idStr = id == null ? '' : String(id);
            return { ...r, id: idStr };
          })
          .filter((r) => r.id && r.id !== 'undefined' && r.id !== 'null');
        setTeamRequests(normalized);
      } else {
        setTeamRequests([]);
      }
    } catch (e) {
      setTeamRequests([]);
    } finally {
      setLoadingTeamRequests(false);
    }
  };

  useEffect(() => {
    fetchManagerScope();
  }, [user?.id]);

  useEffect(() => {
    if (managerScope?.isManager) {
      fetchTeamRequests();
    } else {
      setTeamRequests([]);
    }
  }, [managerScope?.isManager]);

  const decideTeamRequest = async ({ requestId, action, rejectionReason }) => {
    if (!user?.id) return;
    setDecisionBusyId(requestId);
    try {
      const token = localStorage.getItem('auth_token');
      const company =
        (user?.company && String(user.company).trim()) ||
        (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      if (company) headers['x-company'] = company;

      const qs = new URLSearchParams();
      if (company) qs.append('company', company);

      const res = await fetch(
        `/api/portals/employee-portal/team-attendance-requests/${encodeURIComponent(requestId)}/decide${qs.toString() ? `?${qs.toString()}` : ''}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            action,
            decidedByUserId: user.id,
            decidedByName: user.name || user.email || user.id,
            rejectionReason: rejectionReason || '',
          }),
        }
      );
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        toast.success(action === 'approve' ? 'Request approved.' : 'Request rejected.');
        await fetchTeamRequests();
        await fetchLeaveRequests(); // reflect status change in employee view too
      } else {
        toast.error(json?.error || 'Failed to update request');
      }
    } catch (e) {
      toast.error('Failed to update request');
    } finally {
      setDecisionBusyId(null);
    }
  };

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
      const company =
        (user?.company && String(user.company).trim()) ||
        (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);

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

      const res = await fetch('/api/portals/employee-portal/attendance-request', {
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
        <TabsList className={`grid rounded-2xl border border-slate-200 bg-white p-1 ${managerScope?.isManager ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="leave" className="rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white">
            Leaves
          </TabsTrigger>
          {managerScope?.isManager && (
            <TabsTrigger value="team" className="rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              Team
            </TabsTrigger>
          )}
          <TabsTrigger value="expense" className="rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white">
            Expense
          </TabsTrigger>
          <TabsTrigger value="support" className="rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white">
            Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leave">
          <div className="space-y-6">
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-slate-900 text-2xl font-bold mb-1">Leave request</CardTitle>
                  <CardDescription className="text-sm text-slate-600">Fast, clean submission with smart validations.</CardDescription>
                </div>
                <Badge variant="secondary" className="flex items-center gap-2 flex-shrink-0 bg-slate-100 text-slate-700">
                  <ClipboardSignature className="h-4 w-4" /> Routing: Manager → HR
                </Badge>
              </CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="group relative">
                      <Select value={leaveType} onValueChange={(value) => setLeaveType(value)}>
                        <SelectTrigger id="leave-type" className="h-12 rounded-2xl border-slate-300 bg-white pt-5 text-slate-900">
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
                      <label htmlFor="leave-type" className="pointer-events-none absolute left-3 top-2 text-[11px] font-semibold text-slate-500">
                        Leave type
                      </label>
                    </div>

                    <div className="group relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date-range"
                            variant="outline"
                            className="h-12 w-full justify-start rounded-2xl border-slate-300 bg-white pt-5 text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0 text-slate-500" />
                            <span className="truncate text-sm text-slate-900">
                              {dateRange.from && dateRange.to
                                ? `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
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
                      <label htmlFor="date-range" className="pointer-events-none absolute left-3 top-2 text-[11px] font-semibold text-slate-500">
                        Date range
                      </label>
                    </div>
                  </div>

                  <FloatingField id="reason" label="Reason">
                    <Textarea
                      id="reason"
                      placeholder=" "
                      rows={5}
                      className="min-h-[120px] resize-none rounded-2xl border-slate-300 bg-white pt-6 text-slate-900"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </FloatingField>

                  <Button className="h-11 w-full rounded-2xl" onClick={handleLeaveSubmit} disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit for approval'}
                  </Button>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Workflow</p>
                    <p className="mt-1 text-sm text-slate-600">Submitted → Manager approval → HR approval.</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Leave balance</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {leaveBalances.map((balance) => {
                      const active = leaveType && String(leaveType) === String(balance.type);
                      return (
                        <div
                          key={balance.type}
                          className={[
                            'rounded-2xl border p-3 transition',
                            active ? 'border-purple-300 bg-purple-50' : 'border-slate-200 bg-white hover:bg-slate-50',
                          ].join(' ')}
                        >
                          <p className="text-xs text-slate-500">{balance.type}</p>
                          <p className="mt-1 text-xl font-semibold text-slate-900">{balance.balance}</p>
                          <p className="text-xs text-slate-500">days</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Empty state</p>
                    <p className="mt-1 text-sm text-slate-600">Balances update after approvals.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          {/* Leave Requests List */}
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-600">
                  <p className="text-base font-semibold text-slate-900">You haven't submitted any requests yet.</p>
                  <p className="mt-1 text-sm text-slate-600">Your leave history will appear here once you submit a request.</p>
                </div>
              ) : (
                <div className="max-h-[520px] space-y-3 overflow-y-auto pr-2">
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
                              <span className="text-sm font-semibold text-slate-900">
                                {req.leaveType ? (req.leaveType === 'Time Off' ? 'Leave' : req.leaveType) : 'Leave'}
                              </span>
                            </div>
                            <Timeline status={req.status} />
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
          </div>

          {/* Attendance Requests List (Regularization / On-duty) */}
          <Card className="border border-slate-200 bg-white shadow-lg mt-6">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-slate-900 text-xl font-bold">My Attendance Requests</CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Track regularization and on-duty requests
                </CardDescription>
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
                <div className="text-center py-8 text-sm text-slate-600">Loading attendance requests...</div>
              ) : attendanceRequests.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-600">No attendance requests found</div>
              ) : (
                <div className="space-y-3">
                  {attendanceRequests.map((req) => {
                    const statusColors = {
                      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                      approved: 'bg-green-100 text-green-800 border-green-200',
                      rejected: 'bg-red-100 text-red-800 border-red-200',
                    };
                    const statusColor =
                      statusColors[String(req.status || '').toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
                    const typeLabel =
                      req.type === 'regularization'
                        ? 'Attendance regularization'
                        : req.type === 'on-duty'
                          ? 'On duty'
                          : req.type || 'Attendance request';

                    return (
                      <div
                        key={req.id}
                        className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={`${statusColor} border font-medium`}>
                                {req.status || 'Pending'}
                              </Badge>
                              <span className="text-sm font-semibold text-slate-900">{typeLabel}</span>
                            </div>
                            <div className="space-y-1 text-sm text-slate-600">
                              {req.date && <p><span className="font-medium">Date:</span> {req.date}</p>}
                              {req.timeWindow && <p><span className="font-medium">Time window:</span> {req.timeWindow}</p>}
                              {req.location && <p><span className="font-medium">Location:</span> {req.location}</p>}
                              {req.details && <p><span className="font-medium">Details:</span> {req.details}</p>}
                              {req.notes && <p><span className="font-medium">Notes:</span> {req.notes}</p>}
                              {req.submittedAt && (
                                <p>
                                  <span className="font-medium">Submitted:</span>{' '}
                                  {format(new Date(req.submittedAt), 'MMM dd, yyyy hh:mm a')}
                                </p>
                              )}
                              {req.approvedAt && (
                                <p>
                                  <span className="font-medium">Approved:</span>{' '}
                                  {format(new Date(req.approvedAt), 'MMM dd, yyyy hh:mm a')}
                                </p>
                              )}
                              {req.rejectedAt && (
                                <p>
                                  <span className="font-medium">Rejected:</span>{' '}
                                  {format(new Date(req.rejectedAt), 'MMM dd, yyyy hh:mm a')}
                                </p>
                              )}
                              {req.rejectionReason && (
                                <p className="text-red-600">
                                  <span className="font-medium">Rejection Reason:</span> {req.rejectionReason}
                                </p>
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

        {managerScope?.isManager && (
          <TabsContent value="team">
            <Card className="border border-slate-200 bg-white shadow-lg">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-slate-900 text-xl font-bold">Team Leave Requests</CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    Approve or reject leave/WFH requests from your department team.
                  </CardDescription>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-1">
                      Managed: {managerScope.departments?.join(', ') || '—'}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1">
                      Showing: Pending only
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchTeamRequests}
                  disabled={loadingTeamRequests || loadingManagerScope}
                  className="flex-shrink-0 flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingTeamRequests ? 'animate-spin' : ''}`} />
                  {loadingTeamRequests ? 'Refreshing...' : 'Refresh'}
                </Button>
              </CardHeader>
              <CardContent>
                {loadingTeamRequests ? (
                  <div className="text-center py-8 text-sm text-slate-600">Loading team requests...</div>
                ) : teamRequests.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-600">No pending team leave requests</div>
                ) : (
                  <div className="rounded-lg border border-slate-200 overflow-hidden">
                    {teamRequests.map((req) => (
                      <div key={req.id} className="px-4 py-3 border-b last:border-b-0">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 border font-medium">
                                Pending
                              </Badge>
                              <span className="text-sm font-semibold text-slate-900">
                                {req.employeeName || req.employeeId}
                              </span>
                              {req.employeeEmail ? (
                                <span className="text-xs text-slate-500 truncate">{req.employeeEmail}</span>
                              ) : null}
                            </div>
                            <div className="mt-1 text-xs text-slate-600 flex flex-wrap gap-x-2 gap-y-1">
                              <span className="font-medium text-slate-700">
                                {req.leaveType ? (req.leaveType === 'Time Off' ? 'Leave' : req.leaveType) : 'Leave'}
                              </span>
                              {req.employeeDepartment ? <span>• {req.employeeDepartment}</span> : null}
                              <span>• {req.dateRange || 'N/A'}</span>
                              {req.submittedAt ? (
                                <span className="text-slate-500">
                                  • {format(new Date(req.submittedAt), 'MMM dd, yyyy hh:mm a')}
                                </span>
                              ) : null}
                            </div>
                            {req.reason ? (
                              <div className="mt-1 text-xs text-slate-500 line-clamp-2">
                                {req.reason}
                              </div>
                            ) : null}
                          </div>

                          <div className="flex items-center gap-2 sm:justify-end">
                            <Button
                              size="sm"
                              onClick={() => decideTeamRequest({ requestId: req.id, action: 'approve' })}
                              disabled={!req.id || decisionBusyId === req.id}
                            >
                              {decisionBusyId === req.id ? '...' : 'Approve'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const reason = window.prompt('Rejection reason (optional):', '') || '';
                                decideTeamRequest({ requestId: req.id, action: 'reject', rejectionReason: reason });
                              }}
                              disabled={!req.id || decisionBusyId === req.id}
                              className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="expense">
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
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
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
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
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 space-y-2 shadow-sm">
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
