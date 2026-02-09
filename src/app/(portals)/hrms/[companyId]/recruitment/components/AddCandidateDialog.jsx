'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, User, Briefcase, DollarSign, MessageSquare } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Textarea from '@/components/common/Textarea';

const PHASES = [
  {
    id: 1,
    name: 'Basic Information',
    icon: User,
    fields: ['candidateName', 'contactNumber', 'email', 'currentLocation', 'callingDate']
  },
  {
    id: 2,
    name: 'Professional Details',
    icon: Briefcase,
    fields: ['currentOrganisation', 'education', 'totalExperience', 'assignedTo', 'status']
  },
  {
    id: 3,
    name: 'Compensation & Availability',
    icon: DollarSign,
    fields: ['currentCTCFixed', 'currentCTCInHand', 'expectedCTC', 'noticePeriod', 'willingToWorkInStartup']
  },
  {
    id: 4,
    name: 'Assessment & Feedback',
    icon: MessageSquare,
    fields: ['communicationSkills', 'recruiterFeedback', 'interviewerFeedback', 'remark']
  },
];

const statusOptions = [
  { value: 'New', label: 'New' },
  { value: 'Shortlisted', label: 'Shortlisted' },
  { value: 'In Interview', label: 'In Interview' },
  { value: 'Feedback Call', label: 'Feedback Call' },
  { value: 'Finalized', label: 'Finalized' },
  { value: 'Hired', label: 'Hired' },
  { value: 'On Hold', label: 'On Hold' },
];

const recruiterOptions = [
  { value: 'Sarah Johnson', label: 'Sarah Johnson' },
  { value: 'Mike Wilson', label: 'Mike Wilson' },
  { value: 'David Lee', label: 'David Lee' },
];

const communicationSkillsOptions = [
  { value: 'Excellent', label: 'Excellent' },
  { value: 'Very Good', label: 'Very Good' },
  { value: 'Good', label: 'Good' },
  { value: 'Average', label: 'Average' },
  { value: 'Poor', label: 'Poor' },
];

const yesNoOptions = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];

