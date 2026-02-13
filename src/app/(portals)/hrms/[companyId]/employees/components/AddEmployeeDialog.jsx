'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { API_BASE_URL } from '@/lib/utils/constants';

const PHASES = [
  { id: 1, name: 'Basic Details', fields: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender'] },
  { id: 2, name: 'Personal Details', fields: ['address', 'city', 'state', 'zipCode', 'emergencyContact', 'emergencyPhone'] },
  { id: 3, name: 'Work Details', fields: ['employeeId', 'jobTitle', 'department', 'company', 'location', 'reportingManager', 'joiningDate', 'role', 'hasCredentialAccess', 'hasSubscriptionAccess'] },
  { id: 4, name: 'Bank & Insurance', fields: ['bankAccount', 'ifsc', 'pan', 'aadhaar', 'uan', 'esiNo', 'pfNo'] },
];

export default function AddEmployeeDialog({ open, onOpenChange, onSave, existingEmployees = [], employeeToEdit = null }) {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [departmentsFromDB, setDepartmentsFromDB] = useState(false);
  
  // Initialize form data - if editing, populate with employee data
  // This function should be called fresh each time to get the latest employeeToEdit
  const getInitialFormData = (employee = employeeToEdit) => {
    // Get company from sessionStorage (from logged-in user) - this determines which table to use
    let defaultCompany = '';
    if (typeof window !== 'undefined') {
      defaultCompany = sessionStorage.getItem('selectedCompany') || 
                      sessionStorage.getItem('adminSelectedCompany') || 
                      '';
    }
    
    console.log('[getInitialFormData] Called with employee:', employee);
    console.log('[getInitialFormData] employeeToEdit prop:', employeeToEdit);
    
    if (employee) {
      // Split name into first and last name
      const nameParts = (employee.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Helper function to safely get date value
      const getDateValue = (dateValue) => {
        if (!dateValue) return '';
        if (dateValue instanceof Date) return dateValue.toISOString().split('T')[0];
        if (typeof dateValue === 'string') {
          // Handle MongoDB date format: { "$date": "2026-02-13T05:16:16.148Z" }
          if (dateValue.includes('T')) return dateValue.split('T')[0];
          // Handle date string format
          return dateValue;
        }
        // Handle MongoDB date object format
        if (dateValue && typeof dateValue === 'object' && dateValue.$date) {
          const dateStr = dateValue.$date;
          if (dateStr.includes('T')) return dateStr.split('T')[0];
          return dateStr;
        }
        return '';
      };
      
      // Helper to safely get field value (preserves empty strings)
      const getFieldValue = (value, defaultValue = '') => {
        if (value === null || value === undefined) return defaultValue;
        return String(value); // Convert to string to ensure consistency
      };
      
      const formData = {
        // Basic Details
        firstName: firstName,
        lastName: lastName,
        email: getFieldValue(employee.email),
        phone: getFieldValue(employee.phone),
        dateOfBirth: getDateValue(employee.dateOfBirth),
        gender: getFieldValue(employee.gender),
        // Personal Details
        address: getFieldValue(employee.address),
        city: getFieldValue(employee.city),
        state: getFieldValue(employee.state),
        zipCode: getFieldValue(employee.zipCode),
        emergencyContact: getFieldValue(employee.emergencyContact),
        emergencyPhone: getFieldValue(employee.emergencyPhone),
        // Work Details
        employeeId: getFieldValue(employee.employeeId),
        jobTitle: getFieldValue(employee.jobTitle),
        department: getFieldValue(employee.department),
        company: getFieldValue(employee.company) || defaultCompany,
        location: getFieldValue(employee.location),
        reportingManager: getFieldValue(employee.reportingManager),
        joiningDate: getDateValue(employee.joiningDate || employee.createdAt),
        role: getFieldValue(employee.role, 'user'),
        hasCredentialAccess: employee.hasCredentialAccess !== false,
        hasSubscriptionAccess: employee.hasSubscriptionAccess !== false,
        password: '', // Don't pre-fill password
        // Bank & Insurance
        bankAccount: getFieldValue(employee.bankAccount),
        ifsc: getFieldValue(employee.ifsc),
        pan: getFieldValue(employee.pan),
        aadhaar: getFieldValue(employee.aadhaar),
        uan: getFieldValue(employee.uan),
        esiNo: getFieldValue(employee.esiNo),
        pfNo: getFieldValue(employee.pfNo),
      };
      
      console.log('[getInitialFormData] Mapped employee data:', {
        original: {
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
        },
        mapped: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          employeeId: formData.employeeId,
          company: formData.company,
          jobTitle: formData.jobTitle,
          department: formData.department,
          location: formData.location,
          address: formData.address,
          city: formData.city,
          state: formData.state,
        }
      });
      
      return formData;
    }
    
    return {
      // Basic Details
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      // Personal Details
      address: '',
      city: '',
      state: '',
      zipCode: '',
      emergencyContact: '',
      emergencyPhone: '',
      // Work Details
      employeeId: '',
      jobTitle: '',
      department: '',
      company: defaultCompany, // Auto-populate from logged-in user
      location: '',
      reportingManager: '',
      joiningDate: '',
      role: 'user',
      hasCredentialAccess: true,
      hasSubscriptionAccess: true,
      password: '',
      // Bank & Insurance
      bankAccount: '',
      ifsc: '',
      pan: '',
      aadhaar: '',
      uan: '',
      esiNo: '',
      pfNo: '',
    };
  };

  // Initialize with empty form - will be populated by useEffect when dialog opens
  const [formData, setFormData] = useState(() => {
    const initial = getInitialFormData();
    console.log('[AddEmployeeDialog] Component mounted - Initial state formData:', initial);
    console.log('[AddEmployeeDialog] Component mounted - employeeToEdit at mount:', employeeToEdit);
    return initial;
  });
  const [errors, setErrors] = useState({});
  
  // Log formData changes
  useEffect(() => {
    if (formData.email || formData.firstName) {
      console.log('[AddEmployeeDialog] formData state changed:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        employeeId: formData.employeeId,
        company: formData.company,
        jobTitle: formData.jobTitle,
        department: formData.department,
        location: formData.location,
        address: formData.address,
        city: formData.city,
        state: formData.state,
      });
    }
  }, [formData]);

  // Reset form when dialog opens/closes or employeeToEdit changes
  useEffect(() => {
    console.log('========================================');
    console.log('[AddEmployeeDialog] useEffect triggered');
    console.log('[AddEmployeeDialog] open:', open);
    console.log('[AddEmployeeDialog] employeeToEdit:', employeeToEdit);
    console.log('[AddEmployeeDialog] employeeToEdit?.id:', employeeToEdit?.id);
    console.log('[AddEmployeeDialog] employeeToEdit?._id:', employeeToEdit?._id);
    
    if (open) {
      console.log('[AddEmployeeDialog] Dialog is OPEN - Re-initializing form');
      
      // Force re-initialization of form data when dialog opens
      // Pass employeeToEdit explicitly to ensure we use the latest value
      const initialData = getInitialFormData(employeeToEdit);
      
      console.log('[AddEmployeeDialog] getInitialFormData() returned:');
      console.log(JSON.stringify(initialData, null, 2));
      console.log('[AddEmployeeDialog] Key form fields:', {
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        phone: initialData.phone,
        employeeId: initialData.employeeId,
        company: initialData.company,
        jobTitle: initialData.jobTitle,
        department: initialData.department,
        location: initialData.location,
        address: initialData.address,
        city: initialData.city,
        state: initialData.state,
      });
      
      // Set form data immediately
      setFormData(initialData);
      setCurrentPhase(1);
      setErrors({}); // Clear all errors - all fields are optional
      console.log('[AddEmployeeDialog] Form data set, phase reset to 1, all errors cleared');
      
      console.log('========================================');
    } else {
      // Reset form when dialog closes
      console.log('[AddEmployeeDialog] Dialog is CLOSED - Resetting form');
      const emptyData = getInitialFormData();
      setFormData(emptyData);
      setCurrentPhase(1);
      setErrors({});
      console.log('========================================');
    }
  }, [open, employeeToEdit]); // Use full employeeToEdit object in dependency array

  // Update company field when dialog opens (in case sessionStorage was updated)
  useEffect(() => {
    if (open && !employeeToEdit) {
      // Get company from sessionStorage
      if (typeof window !== 'undefined') {
        const companyFromStorage = sessionStorage.getItem('selectedCompany') || 
                                   sessionStorage.getItem('adminSelectedCompany') || 
                                   '';
        if (companyFromStorage) {
          setFormData(prev => ({ ...prev, company: companyFromStorage }));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, employeeToEdit]);

  // Fetch departments from database when dialog opens
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!open) {
        console.log('[AddEmployeeDialog] Dialog is closed, skipping department fetch');
        return;
      }
      
      try {
        setLoadingDepartments(true);
        console.log('========================================');
        console.log('[AddEmployeeDialog] Fetching departments from database...');
        
        // Get company from sessionStorage (required for determining which table to use)
        let company = '';
        if (typeof window !== 'undefined') {
          company = sessionStorage.getItem('selectedCompany') || 
                    sessionStorage.getItem('adminSelectedCompany') || 
                    '';
        }
        
        console.log('[AddEmployeeDialog] Company from sessionStorage:', company);
        
        if (!company) {
          console.warn('[AddEmployeeDialog] No company found in sessionStorage, using fallback departments');
          const fallbackDepts = ['Engineering', 'Sales', 'Human Resources', 'Marketing', 'Finance', 'Operations', 'IT', 'Thrive Ecom'];
          setDepartments(fallbackDepts);
          setDepartmentsFromDB(false); // Mark that these are fallback departments
          console.log('[AddEmployeeDialog] Set fallback departments:', fallbackDepts);
          setLoadingDepartments(false);
          return;
        }
        
        // Call the new departments API endpoint
        const apiUrl = `${API_BASE_URL}/admin-users/departments/list?company=${encodeURIComponent(company)}`;
        console.log('[AddEmployeeDialog] Calling departments API:', apiUrl);
        console.log('[AddEmployeeDialog] API_BASE_URL:', API_BASE_URL);
        
        const response = await fetch(apiUrl);
        console.log('[AddEmployeeDialog] API Response status:', response.status);
        console.log('[AddEmployeeDialog] API Response ok:', response.ok);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseText = await response.text();
        console.log('[AddEmployeeDialog] Raw API Response:', responseText);
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('[AddEmployeeDialog] Failed to parse response:', parseError);
          throw new Error('Invalid JSON response from server');
        }
        
        console.log('[AddEmployeeDialog] Parsed API Response:', JSON.stringify(data, null, 2));
        
        if (data.success && data.departments) {
          console.log('[AddEmployeeDialog] Fetched departments from database:', data.departments);
          console.log('[AddEmployeeDialog] Total departments:', data.count);
          console.log('[AddEmployeeDialog] Collection used:', data.collection);
          setDepartments(data.departments);
          setDepartmentsFromDB(true); // Mark that departments came from DB
          console.log('[AddEmployeeDialog] Departments state updated with', data.departments.length, 'departments from database');
        } else {
          console.warn('[AddEmployeeDialog] Failed to fetch departments:', data.error || 'Unknown error');
          console.warn('[AddEmployeeDialog] Response data:', data);
          // Fallback to default departments if API fails
          const fallbackDepts = ['Engineering', 'Sales', 'Human Resources', 'Marketing', 'Finance', 'Operations', 'IT', 'Thrive Ecom'];
          setDepartments(fallbackDepts);
          setDepartmentsFromDB(false); // Mark that these are fallback departments
          console.log('[AddEmployeeDialog] Set fallback departments:', fallbackDepts);
        }
        console.log('========================================');
      } catch (error) {
        console.error('[AddEmployeeDialog] Error fetching departments:', error);
        console.error('[AddEmployeeDialog] Error details:', {
          message: error.message,
          stack: error.stack
        });
        // Fallback to default departments on error
        const fallbackDepts = ['Engineering', 'Sales', 'Human Resources', 'Marketing', 'Finance', 'Operations', 'IT', 'Thrive Ecom'];
        setDepartments(fallbackDepts);
        setDepartmentsFromDB(false); // Mark that these are fallback departments
        console.log('[AddEmployeeDialog] Set fallback departments due to error:', fallbackDepts);
      } finally {
        setLoadingDepartments(false);
        console.log('[AddEmployeeDialog] Department fetch completed, loading set to false');
      }
    };
    
    fetchDepartments();
  }, [open]);

  const validatePhase = (phase) => {
    const phaseData = PHASES.find(p => p.id === phase);
    if (!phaseData) return true; // Allow proceeding if phase not found

    const newErrors = {};
    let isValid = true;

    // ALL FIELDS ARE NOW OPTIONAL - Only validate format if value is provided
    
    // Email format validation (only if email is provided)
    if (phase === 1 && formData.email && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
        isValid = false;
      }
    }

    // Password validation (only if password is provided)
    if (phase === 3 && formData.password && formData.password.trim() !== '') {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters long';
        isValid = false;
      }
    }

    // Phone format validation (only if phone is provided)
    if (phase === 1 && formData.phone && formData.phone.trim() !== '') {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Invalid phone number format';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid; // Always allow proceeding, only show format errors if any
  };

  const handleNext = () => {
    // All fields are optional - always allow proceeding
    // Only validate format if values are provided
    validatePhase(currentPhase); // This will only set format errors if any
    
    // Always allow proceeding to next phase
    if (currentPhase < PHASES.length) {
      setCurrentPhase(currentPhase + 1);
      // Clear errors when moving to next phase (format errors are just warnings)
      setErrors({});
    }
  };

  const handlePrevious = () => {
    if (currentPhase > 1) {
      setCurrentPhase(currentPhase - 1);
      setErrors({});
    }
  };

  const handleSubmit = () => {
    // All fields are optional - only validate format if values are provided
    // Always allow submission, just check format
    validatePhase(currentPhase); // This will only set format errors if any
    
    // Always allow submission - all fields are optional
    // Only format errors might be shown, but they won't block submission
    
    // Auto-generate Employee ID if not provided
    const finalFormData = { ...formData };
    if (!finalFormData.employeeId) {
      const employeeNumbers = existingEmployees
        .map((emp) => {
          const match = emp.employeeId?.match(/EMP(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter((num) => !isNaN(num));

      const maxNumber = employeeNumbers.length > 0 ? Math.max(...employeeNumbers) : 0;
      const nextNumber = maxNumber + 1;
      finalFormData.employeeId = `EMP${String(nextNumber).padStart(3, '0')}`;
    }

    // Calculate tenure from joining date
    const joiningDate = finalFormData.joiningDate ? new Date(finalFormData.joiningDate) : new Date();
    const today = new Date();
    let years = today.getFullYear() - joiningDate.getFullYear();
    let months = today.getMonth() - joiningDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    const tenure = `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;

    // Get company from form or sessionStorage (required for determining which table to use)
    let company = finalFormData.company;
    if (!company && typeof window !== 'undefined') {
      company = sessionStorage.getItem('selectedCompany') || 
                sessionStorage.getItem('adminSelectedCompany') || 
                '';
    }

    // Company is optional - proceed even if not set
    // Prepare employee data with ALL fields (both for new and existing employees)
    const employeeData = {
      id: employeeToEdit ? (employeeToEdit.id || employeeToEdit._id) : Date.now().toString(),
      _id: employeeToEdit ? (employeeToEdit._id || employeeToEdit.id) : null,
      // Basic fields
      name: `${finalFormData.firstName || ''} ${finalFormData.lastName || ''}`.trim() || 'Employee',
      email: finalFormData.email ? finalFormData.email.trim().toLowerCase() : '',
      password: finalFormData.password || '', // Optional
      role: finalFormData.role || 'user',
      employeeId: finalFormData.employeeId || '',
      company: company || '', // Optional
      
      // Include ALL fields for both new and existing employees
      // Basic Details
      firstName: finalFormData.firstName || '',
      lastName: finalFormData.lastName || '',
      phone: finalFormData.phone || '',
      dateOfBirth: finalFormData.dateOfBirth || '',
      gender: finalFormData.gender || '',
      
      // Personal Details
      address: finalFormData.address || '',
      city: finalFormData.city || '',
      state: finalFormData.state || '',
      zipCode: finalFormData.zipCode || '',
      emergencyContact: finalFormData.emergencyContact || '',
      emergencyPhone: finalFormData.emergencyPhone || '',
      
      // Work Details
      jobTitle: finalFormData.jobTitle || '',
      department: finalFormData.department || '',
      location: finalFormData.location || '',
      reportingManager: finalFormData.reportingManager || '',
      joiningDate: finalFormData.joiningDate || '',
      hasCredentialAccess: finalFormData.hasCredentialAccess !== false,
      hasSubscriptionAccess: finalFormData.hasSubscriptionAccess !== false,
      
      // Bank & Insurance
      bankAccount: finalFormData.bankAccount || '',
      ifsc: finalFormData.ifsc || '',
      pan: finalFormData.pan || '',
      aadhaar: finalFormData.aadhaar || '',
      uan: finalFormData.uan || '',
      esiNo: finalFormData.esiNo || '',
      pfNo: finalFormData.pfNo || '',
      
      // Additional fields for editing
      ...(employeeToEdit ? {
        status: employeeToEdit.status,
        tenure,
      } : {}),
    };

    console.log('========================================');
    console.log('[AddEmployeeDialog] handleSubmit - Preparing employeeData:');
    console.log('[AddEmployeeDialog] finalFormData:', JSON.stringify(finalFormData, null, 2));
    console.log('[AddEmployeeDialog] employeeData to send:', JSON.stringify({
      ...employeeData,
      password: employeeData.password ? '***hidden***' : undefined
    }, null, 2));
    console.log('========================================');

    onSave(employeeData);
    // Don't close the dialog - keep it open for editing
    // User can continue editing or click Cancel/X to close
    // Success message is handled by parent component
  };

  const handleClose = () => {
    setCurrentPhase(1);
    setFormData(getInitialFormData());
    setErrors({});
    onOpenChange(false);
  };

  const progress = (currentPhase / PHASES.length) * 100;

  // Helper function to log input changes
  const handleInputChange = (fieldName, value) => {
    console.log(`[Input] ${fieldName} changed:`, value);
    console.log(`[Input] Current formData.${fieldName}:`, formData[fieldName]);
    setFormData({ ...formData, [fieldName]: value });
    console.log(`[Input] Updated formData.${fieldName}:`, value);
    console.log(`[Input] Full formData after ${fieldName} change:`, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      employeeId: formData.employeeId,
      company: formData.company,
      jobTitle: formData.jobTitle,
      department: formData.department,
      location: formData.location,
      address: formData.address,
      city: formData.city,
      state: formData.state,
    });
  };

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 1: // Basic Details
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={errors.firstName ? 'border-red-500' : ''}
                placeholder="Enter first name"
              />
              {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={errors.lastName ? 'border-red-500' : ''}
                placeholder="Enter last name"
              />
              {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'border-red-500' : ''}
                placeholder="Enter phone number"
              />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={`${errors.dateOfBirth ? 'border-red-500' : ''} pr-10`}
                  data-lpignore="true"
                  data-form-type="other"
                  autoComplete="off"
                  style={{ position: 'relative', zIndex: 1 }}
                />
              </div>
              {errors.dateOfBirth && <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  errors.gender ? 'border-red-500' : 'border-neutral-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
            </div>
          </div>
        );

      case 2: // Personal Details
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={errors.address ? 'border-red-500' : ''}
                placeholder="Enter address"
              />
              {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <Input
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={errors.city ? 'border-red-500' : ''}
                placeholder="Enter city"
              />
              {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
              <Input
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className={errors.state ? 'border-red-500' : ''}
                placeholder="Enter state"
              />
              {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Zip Code</label>
              <Input
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className={errors.zipCode ? 'border-red-500' : ''}
                placeholder="Enter zip code"
              />
              {errors.zipCode && <p className="text-sm text-red-500 mt-1">{errors.zipCode}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact</label>
              <Input
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                className={errors.emergencyContact ? 'border-red-500' : ''}
                placeholder="Enter emergency contact name"
              />
              {errors.emergencyContact && <p className="text-sm text-red-500 mt-1">{errors.emergencyContact}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Phone</label>
              <Input
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                className={errors.emergencyPhone ? 'border-red-500' : ''}
                placeholder="Enter emergency phone"
              />
              {errors.emergencyPhone && <p className="text-sm text-red-500 mt-1">{errors.emergencyPhone}</p>}
            </div>
          </div>
        );

      case 3: // Work Details
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
              <Input
                value={formData.employeeId}
                onChange={(e) => handleInputChange('employeeId', e.target.value.toUpperCase())}
                placeholder="Auto-generated if empty"
              />
              <p className="text-xs text-slate-500 mt-1">Leave empty to auto-generate</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
              <Input
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                className={errors.jobTitle ? 'border-red-500' : ''}
                placeholder="Enter job title"
              />
              {errors.jobTitle && <p className="text-sm text-red-500 mt-1">{errors.jobTitle}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                disabled={loadingDepartments}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  errors.department ? 'border-red-500' : 'border-neutral-300'
                } ${loadingDepartments ? 'bg-slate-100 cursor-not-allowed' : ''} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">
                  {loadingDepartments ? 'Loading departments...' : 'Select Department'}
                </option>
                {departments.length > 0 ? (
                  departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))
                ) : (
                  !loadingDepartments && (
                    <option value="" disabled>No departments available</option>
                  )
                )}
                {/* Show current department value if it's not in the list (for editing) */}
                {formData.department && !departments.includes(formData.department) && (
                  <option value={formData.department}>{formData.department}</option>
                )}
              </select>
              {errors.department && <p className="text-sm text-red-500 mt-1">{errors.department}</p>}
              {!loadingDepartments && departments.length === 0 && (
                <p className="text-xs text-slate-500 mt-1">No departments found in database. You can manually enter a department name.</p>
              )}
              {!loadingDepartments && departments.length > 0 && (
                <p className={`text-xs mt-1 ${departmentsFromDB ? 'text-green-600' : 'text-slate-500'}`}>
                  {departments.length} department(s) {departmentsFromDB ? 'loaded from database' : 'available (fallback list)'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <select
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  errors.location ? 'border-red-500' : 'border-neutral-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Select Location</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
                <option value="Chennai">Chennai</option>
              </select>
              {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reporting Manager</label>
              <Input
                value={formData.reportingManager}
                onChange={(e) => handleInputChange('reportingManager', e.target.value)}
                className={errors.reportingManager ? 'border-red-500' : ''}
                placeholder="Enter reporting manager"
              />
              {errors.reportingManager && <p className="text-sm text-red-500 mt-1">{errors.reportingManager}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Joining Date</label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                  className={`${errors.joiningDate ? 'border-red-500' : ''} pr-10`}
                  data-lpignore="true"
                  data-form-type="other"
                  autoComplete="off"
                  style={{ position: 'relative', zIndex: 1 }}
                />
              </div>
              {errors.joiningDate && <p className="text-sm text-red-500 mt-1">{errors.joiningDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
              <Input
                value={formData.company}
                readOnly
                disabled
                className="bg-slate-100 cursor-not-allowed"
                placeholder="Company will be auto-detected from your login"
              />
              <p className="text-xs text-slate-500 mt-1">
                Company is automatically determined from your login. 
                {formData.company ? ` Current: ${formData.company}` : ' Please ensure you are logged in with a valid company account.'}
                {formData.company && (
                  <span className="block mt-1 text-blue-600">
                    User will be added to {formData.company.toLowerCase().includes('thrive') ? 'Thrive_Employees' : 'Ecosoul_Employees'} table.
                  </span>
                )}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  errors.role ? 'border-red-500' : 'border-neutral-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role}</p>}
            </div>
            {!employeeToEdit ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'border-red-500' : ''}
                  placeholder="Enter password (min 6 characters)"
                />
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                <p className="text-xs text-slate-500 mt-1">Optional - Leave blank if not needed</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password (Optional)</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'border-red-500' : ''}
                  placeholder="Leave blank to keep current password"
                />
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                <p className="text-xs text-slate-500 mt-1">Enter new password to change, or leave blank to keep current</p>
              </div>
            )}
            <div className="col-span-2">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasCredentialAccess}
                    onChange={(e) => {
                      console.log('[Input] hasCredentialAccess changed:', e.target.checked);
                      setFormData({ ...formData, hasCredentialAccess: e.target.checked });
                    }}
                    className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Has Credential Access</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasSubscriptionAccess}
                    onChange={(e) => {
                      console.log('[Input] hasSubscriptionAccess changed:', e.target.checked);
                      setFormData({ ...formData, hasSubscriptionAccess: e.target.checked });
                    }}
                    className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Has Subscription Access</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 4: // Bank & Insurance
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Bank & Insurance details are optional. You can save the employee now and add these details later by editing the employee record.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bank Account Number</label>
              <Input
                value={formData.bankAccount}
                onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                placeholder="Enter bank account number (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">IFSC Code</label>
              <Input
                value={formData.ifsc}
                onChange={(e) => handleInputChange('ifsc', e.target.value.toUpperCase())}
                placeholder="Enter IFSC code (optional)"
                maxLength={11}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PAN Number</label>
              <Input
                value={formData.pan}
                onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
                placeholder="Enter PAN number (optional)"
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aadhaar Number</label>
              <Input
                value={formData.aadhaar}
                onChange={(e) => handleInputChange('aadhaar', e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="Enter Aadhaar number (optional)"
                maxLength={12}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">UAN Number</label>
              <Input
                value={formData.uan}
                onChange={(e) => handleInputChange('uan', e.target.value)}
                placeholder="Enter UAN number (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ESI Number</label>
              <Input
                value={formData.esiNo}
                onChange={(e) => handleInputChange('esiNo', e.target.value)}
                placeholder="Enter ESI number (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PF Number</label>
              <Input
                value={formData.pfNo}
                onChange={(e) => handleInputChange('pfNo', e.target.value)}
                placeholder="Enter PF number (optional)"
              />
            </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* CSS to prevent LastPass and other password managers from interfering with date inputs */}
      <style dangerouslySetInnerHTML={{__html: `
        input[type="date"][data-lpignore="true"] {
          position: relative !important;
          z-index: 1 !important;
        }
        input[type="date"][data-lpignore="true"]::-webkit-calendar-picker-indicator {
          cursor: pointer !important;
          position: absolute !important;
          right: 0.75rem !important;
          width: 20px !important;
          height: 20px !important;
          opacity: 1 !important;
          z-index: 10 !important;
        }
        input[type="date"][data-lpignore="true"]::-webkit-inner-spin-button,
        input[type="date"][data-lpignore="true"]::-webkit-clear-button {
          z-index: 1 !important;
        }
        /* Hide LastPass icons on date fields */
        div[data-lastpass-icon-root],
        div[data-lastpass-root] {
          display: none !important;
        }
        input[type="date"][data-lpignore="true"] {
          cursor: pointer !important;
        }
      `}} />
    <Modal
      isOpen={open}
      onClose={handleClose}
      title={employeeToEdit ? "Edit Employee" : "Add New Employee"}
      size="lg"
      footer={
        <div className="flex justify-between w-full">
          <div>
            {currentPhase > 1 && (
              <Button
                onClick={handlePrevious}
                className="bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                icon={<ChevronLeft className="h-4 w-4" />}
                iconPosition="left"
              >
                Previous
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleClose}
              className="bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </Button>
            {currentPhase < PHASES.length ? (
              <Button 
                onClick={handleNext} 
                className="bg-blue-600 text-white hover:bg-blue-700"
                icon={<ChevronRight className="h-4 w-4" />}
                iconPosition="right"
              >
                Next
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleSubmit} 
                  className="bg-green-600 text-white hover:bg-green-700"
                  icon={<Check className="h-4 w-4" />}
                  iconPosition="left"
                >
                  Save Employee
                </Button>
                <Button 
                  onClick={() => {
                    handleSubmit();
                    handleClose();
                  }} 
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save & Close
                </Button>
              </>
            )}
          </div>
        </div>
      }
    >
      {/* Progress Bar */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Phase {currentPhase} of {PHASES.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Phase Indicators */}
        <div className="flex gap-2 justify-center flex-wrap">
          {PHASES.map((phase) => (
            <div
              key={phase.id}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                phase.id === currentPhase
                  ? 'bg-blue-600 text-white'
                  : phase.id < currentPhase
                  ? 'bg-green-100 text-green-700'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {phase.id < currentPhase ? (
                <Check className="w-3 h-3" />
              ) : (
                <div className={`w-3 h-3 rounded-full ${
                  phase.id === currentPhase ? 'bg-white' : 'bg-neutral-400'
                }`} />
              )}
              {phase.name}
            </div>
          ))}
        </div>
      </div>

      {/* Phase Content */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {PHASES.find(p => p.id === currentPhase)?.name}
        </h3>
        
        {/* Error Summary - Only show format validation warnings, not required field errors */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-yellow-800 mb-2">Format validation warnings (optional to fix):</p>
            <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
            <p className="text-xs text-yellow-600 mt-2">Note: All fields are optional. These are just format warnings.</p>
          </div>
        )}
        
        {renderPhaseContent()}
      </div>
    </Modal>
    </>
  );
}

