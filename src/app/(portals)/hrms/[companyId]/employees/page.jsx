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
  Eye
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import AddEmployeeDialog from './components/AddEmployeeDialog';
import ConfirmationDialog from './components/ConfirmationDialog';
import ViewEmployeeDetailsDialog from './components/ViewEmployeeDetailsDialog';
import { API_BASE_URL } from '@/lib/utils/constants';

export default function EmployeesPage() {
  const params = useParams();
  const companyId = params?.companyId;
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null); // Track which employee's menu is open
  const [dropdownDirection, setDropdownDirection] = useState('down'); // 'up' or 'down'
  
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
    };

    if (actionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [actionMenuOpen]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Employee Data - will be fetched from MongoDB
  const [employees, setEmployees] = useState([]);

  // Fetch employees from MongoDB
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get company name from sessionStorage or use companyId
        let company = null;
        if (typeof window !== 'undefined') {
          company = sessionStorage.getItem('selectedCompany') || 
                    sessionStorage.getItem('adminSelectedCompany');
        }
        
        // If companyId is '1', try to map it to company name
        // You may need to adjust this mapping based on your setup
        if (!company && companyId) {
          // Try to determine company from URL or other context
          // For now, we'll try both collections
        }
        
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
              // Calculate tenure from createdAt or joiningDate
              let tenure = '-';
              if (user.createdAt) {
                const createdDate = new Date(user.createdAt);
                const now = new Date();
                const years = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24 * 365));
                const months = Math.floor(((now - createdDate) % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
                if (years > 0) {
                  tenure = `${years} year${years > 1 ? 's' : ''}`;
                } else if (months > 0) {
                  tenure = `${months} month${months > 1 ? 's' : ''}`;
                } else {
                  tenure = 'Less than a month';
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
                status: user.active !== false ? 'Active' : 'Inactive',
                tenure: tenure,
                joiningDate: user.joiningDate || user.createdAt,
                hasCredentialAccess: user.hasCredentialAccess !== false,
                hasSubscriptionAccess: user.hasSubscriptionAccess !== false,
                role: user.role || 'user',
                
                // Personal details
                phone: user.phone || '',
                dateOfBirth: user.dateOfBirth || '',
                gender: user.gender || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                zipCode: user.zipCode || '',
                emergencyContact: user.emergencyContact || '',
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
  }, [companyId]);

  // Handle adding/updating employee
  const handleSaveEmployee = async (employeeData) => {
    try {
      // Get company name
      let company = null;
      if (typeof window !== 'undefined') {
        company = sessionStorage.getItem('selectedCompany') || 
                  sessionStorage.getItem('adminSelectedCompany');
      }
      
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
          gender: employeeData.gender !== undefined ? employeeData.gender : '',
          address: employeeData.address !== undefined ? employeeData.address : '',
          city: employeeData.city !== undefined ? employeeData.city : '',
          state: employeeData.state !== undefined ? employeeData.state : '',
          zipCode: employeeData.zipCode !== undefined ? employeeData.zipCode : '',
          emergencyContact: employeeData.emergencyContact !== undefined ? employeeData.emergencyContact : '',
          emergencyPhone: employeeData.emergencyPhone !== undefined ? employeeData.emergencyPhone : '',
          
          // Work details
          jobTitle: employeeData.jobTitle !== undefined ? employeeData.jobTitle : '',
          location: employeeData.location !== undefined ? employeeData.location : '',
          reportingManager: employeeData.reportingManager !== undefined ? employeeData.reportingManager : '',
          joiningDate: employeeData.joiningDate !== undefined ? employeeData.joiningDate : '',
          
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
          address: employeeData.address || '',
          city: employeeData.city || '',
          state: employeeData.state || '',
          zipCode: employeeData.zipCode || '',
          emergencyContact: employeeData.emergencyContact || '',
          emergencyPhone: employeeData.emergencyPhone || '',
          
          // Work Details
          jobTitle: employeeData.jobTitle || '',
          department: employeeData.department || '',
          location: employeeData.location || '',
          reportingManager: employeeData.reportingManager || '',
          joiningDate: employeeData.joiningDate || '',
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
        address: employee.address,
        city: employee.city,
        state: employee.state,
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
      // Get company name
      let company = null;
      if (typeof window !== 'undefined') {
        company = sessionStorage.getItem('selectedCompany') || 
                  sessionStorage.getItem('adminSelectedCompany');
      }
      
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
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Date of Birth',
      'Gender',
      'Address',
      'City',
      'State',
      'Zip Code',
      'Emergency Contact',
      'Emergency Phone',
      'Employee ID',
      'Job Title',
      'Department',
      'Location',
      'Reporting Manager',
      'Joining Date',
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
      'John', // First Name
      'Doe', // Last Name
      'john.doe@example.com', // Email
      '1234567890', // Phone
      '1990-01-15', // Date of Birth (YYYY-MM-DD format)
      'Male', // Gender (Male/Female/Other)
      '123 Main Street', // Address
      'Bangalore', // City
      'Karnataka', // State
      '560001', // Zip Code
      'Jane Doe', // Emergency Contact
      '9876543210', // Emergency Phone
      '', // Employee ID (leave empty for auto-generation)
      'Software Engineer', // Job Title
      'Engineering', // Department
      'Bangalore', // Location
      'Manager Name', // Reporting Manager
      '2024-01-15', // Joining Date (YYYY-MM-DD format)
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
      const formData = new FormData();
      formData.append('file', file);
      formData.append('companyId', window.location.pathname.split('/')[2] || '');

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
  const departments = [...new Set(employees.map(emp => emp.department))];
  const departmentsCount = departments.length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newThisMonth = employees.filter((emp) => {
    if (!emp.joiningDate) return false;
    const joinDate = new Date(emp.joiningDate);
    return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
  }).length;

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
                           (emp.name || '').toLowerCase().includes(searchLower) ||
                           (emp.jobTitle || '').toLowerCase().includes(searchLower) ||
                           (emp.department || '').toLowerCase().includes(searchLower) ||
                           (emp.employeeId || '').toLowerCase().includes(searchLower) ||
                           (emp.email || '').toLowerCase().includes(searchLower) ||
                           (emp.company || '').toLowerCase().includes(searchLower);
      const matchesDepartment = departmentFilter === 'All Departments' || emp.department === departmentFilter;
      const matchesLocation = locationFilter === 'All Locations' || emp.location === locationFilter;
      return matchesSearch && matchesDepartment && matchesLocation;
    });
  }, [searchQuery, departmentFilter, locationFilter, employees]);

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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
          <p className="text-sm text-slate-600 mt-1">Manage your company employees</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleDownloadTemplate}
            className="bg-green-600 text-white hover:bg-green-700"
            icon={<Download className="w-4 h-4" />}
          >
            Download Template
          </Button>
          <label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleBulkUpload}
              className="hidden"
              disabled={isUploading}
            />
            <Button
              as="span"
              className="bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
              icon={<Upload className="w-4 h-4" />}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Excel'}
            </Button>
          </label>
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
                <option>Hyderabad</option>
                <option>Pune</option>
              </select>
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
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground group-hover:text-white/80 transition-colors">Status</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          employee.status === 'Active'
                            ? 'bg-green-100 text-green-700 group-hover:bg-white/20 group-hover:text-white'
                            : 'bg-gray-100 text-gray-700 group-hover:bg-white/20 group-hover:text-white'
                        }`}>
                          {employee.status}
                        </span>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">EMPLOYEE NAME</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">EMPLOYEE ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">EMAIL</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">JOB TITLE</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">DEPARTMENT</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">COMPANY</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">LOCATION</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">STATUS</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">CREDENTIAL ACCESS</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">SUBSCRIPTION ACCESS</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">TENURE</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-slate-500">
                      Loading employees...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-red-500">
                      Error: {error}
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-slate-500">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                  <tr 
                    key={employee.id || employee._id} 
                    className="hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {(employee.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-medium text-slate-900">{employee.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{employee.employeeId || '-'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{employee.email || '-'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{employee.jobTitle || '-'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{employee.department}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{employee.company || '-'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{employee.location || '-'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.status === 'Active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.hasCredentialAccess 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {employee.hasCredentialAccess ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.hasSubscriptionAccess 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {employee.hasSubscriptionAccess ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{employee.tenure || '-'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap relative z-10">
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
                                  console.log('[Table View Details Button] Clicked for employee:', employee.id || employee._id);
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
                                  console.log('[Table Edit Button] Clicked for employee:', employee.id || employee._id);
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
                                  console.log('[Table Delete Button] Clicked for employee:', employee.id || employee._id);
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
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* HR Copilot Floating Button */}
      <button className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-slate-900 transition-colors flex items-center gap-2 z-50">
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">HR Copilot</span>
      </button>

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
    </div>
  );
}
