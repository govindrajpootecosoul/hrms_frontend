'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Check, User, Briefcase, DollarSign, MessageSquare, Settings, Upload, FileSpreadsheet } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Textarea from '@/components/common/Textarea';
import RecruiterManagementDialog from './RecruiterManagementDialog';
import { useCompany } from '@/lib/context/CompanyContext';
import { useParams } from 'next/navigation';

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
  { value: 'Interview Scheduled', label: 'Interview Scheduled' },
  { value: 'Hired', label: 'Hired' },
  { value: 'On Hold', label: 'On Hold' },
];

// recruiterOptions will be fetched dynamically

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

export default function AddCandidateDialog({ open, onOpenChange, onSave, existingCandidates = [], candidateToEdit = null }) {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const [currentPhase, setCurrentPhase] = useState(1);
  const [recruiterOptions, setRecruiterOptions] = useState([]);
  const [isRecruiterDialogOpen, setIsRecruiterDialogOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState('single'); // 'single' or 'bulk'
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
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
    folderName: '',
  });

  const [errors, setErrors] = useState({});

  // Get company name helper
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

  // Fetch recruiters
  useEffect(() => {
    if (open) {
      fetchRecruiters();
    }
  }, [open]);

  const fetchRecruiters = async () => {
    try {
      const company = getCompanyName();
      const token = localStorage.getItem('auth_token');
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      if (company) {
        // For HRMS Admin Portal - don't send company header to allow all data access
        // headers['x-company'] = company;
      }

      const res = await fetch('/api/hrms-portal/recruitment/recruiters', { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const options = (json.data || []).map(recruiter => ({
            value: recruiter.name,
            label: recruiter.name
          }));
          setRecruiterOptions(options);
        }
      }
    } catch (error) {
      console.error('Fetch recruiters error:', error);
    }
  };

  const handleRecruitersUpdated = () => {
    fetchRecruiters();
  };

  // Populate form data when editing
  useEffect(() => {
    if (candidateToEdit && open) {
      const candidateData = candidateToEdit.candidateData || candidateToEdit;
      setFormData({
        candidateName: candidateData.candidateName || candidateToEdit.name || '',
        contactNumber: candidateData.contactNumber || candidateToEdit.contact || '',
        email: candidateData.email || candidateToEdit.email || '',
        currentLocation: candidateData.currentLocation || candidateToEdit.location || '',
        callingDate: candidateData.callingDate || candidateToEdit.callingDate || new Date().toISOString().split('T')[0],
        currentOrganisation: candidateData.currentOrganisation || candidateToEdit.organisation || '',
        education: candidateData.education || candidateToEdit.education || '',
        totalExperience: candidateData.totalExperience || candidateToEdit.experience || '',
        assignedTo: candidateData.assignedTo || candidateToEdit.assignedTo || '',
        status: candidateData.status || candidateToEdit.status || 'New',
        currentCTCFixed: candidateData.currentCTCFixed || candidateToEdit.currentCTCFixed || '',
        currentCTCInHand: candidateData.currentCTCInHand || candidateToEdit.currentCTCInHand || '',
        expectedCTC: candidateData.expectedCTC || candidateToEdit.expectedCTC || '',
        noticePeriod: candidateData.noticePeriod || candidateToEdit.noticePeriod || '',
        willingToWorkInStartup: candidateData.willingToWorkInStartup || candidateToEdit.willingToWorkInStartup || 'Yes',
        communicationSkills: candidateData.communicationSkills || candidateToEdit.communicationSkills || '',
        recruiterFeedback: candidateData.recruiterFeedback || candidateToEdit.recruiterFeedback || '',
        interviewerFeedback: candidateData.interviewerFeedback || candidateToEdit.interviewerFeedback || '',
        remark: candidateData.remark || candidateToEdit.remark || '',
        folderName: candidateData.folderName || candidateToEdit.folderName || '',
      });
      setCurrentPhase(1);
    } else if (!candidateToEdit && open) {
      // Reset form when adding new candidate
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
        folderName: '',
      });
      setCurrentPhase(1);
    }
  }, [candidateToEdit, open]);

  const progress = (currentPhase / PHASES.length) * 100;

  const validatePhase = (phase) => {
    const phaseData = PHASES.find(p => p.id === phase);
    if (!phaseData) return false;

    const newErrors = {};
    let isValid = true;

    // All fields are optional - only validate format when values are provided

    // Email validation (only if email is provided)
    if (phase === 1 && formData.email && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
        isValid = false;
      }
    }

    // Phone validation (only if phone is provided)
    if (phase === 1 && formData.contactNumber && formData.contactNumber.trim() !== '') {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(formData.contactNumber.replace(/\s/g, ''))) {
        newErrors.contactNumber = 'Invalid phone number';
        isValid = false;
      }
    }

    // CTC validation (only if values are provided)
    if (phase === 3) {
      const currentCTCFixedValue = formData.currentCTCFixed;
      if (currentCTCFixedValue !== null && currentCTCFixedValue !== undefined && currentCTCFixedValue !== '') {
        const currentCTCFixedStr = String(currentCTCFixedValue).trim();
        if (currentCTCFixedStr !== '' && parseFloat(currentCTCFixedStr) < 0) {
          newErrors.currentCTCFixed = 'CTC cannot be negative';
          isValid = false;
        }
      }
      const expectedCTCValue = formData.expectedCTC;
      if (expectedCTCValue !== null && expectedCTCValue !== undefined && expectedCTCValue !== '') {
        const expectedCTCStr = String(expectedCTCValue).trim();
        if (expectedCTCStr !== '' && parseFloat(expectedCTCStr) < 0) {
          newErrors.expectedCTC = 'Expected CTC cannot be negative';
          isValid = false;
        }
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
        ...(candidateToEdit?.id ? { id: candidateToEdit.id } : {}),
        ...formData,
        assignDate: candidateToEdit?.assignDate || new Date().toISOString().split('T')[0],
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
    setUploadMode('single');
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
      folderName: '',
    });
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls'].includes(fileExtension)) {
      alert('Please upload a valid Excel file (.xlsx or .xls)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);
    try {
      const company = getCompanyName();
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('companyId', companyId || '');
      if (company) {
        formData.append('company', company);
      }

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/hrms-portal/recruitment/candidates/bulk-upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const successMessage = `Successfully imported ${result.created || 0} candidate(s).`;
        const errorMessage = result.errors && result.errors.length > 0 
          ? `\n\nErrors:\n${result.errors.map(e => `Row ${e.row}: ${e.errors.join(', ')}`).join('\n')}`
          : '';
        alert(successMessage + errorMessage);
        handleClose();
        // Trigger refresh in parent component
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      } else {
        alert(result.error || 'Failed to upload candidates');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 1: // Basic Information
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Candidate Name</label>
              <Input
                value={formData.candidateName}
                onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                className={errors.candidateName ? 'border-red-500' : ''}
                placeholder="John Doe"
              />
              {errors.candidateName && <p className="text-sm text-red-500 mt-1">{errors.candidateName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
              <Input
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className={errors.contactNumber ? 'border-red-500' : ''}
                placeholder="+91 9876543210"
              />
              {errors.contactNumber && <p className="text-sm text-red-500 mt-1">{errors.contactNumber}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Location</label>
              <Input
                value={formData.currentLocation}
                onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                className={errors.currentLocation ? 'border-red-500' : ''}
                placeholder="Bangalore"
              />
              {errors.currentLocation && <p className="text-sm text-red-500 mt-1">{errors.currentLocation}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Calling Date</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Organisation</label>
              <Input
                value={formData.currentOrganisation}
                onChange={(e) => setFormData({ ...formData, currentOrganisation: e.target.value })}
                className={errors.currentOrganisation ? 'border-red-500' : ''}
                placeholder="Tech Corp"
              />
              {errors.currentOrganisation && <p className="text-sm text-red-500 mt-1">{errors.currentOrganisation}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Education</label>
              <Input
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                className={errors.education ? 'border-red-500' : ''}
                placeholder="B.Tech Computer Science"
              />
              {errors.education && <p className="text-sm text-red-500 mt-1">{errors.education}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Experience</label>
              <Input
                value={formData.totalExperience}
                onChange={(e) => setFormData({ ...formData, totalExperience: e.target.value })}
                className={errors.totalExperience ? 'border-red-500' : ''}
                placeholder="5 years"
              />
              {errors.totalExperience && <p className="text-sm text-red-500 mt-1">{errors.totalExperience}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">Assigned To</label>
                <button
                  type="button"
                  onClick={() => setIsRecruiterDialogOpen(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  title="Manage Recruiters"
                >
                  <Settings className="w-3 h-3" />
                  Manage
                </button>
              </div>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Current CTC (Fixed)</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Expected CTC</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Notice Period</label>
              <Input
                value={formData.noticePeriod}
                onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                className={errors.noticePeriod ? 'border-red-500' : ''}
                placeholder="30 days"
              />
              {errors.noticePeriod && <p className="text-sm text-red-500 mt-1">{errors.noticePeriod}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Willing to Work in Startup</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Communication Skills</label>
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Folder Name</label>
              <Input
                value={formData.folderName}
                onChange={(e) => setFormData({ ...formData, folderName: e.target.value })}
                placeholder="Folder_Example"
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
      title={candidateToEdit ? "Edit Candidate" : "Add New Candidate"}
      size="lg"
      footer={
        uploadMode === 'bulk' ? (
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setUploadMode('single');
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Back to Single Entry
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white hover:bg-blue-700"
              icon={<Upload className="h-4 w-4" />}
              iconPosition="left"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Excel File'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleBulkUpload}
              className="hidden"
            />
          </div>
        ) : (
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
        )
      }
    >
      {/* Upload Mode Toggle - Only show when adding new candidate (not editing) */}
      {!candidateToEdit && (
        <div className="mb-4 flex gap-2 border-b border-slate-200 pb-4">
          <button
            onClick={() => setUploadMode('single')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              uploadMode === 'single'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Single Entry
          </button>
          <button
            onClick={() => setUploadMode('bulk')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              uploadMode === 'bulk'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bulk Upload (Excel)
          </button>
        </div>
      )}

      {/* Bulk Upload Content */}
      {uploadMode === 'bulk' && !candidateToEdit ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Bulk Upload Instructions</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Download the Excel template using the "Download Template" button</li>
                  <li>Fill in the candidate details in the template</li>
                  <li>Upload the completed Excel file here</li>
                  <li>Make sure all required fields are filled correctly</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
            <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-4">
              Click the "Upload Excel File" button below to select your file
            </p>
            <p className="text-xs text-slate-500">
              Supported formats: .xlsx, .xls
            </p>
          </div>
        </div>
      ) : (
        <>
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
      </>
      )}
    </Modal>

    {/* Recruiter Management Dialog */}
    <RecruiterManagementDialog
      open={isRecruiterDialogOpen}
      onOpenChange={setIsRecruiterDialogOpen}
      onRecruitersUpdated={handleRecruitersUpdated}
    />
    </>
  );
}

