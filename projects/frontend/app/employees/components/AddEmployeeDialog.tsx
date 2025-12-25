'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (employeeData: any) => void;
  existingEmployees?: any[];
}

const PHASES = [
  { id: 1, name: 'Basic Details', fields: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender'] },
  { id: 2, name: 'Personal Details', fields: ['address', 'city', 'state', 'zipCode', 'emergencyContact', 'emergencyPhone'] },
  { id: 3, name: 'Work Details', fields: ['employeeId', 'jobTitle', 'department', 'location', 'reportingManager', 'joiningDate'] },
  { id: 4, name: 'Bank & Insurance', fields: ['bankAccount', 'ifsc', 'pan', 'aadhaar', 'uan', 'esiNo', 'pfNo'] },
];

export default function AddEmployeeDialog({ open, onOpenChange, onSave, existingEmployees = [] }: AddEmployeeDialogProps) {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [formData, setFormData] = useState<any>({
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
    location: '',
    reportingManager: '',
    joiningDate: '',
    // Bank & Insurance
    bankAccount: '',
    ifsc: '',
    pan: '',
    aadhaar: '',
    uan: '',
    esiNo: '',
    pfNo: '',
  });

  const [errors, setErrors] = useState<any>({});

  const validatePhase = (phase: number): boolean => {
    const phaseData = PHASES.find(p => p.id === phase);
    if (!phaseData) return false;

    const newErrors: any = {};
    let isValid = true;

    phaseData.fields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
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
    if (validatePhase(currentPhase)) {
      if (currentPhase < PHASES.length) {
        setCurrentPhase(currentPhase + 1);
        setErrors({});
      }
    }
  };

  const handlePrevious = () => {
    if (currentPhase > 1) {
      setCurrentPhase(currentPhase - 1);
      setErrors({});
    }
  };

  const handleSubmit = () => {
    if (validatePhase(currentPhase)) {
      // Generate employee ID if not provided
      if (!formData.employeeId) {
        // Find the highest employee ID number
        const employeeNumbers = existingEmployees
          .map((emp: any) => {
            const match = emp.employeeId?.match(/EMP(\d+)/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter((num: number) => !isNaN(num));
        
        const maxNumber = employeeNumbers.length > 0 ? Math.max(...employeeNumbers) : 0;
        const nextNumber = maxNumber + 1;
        formData.employeeId = `EMP${String(nextNumber).padStart(3, '0')}`;
      }

      // Calculate tenure
      const joiningDate = new Date(formData.joiningDate);
      const today = new Date();
      let years = today.getFullYear() - joiningDate.getFullYear();
      let months = today.getMonth() - joiningDate.getMonth();
      
      if (months < 0) {
        years--;
        months += 12;
      }
      
      const tenure = `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;

      const employeeData = {
        id: Date.now().toString(),
        employeeId: formData.employeeId,
        name: `${formData.firstName} ${formData.lastName}`,
        jobTitle: formData.jobTitle,
        department: formData.department,
        location: formData.location,
        status: 'Active',
        tenure,
        email: formData.email,
        phone: formData.phone,
        ...formData,
      };

      onSave(employeeData);
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentPhase(1);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      emergencyContact: '',
      emergencyPhone: '',
      employeeId: '',
      jobTitle: '',
      department: '',
      location: '',
      reportingManager: '',
      joiningDate: '',
      bankAccount: '',
      ifsc: '',
      pan: '',
      aadhaar: '',
      uan: '',
      esiNo: '',
      pfNo: '',
    });
    setErrors({});
    onOpenChange(false);
  };

  const progress = (currentPhase / PHASES.length) * 100;

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 1: // Basic Details
        return (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className={errors.dateOfBirth ? 'border-red-500' : ''}
                />
                {errors.dateOfBirth && <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth}</p>}
              </div>
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
              </div>
            </div>
          </div>
        );

      case 2: // Personal Details
        return (
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className={errors.state ? 'border-red-500' : ''}
                />
                {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
              </div>
              <div>
                <Label htmlFor="zipCode">Zip Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className={errors.zipCode ? 'border-red-500' : ''}
                />
                {errors.zipCode && <p className="text-sm text-red-500 mt-1">{errors.zipCode}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className={errors.emergencyContact ? 'border-red-500' : ''}
                />
                {errors.emergencyContact && <p className="text-sm text-red-500 mt-1">{errors.emergencyContact}</p>}
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  className={errors.emergencyPhone ? 'border-red-500' : ''}
                />
                {errors.emergencyPhone && <p className="text-sm text-red-500 mt-1">{errors.emergencyPhone}</p>}
              </div>
            </div>
          </div>
        );

      case 3: // Work Details
        return (
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="Auto-generated if left empty"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className={errors.jobTitle ? 'border-red-500' : ''}
                />
                {errors.jobTitle && <p className="text-sm text-red-500 mt-1">{errors.jobTitle}</p>}
              </div>
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-sm text-red-500 mt-1">{errors.department}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location *</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                >
                  <SelectTrigger className={errors.location ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New York">New York</SelectItem>
                    <SelectItem value="Chicago">Chicago</SelectItem>
                    <SelectItem value="Los Angeles">Los Angeles</SelectItem>
                    <SelectItem value="Miami">Miami</SelectItem>
                    <SelectItem value="Boston">Boston</SelectItem>
                  </SelectContent>
                </Select>
                {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
              </div>
              <div>
                <Label htmlFor="reportingManager">Reporting Manager *</Label>
                <Input
                  id="reportingManager"
                  value={formData.reportingManager}
                  onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                  className={errors.reportingManager ? 'border-red-500' : ''}
                />
                {errors.reportingManager && <p className="text-sm text-red-500 mt-1">{errors.reportingManager}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="joiningDate">Joining Date *</Label>
              <Input
                id="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className={errors.joiningDate ? 'border-red-500' : ''}
              />
              {errors.joiningDate && <p className="text-sm text-red-500 mt-1">{errors.joiningDate}</p>}
            </div>
          </div>
        );

      case 4: // Bank & Insurance
        return (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankAccount">Bank Account Number *</Label>
                <Input
                  id="bankAccount"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  className={errors.bankAccount ? 'border-red-500' : ''}
                />
                {errors.bankAccount && <p className="text-sm text-red-500 mt-1">{errors.bankAccount}</p>}
              </div>
              <div>
                <Label htmlFor="ifsc">IFSC Code *</Label>
                <Input
                  id="ifsc"
                  value={formData.ifsc}
                  onChange={(e) => setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })}
                  className={errors.ifsc ? 'border-red-500' : ''}
                />
                {errors.ifsc && <p className="text-sm text-red-500 mt-1">{errors.ifsc}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pan">PAN Number *</Label>
                <Input
                  id="pan"
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  maxLength={10}
                  className={errors.pan ? 'border-red-500' : ''}
                />
                {errors.pan && <p className="text-sm text-red-500 mt-1">{errors.pan}</p>}
              </div>
              <div>
                <Label htmlFor="aadhaar">Aadhaar Number *</Label>
                <Input
                  id="aadhaar"
                  value={formData.aadhaar}
                  onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                  maxLength={12}
                  className={errors.aadhaar ? 'border-red-500' : ''}
                />
                {errors.aadhaar && <p className="text-sm text-red-500 mt-1">{errors.aadhaar}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="uan">UAN Number *</Label>
                <Input
                  id="uan"
                  value={formData.uan}
                  onChange={(e) => setFormData({ ...formData, uan: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                  maxLength={12}
                  className={errors.uan ? 'border-red-500' : ''}
                />
                {errors.uan && <p className="text-sm text-red-500 mt-1">{errors.uan}</p>}
              </div>
              <div>
                <Label htmlFor="esiNo">ESI Number</Label>
                <Input
                  id="esiNo"
                  value={formData.esiNo}
                  onChange={(e) => setFormData({ ...formData, esiNo: e.target.value.replace(/\D/g, '') })}
                />
              </div>
              <div>
                <Label htmlFor="pfNo">PF Number</Label>
                <Input
                  id="pfNo"
                  value={formData.pfNo}
                  onChange={(e) => setFormData({ ...formData, pfNo: e.target.value })}
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Fill in the employee details in phases. Complete each phase before proceeding.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="space-y-2 py-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Phase {currentPhase} of {PHASES.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex gap-2 justify-center">
            {PHASES.map((phase) => (
              <div
                key={phase.id}
                className={`flex items-center gap-1 text-xs ${
                  phase.id < currentPhase
                    ? 'text-green-600'
                    : phase.id === currentPhase
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground'
                }`}
              >
                {phase.id < currentPhase ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <div
                    className={`h-3 w-3 rounded-full ${
                      phase.id === currentPhase
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  />
                )}
                {phase.name}
              </div>
            ))}
          </div>
        </div>

        {/* Phase Content */}
        <div className="min-h-[400px]">
          {renderPhaseContent()}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {currentPhase > 1 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {currentPhase < PHASES.length ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                <Check className="mr-2 h-4 w-4" />
                Save Employee
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

