'use client';

import { useState } from 'react';
import { 
  User, 
  Calendar, 
  Phone, 
  ChevronLeft,
  ChevronRight,
  Mail,
  Briefcase,
  Clock,
  Users,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Checkbox from '@/components/common/Checkbox';
import Card from '@/components/common/Card';

const CandidateForm = ({ 
  candidate = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    firstName: candidate?.firstName || '',
    lastName: candidate?.lastName || '',
    email: candidate?.email || '',
    phone: candidate?.phone || '',
    position: candidate?.position || '',
    department: candidate?.department || '',
    experience: candidate?.experience || '',
    currentCompany: candidate?.currentCompany || '',
    expectedSalary: candidate?.expectedSalary || '',
    noticePeriod: candidate?.noticePeriod || '',
    
    // Step 2: Interview Details
    interviewDate: candidate?.interviewDate || '',
    interviewTime: candidate?.interviewTime || '',
    interviewRound: candidate?.interviewRound || '',
    screeningCall: candidate?.screeningCall || false,
    screeningCallDate: candidate?.screeningCallDate || '',
    screeningCallTime: candidate?.screeningCallTime || '',
    interviewType: candidate?.interviewType || '',
    interviewLocation: candidate?.interviewLocation || '',
    interviewer: candidate?.interviewer || '',
    
    // Step 3: Onboarding Checks
    resumeReceived: candidate?.resumeReceived || false,
    backgroundCheck: candidate?.backgroundCheck || false,
    referenceCheck: candidate?.referenceCheck || false,
    documentVerification: candidate?.documentVerification || false,
    offerLetterSent: candidate?.offerLetterSent || false,
    offerAccepted: candidate?.offerAccepted || false,
    joiningDate: candidate?.joiningDate || '',
    additionalNotes: candidate?.additionalNotes || ''
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, title: 'Candidate Info', icon: <User className="w-5 h-5" /> },
    { id: 2, title: 'Interview Details', icon: <Calendar className="w-5 h-5" /> },
    { id: 3, title: 'Onboarding Checks', icon: <CheckCircle2 className="w-5 h-5" /> }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
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
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!formData.position) newErrors.position = 'Position is required';
        if (!formData.department) newErrors.department = 'Department is required';
        break;
      case 2:
        if (!formData.interviewDate) newErrors.interviewDate = 'Interview date is required';
        if (!formData.interviewTime) newErrors.interviewTime = 'Interview time is required';
        if (!formData.interviewRound) newErrors.interviewRound = 'Interview round is required';
        if (formData.screeningCall && !formData.screeningCallDate) {
          newErrors.screeningCallDate = 'Screening call date is required';
        }
        break;
      case 3:
        if (!formData.joiningDate) newErrors.joiningDate = 'Joining date is required';
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
        <Input
          label="First Name"
          value={formData.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          error={errors.firstName}
          required
          icon={<User className="w-4 h-4" />}
        />
        
        <Input
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          error={errors.lastName}
          required
          icon={<User className="w-4 h-4" />}
        />
        
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          required
          icon={<Mail className="w-4 h-4" />}
        />
        
        <Input
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          required
          icon={<Phone className="w-4 h-4" />}
        />
        
        <Select
          label="Position Applied For"
          options={[
            { value: 'software-engineer', label: 'Software Engineer' },
            { value: 'senior-engineer', label: 'Senior Software Engineer' },
            { value: 'product-manager', label: 'Product Manager' },
            { value: 'designer', label: 'UI/UX Designer' },
            { value: 'data-analyst', label: 'Data Analyst' },
            { value: 'hr-manager', label: 'HR Manager' },
            { value: 'marketing-specialist', label: 'Marketing Specialist' },
            { value: 'sales-executive', label: 'Sales Executive' }
          ]}
          value={formData.position}
          onChange={(value) => handleChange('position', value)}
          error={errors.position}
          required
        />
        
        <Select
          label="Department"
          options={[
            { value: 'engineering', label: 'Engineering' },
            { value: 'product', label: 'Product' },
            { value: 'design', label: 'Design' },
            { value: 'hr', label: 'Human Resources' },
            { value: 'marketing', label: 'Marketing' },
            { value: 'sales', label: 'Sales' },
            { value: 'finance', label: 'Finance' },
            { value: 'operations', label: 'Operations' }
          ]}
          value={formData.department}
          onChange={(value) => handleChange('department', value)}
          error={errors.department}
          required
        />
        
        <Input
          label="Years of Experience"
          type="number"
          value={formData.experience}
          onChange={(e) => handleChange('experience', e.target.value)}
          error={errors.experience}
          placeholder="e.g., 3"
        />
        
        <Input
          label="Current Company"
          value={formData.currentCompany}
          onChange={(e) => handleChange('currentCompany', e.target.value)}
          error={errors.currentCompany}
          icon={<Briefcase className="w-4 h-4" />}
        />
        
        <Input
          label="Expected Salary"
          type="number"
          value={formData.expectedSalary}
          onChange={(e) => handleChange('expectedSalary', e.target.value)}
          error={errors.expectedSalary}
          placeholder="e.g., 50000"
        />
        
        <Input
          label="Notice Period (Days)"
          type="number"
          value={formData.noticePeriod}
          onChange={(e) => handleChange('noticePeriod', e.target.value)}
          error={errors.noticePeriod}
          placeholder="e.g., 30"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Interview Date"
          type="date"
          value={formData.interviewDate}
          onChange={(e) => handleChange('interviewDate', e.target.value)}
          error={errors.interviewDate}
          required
          icon={<Calendar className="w-4 h-4" />}
        />
        
        <Input
          label="Interview Time"
          type="time"
          value={formData.interviewTime}
          onChange={(e) => handleChange('interviewTime', e.target.value)}
          error={errors.interviewTime}
          required
          icon={<Clock className="w-4 h-4" />}
        />
        
        <Select
          label="Interview Round"
          options={[
            { value: 'screening', label: 'Screening Round' },
            { value: 'technical-1', label: 'Technical Round 1' },
            { value: 'technical-2', label: 'Technical Round 2' },
            { value: 'managerial', label: 'Managerial Round' },
            { value: 'hr', label: 'HR Round' },
            { value: 'final', label: 'Final Round' }
          ]}
          value={formData.interviewRound}
          onChange={(value) => handleChange('interviewRound', value)}
          error={errors.interviewRound}
          required
        />
        
        <Select
          label="Interview Type"
          options={[
            { value: 'in-person', label: 'In-Person' },
            { value: 'video', label: 'Video Call' },
            { value: 'phone', label: 'Phone Call' },
            { value: 'hybrid', label: 'Hybrid' }
          ]}
          value={formData.interviewType}
          onChange={(value) => handleChange('interviewType', value)}
          error={errors.interviewType}
        />
        
        <Input
          label="Interview Location"
          value={formData.interviewLocation}
          onChange={(e) => handleChange('interviewLocation', e.target.value)}
          error={errors.interviewLocation}
          icon={<MapPin className="w-4 h-4" />}
          placeholder="Office address or video link"
        />
        
        <Input
          label="Interviewer Name"
          value={formData.interviewer}
          onChange={(e) => handleChange('interviewer', e.target.value)}
          error={errors.interviewer}
          icon={<Users className="w-4 h-4" />}
        />
      </div>

      <div className="pt-4 border-t border-neutral-200">
        <div className="space-y-4">
          <Checkbox
            label="Schedule Screening Call"
            checked={formData.screeningCall}
            onChange={(e) => handleChange('screeningCall', e.target.checked)}
          />
          
          {formData.screeningCall && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-8 mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <Input
                label="Screening Call Date"
                type="date"
                value={formData.screeningCallDate}
                onChange={(e) => handleChange('screeningCallDate', e.target.value)}
                error={errors.screeningCallDate}
                required={formData.screeningCall}
                icon={<Calendar className="w-4 h-4" />}
              />
              
              <Input
                label="Screening Call Time"
                type="time"
                value={formData.screeningCallTime}
                onChange={(e) => handleChange('screeningCallTime', e.target.value)}
                error={errors.screeningCallTime}
                icon={<Clock className="w-4 h-4" />}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Expected Joining Date"
          type="date"
          value={formData.joiningDate}
          onChange={(e) => handleChange('joiningDate', e.target.value)}
          error={errors.joiningDate}
          required
          icon={<Calendar className="w-4 h-4" />}
        />
      </div>

      <div className="pt-4 border-t border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-2 text-primary-600" />
          Onboarding Checklist
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors">
            <Checkbox
              label="Resume Received"
              checked={formData.resumeReceived}
              onChange={(e) => handleChange('resumeReceived', e.target.checked)}
            />
          </div>
          
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors">
            <Checkbox
              label="Background Check Completed"
              checked={formData.backgroundCheck}
              onChange={(e) => handleChange('backgroundCheck', e.target.checked)}
            />
          </div>
          
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors">
            <Checkbox
              label="Reference Check Completed"
              checked={formData.referenceCheck}
              onChange={(e) => handleChange('referenceCheck', e.target.checked)}
            />
          </div>
          
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors">
            <Checkbox
              label="Document Verification Done"
              checked={formData.documentVerification}
              onChange={(e) => handleChange('documentVerification', e.target.checked)}
            />
          </div>
          
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors">
            <Checkbox
              label="Offer Letter Sent"
              checked={formData.offerLetterSent}
              onChange={(e) => handleChange('offerLetterSent', e.target.checked)}
            />
          </div>
          
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors">
            <Checkbox
              label="Offer Accepted"
              checked={formData.offerAccepted}
              onChange={(e) => handleChange('offerAccepted', e.target.checked)}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-neutral-200">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Additional Notes
          </label>
          <textarea
            value={formData.additionalNotes}
            onChange={(e) => handleChange('additionalNotes', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200 resize-none"
            placeholder="Add any additional notes or comments about the candidate..."
          />
        </div>
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
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                ${currentStep >= step.id 
                  ? 'bg-primary-600 text-white border-primary-600 shadow-lg' 
                  : 'border-neutral-300 text-neutral-500 bg-white'
                }
              `}>
                {step.icon}
              </div>
              <span className={`
                mt-2 text-xs font-medium transition-colors
                ${currentStep >= step.id ? 'text-primary-600' : 'text-neutral-600'}
              `}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`
                flex-1 h-0.5 mx-4 transition-all duration-300
                ${currentStep > step.id ? 'bg-primary-600' : 'bg-neutral-300'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="max-h-[60vh] overflow-y-auto">
        {renderCurrentStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t border-neutral-200">
        <Button
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
              Next Step
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={loading}
            >
              {candidate ? 'Update Candidate' : 'Add Candidate'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateForm;

