'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, User, CreditCard, Home } from 'lucide-react';
import { HRMS_DEPARTMENTS, HRMS_DESIGNATIONS, HRMS_BLOOD_GROUPS, HRMS_MARITAL_STATUS } from '@/lib/utils/constants';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Card from '@/components/common/Card';

const EmployeeForm = ({ 
  employee = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef(null);
  const [profileName, setProfileName] = useState('');
  const [formData, setFormData] = useState({
    // Step 1: Basic Details
    name: employee?.name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    department: employee?.department || '',
    designation: employee?.designation || '',
    gender: employee?.gender || '',
    dateOfBirth: employee?.dateOfBirth || '',
    biometricId: employee?.biometricId || '',
    profilePicture: employee?.profilePicture || null,
    
    // Step 2: Personal Details
    fatherName: employee?.fatherName || '',
    personalEmail: employee?.personalEmail || '',
    maritalStatus: employee?.maritalStatus || '',
    bloodGroup: employee?.bloodGroup || '',
    address: employee?.address || '',
    emergencyContact: employee?.emergencyContact || '',
    
    // Step 3: Bank Details
    accountNumber: employee?.accountNumber || '',
    ifscCode: employee?.ifscCode || '',
    bankName: employee?.bankName || '',
    branch: employee?.branch || '',
    panNumber: employee?.panNumber || '',
    aadharNumber: employee?.aadharNumber || '',
    uanNumber: employee?.uanNumber || ''
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, title: 'Basic Details', icon: <User className="w-5 h-5" /> },
    { id: 2, title: 'Personal Details', icon: <Home className="w-5 h-5" /> },
    { id: 3, title: 'Bank Details', icon: <CreditCard className="w-5 h-5" /> }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.phone) newErrors.phone = 'Phone is required';
        if (!formData.department) newErrors.department = 'Department is required';
        if (!formData.designation) newErrors.designation = 'Designation is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.biometricId) newErrors.biometricId = 'Biometric ID is required';
        break;
      case 2:
        if (!formData.fatherName) newErrors.fatherName = 'Father\'s name is required';
        if (!formData.personalEmail) newErrors.personalEmail = 'Personal email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.personalEmail)) newErrors.personalEmail = 'Personal email is invalid';
        if (!formData.maritalStatus) newErrors.maritalStatus = 'Marital status is required';
        if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.emergencyContact) newErrors.emergencyContact = 'Emergency contact is required';
        break;
      case 3:
        if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
        if (!formData.ifscCode) newErrors.ifscCode = 'IFSC code is required';
        if (!formData.bankName) newErrors.bankName = 'Bank name is required';
        if (!formData.branch) newErrors.branch = 'Branch is required';
        if (!formData.panNumber) newErrors.panNumber = 'PAN number is required';
        if (!formData.aadharNumber) newErrors.aadharNumber = 'Aadhar number is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onSubmit(formData);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">Profile Picture</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center">
              {formData.profilePicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={formData.profilePicture} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg text-neutral-900 font-semibold">
                  {(formData.name || 'E').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-900 transition-colors"
              >
                Upload Photo
              </button>
              {profileName && (
                <span className="text-neutral-600 text-xs truncate max-w-[160px]">{profileName}</span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => handleChange('profilePicture', reader.result);
                  reader.readAsDataURL(file);
                  setProfileName(file.name);
                }}
              />
            </div>
          </div>
        </div>
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          required
        />
        
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          required
        />
        
        <Input
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          required
        />
        
        <Select
          label="Department"
          options={HRMS_DEPARTMENTS.map(dept => ({ value: dept, label: dept }))}
          value={formData.department}
          onChange={(value) => handleChange('department', value)}
          error={errors.department}
          required
        />
        
        <Select
          label="Designation"
          options={HRMS_DESIGNATIONS.map(des => ({ value: des, label: des }))}
          value={formData.designation}
          onChange={(value) => handleChange('designation', value)}
          error={errors.designation}
          required
        />
        
        <Select
          label="Gender"
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' }
          ]}
          value={formData.gender}
          onChange={(value) => handleChange('gender', value)}
          error={errors.gender}
          required
        />
        
        <Input
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          error={errors.dateOfBirth}
          required
        />
        
        <Input
          label="Biometric ID"
          value={formData.biometricId}
          onChange={(e) => handleChange('biometricId', e.target.value)}
          error={errors.biometricId}
          required
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Father's Name"
          value={formData.fatherName}
          onChange={(e) => handleChange('fatherName', e.target.value)}
          error={errors.fatherName}
          required
        />
        
        <Input
          label="Personal Email"
          type="email"
          value={formData.personalEmail}
          onChange={(e) => handleChange('personalEmail', e.target.value)}
          error={errors.personalEmail}
          required
        />
        
        <Select
          label="Marital Status"
          options={HRMS_MARITAL_STATUS.map(status => ({ value: status, label: status }))}
          value={formData.maritalStatus}
          onChange={(value) => handleChange('maritalStatus', value)}
          error={errors.maritalStatus}
          required
        />
        
        <Select
          label="Blood Group"
          options={HRMS_BLOOD_GROUPS.map(group => ({ value: group, label: group }))}
          value={formData.bloodGroup}
          onChange={(value) => handleChange('bloodGroup', value)}
          error={errors.bloodGroup}
          required
        />
        
        <div className="md:col-span-2">
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            error={errors.address}
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <Input
            label="Emergency Contact"
            type="tel"
            value={formData.emergencyContact}
            onChange={(e) => handleChange('emergencyContact', e.target.value)}
            error={errors.emergencyContact}
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Account Number"
          value={formData.accountNumber}
          onChange={(e) => handleChange('accountNumber', e.target.value)}
          error={errors.accountNumber}
          required
        />
        
        <Input
          label="IFSC Code"
          value={formData.ifscCode}
          onChange={(e) => handleChange('ifscCode', e.target.value)}
          error={errors.ifscCode}
          required
        />
        
        <Input
          label="Bank Name"
          value={formData.bankName}
          onChange={(e) => handleChange('bankName', e.target.value)}
          error={errors.bankName}
          required
        />
        
        <Input
          label="Branch"
          value={formData.branch}
          onChange={(e) => handleChange('branch', e.target.value)}
          error={errors.branch}
          required
        />
        
        <Input
          label="PAN Number"
          value={formData.panNumber}
          onChange={(e) => handleChange('panNumber', e.target.value)}
          error={errors.panNumber}
          required
        />
        
        <Input
          label="Aadhar Number"
          value={formData.aadharNumber}
          onChange={(e) => handleChange('aadharNumber', e.target.value)}
          error={errors.aadharNumber}
          required
        />
        
        <Input
          label="UAN Number"
          value={formData.uanNumber}
          onChange={(e) => handleChange('uanNumber', e.target.value)}
          error={errors.uanNumber}
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return renderStep1();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
              ${currentStep >= step.id 
                ? 'bg-primary-600 text-white border-primary-600' 
                : 'border-neutral-300 text-neutral-500'
              }
            `}>
              {step.icon}
            </div>
            <span className={`
              ml-2 text-sm font-medium
              ${currentStep >= step.id ? 'text-neutral-900' : 'text-neutral-600'}
            `}>
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div className={`
                w-16 h-0.5 mx-4
                ${currentStep > step.id ? 'bg-primary-600' : 'bg-neutral-300'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <Card variant="glass">
        {renderCurrentStep()}
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          icon={<ChevronLeft className="w-4 h-4" />}
        >
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>
        
        <div className="flex space-x-3">
          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              icon={<ChevronRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={loading}
            >
              {employee ? 'Update Employee' : 'Create Employee'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
