'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Import the same mock data generator
const generateLeaveRequestsForKPIs = () => {
  const employees = [
    { name: 'John Doe', code: 'EMP001' },
    { name: 'Jane Smith', code: 'EMP002' },
    { name: 'Mike Johnson', code: 'EMP003' },
    { name: 'Sarah Williams', code: 'EMP004' },
    { name: 'David Brown', code: 'EMP005' },
    { name: 'Emily Davis', code: 'EMP006' },
  ];

  const statuses = ['Pending', 'Approved', 'Rejected'];
  const data: any[] = [];

  employees.forEach((emp, empIndex) => {
    const numRequests = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < numRequests; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const daysAgo = Math.floor(Math.random() * 30) - 10;
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() + daysAgo);
      const duration = Math.floor(Math.random() * 5) + 1;
      const toDate = new Date(fromDate);
      toDate.setDate(toDate.getDate() + duration - 1);
      
      const appliedDate = new Date(fromDate);
      appliedDate.setDate(appliedDate.getDate() - Math.floor(Math.random() * 7) - 1);
      
      let approvedDate = null;
      if (status !== 'Pending') {
        approvedDate = new Date(appliedDate);
        approvedDate.setDate(approvedDate.getDate() + Math.floor(Math.random() * 3) + 1);
      }
      
      data.push({
        status,
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0],
        approvedDate: approvedDate ? approvedDate.toISOString().split('T')[0] : null,
      });
    }
  });

  return data;
};

const mockLeaveRequests = generateLeaveRequestsForKPIs();

const generateYearlyLeaveUtilization = () => {
  const employees = [
    'John Doe',
    'Jane Smith',
    'Mike Johnson',
    'Sarah Williams',
    'David Brown',
    'Emily Davis',
    'Robert Wilson',
    'Lisa Anderson',
    'Alex Kumar',
    'Priya Sharma',
    'Rajesh Patel',
    'Sneha Reddy',
    'Vikram Singh',
    'Anita Desai',
    'Rahul Mehta',
  ];

  return employees.map(emp => {
    const utilized = Math.floor(Math.random() * 15) + 5; // 5-20
    const remaining = Math.floor(Math.random() * 10) + 8; // 8-18
    return { employee: emp, utilized, remaining };
  });
};

const yearlyLeaveUtilization = generateYearlyLeaveUtilization();

