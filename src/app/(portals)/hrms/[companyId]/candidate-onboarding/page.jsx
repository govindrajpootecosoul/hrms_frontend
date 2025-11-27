'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  User, 
  Mail, 
  Phone, 
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import CandidateForm from '@/components/hrms/CandidateForm';

// Mock data - replace with actual API calls
const mockCandidates = [
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
    interviewDate: '2024-01-15',
    interviewTime: '10:00',
    interviewRound: 'technical-2',
    resumeReceived: true,
    backgroundCheck: true,
    referenceCheck: false,
    documentVerification: false,
    offerLetterSent: false,
    offerAccepted: false,
    joiningDate: '2024-02-01',
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
    interviewDate: '2024-01-20',
    interviewTime: '14:00',
    interviewRound: 'hr',
    resumeReceived: true,
    backgroundCheck: true,
    referenceCheck: true,
    documentVerification: true,
    offerLetterSent: true,
    offerAccepted: true,
    joiningDate: '2024-02-15',
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
    interviewDate: '2024-01-18',
    interviewTime: '11:00',
    interviewRound: 'screening',
    resumeReceived: true,
    backgroundCheck: false,
    referenceCheck: false,
    documentVerification: false,
    offerLetterSent: false,
    offerAccepted: false,
    joiningDate: '',
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
    interviewDate: '2024-01-22',
    interviewTime: '15:00',
    interviewRound: 'technical-1',
    resumeReceived: true,
    backgroundCheck: false,
    referenceCheck: false,
    documentVerification: false,
    offerLetterSent: false,
    offerAccepted: false,
    joiningDate: '',
    status: 'interview'
  }
];

const getStatusBadge = (status) => {
  const statusConfig = {
    'screening': { label: 'Screening', variant: 'info' },
    'interview': { label: 'In Interview', variant: 'warning' },
    'in-progress': { label: 'In Progress', variant: 'info' },
    'offer-accepted': { label: 'Offer Accepted', variant: 'success' },
    'rejected': { label: 'Rejected', variant: 'danger' }
  };
  
  const config = statusConfig[status] || { label: status, variant: 'default' };
  return <Badge size="sm">{config.label}</Badge>;
};

const getInterviewRoundLabel = (round) => {
  const rounds = {
    'screening': 'Screening',
    'technical-1': 'Technical Round 1',
    'technical-2': 'Technical Round 2',
    'managerial': 'Managerial',
    'hr': 'HR Round',
    'final': 'Final Round'
  };
  return rounds[round] || round;
};

const calculateProgress = (candidate) => {
  const checks = [
    candidate.resumeReceived,
    candidate.backgroundCheck,
    candidate.referenceCheck,
    candidate.documentVerification,
    candidate.offerLetterSent,
    candidate.offerAccepted
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

export default function CandidateOnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.companyId;
  
  const [candidates, setCandidates] = useState(mockCandidates);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = !searchTerm || 
      `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || candidate.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddCandidate = (formData) => {
    const newCandidate = {
      id: String(candidates.length + 1),
      ...formData,
      status: 'screening'
    };
    setCandidates([...candidates, newCandidate]);
    setShowAddModal(false);
  };

  const handleCandidateClick = (candidateId) => {
    router.push(`/hrms/${companyId}/candidate-onboarding/${candidateId}`);
  };

  return (
    <div className="min-h-screen space-y-8">
      <PageHeader
        title="Candidate Onboarding"
        description="Manage candidate pre-joining workflows and track recruitment progress"
        actions={[
          <Button
            key="add-candidate"
            onClick={() => setShowAddModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add New Candidate
          </Button>
        ]}
      />

      {/* Search and Filter */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search by name, email, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            placeholder="Filter by status"
            options={[
              { value: '', label: 'All Status' },
              { value: 'screening', label: 'Screening' },
              { value: 'interview', label: 'In Interview' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'offer-accepted', label: 'Offer Accepted' },
              { value: 'rejected', label: 'Rejected' }
            ]}
            value={filterStatus}
            onChange={(value) => setFilterStatus(value)}
          />
        </div>
      </Card>

      {/* Candidates List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredCandidates.length === 0 ? (
          <Card className="p-12 text-center">
            <User className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No candidates found</h3>
            <p className="text-neutral-600 mb-6">Try adjusting your search or filters</p>
            <Button onClick={() => setShowAddModal(true)} icon={<Plus className="w-4 h-4" />}>
              Add New Candidate
            </Button>
          </Card>
        ) : (
          filteredCandidates.map((candidate) => {
            const progress = calculateProgress(candidate);
            const fullName = `${candidate.firstName} ${candidate.lastName}`;
            
            return (
              <Card
                key={candidate.id}
                className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => handleCandidateClick(candidate.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                            {fullName}
                          </h3>
                          {getStatusBadge(candidate.status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-4 h-4" />
                            <span>{candidate.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-4 h-4" />
                            <span>{candidate.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4" />
                            <span>{candidate.position}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{candidate.interviewDate} at {candidate.interviewTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-700 font-medium">Recruitment Progress</span>
                        <span className="text-primary-600 font-semibold">{progress}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-600 mt-2">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${candidate.resumeReceived ? 'text-green-500' : 'text-neutral-300'}`} />
                          Resume
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${candidate.backgroundCheck ? 'text-green-500' : 'text-neutral-300'}`} />
                          Background
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${candidate.referenceCheck ? 'text-green-500' : 'text-neutral-300'}`} />
                          Reference
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${candidate.documentVerification ? 'text-green-500' : 'text-neutral-300'}`} />
                          Documents
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${candidate.offerLetterSent ? 'text-green-500' : 'text-neutral-300'}`} />
                          Offer Sent
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${candidate.offerAccepted ? 'text-green-500' : 'text-neutral-300'}`} />
                          Accepted
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-6 flex items-center">
                    <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Candidate Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Candidate"
        size="xl"
      >
        <CandidateForm
          onSubmit={handleAddCandidate}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  );
}