export default function AddCandidateDialog({ open, onOpenChange, onSave, existingCandidates = [] }) {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    candidateName: '',
    contactNumber: '',
    email: '',
    currentLocation: '',
    callingDate: new Date().toISOString().split('T')[0],
    
    // Professional Details
    currentOrganisation: '',
    education: '',
    totalExperience: '',
    assignedTo: '',
    status: 'New',
    
    // Compensation & Availability
    currentCTCFixed: '',
    currentCTCInHand: '',
    expectedCTC: '',
    noticePeriod: '',
    willingToWorkInStartup: 'Yes',
    
    // Assessment & Feedback
    communicationSkills: '',
    recruiterFeedback: '',
    interviewerFeedback: '',
    remark: '',
  });

  const [errors, setErrors] = useState({});

  const progress = (currentPhase / PHASES.length) * 100;

  const validatePhase = (phase) => {
    const phaseData = PHASES.find(p => p.id === phase);
    if (!phaseData) return false;

    const newErrors = {};
    let isValid = true;

    // Check required fields
    phaseData.fields.forEach((field) => {
      // Skip validation for optional fields
      if (field === 'currentCTCInHand' || field === 'recruiterFeedback' || field === 'interviewerFeedback' || field === 'remark') {
        return;
      }
      
      if (!formData[field] || formData[field].toString().trim() === '') {
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
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

    // Phone validation
    if (phase === 1 && formData.contactNumber) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(formData.contactNumber.replace(/\s/g, ''))) {
        newErrors.contactNumber = 'Invalid phone number';
        isValid = false;
      }
    }

    // CTC validation
    if (phase === 3) {
      if (formData.currentCTCFixed && parseFloat(formData.currentCTCFixed) < 0) {
        newErrors.currentCTCFixed = 'CTC cannot be negative';
        isValid = false;
      }
      if (formData.expectedCTC && parseFloat(formData.expectedCTC) < 0) {
        newErrors.expectedCTC = 'Expected CTC cannot be negative';
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
      const candidateData = {
        id: String(Date.now()),
        ...formData,
        assignDate: new Date().toISOString().split('T')[0],
        currentCTCFixed: parseFloat(formData.currentCTCFixed) || 0,
        currentCTCInHand: parseFloat(formData.currentCTCInHand) || 0,
        expectedCTC: parseFloat(formData.expectedCTC) || 0,
      };
      onSave(candidateData);
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentPhase(1);
    setFormData({
      candidateName: '',
      contactNumber: '',
      email: '',
      currentLocation: '',
      callingDate: new Date().toISOString().split('T')[0],
      currentOrganisation: '',
      education: '',
      totalExperience: '',
      assignedTo: '',
      status: 'New',
      currentCTCFixed: '',
      currentCTCInHand: '',
      expectedCTC: '',
      noticePeriod: '',
      willingToWorkInStartup: 'Yes',
      communicationSkills: '',
      recruiterFeedback: '',
      interviewerFeedback: '',
      remark: '',
    });
    setErrors({});
    onOpenChange(false);
  };

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 1: // Basic Information
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Candidate Name *</label>
              <Input
                value={formData.candidateName}
                onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                className={errors.candidateName ? 'border-red-500' : ''}
                placeholder="John Doe"
              />
              {errors.candidateName && <p className="text-sm text-red-500 mt-1">{errors.candidateName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number *</label>
              <Input
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className={errors.contactNumber ? 'border-red-500' : ''}
                placeholder="+91 9876543210"
              />
              {errors.contactNumber && <p className="text-sm text-red-500 mt-1">{errors.contactNumber}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? 'border-red-500' : ''}
                placeholder="john.doe@example.com"
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Location *</label>
              <Input
                value={formData.currentLocation}
                onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                className={errors.currentLocation ? 'border-red-500' : ''}
                placeholder="Bangalore"
              />
              {errors.currentLocation && <p className="text-sm text-red-500 mt-1">{errors.currentLocation}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Calling Date *</label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.callingDate}
                  onChange={(e) => setFormData({ ...formData, callingDate: e.target.value })}
                  className={`${errors.callingDate ? 'border-red-500' : ''} pr-10`}
                  data-lpignore="true"
                  data-form-type="other"
                  autoComplete="off"
                  style={{ position: 'relative', zIndex: 1 }}
                />
              </div>
              {errors.callingDate && <p className="text-sm text-red-500 mt-1">{errors.callingDate}</p>}
            </div>
          </div>
        );

      case 2: // Professional Details
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Organisation *</label>
              <Input
                value={formData.currentOrganisation}
                onChange={(e) => setFormData({ ...formData, currentOrganisation: e.target.value })}
                className={errors.currentOrganisation ? 'border-red-500' : ''}
                placeholder="Tech Corp"
              />
              {errors.currentOrganisation && <p className="text-sm text-red-500 mt-1">{errors.currentOrganisation}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Education *</label>
              <Input
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                className={errors.education ? 'border-red-500' : ''}
                placeholder="B.Tech Computer Science"
              />
              {errors.education && <p className="text-sm text-red-500 mt-1">{errors.education}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Experience *</label>
              <Input
                value={formData.totalExperience}
                onChange={(e) => setFormData({ ...formData, totalExperience: e.target.value })}
                className={errors.totalExperience ? 'border-red-500' : ''}
                placeholder="5 years"
              />
              {errors.totalExperience && <p className="text-sm text-red-500 mt-1">{errors.totalExperience}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assigned To *</label>
              <Select
                options={recruiterOptions}
                value={formData.assignedTo}
                onChange={(value) => setFormData({ ...formData, assignedTo: value })}
                placeholder="Select recruiter"
                error={errors.assignedTo}
              />
              {errors.assignedTo && <p className="text-sm text-red-500 mt-1">{errors.assignedTo}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
              <Select
                options={statusOptions}
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value })}
                error={errors.status}
              />
              {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
            </div>
          </div>
        );

      case 3: // Compensation & Availability
        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current CTC (Fixed) *</label>
              <Input
                type="number"
                value={formData.currentCTCFixed}
                onChange={(e) => setFormData({ ...formData, currentCTCFixed: e.target.value })}
                className={errors.currentCTCFixed ? 'border-red-500' : ''}
                placeholder="800000"
              />
              {errors.currentCTCFixed && <p className="text-sm text-red-500 mt-1">{errors.currentCTCFixed}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current CTC (In-hand)</label>
              <Input
                type="number"
                value={formData.currentCTCInHand}
                onChange={(e) => setFormData({ ...formData, currentCTCInHand: e.target.value })}
                placeholder="650000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expected CTC *</label>
              <Input
                type="number"
                value={formData.expectedCTC}
                onChange={(e) => setFormData({ ...formData, expectedCTC: e.target.value })}
                className={errors.expectedCTC ? 'border-red-500' : ''}
                placeholder="1000000"
              />
              {errors.expectedCTC && <p className="text-sm text-red-500 mt-1">{errors.expectedCTC}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notice Period *</label>
              <Input
                value={formData.noticePeriod}
                onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                className={errors.noticePeriod ? 'border-red-500' : ''}
                placeholder="30 days"
              />
              {errors.noticePeriod && <p className="text-sm text-red-500 mt-1">{errors.noticePeriod}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Willing to Work in Startup *</label>
              <Select
                options={yesNoOptions}
                value={formData.willingToWorkInStartup}
                onChange={(value) => setFormData({ ...formData, willingToWorkInStartup: value })}
                error={errors.willingToWorkInStartup}
              />
              {errors.willingToWorkInStartup && <p className="text-sm text-red-500 mt-1">{errors.willingToWorkInStartup}</p>}
            </div>
          </div>
        );

      case 4: // Assessment & Feedback
        return (
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Communication Skills *</label>
              <Select
                options={communicationSkillsOptions}
                value={formData.communicationSkills}
                onChange={(value) => setFormData({ ...formData, communicationSkills: value })}
                placeholder="Select rating"
                error={errors.communicationSkills}
              />
              {errors.communicationSkills && <p className="text-sm text-red-500 mt-1">{errors.communicationSkills}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Recruiter Feedback</label>
              <Textarea
                value={formData.recruiterFeedback}
                onChange={(e) => setFormData({ ...formData, recruiterFeedback: e.target.value })}
                rows={3}
                placeholder="Enter recruiter's initial feedback..."
                className="border border-neutral-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Interviewer Feedback</label>
              <Textarea
                value={formData.interviewerFeedback}
                onChange={(e) => setFormData({ ...formData, interviewerFeedback: e.target.value })}
                rows={3}
                placeholder="Will be updated after interview..."
                className="border border-neutral-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Remark</label>
              <Textarea
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                rows={2}
                placeholder="Any additional notes..."
                className="border border-neutral-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              />
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
      title="Add New Candidate"
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
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 text-white hover:bg-blue-700"
                icon={<Check className="h-4 w-4" />}
                iconPosition="left"
              >
                Save Candidate
              </Button>
            )}
          </div>
        </div>
      }
    >
      {/* Progress Bar */}
      <div className="space-y-2 py-4 mb-6">
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
        <div className="flex gap-2 justify-center flex-wrap mt-4">
          {PHASES.map((phase) => {
            const Icon = phase.icon;
            return (
              <div
                key={phase.id}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  phase.id < currentPhase
                    ? 'bg-green-100 text-green-700'
                    : phase.id === currentPhase
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {phase.id < currentPhase ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Icon className="w-3 h-3" />
                )}
                {phase.name}
              </div>
            );
          })}
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

