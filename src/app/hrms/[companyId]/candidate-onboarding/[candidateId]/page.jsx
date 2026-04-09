'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  FileText,
  Edit,
  Save
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Checkbox from '@/components/common/Checkbox';
import Badge from '@/components/common/Badge';

// Mock data - replace with actual API calls
const getCandidateById = (id) => {
  const candidates = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 234 567 8900',
      position: 'Software Engineer',
      department: 'Engineering',
      experience: '5',
      currentCompany: 'Tech Corp',
      expectedSalary: '80000',
      noticePeriod: '30',
      interviewDate: '2024-01-15',
      interviewTime: '10:00',
      interviewRound: 'technical-2',
      interviewType: 'video',
      interviewLocation: 'Zoom Meeting Room',
      interviewer: 'Sarah Johnson',
      screeningCall: true,
      screeningCallDate: '2024-01-10',
      screeningCallTime: '14:00',
      resumeReceived: true,
      backgroundCheck: true,
      referenceCheck: false,
      documentVerification: false,
      offerLetterSent: false,
      offerAccepted: false,
      joiningDate: '2024-02-01',
      additionalNotes: 'Strong technical skills, good communication. Follow up on reference check.',
      status: 'in-progress'
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1 234 567 8901',
      position: 'Product Manager',
      department: 'Product',
      experience: '7',
      currentCompany: 'StartupXYZ',
      expectedSalary: '95008',
      noticePeriod: '45',
      interviewDate: '2024-01-20',
      interviewTime: '14:00',
      interviewRound: 'hr',
      interviewType: 'in-person',
      interviewLocation: 'Office - Conference Room A',
      interviewer: 'Michael Brown',
      screeningCall: true,
      screeningCallDate: '2024-01-15',
      screeningCallTime: '11:00',
      resumeReceived: true,
      backgroundCheck: true,
      referenceCheck: true,
      documentVerification: true,
      offerLetterSent: true,
      offerAccepted: true,
      joiningDate: '2024-02-15',
      additionalNotes: 'Excellent candidate, all checks completed. Ready for onboarding.',
      status: 'offer-accepted'
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@example.com',
      phone: '+1 234 567 8902',
      position: 'UI/UX Designer',
      department: 'Design',
      experience: '3',
      currentCompany: 'Design Studio',
      expectedSalary: '65008',
      noticePeriod: '15',
      interviewDate: '2024-01-18',
      interviewTime: '11:00',
      interviewRound: 'screening',
      interviewType: 'video',
      interviewLocation: 'Google Meet',
      interviewer: 'Emily Davis',
      screeningCall: false,
      screeningCallDate: '',
      screeningCallTime: '',
      resumeReceived: true,
      backgroundCheck: false,
      referenceCheck: false,
      documentVerification: false,
      offerLetterSent: false,
      offerAccepted: false,
      joiningDate: '',
      additionalNotes: 'Early stage candidate, pending initial screening.',
      status: 'screening'
    },
    {
      id: '4',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@example.com',
      phone: '+1 234 567 8903',
      position: 'Data Analyst',
      department: 'Engineering',
      experience: '4',
      currentCompany: 'Data Inc',
      expectedSalary: '70000',
      noticePeriod: '30',
      interviewDate: '2024-01-22',
      interviewTime: '15:00',
      interviewRound: 'technical-1',
      interviewType: 'hybrid',
      interviewLocation: 'Office - Room B',
      interviewer: 'David Wilson',
      screeningCall: true,
      screeningCallDate: '2024-01-20',
      screeningCallTime: '10:00',
      resumeReceived: true,
      backgroundCheck: false,
      referenceCheck: false,
      documentVerification: false,
      offerLetterSent: false,
      offerAccepted: false,
      joiningDate: '',
      additionalNotes: 'Good technical background, scheduled for technical interview.',
      status: 'interview'
    }
  ];
  return candidates.find(c => c.id === id);
};

