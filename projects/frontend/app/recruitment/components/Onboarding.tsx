'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  FileCheck,
  Search,
  Edit,
  Eye,
  ChevronDown,
  ChevronUp,
  FileText,
  Shield,
  FormInput,
  UserCheck,
  Laptop,
  Calendar,
  Mail,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useCandidates } from '../context/CandidateContext';

// Mock data
const mockOnboardingCandidates = [
  {
    id: '1',
    candidateName: 'John Doe',
    email: 'john.doe@example.com',
    contact: '+91 9876543210',
    position: 'Senior Software Engineer',
    recruiter: 'Sarah Johnson',
    offerStatus: 'Accepted',
    joiningDate: '2024-02-15',
    onboardingStage: 'Form',
    stageProgress: 40,
    offerDetails: {
      positionTitle: 'Senior Software Engineer',
      offeredCTC: 1200000,
      doj: '2024-02-15',
      offerSentDate: '2024-01-20',
      offerAcceptedDate: '2024-01-22',
    },
    policyAcknowledgment: {
      codeOfConduct: { acknowledged: true, date: '2024-01-25' },
      leavePolicy: { acknowledged: true, date: '2024-01-25' },
      nda: { acknowledged: false, date: null },
    },
    joiningForm: {
      completed: false,
      link: 'https://forms.example.com/john-doe-12345',
    },
    hrVerification: {
      verified: false,
      employeeCode: '',
      department: '',
      designation: '',
      reportingManager: '',
      doj: '2024-02-15',
      pfNo: '',
      esiNo: '',
      uanNo: '',
      verifiedBy: '',
      verifiedDate: '',
      remarks: '',
    },
    assetAllocation: {
      laptop: { assigned: false, serialNumber: '', issuanceDate: '', acknowledged: false },
      emailId: { assigned: false, email: '', issuanceDate: '', acknowledged: false },
      accessBadge: { assigned: false, badgeNumber: '', issuanceDate: '', acknowledged: false },
    },
    probation: {
      status: 'On Probation',
      duration: '3 months',
      confirmationReviewDate: '2024-05-15',
      confirmed: false,
    },
    welcome: {
      emailSent: false,
      orientationAssigned: false,
      acknowledgment: false,
    },
  },
  {
    id: '2',
    candidateName: 'Jane Smith',
    email: 'jane.smith@example.com',
    contact: '+91 9876543211',
    position: 'Product Manager',
    recruiter: 'Mike Wilson',
    offerStatus: 'Sent',
    joiningDate: '2024-02-20',
    onboardingStage: 'Offer',
    stageProgress: 15,
    offerDetails: {
      positionTitle: 'Product Manager',
      offeredCTC: 1500000,
      doj: '2024-02-20',
      offerSentDate: '2024-01-25',
      offerAcceptedDate: null,
    },
    policyAcknowledgment: {
      codeOfConduct: { acknowledged: false, date: null },
      leavePolicy: { acknowledged: false, date: null },
      nda: { acknowledged: false, date: null },
    },
    joiningForm: {
      completed: false,
      link: 'https://forms.example.com/jane-smith-12346',
    },
    hrVerification: {
      verified: false,
      employeeCode: '',
      department: '',
      designation: '',
      reportingManager: '',
      doj: '2024-02-20',
      pfNo: '',
      esiNo: '',
      uanNo: '',
      verifiedBy: '',
      verifiedDate: '',
      remarks: '',
    },
    assetAllocation: {
      laptop: { assigned: false, serialNumber: '', issuanceDate: '', acknowledged: false },
      emailId: { assigned: false, email: '', issuanceDate: '', acknowledged: false },
      accessBadge: { assigned: false, badgeNumber: '', issuanceDate: '', acknowledged: false },
    },
    probation: {
      status: 'Pending',
      duration: '3 months',
      confirmationReviewDate: '',
      confirmed: false,
    },
    welcome: {
      emailSent: false,
      orientationAssigned: false,
      acknowledgment: false,
    },
  },
  {
    id: '3',
    candidateName: 'Robert Brown',
    email: 'robert.brown@example.com',
    contact: '+91 9876543212',
    position: 'Full Stack Developer',
    recruiter: 'Sarah Johnson',
    offerStatus: 'Accepted',
    joiningDate: '2024-02-10',
    onboardingStage: 'Verification',
    stageProgress: 60,
    offerDetails: {
      positionTitle: 'Full Stack Developer',
      offeredCTC: 1000000,
      doj: '2024-02-10',
      offerSentDate: '2024-01-15',
      offerAcceptedDate: '2024-01-17',
    },
    policyAcknowledgment: {
      codeOfConduct: { acknowledged: true, date: '2024-01-20' },
      leavePolicy: { acknowledged: true, date: '2024-01-20' },
      nda: { acknowledged: true, date: '2024-01-20' },
    },
    joiningForm: {
      completed: true,
      link: 'https://forms.example.com/robert-brown-12347',
    },
    hrVerification: {
      verified: false,
      employeeCode: 'EMP001',
      department: 'Engineering',
      designation: 'Full Stack Developer',
      reportingManager: 'David Lee',
      doj: '2024-02-10',
      pfNo: '',
      esiNo: '',
      uanNo: '',
      verifiedBy: '',
      verifiedDate: '',
      remarks: '',
    },
    assetAllocation: {
      laptop: { assigned: false, serialNumber: '', issuanceDate: '', acknowledged: false },
      emailId: { assigned: false, email: '', issuanceDate: '', acknowledged: false },
      accessBadge: { assigned: false, badgeNumber: '', issuanceDate: '', acknowledged: false },
    },
    probation: {
      status: 'On Probation',
      duration: '3 months',
      confirmationReviewDate: '2024-05-10',
      confirmed: false,
    },
    welcome: {
      emailSent: false,
      orientationAssigned: false,
      acknowledgment: false,
    },
  },
  {
    id: '4',
    candidateName: 'Emily Davis',
    email: 'emily.davis@example.com',
    contact: '+91 9876543213',
    position: 'UX Designer',
    recruiter: 'Mike Wilson',
    offerStatus: 'Declined',
    joiningDate: null,
    onboardingStage: 'Offer',
    stageProgress: 0,
    offerDetails: {
      positionTitle: 'UX Designer',
      offeredCTC: 900000,
      doj: null,
      offerSentDate: '2024-01-18',
      offerAcceptedDate: null,
    },
    policyAcknowledgment: {
      codeOfConduct: { acknowledged: false, date: null },
      leavePolicy: { acknowledged: false, date: null },
      nda: { acknowledged: false, date: null },
    },
    joiningForm: {
      completed: false,
      link: '',
    },
    hrVerification: {
      verified: false,
      employeeCode: '',
      department: '',
      designation: '',
      reportingManager: '',
      doj: null,
      pfNo: '',
      esiNo: '',
      uanNo: '',
      verifiedBy: '',
      verifiedDate: '',
      remarks: '',
    },
    assetAllocation: {
      laptop: { assigned: false, serialNumber: '', issuanceDate: '', acknowledged: false },
      emailId: { assigned: false, email: '', issuanceDate: '', acknowledged: false },
      accessBadge: { assigned: false, badgeNumber: '', issuanceDate: '', acknowledged: false },
    },
    probation: {
      status: 'N/A',
      duration: '',
      confirmationReviewDate: '',
      confirmed: false,
    },
    welcome: {
      emailSent: false,
      orientationAssigned: false,
      acknowledgment: false,
    },
  },
  {
    id: '5',
    candidateName: 'Michael Chen',
    email: 'michael.chen@example.com',
    contact: '+91 9876543214',
    position: 'DevOps Engineer',
    recruiter: 'Sarah Johnson',
    offerStatus: 'Accepted',
    joiningDate: '2024-02-05',
    onboardingStage: 'Completed',
    stageProgress: 100,
    offerDetails: {
      positionTitle: 'DevOps Engineer',
      offeredCTC: 1100000,
      doj: '2024-02-05',
      offerSentDate: '2024-01-10',
      offerAcceptedDate: '2024-01-12',
    },
    policyAcknowledgment: {
      codeOfConduct: { acknowledged: true, date: '2024-01-15' },
      leavePolicy: { acknowledged: true, date: '2024-01-15' },
      nda: { acknowledged: true, date: '2024-01-15' },
    },
    joiningForm: {
      completed: true,
      link: 'https://forms.example.com/michael-chen-12348',
    },
    hrVerification: {
      verified: true,
      employeeCode: 'EMP002',
      department: 'Engineering',
      designation: 'DevOps Engineer',
      reportingManager: 'David Lee',
      doj: '2024-02-05',
      pfNo: 'PF123456',
      esiNo: 'ESI123456',
      uanNo: 'UAN123456789',
      verifiedBy: 'HR Team',
      verifiedDate: '2024-01-25',
      remarks: 'All documents verified',
    },
    assetAllocation: {
      laptop: { assigned: true, serialNumber: 'LAP001234', issuanceDate: '2024-01-30', acknowledged: true },
      emailId: { assigned: true, email: 'michael.chen@company.com', issuanceDate: '2024-01-30', acknowledged: true },
      accessBadge: { assigned: true, badgeNumber: 'BADGE001', issuanceDate: '2024-01-30', acknowledged: true },
    },
    probation: {
      status: 'On Probation',
      duration: '3 months',
      confirmationReviewDate: '2024-05-05',
      confirmed: false,
    },
    welcome: {
      emailSent: true,
      orientationAssigned: true,
      acknowledgment: true,
    },
  },
];

