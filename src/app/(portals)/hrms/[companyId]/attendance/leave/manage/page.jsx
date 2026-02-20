'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import { Users, AlertCircle, CheckCircle2, XCircle, Calendar, Settings, Users as UsersIcon, FileText, Plus, Search, Check, X, Edit, Trash2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';
import RejectionReasonDialog from '@/components/hrms/RejectionReasonDialog';

const AttendanceLeaveManagePage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();

  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTenurePolicyDialogOpen, setIsTenurePolicyDialogOpen] = useState(false);

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [leaveStats, setLeaveStats] = useState({
    totalOnLeave: 0,
    leaveForApproval: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
  });

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editForm, setEditForm] = useState({
    leaveType: '',
    from: '',
    to: '',
    reason: '',
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingRow, setDeletingRow] = useState(null);

  const [viewMode, setViewMode] = useState('requests'); // 'balance' | 'requests'

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addEmployeeSearch, setAddEmployeeSearch] = useState('');
  const [addForm, setAddForm] = useState({
    employeeId: '',
    leaveType: '',
    from: '',
    to: '',
    reason: '',
  });

  const LEAVE_TYPE_OPTIONS = [
    'Casual Leave',
    'Sick Leave',
    'Earned Leave',
    'LOP',
    'Compensatory Off',
    'Work From Home',
  ];

  const [policyLoading, setPolicyLoading] = useState(true);
  const [tenurePolicy, setTenurePolicy] = useState({
    '0-6months': { casualLeave: 0, sickLeave: 3, earnedLeave: 0, compOff: 0 },
    '6-12months': { casualLeave: 6, sickLeave: 6, earnedLeave: 0, compOff: 0 },
    '1year+': { casualLeave: 12, sickLeave: 6, earnedLeave: 10, compOff: 0 },
  });
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [modalFilterType, setModalFilterType] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  const getCompanyName = () => {
    let company = currentCompany?.name;
    if (!company && typeof window !== 'undefined') {
      company =
        sessionStorage.getItem('selectedCompany') ||
        sessionStorage.getItem('adminSelectedCompany');
    }
    if (!company && companyId && companyId !== 'undefined') {
      if (typeof window !== 'undefined') {
        company = sessionStorage.getItem(`company_${companyId}`);
      }
    }
    return company;
  };

  // Fetch employees for name mapping
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const company = getCompanyName();

        const params = new URLSearchParams();
        if (company) params.append('company', company);

        const headers = {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(company ? { 'x-company': company } : {}),
        };

        const res = await fetch(`/api/hrms-portal/employees?${params.toString()}`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setEmployees(json.data.employees || []);
          }
        }
      } catch (err) {
        console.error('[Attendance Leave Manage] Fetch employees error:', err);
      }
    };

    fetchEmployees();
  }, [companyId, currentCompany]);

  // Fetch leave policy from backend
  useEffect(() => {
    const fetchLeavePolicy = async () => {
      try {
        setPolicyLoading(true);
        const token = localStorage.getItem('auth_token');
        const company = getCompanyName();

        const params = new URLSearchParams();
        if (company) params.append('company', company);

        const headers = {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(company ? { 'x-company': company } : {}),
        };

        const res = await fetch(`/api/hrms-portal/leave-policy?${params.toString()}`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setTenurePolicy(json.data);
          }
        }
      } catch (err) {
        console.error('[Attendance Leave Manage] Fetch leave policy error:', err);
      } finally {
        setPolicyLoading(false);
      }
    };

    fetchLeavePolicy();
  }, [companyId, currentCompany]);

  // Fetch leave stats from backend API
  const fetchLeaveStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const company = getCompanyName();
      
      const params = new URLSearchParams();
      if (company) params.append('company', company);

      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(company ? { 'x-company': company } : {}),
      };

      const res = await fetch(`/api/hrms-portal/leaves/overview/stats?${params.toString()}`, { headers });
      if (!res.ok) {
        console.error('[Attendance Leave Manage] Failed to fetch stats:', res.status);
        return;
      }

      const json = await res.json();
      if (json.success && json.data) {
        setLeaveStats({
          totalOnLeave: json.data.totalOnLeave || 0,
          leaveForApproval: json.data.leaveForApproval || 0,
          approvedThisMonth: json.data.approvedThisMonth || 0,
          rejectedThisMonth: json.data.rejectedThisMonth || 0
        });
        console.log('[Attendance Leave Manage] Fetched stats from API:', json.data);
      }
    } catch (err) {
      console.error('[Attendance Leave Manage] Fetch stats error:', err);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const company = getCompanyName();

      const params = new URLSearchParams();
      params.append('type', 'time-off');
      params.append('status', statusFilter === 'all' ? 'all' : statusFilter);
      if (company) params.append('company', company);

      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(company ? { 'x-company': company } : {}),
      };

      const res = await fetch(`/api/hrms-portal/attendance-requests?${params.toString()}`, { headers });
      if (!res.ok) return;

      const json = await res.json();
      if (!json.success) return;

      const originalRequests = json.data.requests || [];

      const employeeMap = new Map();
      employees.forEach((emp) => {
        const empId = emp.employeeId || emp.email?.split('@')[0] || '';
        if (empId) employeeMap.set(empId, emp.name || emp.firstName || 'Unknown');
      });

      const requests = originalRequests.map((req) => {
        let from = '';
        let to = '';
        let duration = 0;

        // First, check if we have separate from/to fields
        if (req.from && req.to) {
          from = req.from;
          to = req.to;
        } else if (req.dateRange) {
          // Try splitting by " - " first (with spaces)
          let parts = req.dateRange.split(' - ');
          // If that doesn't work, try splitting by " to " (with spaces)
          if (parts.length !== 2) {
            parts = req.dateRange.split(' to ');
          }
          // If still doesn't work, try splitting by "to" (without spaces)
          if (parts.length !== 2) {
            parts = req.dateRange.split('to');
          }
          // If still doesn't work, try splitting by "-" (without spaces)
          if (parts.length !== 2) {
            parts = req.dateRange.split('-');
            // If we split by "-" without spaces, we might have more than 2 parts (e.g., "2026-01-22-2026-01-24")
            // In that case, try to reconstruct
            if (parts.length >= 4) {
              // Assume format like "2026-01-22-2026-01-24"
              from = `${parts[0]}-${parts[1]}-${parts[2]}`;
              to = `${parts[3]}-${parts[4]}-${parts[5] || parts[4]}`;
            }
          }
          
          if (parts.length === 2) {
            from = parts[0].trim();
            to = parts[1].trim();
          }
        }

        // Try to parse dates and calculate duration
        if (from && to) {
          try {
            const fromDate = new Date(from);
            const toDate = new Date(to);
            if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
              // Ensure dates are properly formatted as ISO strings for consistency
              from = fromDate.toISOString().split('T')[0];
              to = toDate.toISOString().split('T')[0];
              const diffTime = Math.abs(toDate - fromDate);
              duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            } else {
              // If parsing fails, try to keep original values but set duration to 1
              duration = 1;
            }
          } catch (e) {
            duration = 1;
          }
        }

        const employeeName = employeeMap.get(req.employeeId) || req.employeeId || 'Unknown';
        const leaveType = req.leaveType || 'Time Off';

        return {
          id: req.id,
          employeeName,
          employeeId: req.employeeId,
          leaveType,
          from,
          to,
          duration: duration || 1,
          reason: req.reason || '',
          status:
            req.status === 'pending'
              ? 'Pending'
              : req.status === 'approved'
                ? 'Approved'
                : req.status === 'rejected'
                  ? 'Rejected'
                  : 'Pending',
          approvedAt: req.approvedAt,
          rejectedAt: req.rejectedAt,
          dateRange: req.dateRange,
          submittedAt: req.submittedAt,
        };
      });

      setLeaveRequests(requests);
    } catch (err) {
      console.error('[Attendance Leave Manage] Fetch leave requests error:', err);
      toast?.error?.('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
    fetchLeaveStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, companyId, currentCompany, employees]);

  // Fetch stats separately when needed
  useEffect(() => {
    fetchLeaveStats();
  }, [companyId, currentCompany]);

  // Filter leave requests
  const filteredRequests = leaveRequests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'all' || request.leaveType.toLowerCase().includes(typeFilter.toLowerCase());
    const matchesSearch = !searchQuery || 
      request.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.leaveType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}, ${date.getFullYear()}`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Approved': 'bg-green-100 text-green-800 border-green-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Helper function to check if a request is approved this month
  const isApprovedThisMonth = (req, currentMonth, currentYear) => {
    const status = req.status || '';
    if (status.toLowerCase() !== 'approved') return false;
    
    if (req.approvedAt) {
      try {
        const approvedDate = req.approvedAt instanceof Date ? req.approvedAt : new Date(req.approvedAt);
        if (!isNaN(approvedDate.getTime())) {
          return approvedDate.getMonth() === currentMonth && approvedDate.getFullYear() === currentYear;
        }
      } catch (e) {}
    }
    
    if (req.from) {
      try {
        const fromDate = new Date(req.from);
        if (!isNaN(fromDate.getTime())) {
          return fromDate.getMonth() === currentMonth && fromDate.getFullYear() === currentYear;
        }
      } catch (e) {}
    }
    
    if (req.dateRange) {
      try {
        const parts = req.dateRange.split(' - ');
        if (parts.length > 0) {
          const checkDate = new Date(parts[0].trim());
          if (!isNaN(checkDate.getTime())) {
            return checkDate.getMonth() === currentMonth && checkDate.getFullYear() === currentYear;
          }
        }
      } catch (e) {}
    }
    
    return false;
  };

  // Helper function to check if a request is rejected this month
  const isRejectedThisMonth = (req, currentMonth, currentYear) => {
    const status = req.status || '';
    if (status.toLowerCase() !== 'rejected') return false;
    
    if (req.rejectedAt) {
      try {
        const rejectedDate = req.rejectedAt instanceof Date ? req.rejectedAt : new Date(req.rejectedAt);
        if (!isNaN(rejectedDate.getTime())) {
          return rejectedDate.getMonth() === currentMonth && rejectedDate.getFullYear() === currentYear;
        }
      } catch (e) {}
    }
    
    if (req.from) {
      try {
        const fromDate = new Date(req.from);
        if (!isNaN(fromDate.getTime())) {
          return fromDate.getMonth() === currentMonth && fromDate.getFullYear() === currentYear;
        }
      } catch (e) {}
    }
    
    return false;
  };

  // Get filtered leave requests based on card type
  const getFilteredLeaveRequests = (filterType) => {
    if (!filterType || !leaveRequests || leaveRequests.length === 0) {
      return [];
    }
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    switch (filterType) {
      case 'total-on-leave':
        return leaveRequests.filter(req => 
          req.status === 'Approved' && 
          req.from && req.to &&
          new Date(req.from) <= now && new Date(req.to) >= now
        );
      
      case 'leave-for-approval':
        return leaveRequests.filter(req => {
          const status = req.status || '';
          return status.toLowerCase() === 'pending';
        });
      
      case 'approved-this-month':
        const approved = leaveRequests.filter(req => isApprovedThisMonth(req, currentMonth, currentYear));
        if (approved.length === 0) {
          const allApproved = leaveRequests.filter(req => {
            const status = req.status || '';
            return status.toLowerCase() === 'approved';
          });
          if (allApproved.length > 0) {
            return allApproved;
          }
        }
        return approved;
      
      case 'rejected-this-month':
        return leaveRequests.filter(req => isRejectedThisMonth(req, currentMonth, currentYear));
      
      default:
        return [];
    }
  };

  // Handle card click
  const handleCardClick = (filterType, title) => {
    console.log('[Attendance Leave Manage] Card clicked:', filterType, title);
    setModalFilterType(filterType);
    setModalTitle(title);
    setShowLeaveModal(true);
  };

  // Export to Excel
  const handleExportToExcel = () => {
    try {
      const filteredData = getFilteredLeaveRequests(modalFilterType);
      
      if (filteredData.length === 0) {
        toast.error('No data to export');
        return;
      }

      const excelData = filteredData.map((req, index) => ({
        'S.No': index + 1,
        'Employee Name': req.employeeName || '--',
        'Employee ID': req.employeeId || '--',
        'Leave Type': req.leaveType || '--',
        'From Date': req.from ? formatDate(req.from) : '--',
        'To Date': req.to ? formatDate(req.to) : '--',
        'Duration': `${req.duration || 0} ${req.duration === 1 ? 'day' : 'days'}`,
        'Reason': req.reason || '--',
        'Status': req.status || '--',
        'Applied Date': req.dateRange || '--'
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      const colWidths = [
        { wch: 8 }, { wch: 20 }, { wch: 15 }, { wch: 18 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 30 },
        { wch: 12 }, { wch: 15 }
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Leave Requests');

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `${modalTitle.replace(/\s+/g, '_')}_${dateStr}.xlsx`;

      XLSX.writeFile(wb, filename);
      toast.success('Excel file exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel file');
    }
  };

  const openEditDialog = (row) => {
    if (!row?.id) return;
    if (row.status !== 'Pending') {
      toast?.info?.('Only pending requests can be edited');
      return;
    }
    setEditingRow(row);
    setEditForm({
      leaveType: row.leaveType || '',
      from: row.from || '',
      to: row.to || '',
      reason: row.reason || '',
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingRow?.id) return;

    const from = (editForm.from || '').trim();
    const to = (editForm.to || '').trim();
    if (!from || !to) {
      toast?.error?.('From and To dates are required');
      return;
    }

    try {
      setEditLoading(true);
      const token = localStorage.getItem('auth_token');
      const company = getCompanyName();

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(company ? { 'x-company': company } : {}),
      };

      const res = await fetch(`/api/hrms-portal/attendance-requests/${editingRow.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          leaveType: editForm.leaveType,
          reason: editForm.reason,
          from,
          to,
          dateRange: `${from} - ${to}`,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast?.success?.('Leave request updated');
        setEditDialogOpen(false);
        setEditingRow(null);
        await fetchLeaveRequests();
        await fetchLeaveStats(); // Refresh stats after update
      } else {
        toast?.error?.(json.error || 'Failed to update request');
      }
    } catch (err) {
      console.error('[Attendance Leave Manage] Edit error:', err);
      toast?.error?.('An error occurred. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const openDeleteDialog = (row) => {
    if (!row?.id) return;
    if (row.status !== 'Pending') {
      toast?.info?.('Only pending requests can be deleted');
      return;
    }
    setDeletingRow(row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRow?.id) return;
    try {
      setDeleteLoading(true);
      const token = localStorage.getItem('auth_token');
      const company = getCompanyName();

      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(company ? { 'x-company': company } : {}),
      };

      const res = await fetch(`/api/hrms-portal/attendance-requests/${deletingRow.id}`, {
        method: 'DELETE',
        headers,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast?.success?.('Leave request deleted');
        setDeleteDialogOpen(false);
        setDeletingRow(null);
        await fetchLeaveRequests();
        await fetchLeaveStats(); // Refresh stats after delete
      } else {
        toast?.error?.(json.error || 'Failed to delete request');
      }
    } catch (err) {
      console.error('[Attendance Leave Manage] Delete error:', err);
      toast?.error?.('An error occurred. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openAddDialog = () => {
    setAddEmployeeSearch('');
    setAddForm({
      employeeId: '',
      leaveType: '',
      from: '',
      to: '',
      reason: '',
    });
    setAddDialogOpen(true);
  };

  const handleAddSave = async () => {
    const employeeId = (addForm.employeeId || '').trim();
    const leaveType = (addForm.leaveType || '').trim();
    const from = (addForm.from || '').trim();
    const to = (addForm.to || '').trim();

    if (!employeeId) return toast?.error?.('Employee is required');
    if (!leaveType) return toast?.error?.('Leave Type is required');
    if (!from || !to) return toast?.error?.('From and To dates are required');

    try {
      setAddLoading(true);
      const token = localStorage.getItem('auth_token');
      const company = getCompanyName();

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(company ? { 'x-company': company } : {}),
      };

      const res = await fetch('/api/hrms-portal/attendance-requests', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          employeeId,
          leaveType,
          from,
          to,
          reason: addForm.reason,
          type: 'time-off',
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast?.success?.('Leave request created');
        setAddDialogOpen(false);
        await fetchLeaveRequests();
        await fetchLeaveStats(); // Refresh stats after create
      } else {
        toast?.error?.(json.error || 'Failed to create request');
      }
    } catch (err) {
      console.error('[Attendance Leave Manage] Add error:', err);
      toast?.error?.('An error occurred. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  // Generate actions for each row
  const getRowActions = (row) => {
    const actions = [];
    if (row.status === 'Pending') {
      actions.push(
        {
          icon: <Check className="w-4 h-4" />,
          onClick: () => handleApprove(row.id),
          title: 'Approve'
        },
        {
          icon: <X className="w-4 h-4" />,
          onClick: () => handleReject(row.id),
          title: 'Reject',
          variant: 'danger'
        }
      );
    }
    actions.push(
      {
        icon: <Edit className="w-4 h-4" />,
        onClick: (r) => openEditDialog(r),
        title: 'Edit'
      },
      {
        icon: <Trash2 className="w-4 h-4" />,
        onClick: (r) => openDeleteDialog(r),
        title: 'Delete',
        variant: 'danger'
      }
    );
    return actions;
  };

  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const company = getCompanyName();

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(company ? { 'x-company': company } : {}),
      };

      const res = await fetch(`/api/hrms-portal/attendance-requests/${requestId}/approve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ approvedBy: 'Admin' }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast?.success?.('Leave request approved successfully');
        await fetchLeaveRequests();
        await fetchLeaveStats(); // Refresh stats after approval
      } else {
        toast?.error?.(json.error || 'Failed to approve request');
      }
    } catch (err) {
      console.error('[Attendance Leave Manage] Approve error:', err);
      toast?.error?.('An error occurred. Please try again.');
    }
  };

  const handleReject = async (requestId) => {
    setRejectingRequestId(requestId);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async (rejectionReason) => {
    const requestId = rejectingRequestId;
    if (!requestId) return;

    try {
      setRejectLoading(true);
      const token = localStorage.getItem('auth_token');
      const company = getCompanyName();

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(company ? { 'x-company': company } : {}),
      };

      const res = await fetch(`/api/hrms-portal/attendance-requests/${requestId}/reject`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ rejectedBy: 'Admin', rejectionReason }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast?.success?.('Leave request rejected');
        setRejectDialogOpen(false);
        setRejectingRequestId(null);
        await fetchLeaveRequests();
        await fetchLeaveStats(); // Refresh stats after rejection
      } else {
        toast?.error?.(json.error || 'Failed to reject request');
      }
    } catch (err) {
      console.error('[Attendance Leave Manage] Reject error:', err);
      toast?.error?.('An error occurred. Please try again.');
    } finally {
      setRejectLoading(false);
    }
  };

  const tableColumns = [
    {
      key: 'employeeName',
      title: 'Employee Name',
      render: (value) => <div className="font-medium text-slate-900">{value}</div>
    },
    {
      key: 'leaveType',
      title: 'Leave Type',
      render: (value) => <div className="text-slate-700">{value}</div>
    },
    {
      key: 'from',
      title: 'From',
      render: (value) => <div className="text-slate-700">{formatDate(value)}</div>
    },
    {
      key: 'to',
      title: 'To',
      render: (value) => <div className="text-slate-700">{formatDate(value)}</div>
    },
    {
      key: 'duration',
      title: 'Duration',
      render: (value) => <div className="text-slate-700">{value} {value === 1 ? 'day' : 'days'}</div>
    },
    {
      key: 'reason',
      title: 'Reason',
      render: (value) => <div className="text-slate-700">{value}</div>
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value, row) => {
        const actions = getRowActions(row);
        return (
          <div className="flex items-center justify-end space-x-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(row);
                }}
                className={`text-slate-600 hover:text-slate-900 transition-colors ${
                  action.variant === 'danger' ? 'hover:text-red-600' : ''
                }`}
                title={action.title}
              >
                {action.icon}
              </button>
            ))}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            title: 'Total On Leave',
            value: leaveStats.totalOnLeave,
            icon: Users,
            gradient: 'from-blue-600 via-indigo-600 to-blue-700',
          },
          {
            title: 'Leave For Approval',
            value: leaveStats.leaveForApproval,
            icon: AlertCircle,
            gradient: 'from-orange-600 via-amber-600 to-orange-700',
          },
          {
            title: 'Approved This Month',
            value: leaveStats.approvedThisMonth,
            icon: CheckCircle2,
            gradient: 'from-green-600 via-emerald-600 to-green-700',
          },
          {
            title: 'Rejected This Month',
            value: leaveStats.rejectedThisMonth,
            icon: XCircle,
            gradient: 'from-red-600 via-rose-600 to-red-700',
          },
        ].map((kpi, index) => {
          const Icon = kpi.icon;
          const filterTypeMap = {
            'Total On Leave': 'total-on-leave',
            'Leave For Approval': 'leave-for-approval',
            'Approved This Month': 'approved-this-month',
            'Rejected This Month': 'rejected-this-month'
          };
          const filterType = filterTypeMap[kpi.title];
          
          return (
            <div
              key={index}
              onClick={(e) => {
                console.log('[Attendance Leave Manage] Card clicked:', kpi.title, filterType);
                e.preventDefault();
                e.stopPropagation();
                if (filterType) {
                  handleCardClick(filterType, kpi.title);
                }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (filterType) {
                    handleCardClick(filterType, kpi.title);
                  }
                }
              }}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${kpi.gradient} shadow-lg ${filterType ? 'cursor-pointer hover:scale-105 transition-transform duration-200 active:scale-95' : ''}`}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1 text-white">{kpi.value}</div>
                <div className="text-xs text-white/90 uppercase tracking-wide">{kpi.title}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tenure-based Leave Policy Section */}
      <Card className="border-2 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Tenure-based Leave Policy</h2>
            <p className="text-sm text-slate-600 mt-1">Configure leave entitlements based on employee tenure</p>
          </div>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            icon={<Settings className="w-4 h-4" />}
            onClick={() => setIsTenurePolicyDialogOpen(true)}
          >
            Configure Leave Policy
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {policyLoading ? (
            <div className="col-span-3 text-center py-8 text-slate-600">Loading leave policy...</div>
          ) : ([
            {
              tenure: '0-6 Months',
              borderColor: 'border-blue-200',
              bgColor: 'bg-blue-50',
              iconColor: 'text-blue-600',
              key: '0-6months',
              policies: [
                { type: 'Casual Leave', days: tenurePolicy['0-6months'].casualLeave },
                { type: 'Sick Leave', days: tenurePolicy['0-6months'].sickLeave },
                { type: 'Earned Leave', days: tenurePolicy['0-6months'].earnedLeave },
                { type: 'Compensatory Off', days: tenurePolicy['0-6months'].compOff }
              ]
            },
            {
              tenure: '6-12 Months',
              borderColor: 'border-green-200',
              bgColor: 'bg-green-50',
              iconColor: 'text-green-600',
              key: '6-12months',
              policies: [
                { type: 'Casual Leave', days: tenurePolicy['6-12months'].casualLeave },
                { type: 'Sick Leave', days: tenurePolicy['6-12months'].sickLeave },
                { type: 'Earned Leave', days: tenurePolicy['6-12months'].earnedLeave },
                { type: 'Compensatory Off', days: tenurePolicy['6-12months'].compOff }
              ]
            },
            {
              tenure: '1 Year+',
              borderColor: 'border-purple-200',
              bgColor: 'bg-purple-50',
              iconColor: 'text-purple-600',
              key: '1year+',
              policies: [
                { type: 'Casual Leave', days: tenurePolicy['1year+'].casualLeave },
                { type: 'Sick Leave', days: tenurePolicy['1year+'].sickLeave },
                { type: 'Earned Leave', days: tenurePolicy['1year+'].earnedLeave },
                { type: 'Compensatory Off', days: tenurePolicy['1year+'].compOff }
              ]
            }
          ]).map((tenure, index) => (
            <div
              key={index}
              className={`rounded-xl border-2 ${tenure.borderColor} ${tenure.bgColor} p-5`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-white ${tenure.iconColor}`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{tenure.tenure}</h3>
              </div>
              <div className="space-y-2">
                {tenure.policies.map((policy, pIndex) => (
                  <div key={pIndex} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{policy.type}:</span>
                    <span className="font-semibold text-slate-900">{policy.days} days</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Employee Leave Requests Section */}
      <Card className="border-2 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Employee Leave Requests</h2>
            <p className="text-sm text-slate-600 mt-1">Manage and approve leave requests</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className={
                viewMode === 'balance'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
              }
              icon={<UsersIcon className="w-4 h-4" />}
              onClick={() => setViewMode('balance')}
            >
              Balance
            </Button>
            <Button
              size="sm"
              className={
                viewMode === 'requests'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
              }
              icon={<FileText className="w-4 h-4" />}
              onClick={() => setViewMode('requests')}
            >
              Requests
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
              icon={<Plus className="w-4 h-4" />}
              onClick={openAddDialog}
            >
              Add Leave Request
            </Button>
          </div>
        </div>

        {viewMode === 'balance' ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="text-sm text-neutral-700">
              Balance view shows the tenure-based leave policy cards above. Use “Requests” to manage employee leave requests.
            </div>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="all">All Types</option>
                <option value="casual leave">Casual Leave</option>
                <option value="sick leave">Sick Leave</option>
                <option value="earned leave">Earned Leave</option>
                <option value="lop">LOP</option>
                <option value="compensatory off">Compensatory Off</option>
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-8 text-slate-600">Loading leave requests...</div>
            ) : (
              <Table
                columns={tableColumns}
                data={filteredRequests}
                pagination={true}
                currentPage={1}
                totalPages={Math.ceil(filteredRequests.length / 10)}
                emptyMessage="No leave requests found"
              />
            )}

            {/* Pagination Info */}
            <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
              <span>Showing latest {Math.min(10, filteredRequests.length)} of {filteredRequests.length} records</span>
              <Button
                size="sm"
                className="bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              >
                View All
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Tenure-based Leave Policy Configuration Dialog */}
      <Modal
        isOpen={isTenurePolicyDialogOpen}
        onClose={() => setIsTenurePolicyDialogOpen(false)}
        title="Configure Tenure-based Leave Policy"
        size="lg"
      >
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-6">
            Set leave entitlements for employees based on their tenure in the organization
          </p>
          
          <div className="space-y-6">
            {/* Header Row - Leave Types */}
            <div className="grid grid-cols-5 gap-4 pb-2 border-b border-neutral-200">
              <div className="font-semibold text-slate-900">Tenure</div>
              <div className="font-semibold text-slate-900 text-center">Casual Leave (days)</div>
              <div className="font-semibold text-slate-900 text-center">Sick Leave (days)</div>
              <div className="font-semibold text-slate-900 text-center">Earned Leave (days)</div>
              <div className="font-semibold text-slate-900 text-center">Compensatory Off (days)</div>
            </div>

            {/* 0-6 Months */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-5 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">0-6 Months</h3>
                </div>
                <div className="flex justify-center">
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['0-6months'].casualLeave}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '0-6months': {
                        ...tenurePolicy['0-6months'],
                        casualLeave: parseInt(e.target.value) || 0,
                      },
                    })}
                    className="w-full max-w-[120px]"
                  />
                </div>
                <div className="flex justify-center">
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['0-6months'].sickLeave}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '0-6months': {
                        ...tenurePolicy['0-6months'],
                        sickLeave: parseInt(e.target.value) || 0,
                      },
                    })}
                    className="w-full max-w-[120px]"
                  />
                </div>
                <div className="flex justify-center">
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['0-6months'].earnedLeave}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '0-6months': {
                        ...tenurePolicy['0-6months'],
                        earnedLeave: parseInt(e.target.value) || 0,
                      },
                    })}
                    className="w-full max-w-[120px]"
                  />
                </div>
                <div className="flex justify-center">
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['0-6months'].compOff}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '0-6months': {
                        ...tenurePolicy['0-6months'],
                        compOff: parseInt(e.target.value) || 0,
                      },
                    })}
                    className="w-full max-w-[120px]"
                  />
                </div>
              </div>
            </div>

            {/* 6-12 Months */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="grid grid-cols-5 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">6-12 Months</h3>
                </div>
                <div className="flex justify-center">
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['6-12months'].casualLeave}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '6-12months': {
                        ...tenurePolicy['6-12months'],
                        casualLeave: parseInt(e.target.value) || 0,
                      },
                    })}
                    className="w-full max-w-[120px]"
                  />
                </div>
                <div className="flex justify-center">
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['6-12months'].sickLeave}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '6-12months': {
                        ...tenurePolicy['6-12months'],
                        sickLeave: parseInt(e.target.value) || 0,
                      },
                    })}
                    className="w-full max-w-[120px]"
                  />
                </div>
                <div className="flex justify-center">
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['6-12months'].earnedLeave}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '6-12months': {
                        ...tenurePolicy['6-12months'],
                        earnedLeave: parseInt(e.target.value) || 0,
                      },
                    })}
                    className="w-full max-w-[120px]"
                  />
                </div>
                <div className="flex justify-center">
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['6-12months'].compOff}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '6-12months': {
                        ...tenurePolicy['6-12months'],
                        compOff: parseInt(e.target.value) || 0,
                      },
                    })}
                    className="w-full max-w-[120px]"
                  />
                </div>
              </div>
            </div>

            {/* 1 Year+ */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="grid grid-cols-5 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">1 Year+</h3>
                </div>
                <div className="flex justify-center">
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['1year+'].casualLeave}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '1year+': {
                        ...tenurePolicy['1year+'],
                        casualLeave: parseInt(e.target.value) || 0,
                      },
                    })}
                    className="w-full max-w-[120px]"
                  />
                </div>
                <div className="flex justify-center">
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['1year+'].sickLeave}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '1year+': {
                        ...tenurePolicy['1year+'],
                        sickLeave: parseInt(e.target.value) || 0,
                      },
                    })}
                    className="w-full max-w-[120px]"
                  />
                </div>
                <div className="flex justify-center">
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['1year+'].earnedLeave}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '1year+': {
                        ...tenurePolicy['1year+'],
                        earnedLeave: parseInt(e.target.value) || 0,
                      },
                    })}
                    className="w-full max-w-[120px]"
                  />
                </div>
                <div className="flex justify-center">
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['1year+'].compOff}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '1year+': {
                        ...tenurePolicy['1year+'],
                        compOff: parseInt(e.target.value) || 0,
                      },
                    })}
                    className="w-full max-w-[120px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 bg-slate-50">
          <Button
            variant="outline"
            onClick={() => setIsTenurePolicyDialogOpen(false)}
            className="bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                const token = localStorage.getItem('auth_token');
                const company = getCompanyName();

                const headers = {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  ...(company ? { 'x-company': company } : {}),
                };

                const res = await fetch('/api/hrms-portal/leave-policy', {
                  method: 'PUT',
                  headers,
                  body: JSON.stringify({ company, ...tenurePolicy }),
                });

                const json = await res.json();
                if (res.ok && json.success) {
                  toast?.success?.('Tenure-based leave policy updated successfully');
                  setIsTenurePolicyDialogOpen(false);
                } else {
                  toast?.error?.(json.error || 'Failed to update leave policy');
                }
              } catch (err) {
                console.error('[Attendance Leave Manage] Save policy error:', err);
                toast?.error?.('Failed to update leave policy');
              }
            }}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Save Policy
          </Button>
        </div>
      </Modal>

      {/* Leave Requests Modal */}
      {showLeaveModal && modalFilterType && (() => {
        const filtered = getFilteredLeaveRequests(modalFilterType);
        console.log('[Attendance Leave Manage] Modal rendering with filtered data:', filtered.length, filtered);
        
        return (
          <Modal
            isOpen={showLeaveModal}
            onClose={() => {
              setShowLeaveModal(false);
              setModalFilterType(null);
              setModalTitle('');
            }}
            title={modalTitle || 'Leave Requests'}
            size="xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-slate-600">
                  Showing {filtered.length} leave request(s)
                </div>
                <Button
                  onClick={handleExportToExcel}
                  className="bg-green-600 text-white hover:bg-green-700"
                  icon={<Download className="w-4 h-4" />}
                >
                  Export to Excel
                </Button>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                <Table
                  columns={[
                    {
                      key: 'employeeName',
                      title: 'Employee Name',
                      render: (value) => <div className="font-medium text-slate-900">{value}</div>
                    },
                    {
                      key: 'leaveType',
                      title: 'Leave Type',
                      render: (value) => <div className="text-slate-700">{value}</div>
                    },
                    {
                      key: 'from',
                      title: 'From',
                      render: (value) => <div className="text-slate-700">{formatDate(value)}</div>
                    },
                    {
                      key: 'to',
                      title: 'To',
                      render: (value) => <div className="text-slate-700">{formatDate(value)}</div>
                    },
                    {
                      key: 'duration',
                      title: 'Duration',
                      render: (value) => <div className="text-slate-700">{value} {value === 1 ? 'day' : 'days'}</div>
                    },
                    {
                      key: 'reason',
                      title: 'Reason',
                      render: (value) => <div className="text-slate-700 max-w-xs truncate" title={value}>{value || '--'}</div>
                    },
                    {
                      key: 'status',
                      title: 'Status',
                      render: (value) => (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(value)}`}>
                          {value}
                        </span>
                      )
                    }
                  ]}
                  data={filtered}
                  emptyMessage="No leave requests found"
                />
              </div>
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={() => {
                    setShowLeaveModal(false);
                    setModalFilterType(null);
                    setModalTitle('');
                  }}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        );
      })()}

      <RejectionReasonDialog
        open={rejectDialogOpen}
        title="Reject Leave Request"
        description="Please provide a reason for rejection. This will be saved with the request."
        loading={rejectLoading}
        onCancel={() => {
          if (rejectLoading) return;
          setRejectDialogOpen(false);
          setRejectingRequestId(null);
        }}
        onConfirm={handleRejectConfirm}
      />

      {/* Edit Leave Request */}
      <Modal
        isOpen={editDialogOpen}
        onClose={() => {
          if (editLoading) return;
          setEditDialogOpen(false);
          setEditingRow(null);
        }}
        title="Edit Leave Request"
        size="sm"
        footer={
          <div className="flex gap-3 w-full justify-end">
            <Button
              onClick={() => {
                if (editLoading) return;
                setEditDialogOpen(false);
                setEditingRow(null);
              }}
              disabled={editLoading}
              className="bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={editLoading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {editLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
            <Input
              value={editForm.leaveType}
              onChange={(e) => setEditForm((p) => ({ ...p, leaveType: e.target.value }))}
              placeholder="e.g. Casual Leave"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">From *</label>
              <Input
                type="date"
                value={editForm.from}
                onChange={(e) => setEditForm((p) => ({ ...p, from: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">To *</label>
              <Input
                type="date"
                value={editForm.to}
                onChange={(e) => setEditForm((p) => ({ ...p, to: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
            <Textarea
              value={editForm.reason}
              onChange={(e) => setEditForm((p) => ({ ...p, reason: e.target.value }))}
              rows={3}
              placeholder="Reason"
              className="border border-neutral-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
            />
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={deleteDialogOpen}
        onClose={() => {
          if (deleteLoading) return;
          setDeleteDialogOpen(false);
          setDeletingRow(null);
        }}
        title="Delete Leave Request"
        size="sm"
        footer={
          <div className="flex gap-3 w-full justify-end">
            <Button
              onClick={() => {
                if (deleteLoading) return;
                setDeleteDialogOpen(false);
                setDeletingRow(null);
              }}
              disabled={deleteLoading}
              className="bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-neutral-700">
          Are you sure you want to delete this leave request? This action cannot be undone.
        </p>
      </Modal>

      {/* Add Leave Request */}
      <Modal
        isOpen={addDialogOpen}
        onClose={() => {
          if (addLoading) return;
          setAddDialogOpen(false);
        }}
        title="Add Leave Request"
        size="sm"
        footer={
          <div className="flex gap-3 w-full justify-end">
            <Button
              onClick={() => {
                if (addLoading) return;
                setAddDialogOpen(false);
              }}
              disabled={addLoading}
              className="bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSave}
              disabled={addLoading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {addLoading ? 'Saving...' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Employee *</label>
            <Input
              value={addEmployeeSearch}
              onChange={(e) => setAddEmployeeSearch(e.target.value)}
              placeholder="Search employee..."
              className="mb-2"
            />
            <select
              value={addForm.employeeId}
              onChange={(e) => setAddForm((p) => ({ ...p, employeeId: e.target.value }))}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            >
              <option value="">Select employee</option>
              {employees
                .filter((emp) => {
                  const label =
                    (emp.name || emp.firstName || emp.email || emp.employeeId || '') +
                    (emp.employeeId ? ` (${emp.employeeId})` : '');
                  return !addEmployeeSearch || label.toLowerCase().includes(addEmployeeSearch.toLowerCase());
                })
                .map((emp) => (
                  <option key={emp.id || emp.employeeId || emp.email} value={emp.employeeId || ''}>
                    {(emp.name || emp.firstName || emp.email || emp.employeeId) +
                      (emp.employeeId ? ` (${emp.employeeId})` : '')}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type *</label>
            <select
              value={addForm.leaveType}
              onChange={(e) => setAddForm((p) => ({ ...p, leaveType: e.target.value }))}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            >
              <option value="">Select leave type</option>
              {LEAVE_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">From *</label>
              <Input
                type="date"
                value={addForm.from}
                onChange={(e) => setAddForm((p) => ({ ...p, from: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">To *</label>
              <Input
                type="date"
                value={addForm.to}
                onChange={(e) => setAddForm((p) => ({ ...p, to: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
            <Textarea
              value={addForm.reason}
              onChange={(e) => setAddForm((p) => ({ ...p, reason: e.target.value }))}
              rows={3}
              placeholder="Reason"
              className="border border-neutral-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AttendanceLeaveManagePage;

