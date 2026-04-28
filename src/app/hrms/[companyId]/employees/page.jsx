'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import * as XLSX from 'xlsx';
import { 
  Plus, 
  Search, 
  List, 
  LayoutGrid,
  MoreVertical,
  Sparkles,
  Users,
  UserCheck,
  Building2,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  Download,
  Upload,
  Eye,
  UserX,
  Columns3,
  GripVertical,
  X
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import AddEmployeeDialog from './components/AddEmployeeDialog';
import ConfirmationDialog from './components/ConfirmationDialog';
import ViewEmployeeDetailsDialog from './components/ViewEmployeeDetailsDialog';
import { API_BASE_URL } from '@/lib/utils/constants';
import { useAuth } from '@/lib/context/AuthContext';
import { getCompanyFromEmail } from '@/lib/config/database.config';

export default function EmployeesPage() {
  const params = useParams();
  const companyId = params?.companyId;
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';
  const [searchQuery, setSearchQuery] = useState('');
  const [empCodeQuery, setEmpCodeQuery] = useState('');
  const [empCodeSortDirection] = useState('asc'); // 'none' | 'asc' | 'desc'
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null); // Track which employee's menu is open
  const [dropdownDirection, setDropdownDirection] = useState('down'); // 'up' or 'down'
  const [statusEditEmployeeId, setStatusEditEmployeeId] = useState(null);
  const [statusSavingByEmployeeId, setStatusSavingByEmployeeId] = useState({});
  /** 'current' = active employees only; 'ex' = inactive (former employees) */
  const [rosterTab, setRosterTab] = useState('current');
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);
  const columnsButtonRef = useRef(null);
  const [listColumnState, setListColumnState] = useState([]);
  const [inlineEdit, setInlineEdit] = useState(null); // { employeeId, field, value }
  const [inlineSavingByKey, setInlineSavingByKey] = useState({}); // { `${empId}:${field}`: boolean }
  const [inactiveDialog, setInactiveDialog] = useState({
    open: false,
    employee: null,
    exitDate: '',
  });
  
  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState({ open: false, employee: null });
  const [successDialog, setSuccessDialog] = useState({ open: false, message: '' });
  const [errorDialog, setErrorDialog] = useState({ open: false, message: '' });
  const [infoDialog, setInfoDialog] = useState({ open: false, message: '' });
  const [viewDetailsDialog, setViewDetailsDialog] = useState({ open: false, employee: null });

  // Debug: Log when dialog state changes
  useEffect(() => {
    console.log('[EmployeesPage] Dialog state changed:', {
      isAddDialogOpen,
      employeeToEdit: employeeToEdit ? {
        id: employeeToEdit.id,
        _id: employeeToEdit._id,
        name: employeeToEdit.name,
        email: employeeToEdit.email
      } : null
    });
  }, [isAddDialogOpen, employeeToEdit]);

  // Check dropdown position when it opens
  useEffect(() => {
    if (actionMenuOpen && typeof window !== 'undefined') {
      const button = document.querySelector(`[data-action-button-id="${actionMenuOpen}"]`);
      if (button) {
        const rect = button.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = 100; // Approximate dropdown height
        
        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
          setDropdownDirection('up');
        } else {
          setDropdownDirection('down');
        }
      }
    }
  }, [actionMenuOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuOpen) {
        const dropdown = document.querySelector('[data-dropdown-menu]');
        const button = document.querySelector(`[data-action-button-id="${actionMenuOpen}"]`);
        
        if (dropdown && button) {
          const isClickInsideDropdown = dropdown.contains(event.target);
          const isClickOnButton = button.contains(event.target);
          
          if (!isClickInsideDropdown && !isClickOnButton) {
            setActionMenuOpen(null);
          }
        }
      }

      if (statusEditEmployeeId) {
        const statusEditor = document.querySelector('[data-status-editor]');
        const statusButton = document.querySelector(`[data-status-button-id="${statusEditEmployeeId}"]`);
        if (statusEditor && statusButton) {
          const isClickInsideEditor = statusEditor.contains(event.target);
          const isClickOnButton = statusButton.contains(event.target);
          if (!isClickInsideEditor && !isClickOnButton) {
            setStatusEditEmployeeId(null);
          }
        } else {
          setStatusEditEmployeeId(null);
        }
      }
    };

    if (actionMenuOpen || statusEditEmployeeId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [actionMenuOpen, statusEditEmployeeId]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeCompanyName = (value) => {
    if (!value) return null;
    const raw = String(value).trim();
    if (!raw || raw === 'undefined' || raw === 'null') return null;

    const lc = raw.toLowerCase();
    if (lc === '1' || lc === 'ecosoul' || lc === 'eco soul' || lc === 'ecosoul home') {
      return 'Ecosoul Home';
    }
    if (lc === '2' || lc === 'thrive' || lc === 'thrive brands' || lc === 'thrivebrands') {
      return 'Thrive';
    }
    return raw;
  };

  const resolveCompanyName = () => {
    const companyFromEmail = normalizeCompanyName(getCompanyFromEmail(user?.email));
    if (companyFromEmail) return companyFromEmail;

    const normalizedCompanyId = normalizeCompanyName(companyId);
    if (typeof window === 'undefined') return normalizedCompanyId;

    // Prefer company tied to current route id to avoid stale session values.
    const routeMappedCompany = normalizeCompanyName(sessionStorage.getItem(`company_${companyId}`));
    if (routeMappedCompany) return routeMappedCompany;

    const savedCompanyId = localStorage.getItem('selected_company_id');
    const savedCompanyRaw = localStorage.getItem('selected_company');
    if (savedCompanyRaw) {
      try {
        const savedCompany = JSON.parse(savedCompanyRaw);
        if (!companyId || !savedCompanyId || String(savedCompanyId) === String(companyId)) {
          const normalizedSavedCompany = normalizeCompanyName(savedCompany?.name);
          if (normalizedSavedCompany) return normalizedSavedCompany;
        }
      } catch (e) {
        console.warn('[EmployeesPage] Failed to parse selected_company from localStorage:', e);
      }
    }

    // If URL has explicit company id/name, prefer that over stale sessionStorage.
    if (normalizedCompanyId) return normalizedCompanyId;

    const selectedCompany = normalizeCompanyName(sessionStorage.getItem('selectedCompany'));
    if (selectedCompany) return selectedCompany;

    const adminSelectedCompany = normalizeCompanyName(sessionStorage.getItem('adminSelectedCompany'));
    if (adminSelectedCompany) return adminSelectedCompany;

    return normalizedCompanyId;
  };

  // Employee Data - will be fetched from MongoDB
  const [employees, setEmployees] = useState([]);

  // Fetch employees from MongoDB
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const company = resolveCompanyName();
        
        // Build API URL with company filter if available
        let apiUrl = `${API_BASE_URL}/admin-users`;
        if (company) {
          apiUrl += `?company=${encodeURIComponent(company)}`;
        }
        
        console.log('[EmployeesPage] Fetching employees from:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.users) {
          console.log('[EmployeesPage] Raw API response:', {
            totalUsers: data.users.length,
            sampleUser: data.users[0] ? {
              _id: data.users[0]._id,
              name: data.users[0].name,
              email: data.users[0].email,
              employeeId: data.users[0].employeeId,
              company: data.users[0].company,
              phone: data.users[0].phone,
              jobTitle: data.users[0].jobTitle,
              department: data.users[0].department,
            } : null
          });
          
          // Transform users to employee format with all fields
          const employeeList = data.users
            .map(user => {
              // Calculate tenure from DOJ (joiningDate). Fallback to createdAt if DOJ missing.
              let tenure = '-';
              const startDateRaw = user.joiningDate || user.createdAt;
              if (startDateRaw) {
                const startDate = new Date(startDateRaw);
                if (!Number.isNaN(startDate.getTime())) {
                  const now = new Date();
                  const totalMonths =
                    (now.getFullYear() - startDate.getFullYear()) * 12 +
                    (now.getMonth() - startDate.getMonth()) -
                    (now.getDate() < startDate.getDate() ? 1 : 0);

                  const safeMonths = Math.max(0, totalMonths);
                  const years = Math.floor(safeMonths / 12);
                  const months = safeMonths % 12;

                  if (years > 0 && months > 0) {
                    tenure = `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
                  } else if (years > 0) {
                    tenure = `${years} year${years > 1 ? 's' : ''}`;
                  } else if (months > 0) {
                    tenure = `${months} month${months > 1 ? 's' : ''}`;
                  } else {
                    tenure = 'Less than a month';
                  }
                }
              }
              
              const employee = {
                id: user.id || user._id,
                _id: user._id || user.id,
                name: user.name || 'N/A',
                email: user.email || '',
                employeeId: user.employeeId || '',
                jobTitle: user.jobTitle || user.designation || 'Employee',
                department: user.department || '',
                location: user.location || '',
                company: user.company || '',
                emp_code: user.emp_code || '',
                card_no: user.card_no || '',
                status: user.active !== false ? 'Active' : 'Inactive',
                tenure: tenure,
                joiningDate: user.joiningDate || user.createdAt,
                exitDate: user.exitDate || '',
                hasCredentialAccess: user.hasCredentialAccess !== false,
                hasSubscriptionAccess: user.hasSubscriptionAccess !== false,
                role: user.role || 'user',
                
                // Personal details
                phone: user.phone || '',
                dateOfBirth: user.dateOfBirth || '',
                actualDob: user.actualDob || '',
                gender: user.gender || '',
                personalEmail: user.personalEmail || '',
                fatherName: user.fatherName || '',
                maritalStatus: user.maritalStatus || '',
                bloodGroup: user.bloodGroup || '',
                presentAddress: user.presentAddress || '',
                permanentAddress: user.permanentAddress || '',
                workPhone: user.workPhone || '',
                homePhone: user.homePhone || '',
                emergencyPhone: user.emergencyPhone || '',
                
                // Work details
                reportingManager: user.reportingManager || '',
                
                // Bank & Insurance
                bankAccount: user.bankAccount || '',
                ifsc: user.ifsc || '',
                pan: user.pan || '',
                aadhaar: user.aadhaar || '',
                uan: user.uan || '',
                esiNo: user.esiNo || '',
                pfNo: user.pfNo || '',
                
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
              };
              
              // Log each employee's data for debugging
              if (user.employeeId) {
                console.log(`[EmployeesPage] Mapped employee ${user.employeeId}:`, {
                  name: employee.name,
                  email: employee.email,
                  phone: employee.phone,
                  employeeId: employee.employeeId,
                  company: employee.company,
                  jobTitle: employee.jobTitle,
                  department: employee.department,
                  location: employee.location,
                });
              }
              
              return employee;
            })
            .sort((a, b) => {
              // Sort by name
              return (a.name || '').localeCompare(b.name || '');
            });
          
          setEmployees(employeeList);
          console.log(`[EmployeesPage] Loaded ${employeeList.length} employees${company ? ` for company: ${company}` : ''}`);
          console.log('[EmployeesPage] Employee list summary:', employeeList.map(e => ({
            id: e.id,
            name: e.name,
            email: e.email,
            employeeId: e.employeeId,
            company: e.company
          })));
        } else {
          throw new Error(data.error || 'Failed to fetch employees');
        }
      } catch (err) {
        console.error('[EmployeesPage] Error fetching employees:', err);
        setError(err.message || 'Failed to load employees');
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, [companyId, user?.email]);

  // Handle adding/updating employee
  const handleSaveEmployee = async (employeeData) => {
    try {
      const company = resolveCompanyName();
      
      if (employeeToEdit) {
        // Update existing employee via API - Only send fields that have values (partial update)
        let apiUrl = `${API_BASE_URL}/admin-users/${employeeToEdit.id || employeeToEdit._id}`;
        if (company) {
          apiUrl += `?company=${encodeURIComponent(company)}`;
        }
        
        // Build update payload - include all fields (even empty strings to clear them)
        const updatePayload = {
          // Basic fields
          name: employeeData.name || '',
          email: employeeData.email || '',
          employeeId: employeeData.employeeId !== undefined ? employeeData.employeeId : '',
          department: employeeData.department !== undefined ? employeeData.department : '',
          company: employeeData.company || company || '',
          role: employeeData.role || 'user',
          active: employeeData.status === 'Active',
          hasCredentialAccess: employeeData.hasCredentialAccess !== undefined ? employeeData.hasCredentialAccess : true,
          hasSubscriptionAccess: employeeData.hasSubscriptionAccess !== undefined ? employeeData.hasSubscriptionAccess : true,
          
          // Personal details
          phone: employeeData.phone !== undefined ? employeeData.phone : '',
          dateOfBirth: employeeData.dateOfBirth !== undefined ? employeeData.dateOfBirth : '',
          actualDob: employeeData.actualDob !== undefined ? employeeData.actualDob : '',
          gender: employeeData.gender !== undefined ? employeeData.gender : '',
          personalEmail: employeeData.personalEmail !== undefined ? employeeData.personalEmail : '',
          fatherName: employeeData.fatherName !== undefined ? employeeData.fatherName : '',
          maritalStatus: employeeData.maritalStatus !== undefined ? employeeData.maritalStatus : '',
          bloodGroup: employeeData.bloodGroup !== undefined ? employeeData.bloodGroup : '',
          presentAddress: employeeData.presentAddress !== undefined ? employeeData.presentAddress : '',
          permanentAddress: employeeData.permanentAddress !== undefined ? employeeData.permanentAddress : '',
          workPhone: employeeData.workPhone !== undefined ? employeeData.workPhone : '',
          homePhone: employeeData.homePhone !== undefined ? employeeData.homePhone : '',
          emergencyPhone: employeeData.emergencyPhone !== undefined ? employeeData.emergencyPhone : '',
          
          // Work details
          jobTitle: employeeData.jobTitle !== undefined ? employeeData.jobTitle : '',
          location: employeeData.location !== undefined ? employeeData.location : '',
          reportingManager: employeeData.reportingManager !== undefined ? employeeData.reportingManager : '',
          joiningDate: employeeData.joiningDate !== undefined ? employeeData.joiningDate : '',
          exitDate:
            employeeData.status === 'Inactive'
              ? (employeeData.exitDate !== undefined && employeeData.exitDate !== null
                  ? employeeData.exitDate
                  : (employeeToEdit?.exitDate ?? ''))
              : null,
          emp_code: employeeData.emp_code !== undefined ? employeeData.emp_code : '',
          card_no: employeeData.card_no !== undefined ? employeeData.card_no : '',
          
          // Bank & Insurance
          bankAccount: employeeData.bankAccount !== undefined ? employeeData.bankAccount : '',
          ifsc: employeeData.ifsc !== undefined ? employeeData.ifsc : '',
          pan: employeeData.pan !== undefined ? employeeData.pan : '',
          aadhaar: employeeData.aadhaar !== undefined ? employeeData.aadhaar : '',
          uan: employeeData.uan !== undefined ? employeeData.uan : '',
          esiNo: employeeData.esiNo !== undefined ? employeeData.esiNo : '',
          pfNo: employeeData.pfNo !== undefined ? employeeData.pfNo : '',
        };
        
        // Password (only if provided)
        if (employeeData.password && employeeData.password.trim() !== '') {
          updatePayload.password = employeeData.password;
        }
        
        console.log('========================================');
        console.log('[handleSaveEmployee] UPDATE REQUEST');
        console.log('[handleSaveEmployee] API URL:', apiUrl);
        console.log('[handleSaveEmployee] Update payload:', JSON.stringify(updatePayload, null, 2));
        console.log('[handleSaveEmployee] Payload size:', JSON.stringify(updatePayload).length, 'bytes');
        
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload),
        });
        
        const data = await response.json();
        console.log('[handleSaveEmployee] API Response:', JSON.stringify(data, null, 2));
        
        if (data.success) {
          console.log('[handleSaveEmployee] Update successful!');
          setSuccessDialog({ open: true, message: 'Employee updated successfully!' });
          // Refresh employees list after dialog closes
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          console.error('[handleSaveEmployee] Update failed:', data.error);
          throw new Error(data.error || 'Failed to update employee');
        }
        console.log('========================================');
      } else {
        // Add new employee via API - Send only required fields
        // Get company from employeeData or sessionStorage (required for determining which table to use)
        const employeeCompany = employeeData.company || company;
        
        if (!employeeCompany) {
          throw new Error('Company information is required. Please ensure you are logged in with a valid company account.');
        }
        
        // Password is now optional - if not provided, backend will handle it
        // No need to throw error if password is missing
        
        let apiUrl = `${API_BASE_URL}/admin-users`;
        if (employeeCompany) {
          apiUrl += `?company=${encodeURIComponent(employeeCompany)}`;
        }
        
        // Create payload with ALL fields for user creation
        const createPayload = {
          // Required fields
          name: employeeData.name,
          email: employeeData.email,
          password: employeeData.password, // Required for new employees
          role: employeeData.role || 'user',
          employeeId: employeeData.employeeId || '',
          company: employeeCompany, // This determines which table (Ecosoul_Employees or Thrive_Employees)
          
          // Basic Details
          phone: employeeData.phone || '',
          dateOfBirth: employeeData.dateOfBirth || '',
          gender: employeeData.gender || '',
          
          // Personal Details
          personalEmail: employeeData.personalEmail || '',
          fatherName: employeeData.fatherName || '',
          maritalStatus: employeeData.maritalStatus || '',
          bloodGroup: employeeData.bloodGroup || '',
          presentAddress: employeeData.presentAddress || '',
          permanentAddress: employeeData.permanentAddress || '',
          workPhone: employeeData.workPhone || '',
          homePhone: employeeData.homePhone || '',
          emergencyPhone: employeeData.emergencyPhone || '',
          
          // Work Details
          jobTitle: employeeData.jobTitle || '',
          department: employeeData.department || '',
          location: employeeData.location || '',
          reportingManager: employeeData.reportingManager || '',
          joiningDate: employeeData.joiningDate || '',
          emp_code: employeeData.emp_code || '',
          card_no: employeeData.card_no || '',
          hasCredentialAccess: employeeData.hasCredentialAccess !== false,
          hasSubscriptionAccess: employeeData.hasSubscriptionAccess !== false,
          
          // Bank & Insurance
          bankAccount: employeeData.bankAccount || '',
          ifsc: employeeData.ifsc || '',
          pan: employeeData.pan || '',
          aadhaar: employeeData.aadhaar || '',
          uan: employeeData.uan || '',
          esiNo: employeeData.esiNo || '',
          pfNo: employeeData.pfNo || '',
        };
        
        console.log('========================================');
        console.log('[handleSaveEmployee] CREATE REQUEST');
        console.log('[handleSaveEmployee] API URL:', apiUrl);
        console.log('[handleSaveEmployee] employeeData received:', JSON.stringify({
          ...employeeData,
          password: employeeData.password ? '***hidden***' : undefined
        }, null, 2));
        console.log('[handleSaveEmployee] Creating employee with payload:', JSON.stringify({
          ...createPayload,
          password: '***hidden***'
        }, null, 2));
        console.log('[handleSaveEmployee] Payload field count:', Object.keys(createPayload).length);
        console.log('[handleSaveEmployee] Company:', employeeCompany, '- Will be saved to:', 
          employeeCompany.toLowerCase().includes('thrive') ? 'Thrive_Employees' : 'Ecosoul_Employees');
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createPayload),
        });
        
        const responseText = await response.text();
        console.log('[handleSaveEmployee] Raw API Response:', responseText);
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('[handleSaveEmployee] Failed to parse response:', e);
          throw new Error('Invalid response from server');
        }
        
        console.log('[handleSaveEmployee] Parsed API Response:', JSON.stringify(data, null, 2));
        
        if (data.success) {
          const tableName = employeeCompany.toLowerCase().includes('thrive') ? 'Thrive_Employees' : 'Ecosoul_Employees';
          console.log('[handleSaveEmployee] Create successful! User added to', tableName);
          console.log('[handleSaveEmployee] Created user ID:', data.user?.id || data.user?._id);
          setSuccessDialog({ open: true, message: `Employee created successfully! User has been added to ${tableName} table.` });
          // Refresh employees list after dialog closes
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          console.error('[handleSaveEmployee] Create failed:', data.error);
          throw new Error(data.error || 'Failed to create employee');
        }
        console.log('========================================');
      }
    } catch (err) {
      console.error('Error saving employee:', err);
      setErrorDialog({ open: true, message: err.message || 'Failed to save employee' });
    }
  };

  const setEmployeeFieldsLocal = (employeeId, partial) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        const id = emp.id || emp._id;
        if (String(id) !== String(employeeId)) return emp;
        return { ...emp, ...partial };
      })
    );
  };

  const startInlineEdit = (employee, field) => {
    const empId = employee?.id || employee?._id;
    if (!empId) return;
    const current = (employee?.[field] ?? '').toString();
    setInlineEdit({ employeeId: String(empId), field, value: current });
  };

  const cancelInlineEdit = () => {
    setInlineEdit(null);
  };

  const saveInlineEdit = async () => {
    if (!inlineEdit?.employeeId || !inlineEdit?.field) return;
    const empId = inlineEdit.employeeId;
    const field = inlineEdit.field;
    const rawValue = inlineEdit.value ?? '';
    const value = rawValue.toString().trim();
    const key = `${empId}:${field}`;

    setInlineSavingByKey((prev) => ({ ...prev, [key]: true }));
    // Optimistic update
    setEmployeeFieldsLocal(empId, { [field]: value });

    try {
      const company = resolveCompanyName();
      let apiUrl = `${API_BASE_URL}/admin-users/${empId}`;
      if (company) {
        apiUrl += `?company=${encodeURIComponent(company)}`;
      }

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || `Failed to update ${field} (HTTP ${response.status})`);
      }

      setInlineEdit(null);
    } catch (err) {
      setErrorDialog({ open: true, message: err.message || 'Failed to save changes' });
    } finally {
      setInlineSavingByKey((prev) => ({ ...prev, [key]: false }));
    }
  };

  const formatCellDate = (val) => {
    if (!val) return '-';
    try {
      if (typeof val === 'string' && val.includes('T')) {
        return new Date(val).toLocaleDateString('en-GB');
      }
      if (val instanceof Date) return val.toLocaleDateString('en-GB');
      return String(val);
    } catch {
      return '-';
    }
  };

  const renderNameCell = (employee) => (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
        {(employee?.name || 'U').charAt(0).toUpperCase()}
      </div>
      <div className="text-sm font-medium text-slate-900">{employee?.name || '-'}</div>
    </div>
  );

  const renderStatusCell = (employee) => (
    <select
      value={employee.status === 'Inactive' ? 'Inactive' : 'Active'}
      disabled={statusSavingByEmployeeId[employee.id || employee._id]}
      onChange={(e) => {
        const nextStatus = e.target.value;
        handleEmployeeStatusChange(employee, nextStatus);
      }}
      onClick={(e) => e.stopPropagation()}
      className={`px-2 py-1 rounded-full text-xs font-medium border border-transparent outline-none ${
        employee.status === 'Active'
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
      } ${
        statusSavingByEmployeeId[employee.id || employee._id]
          ? 'opacity-60 cursor-not-allowed'
          : 'cursor-pointer hover:brightness-95'
      }`}
    >
      <option value="Active">Active</option>
      <option value="Inactive">Inactive</option>
    </select>
  );

  const renderCredentialAccessCell = (employee) => (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        employee.hasCredentialAccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {employee.hasCredentialAccess ? 'Yes' : 'No'}
    </span>
  );

  const renderSubscriptionAccessCell = (employee) => (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        employee.hasSubscriptionAccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {employee.hasSubscriptionAccess ? 'Yes' : 'No'}
    </span>
  );

  const renderActionsCell = (employee) => (
    <div className="relative">
      <button
        data-action-button-id={employee.id || employee._id}
        onClick={(e) => {
          e.stopPropagation();
          const empId = employee.id || employee._id;
          setActionMenuOpen(actionMenuOpen === empId ? null : empId);
        }}
        className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {actionMenuOpen === (employee.id || employee._id) && (
        <div
          data-dropdown-menu
          className={`absolute right-0 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-[1000] ${
            dropdownDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="py-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActionMenuOpen(null);
                setViewDetailsDialog({ open: true, employee });
              }}
              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Eye className="w-4 h-4 flex-shrink-0" />
              View Details
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActionMenuOpen(null);
                handleEditEmployee(employee);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Edit className="w-4 h-4 flex-shrink-0" />
              Edit Employee
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActionMenuOpen(null);
                handleDeleteEmployee(employee);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4 flex-shrink-0" />
              Delete Employee
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const handleEmployeeStatusChange = (employee, nextStatus) => {
    if (nextStatus === 'Inactive') {
      const today = new Date().toISOString().slice(0, 10);
      setInactiveDialog({ open: true, employee, exitDate: today });
      return;
    }
    updateEmployeeStatus(employee, nextStatus);
  };

  const updateEmployeeStatus = async (employee, newStatus, options = {}) => {
    const empId = employee?.id || employee?._id;
    if (!empId) return;

    const previousSnapshot = {
      status: employee.status,
      exitDate: employee.exitDate ?? '',
    };
    setStatusEditEmployeeId(null);

    setStatusSavingByEmployeeId((prev) => ({ ...prev, [empId]: true }));
    if (newStatus === 'Active') {
      setEmployeeFieldsLocal(empId, { status: 'Active', exitDate: null });
    }

    try {
      const company = resolveCompanyName();
      let apiUrl = `${API_BASE_URL}/admin-users/${empId}`;
      if (company) {
        apiUrl += `?company=${encodeURIComponent(company)}`;
      }

      const body =
        newStatus === 'Active'
          ? { active: true }
          : { active: false, exitDate: options.exitDate };

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || `Failed to update status (HTTP ${response.status})`);
      }

      if (newStatus === 'Inactive') {
        setEmployeeFieldsLocal(empId, {
          status: 'Inactive',
          exitDate: options.exitDate || '',
        });
      }
    } catch (err) {
      if (newStatus === 'Active') {
        setEmployeeFieldsLocal(empId, {
          status: previousSnapshot.status,
          exitDate: previousSnapshot.exitDate,
        });
      }
      setErrorDialog({ open: true, message: err.message || 'Failed to update status' });
    } finally {
      setStatusSavingByEmployeeId((prev) => ({ ...prev, [empId]: false }));
    }
  };

  // Handle edit employee
  const handleEditEmployee = (employee) => {
    try {
      console.log('========================================');
      console.log('[handleEditEmployee] Edit button clicked!');
      console.log('[handleEditEmployee] Editing employee - FULL DATA:');
      console.log(JSON.stringify(employee, null, 2));
      console.log('[handleEditEmployee] Key fields:', {
        id: employee.id,
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        employeeId: employee.employeeId,
        company: employee.company,
        jobTitle: employee.jobTitle,
        department: employee.department,
        location: employee.location,
      });
      
      // Close action menu first
      setActionMenuOpen(null);
      
      // Create a fresh copy of the employee object to ensure React detects the change
      // Deep copy to ensure all nested properties are copied
      const employeeCopy = JSON.parse(JSON.stringify(employee));
      console.log('[handleEditEmployee] Created employeeCopy:', employeeCopy);
      console.log('[handleEditEmployee] employeeCopy.id:', employeeCopy.id);
      console.log('[handleEditEmployee] employeeCopy._id:', employeeCopy._id);
      
      // Set employeeToEdit first
      console.log('[handleEditEmployee] Setting employeeToEdit state...');
      setEmployeeToEdit(employeeCopy);
      
      // Then open dialog - use a small timeout to ensure state is set
      console.log('[handleEditEmployee] Opening dialog...');
      setTimeout(() => {
        setIsAddDialogOpen(true);
        console.log('[handleEditEmployee] Dialog state set to true');
        console.log('[handleEditEmployee] Current isAddDialogOpen should be true now');
      }, 10);
      
      console.log('[handleEditEmployee] State update initiated');
      console.log('========================================');
    } catch (error) {
      console.error('[handleEditEmployee] Error:', error);
      setErrorDialog({ open: true, message: 'Error opening edit form: ' + error.message });
    }
  };

  // Handle delete employee - show confirmation dialog
  const handleDeleteEmployee = (employee) => {
    setDeleteDialog({ open: true, employee });
  };

  // Confirm delete employee
  const confirmDeleteEmployee = async () => {
    const employee = deleteDialog.employee;
    if (!employee) return;

    try {
      const company = resolveCompanyName();
      
      let apiUrl = `${API_BASE_URL}/admin-users/${employee.id || employee._id}`;
      if (company) {
        apiUrl += `?company=${encodeURIComponent(company)}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      if (data.success) {
        setDeleteDialog({ open: false, employee: null });
        setSuccessDialog({ open: true, message: `Employee "${employee.name}" has been permanently deleted from the database.` });
        // Refresh employees list after dialog closes
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to delete employee');
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      setDeleteDialog({ open: false, employee: null });
      setErrorDialog({ open: true, message: err.message || 'Failed to delete employee' });
    }
  };

  // Handle opening dialog for new employee
  const handleAddNewEmployee = () => {
    setEmployeeToEdit(null);
    setIsAddDialogOpen(true);
  };

  // Download Excel template
  const handleDownloadTemplate = () => {
    // Define all employee fields with headers
    const headers = [
      'Status', // Active / Inactive
      'Full Name',
      'Email',
      'Password', // optional (min 6); blank will auto-generate
      'Phone',
      'Date of Birth',
      'Actual DOB',
      'Gender',
      "Father's Name",
      'Personal Email Id',
      'Marital Status',
      'Blood Group',
      'Present Address',
      'Permanent Address',
      'Work Phone',
      'Home Phone',
      'Emergency Phone',
      'Employee ID',
      'Emp Code',
      'Card No',
      'Job Title',
      'Department',
      'Company',
      'Location',
      'Reporting Manager',
      'Joining Date',
      'Exit Date',
      'Role',
      'Has Credential Access',
      'Has Subscription Access',
      'Bank Account Number',
      'IFSC Code',
      'PAN Number',
      'Aadhaar Number',
      'UAN Number',
      'ESI Number',
      'PF Number'
    ];

    // Create a sample row with empty values and instructions
    const sampleRow = [
      'Active', // Status
      'John Doe', // Full Name
      'john.doe@example.com', // Email
      '', // Password (optional)
      '1234567890', // Phone
      '1990-01-15', // Date of Birth (YYYY-MM-DD format)
      '1990-01-15', // Actual DOB (YYYY-MM-DD format)
      'Male', // Gender (Male/Female/Other)
      'Robert Doe', // Father's Name
      'john.personal@example.com', // Personal Email Id
      'Single', // Marital Status
      'O+', // Blood Group
      '203, Tower No. 4, Emerald Court Aspire, Noida Sec-93A', // Present Address
      '203, Tower No. 4, Emerald Court Aspire, Noida Sec-93A', // Permanent Address
      '', // Work Phone (optional)
      '', // Home Phone (optional)
      '9876543210', // Emergency Phone
      '', // Employee ID (leave empty for auto-generation)
      '', // Emp Code (optional)
      '', // Card No (optional)
      'Software Engineer', // Job Title
      'Engineering', // Department
      '', // Company (optional; if blank upload will use selected company)
      'Bangalore', // Location
      'Manager Name', // Reporting Manager
      '2024-01-15', // Joining Date (YYYY-MM-DD format)
      '', // Exit Date (required if Status=Inactive)
      'user', // Role (user/admin)
      'Yes', // Has Credential Access (Yes/No)
      'Yes', // Has Subscription Access (Yes/No)
      '', // Bank Account Number (optional)
      '', // IFSC Code (optional)
      '', // PAN Number (optional)
      '', // Aadhaar Number (optional)
      '', // UAN Number (optional)
      '', // ESI Number (optional)
      '' // PF Number (optional)
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);

    // Set column widths
    const colWidths = headers.map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Employee Template');

    // Generate Excel file and download
    XLSX.writeFile(wb, 'Employee_Bulk_Upload_Template.xlsx');
  };

  // Handle bulk upload
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const resolvedCompany = resolveCompanyName();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('companyId', window.location.pathname.split('/')[2] || '');
      if (resolvedCompany) {
        formData.append('company', resolvedCompany);
      }

      const response = await fetch('/api/hrms/employees/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Add new employees to the list
        if (result.employees && result.employees.length > 0) {
          setEmployees((prev) => [...result.employees, ...prev]);
        }
        const errorMessage = result.errors && result.errors.length > 0 
          ? `\n\nErrors:\n${result.errors.map(e => `Row ${e.row}: ${e.errors.join(', ')}`).join('\n')}`
          : '';
        setSuccessDialog({ 
          open: true, 
          message: `Successfully imported ${result.created || 0} employee(s).${errorMessage}` 
        });
        // Refresh employees list after dialog closes
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setErrorDialog({ open: true, message: result.error || 'Failed to upload employees' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrorDialog({ open: true, message: 'Failed to upload file. Please try again.' });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Calculate KPI metrics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((emp) => emp.status === 'Active').length;
  const exEmployeesCount = employees.filter((emp) => emp.status === 'Inactive').length;
  const departments = [...new Set(employees.map(emp => emp.department))];
  const departmentsCount = departments.length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newThisMonth = employees.filter((emp) => {
    if (!emp.joiningDate) return false;
    const joinDate = new Date(emp.joiningDate);
    return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
  }).length;

  const empCodes = useMemo(() => {
    const eligible = (employees || []).filter((e) => {
      if (rosterTab === 'current') return e?.status === 'Active';
      if (rosterTab === 'ex') return e?.status === 'Inactive';
      return true;
    });
    const set = new Set(
      eligible.map((e) => (e?.emp_code ?? '').toString().trim()).filter(Boolean)
    );
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [employees, rosterTab]);

  const toCsvValue = (value) => {
    if (value === null || value === undefined) return '';
    const s = String(value);
    const escaped = s.replace(/"/g, '""');
    return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
  };

  const exportEmployeesCsv = () => {
    const rows = filteredEmployees || [];
    const headers = [
      'Name',
      'Employee ID',
      'Email',
      'Job Title',
      'Department',
      'Company',
      'Location',
      'EMP CODE',
      'Card No',
      'Phone',
      'Joining Date',
      'Exit Date',
      'Reporting Manager',
      'Status',
      'Tenure',
    ];

    const lines = [
      headers.map(toCsvValue).join(','),
      ...rows.map((e) =>
        [
          e?.name,
          e?.employeeId,
          e?.email,
          e?.jobTitle,
          e?.department,
          e?.company,
          e?.location,
          e?.emp_code,
          e?.card_no,
          e?.phone,
          formatCellDate(e?.joiningDate),
          formatCellDate(e?.exitDate),
          e?.reportingManager,
          e?.status,
          e?.tenure,
        ].map(toCsvValue).join(',')
      ),
    ];

    const csv = lines.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const dateStamp = now.toISOString().slice(0, 10);
    const rosterLabel = rosterTab === 'ex' ? 'ex-employees' : 'current-employees';
    const filename = `employees_${rosterLabel}_${dateStamp}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter employees
  const filteredEmployees = useMemo(() => {
    const filtered = employees.filter((emp) => {
      if (rosterTab === 'current' && emp.status !== 'Active') return false;
      if (rosterTab === 'ex' && emp.status !== 'Inactive') return false;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
                           (emp.name || '').toLowerCase().includes(searchLower) ||
                           (emp.jobTitle || '').toLowerCase().includes(searchLower) ||
                           (emp.department || '').toLowerCase().includes(searchLower) ||
                           (emp.employeeId || '').toLowerCase().includes(searchLower) ||
                           (emp.email || '').toLowerCase().includes(searchLower) ||
                           (emp.company || '').toLowerCase().includes(searchLower);
      const empCodeLower = empCodeQuery.toLowerCase();
      const matchesEmpCode =
        !empCodeQuery || (emp.emp_code || '').toLowerCase().includes(empCodeLower);
      const matchesDepartment = departmentFilter === 'All Departments' || emp.department === departmentFilter;
      const matchesLocation = locationFilter === 'All Locations' || emp.location === locationFilter;
      return matchesSearch && matchesEmpCode && matchesDepartment && matchesLocation;
    });

    if (empCodeSortDirection === 'none') return filtered;

    const dir = empCodeSortDirection === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const aCode = (a?.emp_code ?? '').toString().trim();
      const bCode = (b?.emp_code ?? '').toString().trim();
      const aEmpty = !aCode;
      const bEmpty = !bCode;
      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1; // empty last
      if (bEmpty) return -1;
      return dir * aCode.localeCompare(bCode, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [searchQuery, empCodeQuery, departmentFilter, locationFilter, employees, rosterTab, empCodeSortDirection]);

  const allListColumns = useMemo(() => {
    const base = [
      { id: 'name', label: 'EMPLOYEE NAME', required: true },
      { id: 'employeeId', label: 'EMPLOYEE ID' },
      { id: 'email', label: 'EMAIL' },
      { id: 'jobTitle', label: 'JOB TITLE' },
      { id: 'department', label: 'DEPARTMENT' },
      { id: 'company', label: 'COMPANY' },
      { id: 'location', label: 'LOCATION' },
      { id: 'emp_code', label: 'EMP CODE' },
      { id: 'card_no', label: 'CARD NO' },
    ];

    const exOnly = [
      { id: 'phone', label: 'PHONE' },
      { id: 'joiningDate', label: 'JOINING DATE' },
      { id: 'exitDate', label: 'EXIT DATE' },
      { id: 'reportingManager', label: 'REPORTING MGR' },
    ];

    const tail = [
      { id: 'status', label: 'STATUS', required: true },
      { id: 'hasCredentialAccess', label: 'CREDENTIAL ACCESS' },
      { id: 'hasSubscriptionAccess', label: 'SUBSCRIPTION ACCESS' },
      { id: 'tenure', label: 'TENURE' },
      { id: 'actions', label: 'ACTIONS', required: true, lockPosition: 'end' },
    ];

    return rosterTab === 'ex' ? [...base, ...exOnly, ...tail] : [...base, ...tail];
  }, [rosterTab]);

  const resolvedCompanyForColumns = useMemo(() => resolveCompanyName(), [companyId, user?.email]);

  const defaultListColumnState = useMemo(() => {
    return allListColumns.map((c) => ({
      id: c.id,
      label: c.label,
      visible: c.required ? true : true,
      required: !!c.required,
      lockPosition: c.lockPosition || null,
    }));
  }, [allListColumns]);

  useEffect(() => {
    setListColumnState(defaultListColumnState);
  }, [defaultListColumnState]);

  const serverColumnsLoadedRef = useRef(false);
  const serverSaveTimerRef = useRef(null);

  useEffect(() => {
    // Load global config from server (applies to everyone)
    const load = async () => {
      try {
        if (!resolvedCompanyForColumns) return;
        const url = `${API_BASE_URL}/admin-users/ui/employees-columns?company=${encodeURIComponent(resolvedCompanyForColumns)}&rosterTab=${encodeURIComponent(rosterTab)}`;
        const res = await fetch(url);
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success) return;
        if (!Array.isArray(data.columns) || data.columns.length === 0) {
          serverColumnsLoadedRef.current = true;
          return;
        }

        // merge server config with current columns (handle new/removed columns)
        const byId = new Map(data.columns.map((x) => [x?.id, x]));
        const merged = defaultListColumnState.map((c) => {
          const saved = byId.get(c.id);
          if (!saved) return c;
          return {
            ...c,
            visible: c.required ? true : saved.visible !== false,
          };
        });

        const savedOrder = data.columns.map((x) => x?.id).filter(Boolean);
        const idToCol = new Map(merged.map((c) => [c.id, c]));
        const inOrder = savedOrder.map((id) => idToCol.get(id)).filter(Boolean);
        const remaining = merged.filter((c) => !savedOrder.includes(c.id));
        const combined = [...inOrder, ...remaining];

        const endLocked = combined.filter((c) => c.lockPosition === 'end');
        const normal = combined.filter((c) => c.lockPosition !== 'end');
        setListColumnState([...normal, ...endLocked]);
      } catch (e) {
        console.warn('[EmployeesPage] Failed to load global columns config:', e);
      } finally {
        serverColumnsLoadedRef.current = true;
      }
    };
    load();
  }, [resolvedCompanyForColumns, rosterTab, defaultListColumnState]);

  useEffect(() => {
    // Save global config only when superadmin changes it
    if (!isSuperAdmin) return;
    if (!serverColumnsLoadedRef.current) return;
    if (!resolvedCompanyForColumns) return;

    if (serverSaveTimerRef.current) clearTimeout(serverSaveTimerRef.current);
    serverSaveTimerRef.current = setTimeout(async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (!token) return;
        const url = `${API_BASE_URL}/admin-users/ui/employees-columns?company=${encodeURIComponent(resolvedCompanyForColumns)}`;
        await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rosterTab, columns: listColumnState }),
        }).catch(() => null);
      } catch (e) {
        console.warn('[EmployeesPage] Failed to save global columns config:', e);
      }
    }, 500);

    return () => {
      if (serverSaveTimerRef.current) clearTimeout(serverSaveTimerRef.current);
    };
  }, [isSuperAdmin, resolvedCompanyForColumns, rosterTab, listColumnState]);

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!columnsPanelOpen) return;
      const btn = columnsButtonRef.current;
      const panel = document.querySelector('[data-columns-panel]');
      if (!btn || !panel) return;
      if (btn.contains(e.target)) return;
      if (panel.contains(e.target)) return;
      setColumnsPanelOpen(false);
    };
    if (columnsPanelOpen) {
      document.addEventListener('mousedown', onDocMouseDown);
      return () => document.removeEventListener('mousedown', onDocMouseDown);
    }
  }, [columnsPanelOpen]);

  const visibleListColumns = useMemo(() => {
    const cols = (listColumnState || []).filter((c) => c?.visible);
    return cols.map((c) => (c.required ? { ...c, visible: true } : c));
  }, [listColumnState]);

  const listTableColSpan = useMemo(() => visibleListColumns.length, [visibleListColumns.length]);

  const moveColumn = (dragId, dropId) => {
    if (!dragId || !dropId || dragId === dropId) return;
    setListColumnState((prev) => {
      const idxFrom = prev.findIndex((c) => c.id === dragId);
      const idxTo = prev.findIndex((c) => c.id === dropId);
      if (idxFrom === -1 || idxTo === -1) return prev;
      const fromCol = prev[idxFrom];
      const toCol = prev[idxTo];
      if (fromCol?.lockPosition === 'end' || toCol?.lockPosition === 'end') return prev;
      const next = [...prev];
      const [removed] = next.splice(idxFrom, 1);
      next.splice(idxTo, 0, removed);
      return next;
    });
  };

  const renderListCell = (colId, employee) => {
    switch (colId) {
      case 'name':
        return renderNameCell(employee);
      case 'employeeId':
        return <div className="text-sm text-slate-600">{employee.employeeId || '-'}</div>;
      case 'email':
        return <div className="text-sm text-slate-600">{employee.email || '-'}</div>;
      case 'jobTitle':
        return <div className="text-sm text-slate-600">{employee.jobTitle || '-'}</div>;
      case 'department':
        return <div className="text-sm text-slate-600">{employee.department || '-'}</div>;
      case 'company':
        return <div className="text-sm text-slate-600">{employee.company || '-'}</div>;
      case 'location':
        return <div className="text-sm text-slate-600">{employee.location || '-'}</div>;
      case 'emp_code':
        return (() => {
          const empId = String(employee?.id || employee?._id || '');
          const key = `${empId}:emp_code`;
          const isEditing =
            inlineEdit?.employeeId === empId && inlineEdit?.field === 'emp_code';
          const isSaving = !!inlineSavingByKey[key];

          if (!isSuperAdmin) {
            return <div className="text-sm text-slate-600">{employee.emp_code || '-'}</div>;
          }

          if (isEditing) {
            return (
              <input
                autoFocus
                value={inlineEdit.value}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setInlineEdit((s) => ({ ...s, value: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveInlineEdit();
                  if (e.key === 'Escape') cancelInlineEdit();
                }}
                onBlur={() => saveInlineEdit()}
                className="w-[120px] px-2 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="-"
              />
            );
          }

          return (
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (!isSaving) startInlineEdit(employee, 'emp_code');
              }}
              disabled={isSaving}
              className={`text-left text-sm ${
                isSaving ? 'text-slate-400 cursor-wait' : 'text-slate-600 hover:underline'
              }`}
              title="Double click to edit"
            >
              {employee.emp_code || '-'}
            </button>
          );
        })();
      case 'card_no':
        return (() => {
          const empId = String(employee?.id || employee?._id || '');
          const key = `${empId}:card_no`;
          const isEditing =
            inlineEdit?.employeeId === empId && inlineEdit?.field === 'card_no';
          const isSaving = !!inlineSavingByKey[key];

          if (!isSuperAdmin) {
            return <div className="text-sm text-slate-600">{employee.card_no || '-'}</div>;
          }

          if (isEditing) {
            return (
              <input
                autoFocus
                value={inlineEdit.value}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setInlineEdit((s) => ({ ...s, value: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveInlineEdit();
                  if (e.key === 'Escape') cancelInlineEdit();
                }}
                onBlur={() => saveInlineEdit()}
                className="w-[140px] px-2 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="-"
              />
            );
          }

          return (
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (!isSaving) startInlineEdit(employee, 'card_no');
              }}
              disabled={isSaving}
              className={`text-left text-sm ${
                isSaving ? 'text-slate-400 cursor-wait' : 'text-slate-600 hover:underline'
              }`}
              title="Double click to edit"
            >
              {employee.card_no || '-'}
            </button>
          );
        })();
      case 'phone':
        return <div className="text-sm text-slate-600">{employee.phone || '-'}</div>;
      case 'joiningDate':
        return <div className="text-sm text-slate-600">{formatCellDate(employee.joiningDate)}</div>;
      case 'exitDate':
        return <div className="text-sm font-medium text-slate-800">{formatCellDate(employee.exitDate)}</div>;
      case 'reportingManager':
        return (
          <div className="text-sm text-slate-600 max-w-[140px] truncate" title={employee.reportingManager || ''}>
            {employee.reportingManager || '-'}
          </div>
        );
      case 'status':
        return renderStatusCell(employee);
      case 'hasCredentialAccess':
        return renderCredentialAccessCell(employee);
      case 'hasSubscriptionAccess':
        return renderSubscriptionAccessCell(employee);
      case 'tenure':
        return <div className="text-sm text-slate-600">{employee.tenure || '-'}</div>;
      case 'actions':
        return renderActionsCell(employee);
      default:
        return <div className="text-sm text-slate-600">{employee?.[colId] ?? '-'}</div>;
    }
  };

  // Gradient colors for employee cards
  const gradients = [
    'from-blue-600 via-indigo-600 to-blue-700',
    'from-green-600 via-emerald-600 to-green-700',
    'from-purple-600 via-violet-600 to-purple-700',
    'from-pink-600 via-rose-600 to-pink-700',
    'from-cyan-600 via-blue-600 to-cyan-700',
    'from-orange-600 via-amber-600 to-orange-700',
    'from-yellow-600 via-amber-600 to-yellow-700',
    'from-teal-600 via-cyan-600 to-teal-700',
    'from-indigo-600 via-purple-600 to-indigo-700',
    'from-red-600 via-rose-600 to-red-700',
  ];

  const shadows = [
    'shadow-blue-500/30',
    'shadow-green-500/30',
    'shadow-purple-500/30',
    'shadow-pink-500/30',
    'shadow-cyan-500/30',
    'shadow-orange-500/30',
    'shadow-yellow-500/30',
    'shadow-teal-500/30',
    'shadow-indigo-500/30',
    'shadow-red-500/30',
  ];

  return (
    <div className="space-y-6 relative">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Employees',
            value: totalEmployees,
            icon: Users,
            gradient: 'from-blue-600 via-indigo-600 to-blue-700',
            shadow: 'shadow-blue-500/30',
          },
          {
            title: 'Active Employees',
            value: activeEmployees,
            icon: UserCheck,
            gradient: 'from-green-600 via-emerald-600 to-green-700',
            shadow: 'shadow-green-500/30',
          },
          {
            title: 'Total Departments',
            value: departmentsCount,
            icon: Building2,
            gradient: 'from-purple-600 via-violet-600 to-purple-700',
            shadow: 'shadow-purple-500/30',
          },
          {
            title: 'New This Month',
            value: newThisMonth,
            icon: TrendingUp,
            gradient: 'from-orange-600 via-amber-600 to-orange-700',
            shadow: 'shadow-orange-500/30',
          },
        ].map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${kpi.gradient} ${kpi.shadow} shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-100`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              
              <div className="relative z-10 p-4 lg:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-sm flex-shrink-0 shadow-lg">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-white/90 mb-2 uppercase tracking-wide truncate">
                      {kpi.title}
                    </p>
                    <h3 className="text-2xl lg:text-3xl font-bold text-white leading-tight drop-shadow-sm">
                      {kpi.value}
                    </h3>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            </div>
          );
        })}
      </div>

      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
          <p className="text-sm text-slate-600 mt-1">
            {rosterTab === 'ex'
              ? `Former employees (${exEmployeesCount}) — exit date and full records`
              : 'Manage your company employees'}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              onClick={() => setRosterTab('current')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                rosterTab === 'current'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Current employees
              <span className="text-xs opacity-80">({activeEmployees})</span>
            </button>
            <button
              type="button"
              onClick={() => setRosterTab('ex')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                rosterTab === 'ex'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <UserX className="w-4 h-4" />
              Ex-employees
              <span className="text-xs opacity-80">({exEmployeesCount})</span>
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportEmployeesCsv}
            className="bg-slate-900 text-white hover:bg-slate-800"
            icon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
          <Button
            onClick={handleDownloadTemplate}
            className="bg-green-600 text-white hover:bg-green-700"
            icon={<Download className="w-4 h-4" />}
          >
            Download Template
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleBulkUpload}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-purple-600 text-white hover:bg-purple-700"
            icon={<Upload className="w-4 h-4" />}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Excel'}
          </Button>
          <Button
            onClick={handleAddNewEmployee}
            className="bg-blue-600 text-white hover:bg-blue-700"
            icon={<Plus className="w-4 h-4" />}
          >
            Add New Employee
          </Button>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <Card className="border-2">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, employee ID, department, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex gap-3 flex-wrap items-center">
              <select
                value={empCodeQuery || 'All EMP CODE'}
                onChange={(e) => {
                  const v = e.target.value;
                  setEmpCodeQuery(v === 'All EMP CODE' ? '' : v);
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option>All EMP CODE</option>
                {empCodes.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option>All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option>All Locations</option>
                <option>Bangalore</option>
                <option>Mumbai</option>
                <option>Delhi</option>
                <option>Noida</option>
                <option>Hyderabad</option>
                <option>Pune</option>
                <option>Chennai</option>
              </select>
              <div className="relative">
                <Button
                  ref={columnsButtonRef}
                  onClick={() => setColumnsPanelOpen((v) => !v)}
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                  icon={<Columns3 className="w-4 h-4" />}
                >
                  Other Columns
                </Button>
                {columnsPanelOpen && viewMode === 'list' && (
                  <div
                    data-columns-panel
                    className="absolute right-0 mt-2 w-[320px] bg-white border border-slate-200 rounded-xl shadow-xl z-[1100]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Columns</div>
                        <div className="text-xs text-slate-500">Show/hide and drag to reorder</div>
                      </div>
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-slate-100 text-slate-600"
                        onClick={() => setColumnsPanelOpen(false)}
                        aria-label="Close columns panel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="max-h-[360px] overflow-auto py-2">
                      {(listColumnState || []).map((col) => (
                        <div
                          key={col.id}
                          className={`flex items-center gap-2 px-4 py-2 ${
                            col.lockPosition === 'end' ? 'opacity-80' : ''
                          }`}
                          draggable={col.lockPosition !== 'end'}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', col.id);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const dragId = e.dataTransfer.getData('text/plain');
                            moveColumn(dragId, col.id);
                          }}
                        >
                          <span className="text-slate-400">
                            <GripVertical className="w-4 h-4" />
                          </span>
                          <label className="flex items-center gap-2 flex-1 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={col.required ? true : col.visible !== false}
                              disabled={col.required}
                              onChange={(e) => {
                                const next = e.target.checked;
                                setListColumnState((prev) =>
                                  prev.map((c) =>
                                    c.id !== col.id ? c : { ...c, visible: c.required ? true : next }
                                  )
                                );
                              }}
                              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-800">{col.label}</span>
                            {col.required && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                Required
                              </span>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-slate-200">
                      <button
                        type="button"
                        className="text-xs font-medium text-slate-600 hover:text-slate-900"
                        onClick={() => setListColumnState(defaultListColumnState)}
                      >
                        Reset
                      </button>
                      <div className="text-xs text-slate-500">
                        Showing <span className="font-semibold text-slate-700">{visibleListColumns.length}</span> /{' '}
                        {(listColumnState || []).length}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* View Toggle Buttons */}
              <div className="flex items-center gap-2 border border-slate-300 rounded-lg p-1 bg-slate-50">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Employee List/Grid View */}
      {loading ? (
        <Card className="border-2">
          <div className="p-12 text-center">
            <p className="text-slate-600">Loading employees from database...</p>
          </div>
        </Card>
      ) : error ? (
        <Card className="border-2">
          <div className="p-12 text-center">
            <p className="text-red-600">Error: {error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
            >
              Retry
            </Button>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.length === 0 ? (
            <Card className="border-2 col-span-full">
              <div className="p-12 text-center">
                <p className="text-slate-600">No employees found</p>
              </div>
            </Card>
          ) : (
            filteredEmployees.map((employee, index) => {
            const gradient = gradients[index % gradients.length];
            const shadow = shadows[index % shadows.length];
            return (
              <Card
                key={employee.id}
                className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer border-2 hover:border-opacity-50 p-0 overflow-hidden"
              >
                <div className={`p-6 transition-all duration-300 rounded-lg group-hover:bg-gradient-to-br ${gradient} group-hover:bg-opacity-90`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient} ${shadow} shadow-lg group-hover:bg-white/20 group-hover:backdrop-blur-sm`}>
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-white transition-colors">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground group-hover:text-white/90 transition-colors">{employee.jobTitle || 'No title'}</p>
                      <p className="text-xs text-muted-foreground group-hover:text-white/80 transition-colors mt-1">{employee.department}</p>
                      {employee.employeeId && (
                        <p className="text-xs text-muted-foreground group-hover:text-white/70 transition-colors mt-0.5">ID: {employee.employeeId}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground group-hover:text-white/80 transition-colors">Email</p>
                        <p className="text-sm font-medium group-hover:text-white transition-colors truncate">{employee.email || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground group-hover:text-white/80 transition-colors">Company</p>
                        <p className="text-sm font-medium group-hover:text-white transition-colors">{employee.company || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground group-hover:text-white/80 transition-colors">Location</p>
                        <p className="text-sm font-medium group-hover:text-white transition-colors">{employee.location || '-'}</p>
                      </div>
                    </div>
                    {rosterTab === 'ex' && (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground group-hover:text-white/80 transition-colors">Exit date</p>
                          <p className="text-sm font-medium group-hover:text-white transition-colors">
                            {formatCellDate(employee.exitDate)}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground group-hover:text-white/80 transition-colors">Status</p>
                        <select
                          value={employee.status === 'Inactive' ? 'Inactive' : 'Active'}
                          disabled={statusSavingByEmployeeId[employee.id || employee._id]}
                          onChange={(e) => {
                            const nextStatus = e.target.value;
                            handleEmployeeStatusChange(employee, nextStatus);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={`mt-1 px-2 py-1 rounded-full text-xs font-medium transition-colors border border-transparent outline-none ${
                            employee.status === 'Active'
                              ? 'bg-green-100 text-green-700 group-hover:bg-white/20 group-hover:text-white'
                              : 'bg-gray-100 text-gray-700 group-hover:bg-white/20 group-hover:text-white'
                          } ${
                            statusSavingByEmployeeId[employee.id || employee._id]
                              ? 'opacity-60 cursor-not-allowed'
                              : 'cursor-pointer hover:brightness-95'
                          }`}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground group-hover:text-white/80 transition-colors">Credential Access</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          employee.hasCredentialAccess
                            ? 'bg-green-100 text-green-700 group-hover:bg-white/20 group-hover:text-white'
                            : 'bg-red-100 text-red-700 group-hover:bg-white/20 group-hover:text-white'
                        }`}>
                          {employee.hasCredentialAccess ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200 group-hover:border-white/30">
                    <div>
                      <p className="text-xs text-muted-foreground group-hover:text-white/80 transition-colors">Tenure</p>
                      <p className="text-sm font-medium group-hover:text-white transition-colors">{employee.tenure || '-'}</p>
                    </div>
                    <div className="relative z-10">
                      <button 
                        data-action-button-id={employee.id || employee._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          const empId = employee.id || employee._id;
                          setActionMenuOpen(actionMenuOpen === empId ? null : empId);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 group-hover:text-white transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {actionMenuOpen === (employee.id || employee._id) && (
                        <div 
                          data-dropdown-menu
                          className={`absolute right-0 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-[1000] ${
                            dropdownDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <div className="py-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('[Grid View Details Button] Clicked for employee:', employee.id || employee._id);
                                setActionMenuOpen(null);
                                setViewDetailsDialog({ open: true, employee });
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 cursor-pointer whitespace-nowrap"
                            >
                              <Eye className="w-4 h-4 flex-shrink-0" />
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('[Grid Edit Button] Clicked for employee:', employee.id || employee._id);
                                setActionMenuOpen(null);
                                handleEditEmployee(employee);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer whitespace-nowrap"
                            >
                              <Edit className="w-4 h-4 flex-shrink-0" />
                              Edit Employee
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('[Grid Delete Button] Clicked for employee:', employee.id || employee._id);
                                setActionMenuOpen(null);
                                handleDeleteEmployee(employee);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer whitespace-nowrap"
                            >
                              <Trash2 className="w-4 h-4 flex-shrink-0" />
                              Delete Employee
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
            })
          )}
        </div>
      ) : (
        <Card className="border-2 overflow-visible">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {visibleListColumns.map((col) => (
                    <th
                      key={col.id}
                      className={`px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider ${
                        col.id === 'actions' ? 'text-right' : ''
                      }`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={listTableColSpan} className="px-4 py-8 text-center text-slate-500">
                      Loading employees...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={listTableColSpan} className="px-4 py-8 text-center text-red-500">
                      Error: {error}
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={listTableColSpan} className="px-4 py-8 text-center text-slate-500">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                  <tr 
                    key={employee.id || employee._id} 
                    className="hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                  >
                    {visibleListColumns.map((col) => (
                      <td
                        key={col.id}
                        className={`px-4 py-4 whitespace-nowrap ${
                          col.id === 'actions' ? 'relative z-10 text-right' : ''
                        }`}
                      >
                        {renderListCell(col.id, employee)}
                      </td>
                    ))}
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add/Edit Employee Dialog */}
      <AddEmployeeDialog
        key={`${isAddDialogOpen ? 'open' : 'closed'}-${employeeToEdit?.id || employeeToEdit?._id || 'new'}`}
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEmployeeToEdit(null);
          }
        }}
        onSave={handleSaveEmployee}
        existingEmployees={employees}
        employeeToEdit={employeeToEdit}
      />


      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, employee: null })}
        onConfirm={confirmDeleteEmployee}
        title="Delete Employee"
        message={deleteDialog.employee 
          ? `Are you sure you want to permanently delete "${deleteDialog.employee.name}"?\n\nThis action cannot be undone. The employee will be completely removed from the database.`
          : ''}
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 text-white hover:bg-red-700"
      />

      {/* Success Dialog */}
      <ConfirmationDialog
        open={successDialog.open}
        onClose={() => setSuccessDialog({ open: false, message: '' })}
        onConfirm={() => setSuccessDialog({ open: false, message: '' })}
        title="Success"
        message={successDialog.message}
        type="success"
        confirmText="OK"
        cancelText=""
        confirmButtonClass="bg-green-600 text-white hover:bg-green-700"
      />

      {/* Error Dialog */}
      <ConfirmationDialog
        open={errorDialog.open}
        onClose={() => setErrorDialog({ open: false, message: '' })}
        onConfirm={() => setErrorDialog({ open: false, message: '' })}
        title="Error"
        message={errorDialog.message}
        type="danger"
        confirmText="OK"
        cancelText=""
        confirmButtonClass="bg-red-600 text-white hover:bg-red-700"
      />

      {/* Info Dialog */}
      <ConfirmationDialog
        open={infoDialog.open}
        onClose={() => setInfoDialog({ open: false, message: '' })}
        onConfirm={() => setInfoDialog({ open: false, message: '' })}
        title="Information"
        message={infoDialog.message}
        type="info"
        confirmText="OK"
        cancelText=""
        confirmButtonClass="bg-blue-600 text-white hover:bg-blue-700"
      />

      {/* View Employee Details Dialog */}
      <ViewEmployeeDetailsDialog
        open={viewDetailsDialog.open}
        onClose={() => setViewDetailsDialog({ open: false, employee: null })}
        employee={viewDetailsDialog.employee}
      />

      <Modal
        isOpen={inactiveDialog.open}
        onClose={() => {
          const id = inactiveDialog.employee?.id || inactiveDialog.employee?._id;
          if (id != null && statusSavingByEmployeeId[id]) return;
          setInactiveDialog({ open: false, employee: null, exitDate: '' });
        }}
        title="Mark employee inactive"
        size="sm"
        footer={
          <div className="flex gap-3 w-full justify-end">
            <Button
              type="button"
              onClick={() => {
                const id = inactiveDialog.employee?.id || inactiveDialog.employee?._id;
                if (id != null && statusSavingByEmployeeId[id]) return;
                setInactiveDialog({ open: false, employee: null, exitDate: '' });
              }}
              disabled={(() => {
                const id = inactiveDialog.employee?.id || inactiveDialog.employee?._id;
                return id != null && !!statusSavingByEmployeeId[id];
              })()}
              className="bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                const emp = inactiveDialog.employee;
                const exitDate = inactiveDialog.exitDate;
                if (!exitDate?.trim()) {
                  setErrorDialog({ open: true, message: 'Please select an exit date.' });
                  return;
                }
                if (!emp) return;
                setInactiveDialog({ open: false, employee: null, exitDate: '' });
                updateEmployeeStatus(emp, 'Inactive', { exitDate: exitDate.trim() });
              }}
              disabled={(() => {
                const id = inactiveDialog.employee?.id || inactiveDialog.employee?._id;
                return id != null && !!statusSavingByEmployeeId[id];
              })()}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Mark inactive
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600 mb-4">
          Choose the last working day (exit date). This person will move to the Ex-employees list and can be reactivated later from that list.
        </p>
        <label className="block text-sm font-medium text-slate-700 mb-1">Exit date</label>
        <input
          type="date"
          value={inactiveDialog.exitDate || ''}
          onChange={(e) =>
            setInactiveDialog((d) => ({ ...d, exitDate: e.target.value }))
          }
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Modal>
    </div>
  );
}