const getStatusBadge = (status) => {
  const statusConfig = {
    'screening': { label: 'Screening', variant: 'info' },
    'interview': { label: 'In Interview', variant: 'warning' },
    'in-progress': { label: 'In Progress', variant: 'info' },
    'offer-accepted': { label: 'Offer Accepted', variant: 'success' },
    'rejected': { label: 'Rejected', variant: 'danger' }
  };
  
  const config = statusConfig[status] || { label: status, variant: 'default' };
  return <Badge size="md">{config.label}</Badge>;
};

const getInterviewRoundLabel = (round) => {
  const rounds = {
    'screening': 'Screening Round',
    'technical-1': 'Technical Round 1',
    'technical-2': 'Technical Round 2',
    'managerial': 'Managerial Round',
    'hr': 'HR Round',
    'final': 'Final Round'
  };
  return rounds[round] || round;
};

const getInterviewTypeLabel = (type) => {
  const types = {
    'in-person': 'In-Person',
    'video': 'Video Call',
    'phone': 'Phone Call',
    'hybrid': 'Hybrid'
  };
  return types[type] || type;
};

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.companyId;
  const candidateId = params.candidateId;

  const [candidate, setCandidate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const candidateData = getCandidateById(candidateId);
    if (candidateData) {
      setCandidate(candidateData);
      setFormData({
        resumeReceived: candidateData.resumeReceived,
        backgroundCheck: candidateData.backgroundCheck,
        referenceCheck: candidateData.referenceCheck,
        documentVerification: candidateData.documentVerification,
        offerLetterSent: candidateData.offerLetterSent,
        offerAccepted: candidateData.offerAccepted,
        joiningDate: candidateData.joiningDate,
        additionalNotes: candidateData.additionalNotes
      });
    }
  }, [candidateId]);

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Here you would typically save to API
    console.log('Saving candidate data:', formData);
    setCandidate(prev => ({
      ...prev,
      ...formData
    }));
    setIsEditing(false);
    setHasChanges(false);
    // Show success message
    alert('Candidate information updated successfully!');
  };

  const calculateProgress = () => {
    const checks = [
      formData.resumeReceived,
      formData.backgroundCheck,
      formData.referenceCheck,
      formData.documentVerification,
      formData.offerLetterSent,
      formData.offerAccepted
    ];
    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  };

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center">
          <User className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Candidate not found</h3>
          <Button onClick={() => router.push(`/hrms/${companyId}/candidate-onboarding`)}>
            Back to Candidates
          </Button>
        </Card>
      </div>
    );
  }

  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  const progress = calculateProgress();

  return (
    <div className="min-h-screen space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push(`/hrms/${companyId}/candidate-onboarding`)}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <div>
            <PageHeader
              title={fullName}
              description="Candidate profile and onboarding checklist"
            />
          </div>
        </div>
        {isEditing && (
          <Button
            onClick={handleSave}
            icon={<Save className="w-4 h-4" />}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Candidate Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-1">{fullName}</h2>
                  <p className="text-neutral-600">{candidate.position}</p>
                  {getStatusBadge(candidate.status)}
                </div>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                icon={<Edit className="w-4 h-4" />}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
                  <Mail className="w-4 h-4" />
                  <span className="font-medium">Email</span>
                </div>
                <p className="text-neutral-900">{candidate.email}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">Phone</span>
                </div>
                <p className="text-neutral-900">{candidate.phone}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span className="font-medium">Current Company</span>
                </div>
                <p className="text-neutral-900">{candidate.currentCompany || 'N/A'}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
                  <User className="w-4 h-4" />
                  <span className="font-medium">Experience</span>
                </div>
                <p className="text-neutral-900">{candidate.experience} years</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span className="font-medium">Department</span>
                </div>
                <p className="text-neutral-900">{candidate.department}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Expected Salary</span>
                </div>
                <p className="text-neutral-900">${parseInt(candidate.expectedSalary).toLocaleString()}</p>
              </div>
            </div>
          </Card>

          {/* Interview Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary-600" />
              Interview Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-sm text-neutral-600 mb-1 font-medium">Interview Date & Time</div>
                <p className="text-neutral-900">{candidate.interviewDate} at {candidate.interviewTime}</p>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-neutral-600 mb-1 font-medium">Interview Round</div>
                <p className="text-neutral-900">{getInterviewRoundLabel(candidate.interviewRound)}</p>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-neutral-600 mb-1 font-medium">Interview Type</div>
                <p className="text-neutral-900">{getInterviewTypeLabel(candidate.interviewType)}</p>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-neutral-600 mb-1 font-medium">Interviewer</div>
                <p className="text-neutral-900">{candidate.interviewer}</p>
              </div>
              
              {candidate.interviewLocation && (
                <div className="space-y-1 md:col-span-2">
                  <div className="text-sm text-neutral-600 mb-1 font-medium flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Location
                  </div>
                  <p className="text-neutral-900">{candidate.interviewLocation}</p>
                </div>
              )}
              
              {candidate.screeningCall && (
                <div className="space-y-1 md:col-span-2">
                  <div className="text-sm text-neutral-600 mb-1 font-medium">Screening Call</div>
                  <p className="text-neutral-900">
                    {candidate.screeningCallDate} at {candidate.screeningCallTime}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Additional Notes */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary-600" />
              Additional Notes
            </h3>
            {isEditing ? (
              <textarea
                value={formData.additionalNotes}
                onChange={(e) => {
                  handleCheckboxChange('additionalNotes', e.target.value);
                }}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200 resize-none"
                placeholder="Add any additional notes or comments about the candidate..."
              />
            ) : (
              <p className="text-neutral-700 whitespace-pre-wrap">{candidate.additionalNotes || 'No notes added.'}</p>
            )}
          </Card>
        </div>

        {/* Right Column - Onboarding Checklist */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recruitment Progress</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">Overall Progress</span>
                <span className="text-2xl font-bold text-primary-600">{progress}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Onboarding Checklist */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-6 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-primary-600" />
              Onboarding Checklist
            </h3>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border transition-all ${
                formData.resumeReceived 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-neutral-50 border-neutral-200'
              }`}>
                <Checkbox
                  label="Resume Received"
                  checked={formData.resumeReceived}
                  onChange={(e) => handleCheckboxChange('resumeReceived', e.target.checked)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className={`p-4 rounded-lg border transition-all ${
                formData.backgroundCheck 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-neutral-50 border-neutral-200'
              }`}>
                <Checkbox
                  label="Background Check Completed"
                  checked={formData.backgroundCheck}
                  onChange={(e) => handleCheckboxChange('backgroundCheck', e.target.checked)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className={`p-4 rounded-lg border transition-all ${
                formData.referenceCheck 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-neutral-50 border-neutral-200'
              }`}>
                <Checkbox
                  label="Reference Check Completed"
                  checked={formData.referenceCheck}
                  onChange={(e) => handleCheckboxChange('referenceCheck', e.target.checked)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className={`p-4 rounded-lg border transition-all ${
                formData.documentVerification 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-neutral-50 border-neutral-200'
              }`}>
                <Checkbox
                  label="Document Verification Done"
                  checked={formData.documentVerification}
                  onChange={(e) => handleCheckboxChange('documentVerification', e.target.checked)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className={`p-4 rounded-lg border transition-all ${
                formData.offerLetterSent 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-neutral-50 border-neutral-200'
              }`}>
                <Checkbox
                  label="Offer Letter Sent"
                  checked={formData.offerLetterSent}
                  onChange={(e) => handleCheckboxChange('offerLetterSent', e.target.checked)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className={`p-4 rounded-lg border transition-all ${
                formData.offerAccepted 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-neutral-50 border-neutral-200'
              }`}>
                <Checkbox
                  label="Offer Accepted"
                  checked={formData.offerAccepted}
                  onChange={(e) => handleCheckboxChange('offerAccepted', e.target.checked)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </Card>

          {/* Joining Date */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Joining Date</h3>
            {isEditing ? (
              <Input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => handleCheckboxChange('joiningDate', e.target.value)}
                icon={<Calendar className="w-4 h-4" />}
              />
            ) : (
              <p className="text-neutral-900 font-medium">
                {formData.joiningDate || 'Not set'}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

