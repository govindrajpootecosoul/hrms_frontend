'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import { Users, AlertCircle, CheckCircle2, XCircle, Calendar, Settings, Users as UsersIcon, FileText, Plus, Search, Check, X, Edit, Trash2, Download } from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Table from '@/components/common/Table';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import Textarea from '@/components/common/Textarea';
import * as XLSX from 'xlsx';
import RejectionReasonDialog from '@/components/hrms/RejectionReasonDialog';

const LeavesManagePage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leavePolicy, setLeavePolicy] = useState({
    '0-6months': { casualLeave: 0, sickLeave: 3, earnedLeave: 0, compOff: 0 },
    '6-12months': { casualLeave: 6, sickLeave: 6, earnedLeave: 0, compOff: 0 },
    '1year+': { casualLeave: 12, sickLeave: 6, earnedLeave: 10, compOff: 0 }
  });
  const [leaveStats, setLeaveStats] = useState({
    totalOnLeave: 0,
    leaveForApproval: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0
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
  const [loading, setLoading] = useState(true);
  const [policyLoading, setPolicyLoading] = useState(true);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [modalFilterType, setModalFilterType] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  // Debug: Log when leaveRequests changes
  useEffect(() => {
    console.log('[Leave Manage] leaveRequests state changed:', leaveRequests.length, leaveRequests);
  }, [leaveRequests]);

  // Debug: Log when modal state changes
  useEffect(() => {
    console.log('[Leave Manage] Modal state changed:', { 
      showLeaveModal, 
      modalFilterType, 
      modalTitle, 
      leaveRequestsLength: leaveRequests.length 
    });
    if (showLeaveModal && modalFilterType && leaveRequests.length > 0) {
      const filtered = getFilteredLeaveRequests(modalFilterType);
      console.log('[Leave Manage] Modal opened with filtered data:', filtered.length, filtered);
    }
  }, [showLeaveModal, modalFilterType, modalTitle, leaveRequests]);

  // Function to get company name
  const getCompanyName = () => {
    let company = currentCompany?.name;
    if (!company && typeof window !== 'undefined') {
      company = sessionStorage.getItem('selectedCompany') || 
               sessionStorage.getItem('adminSelectedCompany');
    }
    if (!company && companyId && companyId !== 'undefined') {
      if (typeof window !== 'undefined') {
        company = sessionStorage.getItem(`company_${companyId}`);
      }
    }
    return company;
  };

  // Fetch employees list for employee names
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const company = getCompanyName();
        
        const params = new URLSearchParams();
        if (company) {
          params.append('company', company);
        }

        const headers = {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
        if (company) {
          headers['x-company'] = company;
        }

        const res = await fetch(`/api/hrms-portal/employees?${params.toString()}`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setEmployees(json.data.employees || []);
          }
        }
      } catch (err) {
        console.error('Fetch employees error:', err);
      }
    };

    fetchEmployees();
  }, [companyId, currentCompany]);

  // Fetch leave policy
  useEffect(() => {
    const fetchLeavePolicy = async () => {
      try {
        setPolicyLoading(true);
        const token = localStorage.getItem('auth_token');
        const company = getCompanyName();
        
        const params = new URLSearchParams();
        if (company) {
          params.append('company', company);
        }

        const headers = {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
        if (company) {
          headers['x-company'] = company;
        }

        const res = await fetch(`/api/hrms-portal/leave-policy?${params.toString()}`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setLeavePolicy(json.data);
          }
        }
      } catch (err) {
        console.error('Fetch leave policy error:', err);
      } finally {
        setPolicyLoading(false);
      }
    };

    fetchLeavePolicy();
  }, [companyId, currentCompany]);

  // Function to fetch and process leave requests
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const company = getCompanyName();
      
      const params = new URLSearchParams();
      params.append('type', 'time-off');
      params.append('status', statusFilter === 'all' ? 'all' : statusFilter);
      if (company) {
        params.append('company', company);
      }

      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      if (company) {
        headers['x-company'] = company;
      }

      const res = await fetch(`/api/hrms-portal/attendance-requests?${params.toString()}`, {
        headers
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          // Transform attendance requests to leave requests format
          const originalRequests = json.data.requests || [];
          
          console.log('[Leave Manage] Fetched requests:', originalRequests.length, originalRequests);
          
          // Create employee map for name lookup
          const employeeMap = new Map();
          employees.forEach(emp => {
            const empId = emp.employeeId || emp.email?.split('@')[0] || '';
            if (empId) {
              employeeMap.set(empId, emp.name || 'Unknown');
            }
          });
          
          console.log('[Leave Manage] Raw requests from backend:', originalRequests.length, originalRequests);
          
          const requests = originalRequests.map(req => {
            // Parse date range (e.g., "22 Jan - 24 Jan", "2026-01-22 - 2026-01-24", or "2026-01-22 to 2026-01-24")
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
                // If parsing fails, try to extract from string
                duration = 1; // Default to 1 day
              }
            }

            // Get employee name from map
            const employeeName = employeeMap.get(req.employeeId) || req.employeeId || 'Unknown';

            // Determine leave type - use leaveType from backend if available, otherwise default to 'Time Off'
            let leaveType = req.leaveType || 'Time Off';
            
            // If leaveType is not set, try to infer from reason (fallback for old data)
            if (!req.leaveType && req.reason) {
              const reasonLower = req.reason.toLowerCase();
              if (reasonLower.includes('sick') || reasonLower.includes('medical') || reasonLower.includes('recovery')) {
                leaveType = 'Sick Leave';
              } else if (reasonLower.includes('casual') || reasonLower.includes('personal')) {
                leaveType = 'Casual Leave';
              } else if (reasonLower.includes('earned') || reasonLower.includes('vacation')) {
                leaveType = 'Earned Leave';
              } else if (reasonLower.includes('compensatory') || reasonLower.includes('comp off')) {
                leaveType = 'Compensatory Off';
              } else if (reasonLower.includes('lop') || reasonLower.includes('loss of pay')) {
                leaveType = 'LOP';
              }
            }

            return {
              id: req.id,
              employeeName: employeeName,
              employeeId: req.employeeId,
              leaveType: leaveType,
              from: from,
              to: to,
              duration: duration || 1,
              reason: req.reason || '',
              status: req.status === 'pending' ? 'Pending' : 
                      req.status === 'approved' ? 'Approved' : 
                      req.status === 'rejected' ? 'Rejected' : 'Pending',
              dateRange: req.dateRange,
              approvedAt: req.approvedAt,
              rejectedAt: req.rejectedAt,
              submittedAt: req.submittedAt // Include submittedAt for fallback
            };
          });
          
          console.log('[Leave Manage] Processed requests:', requests.length);
          console.log('[Leave Manage] Sample processed request:', requests[0]);
          console.log('[Leave Manage] Approved requests:', requests.filter(r => {
            const status = r.status || '';
            return status.toLowerCase() === 'approved';
          }));
          
          setLeaveRequests(requests);

          // Calculate stats
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          const totalOnLeave = requests.filter(r => 
            r.status === 'Approved' && 
            r.from && r.to &&
            new Date(r.from) <= now && new Date(r.to) >= now
          ).length;

          const leaveForApproval = requests.filter(r => r.status === 'Pending').length;
          
          // Helper function to check if approved this month (same logic as getFilteredLeaveRequests)
          const checkApprovedThisMonth = (r) => {
            if (r.status !== 'Approved') return false;
            
            // Try to use approvedAt if available
            if (r.approvedAt) {
              try {
                const approvedDate = r.approvedAt instanceof Date 
                  ? r.approvedAt 
                  : new Date(r.approvedAt);
                if (!isNaN(approvedDate.getTime())) {
                  return approvedDate.getMonth() === currentMonth && 
                         approvedDate.getFullYear() === currentYear;
                }
              } catch (e) {
                // Continue to fallback
              }
            }
            
            // Fallback: check if the leave request date range falls in current month
            if (r.from) {
              try {
                const fromDate = new Date(r.from);
                if (!isNaN(fromDate.getTime())) {
                  return fromDate.getMonth() === currentMonth && 
                         fromDate.getFullYear() === currentYear;
                }
              } catch (e) {
                // Continue to fallback
              }
            }
            
            // If no date available, check dateRange
            if (r.dateRange) {
              try {
                const parts = r.dateRange.split(' - ');
                if (parts.length > 0) {
                  const dateStr = parts[0].trim();
                  const checkDate = new Date(dateStr);
                  if (!isNaN(checkDate.getTime())) {
                    return checkDate.getMonth() === currentMonth && 
                           checkDate.getFullYear() === currentYear;
                  }
                }
              } catch (e) {
                // Return false if all parsing fails
              }
            }
            
            // Last resort: if status is approved and we have submittedAt, use that
            if (r.submittedAt) {
              try {
                const submittedDate = r.submittedAt instanceof Date 
                  ? r.submittedAt 
                  : new Date(r.submittedAt);
                if (!isNaN(submittedDate.getTime())) {
                  return submittedDate.getMonth() === currentMonth && 
                         submittedDate.getFullYear() === currentYear;
                }
              } catch (e) {
                // Return false if all parsing fails
              }
            }
            
            return false;
          };

          const checkRejectedThisMonth = (r) => {
            if (r.status !== 'Rejected') return false;
            
            // Try to use rejectedAt if available
            if (r.rejectedAt) {
              try {
                const rejectedDate = new Date(r.rejectedAt);
                if (!isNaN(rejectedDate.getTime())) {
                  return rejectedDate.getMonth() === currentMonth && 
                         rejectedDate.getFullYear() === currentYear;
                }
              } catch (e) {
                // Continue to fallback
              }
            }
            
            // Fallback: check if the leave request date range falls in current month
            if (r.from) {
              try {
                const fromDate = new Date(r.from);
                if (!isNaN(fromDate.getTime())) {
                  return fromDate.getMonth() === currentMonth && 
                         fromDate.getFullYear() === currentYear;
                }
              } catch (e) {
                // Continue to fallback
              }
            }
            
            // If no date available, check dateRange
            if (r.dateRange) {
              try {
                const parts = r.dateRange.split(' - ');
                if (parts.length > 0) {
                  const dateStr = parts[0].trim();
                  const checkDate = new Date(dateStr);
                  if (!isNaN(checkDate.getTime())) {
                    return checkDate.getMonth() === currentMonth && 
                           checkDate.getFullYear() === currentYear;
                  }
                }
              } catch (e) {
                // Return false if all parsing fails
              }
            }
            
            return false;
          };

          const approvedThisMonth = requests.filter(checkApprovedThisMonth).length;
          const rejectedThisMonth = requests.filter(checkRejectedThisMonth).length;
          
          console.log('[Leave Manage] Stats calculated:', {
            totalOnLeave,
            leaveForApproval,
            approvedThisMonth,
            rejectedThisMonth,
            totalRequests: requests.length,
            approvedRequests: requests.filter(r => r.status === 'Approved').length
          });

          setLeaveStats({
            totalOnLeave,
            leaveForApproval,
            approvedThisMonth,
            rejectedThisMonth
          });
        }
      }
    } catch (err) {
      console.error('Fetch leave requests error:', err);
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  // Fetch leave requests (time-off requests from attendance requests)
  useEffect(() => {
    fetchLeaveRequests();
  }, [statusFilter, companyId, currentCompany, employees, toast]);

  // Filter leave requests
  const filteredRequests = leaveRequests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'all' || request.leaveType.toLowerCase().includes(typeFilter.toLowerCase());
    const matchesSearch = !searchQuery || 
      request.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.leaveType?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // If it's not a valid date, try to parse as string format
        return dateStr;
      }
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}, ${date.getFullYear()}`;
    } catch (e) {
      return dateStr; // Return as-is if parsing fails
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Approved': 'bg-green-100 text-green-800 border-green-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  // Handle approve/reject actions
  const handleApprove = async (requestId) => {
    if (!requestId) {
      toast.error('Invalid request ID. Please refresh the page and try again.');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const company = getCompanyName();
      
      console.log('[Leave Manage] Approving request:', requestId, 'for company:', company);
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      if (company) {
        headers['x-company'] = company;
      }

      const res = await fetch(`/api/hrms-portal/attendance-requests/${requestId}/approve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ approvedBy: 'Admin' })
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success('Leave request approved successfully');
        // Refresh data by refetching
        await fetchLeaveRequests();
      } else {
        const errorMessage = json.error || json.message || 'Failed to approve request';
        console.error('[Leave Manage] Approve error:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error('Approve request error:', err);
      const errorMessage = err.message || 'An error occurred while approving the request. Please try again.';
      toast.error(errorMessage);
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
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      if (company) {
        headers['x-company'] = company;
      }

      const res = await fetch(`/api/hrms-portal/attendance-requests/${requestId}/reject`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          rejectedBy: 'Admin',
          rejectionReason 
        })
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success('Leave request rejected');
        setRejectDialogOpen(false);
        setRejectingRequestId(null);
        // Refresh data by refetching
        await fetchLeaveRequests();
      } else {
        toast.error(json.error || 'Failed to reject request');
      }
    } catch (err) {
      console.error('Reject request error:', err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setRejectLoading(false);
    }
  };

  const openEditDialog = (row) => {
    if (!row?.id) return;
    if (row.status !== 'Pending') {
      toast.info('Only pending requests can be edited');
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
      toast.error('From and To dates are required');
      return;
    }

    try {
      setEditLoading(true);
      const token = localStorage.getItem('auth_token');
      const company = getCompanyName();

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      if (company) headers['x-company'] = company;

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
        toast.success('Leave request updated');
        setEditDialogOpen(false);
        setEditingRow(null);
        await fetchLeaveRequests();
      } else {
        toast.error(json.error || 'Failed to update request');
      }
    } catch (err) {
      console.error('Edit request error:', err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const openDeleteDialog = (row) => {
    if (!row?.id) return;
    if (row.status !== 'Pending') {
      toast.info('Only pending requests can be deleted');
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
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      if (company) headers['x-company'] = company;

      const res = await fetch(`/api/hrms-portal/attendance-requests/${deletingRow.id}`, {
        method: 'DELETE',
        headers,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Leave request deleted');
        setDeleteDialogOpen(false);
        setDeletingRow(null);
        await fetchLeaveRequests();
      } else {
        toast.error(json.error || 'Failed to delete request');
      }
    } catch (err) {
      console.error('Delete request error:', err);
      toast.error('An error occurred. Please try again.');
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

    if (!employeeId) return toast.error('Employee is required');
    if (!leaveType) return toast.error('Leave Type is required');
    if (!from || !to) return toast.error('From and To dates are required');

    try {
      setAddLoading(true);
      const token = localStorage.getItem('auth_token');
      const company = getCompanyName();

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      if (company) headers['x-company'] = company;

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
        toast.success('Leave request created');
        setAddDialogOpen(false);
        await fetchLeaveRequests();
      } else {
        toast.error(json.error || 'Failed to create request');
      }
    } catch (err) {
      console.error('Add request error:', err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  // Helper function to check if a request is approved this month (same logic as stats)
  const isApprovedThisMonth = (req, currentMonth, currentYear) => {
    // Check status (handle both 'Approved' and 'approved')
    const status = req.status || '';
    if (status.toLowerCase() !== 'approved') {
      return false;
    }
    
    console.log('[Leave Manage] Checking approved request:', {
      id: req.id,
      status: req.status,
      approvedAt: req.approvedAt,
      from: req.from,
      dateRange: req.dateRange,
      currentMonth,
      currentYear
    });
    
    // Try to use approvedAt if available
    if (req.approvedAt) {
      try {
        // Handle both Date objects and strings
        const approvedDate = req.approvedAt instanceof Date 
          ? req.approvedAt 
          : new Date(req.approvedAt);
        
        if (!isNaN(approvedDate.getTime())) {
          const month = approvedDate.getMonth();
          const year = approvedDate.getFullYear();
          const matches = month === currentMonth && year === currentYear;
          console.log('[Leave Manage] approvedAt check:', {
            approvedDate: approvedDate.toISOString(),
            month,
            year,
            currentMonth,
            currentYear,
            matches
          });
          if (matches) return true;
        }
      } catch (e) {
        console.log('[Leave Manage] Error parsing approvedAt:', e);
      }
    }
    
    // Fallback: check if the leave request date range falls in current month
    if (req.from) {
      try {
        const fromDate = new Date(req.from);
        if (!isNaN(fromDate.getTime())) {
          const month = fromDate.getMonth();
          const year = fromDate.getFullYear();
          const matches = month === currentMonth && year === currentYear;
          console.log('[Leave Manage] from date check:', {
            fromDate: fromDate.toISOString(),
            month,
            year,
            currentMonth,
            currentYear,
            matches
          });
          if (matches) return true;
        }
      } catch (e) {
        console.log('[Leave Manage] Error parsing from date:', e);
      }
    }
    
    // If no date available, check dateRange
    if (req.dateRange) {
      try {
        const parts = req.dateRange.split(' - ');
        if (parts.length > 0) {
          const dateStr = parts[0].trim();
          const checkDate = new Date(dateStr);
          if (!isNaN(checkDate.getTime())) {
            const month = checkDate.getMonth();
            const year = checkDate.getFullYear();
            const matches = month === currentMonth && year === currentYear;
            console.log('[Leave Manage] dateRange check:', {
              dateStr,
              checkDate: checkDate.toISOString(),
              month,
              year,
              currentMonth,
              currentYear,
              matches
            });
            if (matches) return true;
          }
        }
      } catch (e) {
        console.log('[Leave Manage] Error parsing dateRange:', e);
      }
    }
    
    // Last resort: if status is approved and we have submittedAt, use that
    if (req.submittedAt) {
      try {
        const submittedDate = req.submittedAt instanceof Date 
          ? req.submittedAt 
          : new Date(req.submittedAt);
        if (!isNaN(submittedDate.getTime())) {
          const month = submittedDate.getMonth();
          const year = submittedDate.getFullYear();
          const matches = month === currentMonth && year === currentYear;
          console.log('[Leave Manage] submittedAt check:', {
            submittedDate: submittedDate.toISOString(),
            month,
            year,
            currentMonth,
            currentYear,
            matches
          });
          if (matches) return true;
        }
      } catch (e) {
        console.log('[Leave Manage] Error parsing submittedAt:', e);
      }
    }
    
    console.log('[Leave Manage] Request does not match approved this month filter');
    return false;
  };

  // Helper function to check if a request is rejected this month
  const isRejectedThisMonth = (req, currentMonth, currentYear) => {
    if (req.status !== 'Rejected') return false;
    
    // Try to use rejectedAt if available
    if (req.rejectedAt) {
      try {
        const rejectedDate = new Date(req.rejectedAt);
        if (!isNaN(rejectedDate.getTime())) {
          return rejectedDate.getMonth() === currentMonth && 
                 rejectedDate.getFullYear() === currentYear;
        }
      } catch (e) {
        // Continue to fallback
      }
    }
    
    // Fallback: check if the leave request date range falls in current month
    if (req.from) {
      try {
        const fromDate = new Date(req.from);
        if (!isNaN(fromDate.getTime())) {
          return fromDate.getMonth() === currentMonth && 
                 fromDate.getFullYear() === currentYear;
        }
      } catch (e) {
        // Continue to fallback
      }
    }
    
    // If no date available, check dateRange
    if (req.dateRange) {
      try {
        const parts = req.dateRange.split(' - ');
        if (parts.length > 0) {
          const dateStr = parts[0].trim();
          const checkDate = new Date(dateStr);
          if (!isNaN(checkDate.getTime())) {
            return checkDate.getMonth() === currentMonth && 
                   checkDate.getFullYear() === currentYear;
          }
        }
      } catch (e) {
        // Return false if all parsing fails
      }
    }
    
    return false;
  };

  // Get filtered leave requests based on card type
  const getFilteredLeaveRequests = (filterType) => {
    if (!filterType || !leaveRequests || leaveRequests.length === 0) {
      console.log('[Leave Manage] No filterType or no leaveRequests:', { filterType, leaveRequestsLength: leaveRequests?.length });
      return [];
    }
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    console.log('[Leave Manage] Filtering with:', { filterType, totalRequests: leaveRequests.length, currentMonth, currentYear });

    switch (filterType) {
      case 'total-on-leave':
        return leaveRequests.filter(req => 
          req.status === 'Approved' && 
          req.from && req.to &&
          new Date(req.from) <= now && new Date(req.to) >= now
        );
      
      case 'leave-for-approval':
        return leaveRequests.filter(req => req.status === 'Pending');
      
      case 'approved-this-month':
        const approved = leaveRequests.filter(req => {
          const result = isApprovedThisMonth(req, currentMonth, currentYear);
          return result;
        });
        console.log('[Leave Manage] Approved this month filtered:', approved.length, approved);
        
        // If no results but we have approved requests, show all approved as fallback
        if (approved.length === 0) {
          const allApproved = leaveRequests.filter(req => {
            const status = req.status || '';
            return status.toLowerCase() === 'approved';
          });
          console.log('[Leave Manage] No date-matched approved requests, showing all approved:', allApproved.length);
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
    console.log('[Leave Manage] ===== CARD CLICKED =====');
    console.log('[Leave Manage] Card clicked:', filterType, title);
    console.log('[Leave Manage] Total leave requests:', leaveRequests.length);
    console.log('[Leave Manage] Sample request:', leaveRequests[0]);
    console.log('[Leave Manage] Current modal state before:', { showLeaveModal, modalFilterType, modalTitle });
    
    if (!filterType) {
      console.error('[Leave Manage] No filterType provided!');
      return;
    }
    
    const filtered = getFilteredLeaveRequests(filterType);
    console.log('[Leave Manage] Filtered requests:', filtered.length, filtered);
    
    setModalFilterType(filterType);
    setModalTitle(title);
    setShowLeaveModal(true);
    
    console.log('[Leave Manage] Modal state set:', { filterType, title, showModal: true });
    console.log('[Leave Manage] ===== END CARD CLICK =====');
  };

  // Export to Excel
  const handleExportToExcel = () => {
    try {
      const filteredData = getFilteredLeaveRequests(modalFilterType);
      
      if (filteredData.length === 0) {
        toast.error('No data to export');
        return;
      }

      // Prepare data for Excel
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

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 8 },  // S.No
        { wch: 20 }, // Employee Name
        { wch: 15 }, // Employee ID
        { wch: 18 }, // Leave Type
        { wch: 12 }, // From Date
        { wch: 12 }, // To Date
        { wch: 12 }, // Duration
        { wch: 30 }, // Reason
        { wch: 12 }, // Status
        { wch: 15 }  // Applied Date
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Leave Requests');

      // Generate filename with current date
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `${modalTitle.replace(/\s+/g, '_')}_${dateStr}.xlsx`;

      // Write file
      XLSX.writeFile(wb, filename);
      
      toast.success('Excel file exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel file');
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
                console.log('[Leave Manage] ===== CARD CLICKED =====', kpi.title, filterType);
                e.preventDefault();
                e.stopPropagation();
                
                if (!filterType) {
                  console.warn('[Leave Manage] No filterType for:', kpi.title);
                  return;
                }
                
                console.log('[Leave Manage] Calling handleCardClick');
                handleCardClick(filterType, kpi.title);
                console.log('[Leave Manage] ===== CLICK HANDLED =====');
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (filterType && typeof handleCardClick === 'function') {
                    handleCardClick(filterType, kpi.title);
                  }
                }
              }}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${kpi.gradient} shadow-lg ${filterType ? 'cursor-pointer hover:scale-105 transition-transform duration-200 active:scale-95' : ''}`}
              style={{ zIndex: 1, position: 'relative' }}
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
          >
            Configure Leave Policy
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {policyLoading ? (
            <div className="col-span-3 text-center py-8 text-slate-600">Loading leave policy...</div>
          ) : [
            {
              tenure: '0-6 Months',
              key: '0-6months',
              borderColor: 'border-blue-200',
              bgColor: 'bg-blue-50',
              iconColor: 'text-blue-600',
              policies: [
                { type: 'Casual Leave', days: leavePolicy['0-6months']?.casualLeave || 0 },
                { type: 'Sick Leave', days: leavePolicy['0-6months']?.sickLeave || 3 },
                { type: 'Earned Leave', days: leavePolicy['0-6months']?.earnedLeave || 0 },
                { type: 'Compensatory Off', days: leavePolicy['0-6months']?.compOff || 0 }
              ]
            },
            {
              tenure: '6-12 Months',
              key: '6-12months',
              borderColor: 'border-green-200',
              bgColor: 'bg-green-50',
              iconColor: 'text-green-600',
              policies: [
                { type: 'Casual Leave', days: leavePolicy['6-12months']?.casualLeave || 6 },
                { type: 'Sick Leave', days: leavePolicy['6-12months']?.sickLeave || 6 },
                { type: 'Earned Leave', days: leavePolicy['6-12months']?.earnedLeave || 0 },
                { type: 'Compensatory Off', days: leavePolicy['6-12months']?.compOff || 0 }
              ]
            },
            {
              tenure: '1 Year+',
              key: '1year+',
              borderColor: 'border-purple-200',
              bgColor: 'bg-purple-50',
              iconColor: 'text-purple-600',
              policies: [
                { type: 'Casual Leave', days: leavePolicy['1year+']?.casualLeave || 12 },
                { type: 'Sick Leave', days: leavePolicy['1year+']?.sickLeave || 6 },
                { type: 'Earned Leave', days: leavePolicy['1year+']?.earnedLeave || 10 },
                { type: 'Compensatory Off', days: leavePolicy['1year+']?.compOff || 0 }
              ]
            }
          ].map((tenure, index) => (
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

      {/* Leave Requests Modal */}
      {showLeaveModal && modalFilterType && (() => {
        const filtered = getFilteredLeaveRequests(modalFilterType);
        console.log('[Leave Manage] ===== MODAL RENDERING =====');
        console.log('[Leave Manage] Modal rendering with filtered data:', filtered.length, filtered);
        console.log('[Leave Manage] Modal state:', { showLeaveModal, modalFilterType, modalTitle });
        console.log('[Leave Manage] Total leaveRequests:', leaveRequests.length);
        console.log('[Leave Manage] ===== END MODAL RENDER =====');
        
        return (
          <Modal
            isOpen={showLeaveModal}
            onClose={() => {
              console.log('[Leave Manage] Closing modal');
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

export default LeavesManagePage;
