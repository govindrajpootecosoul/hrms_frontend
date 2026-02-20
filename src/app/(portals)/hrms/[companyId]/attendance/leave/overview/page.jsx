'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import { Users, AlertCircle, CheckCircle2, XCircle, Calendar, Stethoscope, Star, FileText, Home, Ban, Download } from 'lucide-react';
import BarGraph from '@/components/charts/BarGraph';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Table from '@/components/common/Table';
import * as XLSX from 'xlsx';

const AttendanceLeaveOverviewPage = () => {
  const params = useParams();
  const companyId = params?.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast?.() || { error: () => {}, success: () => {} };
  
  const [leaveStats, setLeaveStats] = useState({
    totalOnLeave: 0,
    leaveForApproval: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0
  });
  
  const [leaveUtilizationData, setLeaveUtilizationData] = useState([
    { name: 'Utilized', data: [] },
    { name: 'Remaining', data: [] }
  ]);
  
  const [employeeNames, setEmployeeNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [modalFilterType, setModalFilterType] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Get company name helper function (same as manage page)
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

  // Debug: Log when leaveRequests changes
  useEffect(() => {
    console.log('[Leave Overview] leaveRequests state changed:', leaveRequests.length, leaveRequests);
  }, [leaveRequests]);

  // Debug: Log when modal state changes
  useEffect(() => {
    console.log('[Leave Overview] Modal state changed:', { showLeaveModal, modalFilterType, modalTitle, leaveRequestsLength: leaveRequests.length });
    if (showLeaveModal && modalFilterType && leaveRequests.length > 0) {
      // Calculate filtered data inline to avoid dependency issues
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      let filtered = [];
      if (modalFilterType === 'approved-this-month') {
        filtered = leaveRequests.filter(req => {
          const status = req.status || '';
          if (status.toLowerCase() !== 'approved') return false;
          
          // Try approvedAt
          if (req.approvedAt) {
            try {
              const approvedDate = req.approvedAt instanceof Date ? req.approvedAt : new Date(req.approvedAt);
              if (!isNaN(approvedDate.getTime()) && approvedDate.getMonth() === currentMonth && approvedDate.getFullYear() === currentYear) {
                return true;
              }
            } catch (e) {}
          }
          
          // Fallback to from date
          if (req.from) {
            try {
              const fromDate = new Date(req.from);
              if (!isNaN(fromDate.getTime()) && fromDate.getMonth() === currentMonth && fromDate.getFullYear() === currentYear) {
                return true;
              }
            } catch (e) {}
          }
          
          // Fallback to dateRange
          if (req.dateRange) {
            try {
              const parts = req.dateRange.split(' - ');
              if (parts.length > 0) {
                const checkDate = new Date(parts[0].trim());
                if (!isNaN(checkDate.getTime()) && checkDate.getMonth() === currentMonth && checkDate.getFullYear() === currentYear) {
                  return true;
                }
              }
            } catch (e) {}
          }
          
          return false;
        });
        
        // If no date-matched, show all approved
        if (filtered.length === 0) {
          filtered = leaveRequests.filter(req => {
            const status = req.status || '';
            return status.toLowerCase() === 'approved';
          });
        }
      }
      
      console.log('[Leave Overview] Modal opened with filtered data:', filtered.length, filtered);
    }
  }, [showLeaveModal, modalFilterType, modalTitle, leaveRequests]);

  // Fetch employees list
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const company = currentCompany?.name || companyId;
        
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
        console.error('[Leave Overview] Failed to fetch stats:', res.status);
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
        console.log('[Leave Overview] Fetched stats from API:', json.data);
      }
    } catch (err) {
      console.error('[Leave Overview] Fetch stats error:', err);
    }
  };

  // Fetch leave requests
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const company = getCompanyName();
        
        const params = new URLSearchParams();
        params.append('type', 'time-off');
        params.append('status', 'all');
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
            
            // Create employee map for name lookup
            const employeeMap = new Map();
            employees.forEach(emp => {
              const empId = emp.employeeId || emp.email?.split('@')[0] || '';
              if (empId) {
                employeeMap.set(empId, emp.name || emp.firstName || 'Unknown');
              }
            });
            
            console.log('[Leave Overview] Raw requests from backend:', originalRequests.length, originalRequests);
            console.log('[Leave Overview] Employee map size:', employeeMap.size);
            
            const requests = originalRequests.map(req => {
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
                    duration = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
                  } else {
                    // If parsing fails, try to keep original values but set duration to 1
                    duration = 1;
                  }
                } catch (e) {
                  duration = 1;
                }
              }

              const employeeName = employeeMap.get(req.employeeId) || req.employeeId || req.employeeName || 'Unknown';

              return {
                id: req.id,
                employeeName: employeeName,
                employeeId: req.employeeId,
                leaveType: req.leaveType || 'Time Off',
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
            
            console.log('[Leave Overview] Processed requests:', requests.length);
            console.log('[Leave Overview] Sample processed request:', requests[0]);
            console.log('[Leave Overview] Approved requests:', requests.filter(r => {
              const status = r.status || '';
              return status.toLowerCase() === 'approved';
            }));
            
            setLeaveRequests(requests);
      } catch (err) {
        console.error('[Leave Overview] Fetch leave requests error:', err);
        toast?.error?.('Failed to load leave requests');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchLeaveRequests();
    fetchLeaveStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, currentCompany, employees]);

  // Fetch stats separately when needed
  useEffect(() => {
    fetchLeaveStats();
  }, [companyId, currentCompany]);

  // Fetch leave overview data
  useEffect(() => {
    const fetchLeaveOverview = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        
        // Get company name from multiple sources
        let company = currentCompany?.name;
        if (!company && typeof window !== 'undefined') {
          company = sessionStorage.getItem('selectedCompany') || 
                   sessionStorage.getItem('adminSelectedCompany');
        }
        // If still no company and companyId is a number, try to map it
        if (!company && companyId && companyId !== 'undefined') {
          // Try to get from sessionStorage with companyId key
          if (typeof window !== 'undefined') {
            company = sessionStorage.getItem(`company_${companyId}`);
          }
        }
        
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
        
        console.log('[Leave Overview] Fetching with company:', company);

        // Only fetch utilization data - stats are now calculated from leaveRequests
        const utilizationRes = await fetch(`/api/hrms-portal/leaves/overview/utilization?${params.toString()}`, { headers });

        if (utilizationRes.ok) {
          const utilJson = await utilizationRes.json();
          if (utilJson.success && utilJson.data.utilization) {
            const utilization = utilJson.data.utilization;
            const names = utilization.map(item => item.employee);
            const utilized = utilization.map(item => item.utilized);
            const remaining = utilization.map(item => item.remaining);
            
            setEmployeeNames(names);
            setLeaveUtilizationData([
              { name: 'Utilized', data: utilized },
              { name: 'Remaining', data: remaining }
            ]);
          }
        }
      } catch (err) {
        console.error('Fetch leave overview error:', err);
        toast.error('Failed to load leave overview data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveOverview();
  }, [companyId, currentCompany, toast]);

  // Leave Policy items
  const leavePolicyItems = [
    {
      id: 'casual-leave',
      title: 'Casual Leave',
      description: 'Annual leave entitlement by category',
      days: '12 days/year',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      id: 'sick-leave',
      title: 'Sick Leave',
      description: 'Paid leave for medical reasons',
      days: '6 days/year',
      icon: Stethoscope,
      color: 'text-green-600'
    },
    {
      id: 'earned-leave',
      title: 'Earned Leave',
      description: 'Accrued based on tenure',
      days: '10 days/year',
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      id: 'compensatory-off',
      title: 'Compensatory Off',
      description: 'Time off in lieu of extra work',
      days: '0 days/year',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      id: 'work-from-home',
      title: 'Work From Home',
      description: 'Flexible remote work policy',
      days: 'Unlimited*',
      icon: Home,
      color: 'text-indigo-600'
    },
    {
      id: 'loss-of-pay',
      title: 'Loss of Pay (LOP)',
      description: 'Unpaid leave as per policy',
      days: 'As per policy',
      icon: Ban,
      color: 'text-red-600'
    }
  ];

  // Helper function to check if a request is approved this month
  const isApprovedThisMonth = (req, currentMonth, currentYear) => {
    // Check status (handle both 'Approved' and 'approved')
    const status = req.status || '';
    if (status.toLowerCase() !== 'approved') {
      return false;
    }
    
    // Try to use approvedAt if available
    if (req.approvedAt) {
      try {
        const approvedDate = req.approvedAt instanceof Date 
          ? req.approvedAt 
          : new Date(req.approvedAt);
        if (!isNaN(approvedDate.getTime())) {
          return approvedDate.getMonth() === currentMonth && 
                 approvedDate.getFullYear() === currentYear;
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
    
    // Last resort: if status is approved and we have submittedAt, use that
    if (req.submittedAt) {
      try {
        const submittedDate = req.submittedAt instanceof Date 
          ? req.submittedAt 
          : new Date(req.submittedAt);
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

  // Helper function to check if a request is rejected this month
  const isRejectedThisMonth = (req, currentMonth, currentYear) => {
    // Check status (handle both 'Rejected' and 'rejected')
    const status = req.status || '';
    if (status.toLowerCase() !== 'rejected') {
      return false;
    }
    
    // Try to use rejectedAt if available
    if (req.rejectedAt) {
      try {
        const rejectedDate = req.rejectedAt instanceof Date 
          ? req.rejectedAt 
          : new Date(req.rejectedAt);
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
      console.log('[Leave Overview] No filterType or no leaveRequests:', { filterType, leaveRequestsLength: leaveRequests?.length });
      return [];
    }
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    console.log('[Leave Overview] Filtering with:', { filterType, totalRequests: leaveRequests.length, currentMonth, currentYear });

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
        console.log('[Leave Overview] Approved this month filtered:', approved.length, approved);
        
        // If no results but we have approved requests, show all approved as fallback
        if (approved.length === 0) {
          const allApproved = leaveRequests.filter(req => {
            const status = req.status || '';
            return status.toLowerCase() === 'approved';
          });
          console.log('[Leave Overview] No date-matched approved requests, showing all approved:', allApproved.length);
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
    console.log('[Leave Overview] Card clicked!', { filterType, title });
    console.log('[Leave Overview] Current leaveRequests:', leaveRequests.length, leaveRequests);
    console.log('[Leave Overview] Current modalFilterType:', modalFilterType);
    
    setModalFilterType(filterType);
    setModalTitle(title);
    setShowLeaveModal(true);
    
    // Log after state update (will be in next render)
    setTimeout(() => {
      const filtered = getFilteredLeaveRequests(filterType);
      console.log('[Leave Overview] Filtered results after click:', filtered.length, filtered);
    }, 100);
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

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}, ${date.getFullYear()}`;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    if (status === 'Approved') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (status === 'Rejected') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Show loading state if companyId is not available yet
  if (!companyId || companyId === 'undefined') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

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
                e.preventDefault();
                e.stopPropagation();
                console.log('[Leave Overview] Card div clicked directly!', { filterType, title: kpi.title, value: kpi.value });
                if (filterType) {
                  console.log('[Leave Overview] Calling handleCardClick with:', { filterType, title: kpi.title });
                  handleCardClick(filterType, kpi.title);
                } else {
                  console.log('[Leave Overview] No filterType, skipping');
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

      {/* Leave Policy List + Yearly Utilization Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Leave Policy List - Left */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Leave Policy</h2>
                <p className="text-sm text-slate-600 mt-1">Annual leave entitlements by category</p>
              </div>
              <Button
                size="sm"
                className="bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                icon={<FileText className="w-4 h-4" />}
              >
                Edit Policy
              </Button>
            </div>
            <div className="space-y-3">
              {leavePolicyItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg bg-neutral-100 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                    </div>
                    <div className="text-sm font-medium text-slate-900">{item.days}</div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-4">
              * WFH subject to manager approval and business requirements
            </p>
          </Card>
        </div>

        {/* Bar Chart - Right */}
        <div className="lg:col-span-2">
          <Card className="border-2 p-6">
            {loading ? (
              <div className="flex items-center justify-center h-[460px]">
                <div className="text-slate-600">Loading leave utilization data...</div>
              </div>
            ) : employeeNames.length === 0 ? (
              <div className="flex items-center justify-center h-[460px]">
                <div className="text-slate-600">No leave utilization data available</div>
              </div>
            ) : (
              <BarGraph
                title="Yearly Leave Utilization"
                subtitle="Leave utilization per employee for current year"
                data={leaveUtilizationData}
                categories={employeeNames}
                seriesName="Days"
                height={460}
                colors={['#ef4444', '#10b981']}
                showGrid={true}
                showLegend={true}
                stacked={true}
                horizontal={false}
                dataLabels={false}
                yAxisTitle="Days"
                xAxisTitle=""
              />
            )}
          </Card>
        </div>
      </div>

      {/* Leave Requests Modal */}
      {showLeaveModal && modalFilterType && (
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
            {(() => {
              const filtered = getFilteredLeaveRequests(modalFilterType);
              console.log('[Leave Overview] Modal rendering with filtered data:', filtered.length, filtered);
              return (
                <>
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
                </>
              );
            })()}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AttendanceLeaveOverviewPage;




