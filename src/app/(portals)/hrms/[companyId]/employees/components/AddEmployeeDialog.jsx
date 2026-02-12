'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const PHASES = [
  { id: 1, name: 'Basic Details', fields: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender'] },
  { id: 2, name: 'Personal Details', fields: ['address', 'city', 'state', 'zipCode', 'emergencyContact', 'emergencyPhone'] },
  { id: 3, name: 'Work Details', fields: ['employeeId', 'jobTitle', 'department', 'company', 'location', 'reportingManager', 'joiningDate', 'role', 'hasCredentialAccess', 'hasSubscriptionAccess'] },
  { id: 4, name: 'Bank & Insurance', fields: ['bankAccount', 'ifsc', 'pan', 'aadhaar', 'uan', 'esiNo', 'pfNo'] },
];

export default function AddEmployeeDialog({ open, onOpenChange, onSave, existingEmployees = [], employeeToEdit = null }) {
  const [currentPhase, setCurrentPhase] = useState(1);
  
  // Initialize form data - if editing, populate with employee data
  const getInitialFormData = () => {
    if (employeeToEdit) {
      // Split name into first and last name
      const nameParts = (employeeToEdit.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      return {
        // Basic Details
        firstName: firstName,
        lastName: lastName,
        email: employeeToEdit.email || '',
        phone: employeeToEdit.phone || '',
        dateOfBirth: (() => {
          const date = employeeToEdit.dateOfBirth || '';
          if (!date) return '';
          if (date instanceof Date) return date.toISOString().split('T')[0];
          if (typeof date === 'string' && date.includes('T')) return date.split('T')[0];
          return date;
        })(),
        gender: employeeToEdit.gender || '',
        // Personal Details
        address: employeeToEdit.address || '',
        city: employeeToEdit.city || '',
        state: employeeToEdit.state || '',
        zipCode: employeeToEdit.zipCode || '',
        emergencyContact: employeeToEdit.emergencyContact || '',
        emergencyPhone: employeeToEdit.emergencyPhone || '',
        // Work Details
        employeeId: employeeToEdit.employeeId || '',
        jobTitle: employeeToEdit.jobTitle || '',
        department: employeeToEdit.department || '',
        company: employeeToEdit.company || '',
        location: employeeToEdit.location || '',
        reportingManager: employeeToEdit.reportingManager || '',
        joiningDate: (() => {
          const date = employeeToEdit.joiningDate || employeeToEdit.createdAt || '';
          if (!date) return '';
          if (date instanceof Date) return date.toISOString().split('T')[0];
          if (typeof date === 'string' && date.includes('T')) return date.split('T')[0];
          return date;
        })(),
        role: employeeToEdit.role || 'user',
        hasCredentialAccess: employeeToEdit.hasCredentialAccess !== false,
        hasSubscriptionAccess: employeeToEdit.hasSubscriptionAccess !== false,
        password: '', // Don't pre-fill password
        // Bank & Insurance
        bankAccount: employeeToEdit.bankAccount || '',
        ifsc: employeeToEdit.ifsc || '',
        pan: employeeToEdit.pan || '',
        aadhaar: employeeToEdit.aadhaar || '',
        uan: employeeToEdit.uan || '',
        esiNo: employeeToEdit.esiNo || '',
        pfNo: employeeToEdit.pfNo || '',
      };
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
      company: '',
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

  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});

  // Reset form when dialog opens/closes or employeeToEdit changes
  useEffect(() => {
    if (open) {
      const initialData = getInitialFormData();
      setFormData(initialData);
      setCurrentPhase(1);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, employeeToEdit?.id]);

  const validatePhase = (phase) => {
    const phaseData = PHASES.find(p => p.id === phase);
    if (!phaseData) return false;

    const newErrors = {};
    let isValid = true;

    // Optional fields that don't need validation
    const optionalFields = ['employeeId', 'company', 'password', 'hasCredentialAccess', 'hasSubscriptionAccess']; // Employee ID is auto-generated if empty, company can be auto-detected
    
    // Phase 4 (Bank & Insurance) is completely optional - skip validation for this phase
    if (phase === 4) {
      setErrors({});
      return true; // Always allow proceeding from phase 4
    }

    phaseData.fields.forEach((field) => {
      // Skip validation for optional fields
      if (optionalFields.includes(field)) {
        return;
      }

      const fieldValue = formData[field];
      // Check if field is empty (handle both string and other types)
      if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
        newErrors[field] = `${fieldName} is required`;
        isValid = false;
      }
    });

    // Email validation
    if (phase === 1 && formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
        isValid = false;
      }
    }

    // Password validation
    if (phase === 3) {
      if (!employeeToEdit) {
        // Required for new employees
        if (!formData.password || formData.password.trim() === '') {
          newErrors.password = 'Password is required for new employees';
          isValid = false;
        } else if (formData.password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters long';
          isValid = false;
        }
      } else {
        // Optional for editing, but if provided, must be at least 6 characters
        if (formData.password && formData.password.trim() !== '' && formData.password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters long';
          isValid = false;
        }
      }
    }

    // Phone validation
    if (phase === 1 && formData.phone) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Invalid phone number';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    const isValid = validatePhase(currentPhase);
    if (isValid) {
      if (currentPhase < PHASES.length) {
        setCurrentPhase(currentPhase + 1);
        setErrors({});
      }
    } else {
      // Show validation errors
      console.log('Validation failed for phase', currentPhase, 'Errors:', errors);
    }
  };

  const handlePrevious = () => {
    if (currentPhase > 1) {
      setCurrentPhase(currentPhase - 1);
      setErrors({});
    }
  };

  const handleSubmit = () => {
    // Validate only phases 1-3 (Bank & Insurance is optional)
    let isValid = true;
    if (currentPhase < 4) {
      isValid = validatePhase(currentPhase);
    }

    if (isValid) {
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
      const joiningDate = new Date(finalFormData.joiningDate);
      const today = new Date();
      let years = today.getFullYear() - joiningDate.getFullYear();
      let months = today.getMonth() - joiningDate.getMonth();

      if (months < 0) {
        years--;
        months += 12;
      }

      const tenure = `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;

      // Get company from form or sessionStorage
      let company = finalFormData.company;
      if (!company && typeof window !== 'undefined') {
        company = sessionStorage.getItem('selectedCompany') || 
                  sessionStorage.getItem('adminSelectedCompany') || 
                  '';
      }

      // Prepare employee data
      const employeeData = {
        id: employeeToEdit ? (employeeToEdit.id || employeeToEdit._id) : Date.now().toString(),
        _id: employeeToEdit ? (employeeToEdit._id || employeeToEdit.id) : null,
        employeeId: finalFormData.employeeId,
        name: `${finalFormData.firstName} ${finalFormData.lastName}`,
        jobTitle: finalFormData.jobTitle,
        department: finalFormData.department,
        company: company,
        location: finalFormData.location,
        status: employeeToEdit ? employeeToEdit.status : 'Active',
        tenure,
        email: finalFormData.email,
        phone: finalFormData.phone,
        joiningDate: finalFormData.joiningDate,
        role: finalFormData.role || 'user',
        hasCredentialAccess: finalFormData.hasCredentialAccess !== false,
        hasSubscriptionAccess: finalFormData.hasSubscriptionAccess !== false,
        password: finalFormData.password || '', // Include password for new employees
        ...finalFormData,
      };

      onSave(employeeData);
      // Don't close the dialog - keep it open for editing
      // User can continue editing or click Cancel/X to close
      alert(employeeToEdit ? 'Employee updated successfully! You can continue editing or close the dialog.' : 'Employee saved successfully! You can continue editing or close the dialog.');
    }
  };

  const handleClose = () => {
    setCurrentPhase(1);
    setFormData(getInitialFormData());
    setErrors({});
    onOpenChange(false);
  };

  const progress = (currentPhase / PHASES.length) * 100;

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 1: // Basic Details
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={errors.firstName ? 'border-red-500' : ''}
                placeholder="Enter first name"
              />
              {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={errors.lastName ? 'border-red-500' : ''}
                placeholder="Enter last name"
              />
              {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? 'border-red-500' : ''}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={errors.phone ? 'border-red-500' : ''}
                placeholder="Enter phone number"
              />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Address *</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={errors.address ? 'border-red-500' : ''}
                placeholder="Enter address"
              />
              {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={errors.city ? 'border-red-500' : ''}
                placeholder="Enter city"
              />
              {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State *</label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className={errors.state ? 'border-red-500' : ''}
                placeholder="Enter state"
              />
              {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Zip Code *</label>
              <Input
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className={errors.zipCode ? 'border-red-500' : ''}
                placeholder="Enter zip code"
              />
              {errors.zipCode && <p className="text-sm text-red-500 mt-1">{errors.zipCode}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact *</label>
              <Input
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className={errors.emergencyContact ? 'border-red-500' : ''}
                placeholder="Enter emergency contact name"
              />
              {errors.emergencyContact && <p className="text-sm text-red-500 mt-1">{errors.emergencyContact}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Phone *</label>
              <Input
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                placeholder="Auto-generated if empty"
              />
              <p className="text-xs text-slate-500 mt-1">Leave empty to auto-generate</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
              <Input
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className={errors.jobTitle ? 'border-red-500' : ''}
                placeholder="Enter job title"
              />
              {errors.jobTitle && <p className="text-sm text-red-500 mt-1">{errors.jobTitle}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  errors.department ? 'border-red-500' : 'border-neutral-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Select Department</option>
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="IT">IT</option>
                <option value="Thrive Ecom">Thrive Ecom</option>
              </select>
              {errors.department && <p className="text-sm text-red-500 mt-1">{errors.department}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Reporting Manager *</label>
              <Input
                value={formData.reportingManager}
                onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                className={errors.reportingManager ? 'border-red-500' : ''}
                placeholder="Enter reporting manager"
              />
              {errors.reportingManager && <p className="text-sm text-red-500 mt-1">{errors.reportingManager}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Joining Date *</label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g., Ecosoul Home, Thrive"
              />
              <p className="text-xs text-slate-500 mt-1">Leave empty to use default company</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={errors.password ? 'border-red-500' : ''}
                  placeholder="Enter password (min 6 characters)"
                />
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                <p className="text-xs text-slate-500 mt-1">Required for new employees</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password (Optional)</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, hasCredentialAccess: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Has Credential Access</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasSubscriptionAccess}
                    onChange={(e) => setFormData({ ...formData, hasSubscriptionAccess: e.target.checked })}
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
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                placeholder="Enter bank account number (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">IFSC Code</label>
              <Input
                value={formData.ifsc}
                onChange={(e) => setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })}
                placeholder="Enter IFSC code (optional)"
                maxLength={11}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PAN Number</label>
              <Input
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                placeholder="Enter PAN number (optional)"
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aadhaar Number</label>
              <Input
                value={formData.aadhaar}
                onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                placeholder="Enter Aadhaar number (optional)"
                maxLength={12}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">UAN Number</label>
              <Input
                value={formData.uan}
                onChange={(e) => setFormData({ ...formData, uan: e.target.value })}
                placeholder="Enter UAN number (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ESI Number</label>
              <Input
                value={formData.esiNo}
                onChange={(e) => setFormData({ ...formData, esiNo: e.target.value })}
                placeholder="Enter ESI number (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PF Number</label>
              <Input
                value={formData.pfNo}
                onChange={(e) => setFormData({ ...formData, pfNo: e.target.value })}
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
        
        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</p>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        {renderPhaseContent()}
      </div>
    </Modal>
    </>
  );
}