export default function LeaveOverview() {
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);
  const [leavePolicy, setLeavePolicy] = useState(() => {
    // Load from localStorage if available, otherwise use defaults
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('leavePolicy');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // If parsing fails, use defaults
        }
      }
    }
    return {
      casualLeave: 12,
      sickLeave: 6,
      earnedLeave: 10,
      compOff: 0,
      wfh: 'Unlimited',
      lop: 'As per policy',
    };
  });

  // Calculate KPIs from mock data
  const kpis = useMemo(() => {
    return {
      totalOnLeave: mockLeaveRequests.filter(l => l.status === 'Approved' && 
        new Date(l.from) <= new Date() && new Date(l.to) >= new Date()).length,
      leaveForApproval: mockLeaveRequests.filter(l => l.status === 'Pending').length,
      approvedThisMonth: mockLeaveRequests.filter(l => l.status === 'Approved' && 
        new Date(l.approvedDate || '').getMonth() === new Date().getMonth()).length,
      rejectedThisMonth: mockLeaveRequests.filter(l => l.status === 'Rejected' && 
        new Date(l.approvedDate || '').getMonth() === new Date().getMonth()).length,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total on Leave</p>
                <p className="text-3xl font-bold mt-2">{kpis.totalOnLeave}</p>
              </div>
              <Users className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Leave for Approval</p>
                <p className="text-3xl font-bold mt-2">{kpis.leaveForApproval}</p>
              </div>
              <AlertCircle className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Approved This Month</p>
                <p className="text-3xl font-bold mt-2">{kpis.approvedThisMonth}</p>
              </div>
              <CheckCircle className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Rejected This Month</p>
                <p className="text-3xl font-bold mt-2">{kpis.rejectedThisMonth}</p>
              </div>
              <XCircle className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Policy Widget and Yearly Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Leave Policy Widget */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Leave Policy</CardTitle>
                <CardDescription>Annual leave entitlements by category</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPolicyDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Edit Policy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Casual Leave</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {typeof leavePolicy.casualLeave === 'number' ? `${leavePolicy.casualLeave} days/year` : leavePolicy.casualLeave}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Sick Leave</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {typeof leavePolicy.sickLeave === 'number' ? `${leavePolicy.sickLeave} days/year` : leavePolicy.sickLeave}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Earned Leave</span>
                </div>
                <span className="text-lg font-bold text-purple-600">
                  {typeof leavePolicy.earnedLeave === 'number' ? `${leavePolicy.earnedLeave} days/year` : leavePolicy.earnedLeave}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-cyan-600" />
                  <span className="font-medium">Compensatory Off</span>
                </div>
                <span className="text-lg font-bold text-cyan-600">
                  {typeof leavePolicy.compOff === 'number' ? `${leavePolicy.compOff} days/year` : leavePolicy.compOff || '0 days/year'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Work From Home</span>
                </div>
                <span className="text-lg font-bold text-orange-600">{leavePolicy.wfh}*</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-red-600" />
                  <span className="font-medium">Loss of Pay (LOP)</span>
                </div>
                <span className="text-lg font-bold text-red-600">{leavePolicy.lop}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * WFH subject to manager approval and business requirements
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Yearly Summary Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Yearly Leave Utilization</CardTitle>
            <CardDescription>Leave utilization per employee for current year</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearlyLeaveUtilization}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis dataKey="employee" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="utilized" fill="#ef4444" name="Utilized" radius={[8, 8, 0, 0]} />
                <Bar dataKey="remaining" fill="#10b981" name="Remaining" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Edit Leave Policy Dialog */}
      <Dialog open={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Leave Policy</DialogTitle>
            <DialogDescription>
              Update annual leave entitlements by category
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Casual Leave (days/year)</Label>
                <Input
                  type="number"
                  min="0"
                  max="365"
                  value={leavePolicy.casualLeave}
                  onChange={(e) => setLeavePolicy({
                    ...leavePolicy,
                    casualLeave: parseInt(e.target.value) || 0,
                  })}
                  placeholder="12"
                />
              </div>
              <div>
                <Label>Sick Leave (days/year)</Label>
                <Input
                  type="number"
                  min="0"
                  max="365"
                  value={leavePolicy.sickLeave}
                  onChange={(e) => setLeavePolicy({
                    ...leavePolicy,
                    sickLeave: parseInt(e.target.value) || 0,
                  })}
                  placeholder="6"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Earned Leave (days/year)</Label>
                <Input
                  type="number"
                  min="0"
                  max="365"
                  value={leavePolicy.earnedLeave}
                  onChange={(e) => setLeavePolicy({
                    ...leavePolicy,
                    earnedLeave: parseInt(e.target.value) || 0,
                  })}
                  placeholder="10"
                />
              </div>
              <div>
                <Label>Compensatory Off (days/year)</Label>
                <Input
                  type="number"
                  min="0"
                  max="365"
                  value={leavePolicy.compOff || 0}
                  onChange={(e) => setLeavePolicy({
                    ...leavePolicy,
                    compOff: parseInt(e.target.value) || 0,
                  })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Work From Home</Label>
                <Select
                  value={leavePolicy.wfh}
                  onValueChange={(value) => setLeavePolicy({ ...leavePolicy, wfh: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unlimited">Unlimited</SelectItem>
                    <SelectItem value="2 days/month">2 days/month</SelectItem>
                    <SelectItem value="4 days/month">4 days/month</SelectItem>
                    <SelectItem value="As per manager approval">As per manager approval</SelectItem>
                    <SelectItem value="Not Allowed">Not Allowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Loss of Pay (LOP)</Label>
                <Select
                  value={leavePolicy.lop}
                  onValueChange={(value) => setLeavePolicy({ ...leavePolicy, lop: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="As per policy">As per policy</SelectItem>
                    <SelectItem value="No limit">No limit</SelectItem>
                    <SelectItem value="Max 30 days/year">Max 30 days/year</SelectItem>
                    <SelectItem value="Max 60 days/year">Max 60 days/year</SelectItem>
                    <SelectItem value="Not Allowed">Not Allowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPolicyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Save to localStorage for persistence
                localStorage.setItem('leavePolicy', JSON.stringify(leavePolicy));
                setIsPolicyDialogOpen(false);
                alert('Leave policy updated successfully!');
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