const onboardingStages = ['Offer', 'Policy', 'Form', 'Verification', 'Asset', 'Completed'];
const offerStatusOptions = ['Sent', 'Accepted', 'Declined', 'Pending'];
const recruiterOptions = ['Sarah Johnson', 'Mike Wilson', 'David Lee'];

export default function Onboarding() {
  const { onboardingCandidates, updateCandidate: updateCandidateInContext } = useCandidates();
  const candidates = onboardingCandidates;
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [recruiterFilter, setRecruiterFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(1);
  const itemsPerPage = 10;

  // Calculate KPIs
  const kpis = useMemo(() => {
    return {
      totalOnboardings: candidates.length,
      pendingOffers: candidates.filter(c => c.offerStatus === 'Sent' || c.offerStatus === 'Pending').length,
      offersAccepted: candidates.filter(c => c.offerStatus === 'Accepted').length,
      offersDeclined: candidates.filter(c => c.offerStatus === 'Declined').length,
      completedOnboardings: candidates.filter(c => c.onboardingStage === 'Completed').length,
    };
  }, [candidates]);

  // Filter and sort candidates
  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate => {
      const matchesSearch = 
        candidate.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.contact.includes(searchTerm) ||
        candidate.position.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || candidate.offerStatus === statusFilter;
      const matchesStage = stageFilter === 'all' || candidate.onboardingStage === stageFilter;
      const matchesRecruiter = recruiterFilter === 'all' || candidate.recruiter === recruiterFilter;

      return matchesSearch && matchesStatus && matchesStage && matchesRecruiter;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [candidates, searchTerm, statusFilter, stageFilter, recruiterFilter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredAndSortedCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
      const candidate = candidates.find(c => c.id === id);
      if (candidate) {
        setSelectedCandidate(candidate);
        // Set active step based on onboarding stage
        const stageIndex = onboardingStages.indexOf(candidate.onboardingStage);
        setActiveStep(Math.max(1, stageIndex + 1));
      }
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const updateCandidate = (id: string, updates: any) => {
    // Update candidate in context
    updateCandidateInContext(id, updates);
    // Update selected candidate if it's the one being updated
    if (selectedCandidate && selectedCandidate.id === id) {
      setSelectedCandidate({ ...selectedCandidate, ...updates });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Sent': 'bg-blue-100 text-blue-800',
      'Accepted': 'bg-green-100 text-green-800',
      'Declined': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'Offer': 'bg-blue-100 text-blue-800',
      'Policy': 'bg-purple-100 text-purple-800',
      'Form': 'bg-yellow-100 text-yellow-800',
      'Verification': 'bg-orange-100 text-orange-800',
      'Asset': 'bg-indigo-100 text-indigo-800',
      'Completed': 'bg-emerald-100 text-emerald-800',
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const calculateStageProgress = (candidate: any) => {
    let progress = 0;
    if (candidate.offerStatus === 'Accepted') progress += 15;
    if (candidate.policyAcknowledgment?.codeOfConduct?.acknowledged && 
        candidate.policyAcknowledgment?.leavePolicy?.acknowledged && 
        candidate.policyAcknowledgment?.nda?.acknowledged) progress += 15;
    if (candidate.joiningForm?.completed) progress += 20;
    if (candidate.hrVerification?.verified) progress += 20;
    if (candidate.assetAllocation?.laptop?.assigned && 
        candidate.assetAllocation?.emailId?.assigned) progress += 15;
    if (candidate.welcome?.emailSent && candidate.welcome?.acknowledgment) progress += 15;
    return progress;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          {
            title: 'Total Onboardings',
            value: kpis.totalOnboardings,
            icon: Users,
            gradient: 'from-blue-600 via-indigo-600 to-blue-700',
            shadow: 'shadow-blue-500/30',
          },
          {
            title: 'Pending Offers',
            value: kpis.pendingOffers,
            icon: Clock,
            gradient: 'from-yellow-600 via-amber-600 to-yellow-700',
            shadow: 'shadow-yellow-500/30',
          },
          {
            title: 'Offers Accepted',
            value: kpis.offersAccepted,
            icon: CheckCircle,
            gradient: 'from-green-600 via-emerald-600 to-green-700',
            shadow: 'shadow-green-500/30',
          },
          {
            title: 'Offers Declined',
            value: kpis.offersDeclined,
            icon: XCircle,
            gradient: 'from-red-600 via-rose-600 to-red-700',
            shadow: 'shadow-red-500/30',
          },
          {
            title: 'Completed Onboardings',
            value: kpis.completedOnboardings,
            icon: FileCheck,
            gradient: 'from-emerald-600 via-teal-600 to-emerald-700',
            shadow: 'shadow-emerald-500/30',
          },
        ].map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${kpi.gradient} ${kpi.shadow} shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer`}
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

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, contact, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Offer Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {offerStatusOptions.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Onboarding Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {onboardingStages.map(stage => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={recruiterFilter} onValueChange={setRecruiterFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Recruiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recruiters</SelectItem>
                {recruiterOptions.map(recruiter => (
                  <SelectItem key={recruiter} value={recruiter}>{recruiter}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('candidateName')}>
                    Candidate Name {sortConfig?.key === 'candidateName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Recruiter / Assigned HR</TableHead>
                  <TableHead>Offer Status</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Onboarding Stage</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      No candidates found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCandidates.map((candidate) => {
                    const progress = calculateStageProgress(candidate);
                    return (
                      <>
                        <TableRow 
                          key={candidate.id} 
                          className="cursor-pointer"
                          onClick={() => toggleRow(candidate.id)}
                        >
                          <TableCell>
                            {expandedRows.has(candidate.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{candidate.candidateName}</TableCell>
                          <TableCell>{candidate.email}</TableCell>
                          <TableCell>{candidate.contact}</TableCell>
                          <TableCell>{candidate.position}</TableCell>
                          <TableCell>{candidate.recruiter}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(candidate.offerStatus)}>
                              {candidate.offerStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {candidate.joiningDate ? format(new Date(candidate.joiningDate), 'MMM dd, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStageColor(candidate.onboardingStage)}>
                              {candidate.onboardingStage}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 w-24">
                              <Progress value={progress} className="h-2" />
                              <span className="text-xs text-muted-foreground">{progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRow(candidate.id)}
                                title="View Checklist"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {expandedRows.has(candidate.id) && (
                          <TableRow>
                            <TableCell colSpan={11} className="bg-muted/50 p-0">
                              <OnboardingChecklist 
                                candidate={selectedCandidate || candidate}
                                activeStep={activeStep}
                                setActiveStep={setActiveStep}
                                updateCandidate={updateCandidate}
                              />
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedCandidates.length)} of {filteredAndSortedCandidates.length} candidates
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Onboarding Checklist Component
function OnboardingChecklist({ candidate, activeStep, setActiveStep, updateCandidate }: any) {
  const [formData, setFormData] = useState({
    offeredCTC: candidate.offerDetails.offeredCTC || '',
    doj: candidate.offerDetails.doj || '',
    employeeCode: candidate.hrVerification.employeeCode || '',
    department: candidate.hrVerification.department || '',
    designation: candidate.hrVerification.designation || '',
    reportingManager: candidate.hrVerification.reportingManager || '',
    pfNo: candidate.hrVerification.pfNo || '',
    esiNo: candidate.hrVerification.esiNo || '',
    uanNo: candidate.hrVerification.uanNo || '',
    remarks: candidate.hrVerification.remarks || '',
    laptopSerial: candidate.assetAllocation.laptop.serialNumber || '',
    emailId: candidate.assetAllocation.emailId.email || '',
    badgeNumber: candidate.assetAllocation.accessBadge.badgeNumber || '',
    confirmationReviewDate: candidate.probation.confirmationReviewDate || '',
  });

  const steps = [
    { id: 1, title: 'Offer Rollout', icon: FileText },
    { id: 2, title: 'Policy Acknowledgment', icon: Shield },
    { id: 3, title: 'Digital Joining Form', icon: FormInput },
    { id: 4, title: 'HR Verification', icon: UserCheck },
    { id: 5, title: 'Asset Allocation', icon: Laptop },
    { id: 6, title: 'Probation Setup', icon: Calendar },
    { id: 7, title: 'Welcome & Orientation', icon: Mail },
  ];

  const handleGenerateOffer = () => {
    alert(`Generating Offer Letter PDF for ${candidate.candidateName}...\n(Simulated PDF generation)`);
  };

  const handleMarkOfferSent = () => {
    updateCandidate(candidate.id, {
      offerStatus: 'Sent',
      offerDetails: {
        ...candidate.offerDetails,
        offerSentDate: new Date().toISOString().split('T')[0],
      },
    });
    alert('Offer marked as sent!');
  };

  const handleUpdateOfferStatus = (status: string) => {
    updateCandidate(candidate.id, {
      offerStatus: status,
      offerDetails: {
        ...candidate.offerDetails,
        offerAcceptedDate: status === 'Accepted' ? new Date().toISOString().split('T')[0] : null,
      },
    });
    alert(`Offer status updated to ${status}`);
  };

  const handlePolicyAcknowledge = (policy: string) => {
    const updated = {
      ...candidate.policyAcknowledgment,
      [policy]: { acknowledged: true, date: new Date().toISOString().split('T')[0] },
    };
    updateCandidate(candidate.id, { policyAcknowledgment: updated });
  };

  const handleGenerateJoiningForm = () => {
    const link = `https://forms.example.com/${candidate.candidateName.toLowerCase().replace(' ', '-')}-${candidate.id}`;
    updateCandidate(candidate.id, {
      joiningForm: { completed: false, link },
    });
    alert(`Joining Form Link Generated:\n${link}\n(Notification sent to candidate)`);
  };

  const handleHRVerify = () => {
    updateCandidate(candidate.id, {
      hrVerification: {
        ...candidate.hrVerification,
        ...formData,
        verified: true,
        verifiedBy: 'HR Team',
        verifiedDate: new Date().toISOString().split('T')[0],
      },
      onboardingStage: 'Asset',
    });
    alert('HR Verification completed!');
  };

  const handleAssetAssign = (assetType: string, data: any) => {
    const updated = {
      ...candidate.assetAllocation,
      [assetType]: {
        ...candidate.assetAllocation[assetType],
        ...data,
        assigned: true,
        issuanceDate: new Date().toISOString().split('T')[0],
      },
    };
    updateCandidate(candidate.id, { assetAllocation: updated });
  };

  const handleSendWelcomeEmail = () => {
    updateCandidate(candidate.id, {
      welcome: {
        ...candidate.welcome,
        emailSent: true,
      },
    });
    alert(`Welcome Email sent to ${candidate.email}!\n(Simulated email)`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Onboarding Checklist - {candidate.candidateName}</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            const isCompleted = 
              (step.id === 1 && candidate.offerStatus === 'Accepted') ||
              (step.id === 2 && candidate.policyAcknowledgment.codeOfConduct.acknowledged && 
               candidate.policyAcknowledgment.leavePolicy.acknowledged && 
               candidate.policyAcknowledgment.nda.acknowledged) ||
              (step.id === 3 && candidate.joiningForm.completed) ||
              (step.id === 4 && candidate.hrVerification.verified) ||
              (step.id === 5 && candidate.assetAllocation.laptop.assigned) ||
              (step.id === 6 && candidate.probation.status === 'On Probation') ||
              (step.id === 7 && candidate.welcome.emailSent);

            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#073349] text-white shadow-md'
                    : isCompleted
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="text-sm font-medium whitespace-nowrap">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="border rounded-lg p-6 bg-white">
        {activeStep === 1 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Step 1: Offer Rollout</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Position Title</Label>
                <Input value={candidate.position} readOnly />
              </div>
              <div>
                <Label>Offered CTC (₹)</Label>
                <Input 
                  type="number"
                  value={formData.offeredCTC}
                  onChange={(e) => setFormData({ ...formData, offeredCTC: e.target.value })}
                />
              </div>
              <div>
                <Label>Date of Joining (DOJ)</Label>
                <Input 
                  type="date"
                  value={formData.doj}
                  onChange={(e) => setFormData({ ...formData, doj: e.target.value })}
                />
              </div>
              <div>
                <Label>Offer Status</Label>
                <Select 
                  value={candidate.offerStatus} 
                  onValueChange={handleUpdateOfferStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {offerStatusOptions.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleGenerateOffer}>
                <FileText className="mr-2 h-4 w-4" />
                Generate Offer Letter (PDF)
              </Button>
              <Button 
                onClick={() => {
                  alert(`Offer Letter PDF sent to ${candidate.email}!\n\n(Simulated email with PDF attachment)`);
                  handleMarkOfferSent();
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Mail className="mr-2 h-4 w-4" />
                Send PDF
              </Button>
              <Button variant="outline" onClick={handleMarkOfferSent}>
                Mark as Offer Sent
              </Button>
            </div>
            {candidate.offerDetails.offerSentDate && (
              <p className="text-sm text-muted-foreground">
                Offer sent on: {format(new Date(candidate.offerDetails.offerSentDate), 'MMM dd, yyyy')}
              </p>
            )}
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Step 2: Policy Acknowledgment</h4>
            <div className="space-y-3">
              {[
                { key: 'codeOfConduct', label: 'Code of Conduct' },
                { key: 'leavePolicy', label: 'Leave Policy' },
                { key: 'nda', label: 'NDA (Non-Disclosure Agreement)' },
              ].map((policy) => {
                const policyData = candidate.policyAcknowledgment[policy.key];
                return (
                  <div key={policy.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {policyData.acknowledged ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium">{policy.label}</p>
                        {policyData.acknowledged && (
                          <p className="text-sm text-muted-foreground">
                            Acknowledged on {format(new Date(policyData.date), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                    {!policyData.acknowledged && (
                      <Button 
                        size="sm"
                        onClick={() => handlePolicyAcknowledge(policy.key)}
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Step 3: Digital Joining Form</h4>
            {candidate.joiningForm.link ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium mb-2">Joining Form Link:</p>
                  <div className="flex gap-2">
                    <Input value={candidate.joiningForm.link} readOnly className="flex-1" />
                    <Button 
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(candidate.joiningForm.link)}
                    >
                      Copy Link
                    </Button>
                    <Button 
                      onClick={() => {
                        alert(`Joining Form link sent to ${candidate.email}!\n\nLink: ${candidate.joiningForm.link}\n(Simulated email notification)`);
                      }}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {candidate.joiningForm.completed ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Form Completed
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Clock className="mr-1 h-3 w-3" />
                      Pending Completion
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Candidate will receive notification to fill the form. HR will be notified upon completion.
                </p>
              </div>
            ) : (
              <div>
                <Button onClick={handleGenerateJoiningForm}>
                  <FormInput className="mr-2 h-4 w-4" />
                  Generate Joining Form Link
                </Button>
              </div>
            )}
          </div>
        )}

        {activeStep === 4 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Step 4: HR Verification & Employee Code Allotment</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employee Code *</Label>
                <Input 
                  value={formData.employeeCode}
                  onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                  placeholder="EMP001"
                />
              </div>
              <div>
                <Label>Department *</Label>
                <Input 
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <div>
                <Label>Designation *</Label>
                <Input 
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                />
              </div>
              <div>
                <Label>Reporting Manager *</Label>
                <Input 
                  value={formData.reportingManager}
                  onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                />
              </div>
              <div>
                <Label>Date of Joining (DOJ)</Label>
                <Input 
                  type="date"
                  value={formData.doj}
                  onChange={(e) => setFormData({ ...formData, doj: e.target.value })}
                />
              </div>
            </div>
            <div className="border-t pt-4 mt-4">
              <h5 className="font-semibold mb-3">Statutory & Benefit Details</h5>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>PF No</Label>
                  <Input 
                    value={formData.pfNo}
                    onChange={(e) => setFormData({ ...formData, pfNo: e.target.value })}
                  />
                </div>
                <div>
                  <Label>ESI No</Label>
                  <Input 
                    value={formData.esiNo}
                    onChange={(e) => setFormData({ ...formData, esiNo: e.target.value })}
                  />
                </div>
                <div>
                  <Label>UAN No</Label>
                  <Input 
                    value={formData.uanNo}
                    onChange={(e) => setFormData({ ...formData, uanNo: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Label>Remarks</Label>
              <Textarea 
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={3}
                placeholder="Add verification remarks..."
              />
            </div>
            <Button onClick={handleHRVerify} className="mt-4">
              <UserCheck className="mr-2 h-4 w-4" />
              Complete HR Verification
            </Button>
            {candidate.hrVerification.verified && (
              <p className="text-sm text-green-600 mt-2">
                ✓ Verified by {candidate.hrVerification.verifiedBy} on {format(new Date(candidate.hrVerification.verifiedDate), 'MMM dd, yyyy')}
              </p>
            )}
          </div>
        )}

        {activeStep === 5 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Step 5: Asset Allocation</h4>
            <div className="space-y-4">
              {/* Laptop */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Laptop className="h-5 w-5" />
                    <span className="font-medium">Laptop</span>
                  </div>
                  {candidate.assetAllocation.laptop.assigned ? (
                    <Badge className="bg-green-100 text-green-800">Assigned</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
                  )}
                </div>
                {candidate.assetAllocation.laptop.assigned ? (
                  <div className="space-y-2 text-sm">
                    <p>Serial Number: {candidate.assetAllocation.laptop.serialNumber}</p>
                    <p>Issuance Date: {format(new Date(candidate.assetAllocation.laptop.issuanceDate), 'MMM dd, yyyy')}</p>
                    {candidate.assetAllocation.laptop.acknowledged && (
                      <p className="text-green-600">✓ Acknowledged by employee</p>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Serial Number"
                      value={formData.laptopSerial}
                      onChange={(e) => setFormData({ ...formData, laptopSerial: e.target.value })}
                    />
                    <Button 
                      onClick={() => handleAssetAssign('laptop', { serialNumber: formData.laptopSerial })}
                    >
                      Assign
                    </Button>
                  </div>
                )}
              </div>

              {/* Email ID */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    <span className="font-medium">Email ID</span>
                  </div>
                  {candidate.assetAllocation.emailId.assigned ? (
                    <Badge className="bg-green-100 text-green-800">Assigned</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
                  )}
                </div>
                {candidate.assetAllocation.emailId.assigned ? (
                  <div className="space-y-2 text-sm">
                    <p>Email: {candidate.assetAllocation.emailId.email}</p>
                    <p>Issuance Date: {format(new Date(candidate.assetAllocation.emailId.issuanceDate), 'MMM dd, yyyy')}</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="email@company.com"
                      value={formData.emailId}
                      onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
                    />
                    <Button 
                      onClick={() => handleAssetAssign('emailId', { email: formData.emailId })}
                    >
                      Assign
                    </Button>
                  </div>
                )}
              </div>

              {/* Access Badge */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Access Badge</span>
                  </div>
                  {candidate.assetAllocation.accessBadge.assigned ? (
                    <Badge className="bg-green-100 text-green-800">Assigned</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
                  )}
                </div>
                {candidate.assetAllocation.accessBadge.assigned ? (
                  <div className="space-y-2 text-sm">
                    <p>Badge Number: {candidate.assetAllocation.accessBadge.badgeNumber}</p>
                    <p>Issuance Date: {format(new Date(candidate.assetAllocation.accessBadge.issuanceDate), 'MMM dd, yyyy')}</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Badge Number"
                      value={formData.badgeNumber}
                      onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                    />
                    <Button 
                      onClick={() => handleAssetAssign('accessBadge', { badgeNumber: formData.badgeNumber })}
                    >
                      Assign
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeStep === 6 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Step 6: Probation & Confirmation Setup</h4>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium mb-2">Probation Status</p>
                <Badge className="bg-yellow-100 text-yellow-800 mb-2">
                  {candidate.probation.status} ({candidate.probation.duration})
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Employee will be marked as "On Probation" for {candidate.probation.duration} from joining date.
                </p>
              </div>
              <div>
                <Label>Confirmation Review Date</Label>
                <Input 
                  type="date"
                  value={formData.confirmationReviewDate}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmationReviewDate: e.target.value });
                    updateCandidate(candidate.id, {
                      probation: {
                        ...candidate.probation,
                        confirmationReviewDate: e.target.value,
                        status: 'On Probation',
                      },
                    });
                  }}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Set reminder for confirmation review. Status will auto-update to "Confirmed" after review.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeStep === 7 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Step 7: Welcome & Orientation</h4>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Welcome Email</span>
                  {candidate.welcome.emailSent ? (
                    <Badge className="bg-green-100 text-green-800">Sent</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">Not Sent</Badge>
                  )}
                </div>
                {!candidate.welcome.emailSent ? (
                  <Button onClick={handleSendWelcomeEmail}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Welcome Email
                  </Button>
                ) : (
                  <p className="text-sm text-green-600">✓ Welcome email sent to {candidate.email}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Email includes: Team Introduction, Orientation Plan, and Induction Checklist
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <Label className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={candidate.welcome.acknowledgment}
                    onChange={(e) => updateCandidate(candidate.id, {
                      welcome: {
                        ...candidate.welcome,
                        acknowledgment: e.target.checked,
                      },
                      onboardingStage: e.target.checked ? 'Completed' : candidate.onboardingStage,
                    })}
                    className="h-4 w-4"
                  />
                  <span>Employee Acknowledgment</span>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Employee confirms receipt of welcome materials and orientation details.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

