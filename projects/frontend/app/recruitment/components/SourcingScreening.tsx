'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  UserCheck,
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Video,
} from 'lucide-react';
import { format } from 'date-fns';
import { useCandidates } from '../context/CandidateContext';

// Mock data (used only for initial state in context)
const mockCandidates = [
  {
    id: '1',
    candidateName: 'John Doe',
    contactNumber: '+91 9876543210',
    email: 'john.doe@example.com',
    currentOrganisation: 'Tech Corp',
    education: 'B.Tech Computer Science',
    totalExperience: '5 years',
    assignedTo: 'Sarah Johnson',
    assignDate: '2024-01-10',
    status: 'Shortlisted',
    callingDate: '2024-01-08',
    currentCTCFixed: 800000,
    currentCTCInHand: 650000,
    expectedCTC: 1000000,
    noticePeriod: '30 days',
    communicationSkills: 'Good',
    currentLocation: 'Bangalore',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Strong technical background, good communication skills.',
    interviewerFeedback: 'Performed well in technical round.',
    remark: 'Suitable for Senior Developer role.',
  },
  {
    id: '2',
    candidateName: 'Jane Smith',
    contactNumber: '+91 9876543211',
    email: 'jane.smith@example.com',
    currentOrganisation: 'StartupXYZ',
    education: 'M.Tech Software Engineering',
    totalExperience: '3 years',
    assignedTo: 'Mike Wilson',
    assignDate: '2024-01-12',
    status: 'In Interview',
    callingDate: '2024-01-11',
    currentCTCFixed: 600000,
    currentCTCInHand: 500000,
    expectedCTC: 850000,
    noticePeriod: '15 days',
    communicationSkills: 'Excellent',
    currentLocation: 'Mumbai',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Excellent problem-solving skills.',
    interviewerFeedback: 'Pending',
    remark: 'Second round scheduled.',
  },
  {
    id: '3',
    candidateName: 'Robert Brown',
    contactNumber: '+91 9876543212',
    email: 'robert.brown@example.com',
    currentOrganisation: 'BigTech Inc',
    education: 'B.E Information Technology',
    totalExperience: '7 years',
    assignedTo: 'Sarah Johnson',
    assignDate: '2024-01-09',
    status: 'Hired',
    callingDate: '2024-01-07',
    currentCTCFixed: 1200000,
    currentCTCInHand: 950000,
    expectedCTC: 1500000,
    noticePeriod: '45 days',
    communicationSkills: 'Very Good',
    currentLocation: 'Delhi',
    willingToWorkInStartup: 'No',
    recruiterFeedback: 'Extensive experience in full-stack development.',
    interviewerFeedback: 'Excellent candidate, ready to join.',
    remark: 'Offer letter sent.',
  },
  {
    id: '4',
    candidateName: 'Emily Davis',
    contactNumber: '+91 9876543213',
    email: 'emily.davis@example.com',
    currentOrganisation: 'MidTech Solutions',
    education: 'B.Sc Computer Science',
    totalExperience: '2 years',
    assignedTo: 'Mike Wilson',
    assignDate: '2024-01-13',
    status: 'New',
    callingDate: '2024-01-13',
    currentCTCFixed: 400000,
    currentCTCInHand: 350000,
    expectedCTC: 600000,
    noticePeriod: '20 days',
    communicationSkills: 'Average',
    currentLocation: 'Pune',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Fresh perspective, eager to learn.',
    interviewerFeedback: 'Not scheduled yet',
    remark: 'Initial screening completed.',
  },
  {
    id: '5',
    candidateName: 'Michael Chen',
    contactNumber: '+91 9876543214',
    email: 'michael.chen@example.com',
    currentOrganisation: 'CloudTech',
    education: 'M.Tech Cloud Computing',
    totalExperience: '4 years',
    assignedTo: 'Sarah Johnson',
    assignDate: '2024-01-11',
    status: 'On Hold',
    callingDate: '2024-01-10',
    currentCTCFixed: 900000,
    currentCTCInHand: 720000,
    expectedCTC: 1200000,
    noticePeriod: '60 days',
    communicationSkills: 'Good',
    currentLocation: 'Hyderabad',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Good candidate but long notice period.',
    interviewerFeedback: 'On hold due to notice period.',
    remark: 'Will reconsider after notice period negotiation.',
  },
];

const statusOptions = ['New', 'Shortlisted', 'In Interview', 'Feedback Call', 'Finalized', 'Hired', 'On Hold'];
const recruiterOptions = ['Sarah Johnson', 'Mike Wilson', 'David Lee'];

export default function SourcingScreening() {
  const { sourcingCandidates, updateCandidateStatus, addCandidate, updateCandidate, deleteCandidate } = useCandidates();
  const candidates = sourcingCandidates;
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [recruiterFilter, setRecruiterFilter] = useState<string>('all');
  const [expFilter, setExpFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const itemsPerPage = 10;

  // Form state for add/edit
  const [formData, setFormData] = useState({
    candidateName: '',
    contactNumber: '',
    email: '',
    currentOrganisation: '',
    education: '',
    totalExperience: '',
    assignedTo: '',
    status: 'New',
    callingDate: '',
    currentCTCFixed: '',
    currentCTCInHand: '',
    expectedCTC: '',
    noticePeriod: '',
    communicationSkills: '',
    currentLocation: '',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: '',
    interviewerFeedback: '',
    remark: '',
  });

  // Interview form state
  const [interviewData, setInterviewData] = useState({
    candidateId: '',
    interviewer: '',
    date: '',
    time: '',
    meetingLink: '',
  });

  // Calculate KPIs
  const kpis = useMemo(() => {
    return {
      totalCandidates: candidates.length,
      shortlisted: candidates.filter(c => c.status === 'Shortlisted').length,
      inInterview: candidates.filter(c => c.status === 'In Interview').length,
      hired: candidates.filter(c => c.status === 'Hired').length,
      onHold: candidates.filter(c => c.status === 'On Hold').length,
    };
  }, [candidates]);

  // Filter and sort candidates
  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate => {
      const matchesSearch = 
        candidate.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.contactNumber.includes(searchTerm) ||
        candidate.currentOrganisation.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
      const matchesRecruiter = recruiterFilter === 'all' || candidate.assignedTo === recruiterFilter;
      
      let matchesExp = true;
      if (expFilter !== 'all') {
        const exp = parseInt(candidate.totalExperience);
        if (expFilter === '0-2') matchesExp = exp >= 0 && exp < 2;
        else if (expFilter === '2-5') matchesExp = exp >= 2 && exp < 5;
        else if (expFilter === '5-10') matchesExp = exp >= 5 && exp < 10;
        else if (expFilter === '10+') matchesExp = exp >= 10;
      }

      return matchesSearch && matchesStatus && matchesRecruiter && matchesExp;
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
  }, [candidates, searchTerm, statusFilter, recruiterFilter, expFilter, sortConfig]);

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

  const handleAdd = () => {
    setFormData({
      candidateName: '',
      contactNumber: '',
      email: '',
      currentOrganisation: '',
      education: '',
      totalExperience: '',
      assignedTo: '',
      status: 'New',
      callingDate: new Date().toISOString().split('T')[0],
      currentCTCFixed: '',
      currentCTCInHand: '',
      expectedCTC: '',
      noticePeriod: '',
      communicationSkills: '',
      currentLocation: '',
      willingToWorkInStartup: 'Yes',
      recruiterFeedback: '',
      interviewerFeedback: '',
      remark: '',
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (candidate: any) => {
    setSelectedCandidate(candidate);
    setFormData({
      candidateName: candidate.candidateName,
      contactNumber: candidate.contactNumber,
      email: candidate.email,
      currentOrganisation: candidate.currentOrganisation,
      education: candidate.education,
      totalExperience: candidate.totalExperience,
      assignedTo: candidate.assignedTo,
      status: candidate.status,
      callingDate: candidate.callingDate,
      currentCTCFixed: candidate.currentCTCFixed.toString(),
      currentCTCInHand: candidate.currentCTCInHand.toString(),
      expectedCTC: candidate.expectedCTC.toString(),
      noticePeriod: candidate.noticePeriod,
      communicationSkills: candidate.communicationSkills,
      currentLocation: candidate.currentLocation,
      willingToWorkInStartup: candidate.willingToWorkInStartup,
      recruiterFeedback: candidate.recruiterFeedback,
      interviewerFeedback: candidate.interviewerFeedback,
      remark: candidate.remark,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this candidate?')) {
      deleteCandidate(id, 'sourcing');
    }
  };

  const handleSave = () => {
    if (isAddDialogOpen) {
      const newCandidate = {
        id: String(Date.now()),
        ...formData,
        assignDate: new Date().toISOString().split('T')[0],
        currentCTCFixed: parseFloat(formData.currentCTCFixed) || 0,
        currentCTCInHand: parseFloat(formData.currentCTCInHand) || 0,
        expectedCTC: parseFloat(formData.expectedCTC) || 0,
      };
      addCandidate(newCandidate);
      setIsAddDialogOpen(false);
    } else if (isEditDialogOpen && selectedCandidate) {
      const updates = {
        ...formData,
        currentCTCFixed: parseFloat(formData.currentCTCFixed) || 0,
        currentCTCInHand: parseFloat(formData.currentCTCInHand) || 0,
        expectedCTC: parseFloat(formData.expectedCTC) || 0,
      };
      
      // If status changed to Finalized, move to Recruitment & Hiring
      if (formData.status === 'Finalized' && selectedCandidate.status !== 'Finalized') {
        updateCandidateStatus(selectedCandidate.id, 'Finalized', 'sourcing');
      } else {
        updateCandidate(selectedCandidate.id, updates);
      }
      
      setIsEditDialogOpen(false);
      setSelectedCandidate(null);
    }
  };

  const handleScheduleInterview = (candidate: any) => {
    setSelectedCandidate(candidate);
    setInterviewData({
      candidateId: candidate.id,
      interviewer: '',
      date: '',
      time: '',
      meetingLink: `https://meet.example.com/${candidate.id}-${Date.now()}`,
    });
    setIsInterviewDialogOpen(true);
  };

  const handleSaveInterview = () => {
    // Mock notification
    alert(`Interview scheduled for ${selectedCandidate?.candidateName}!\nMeeting Link: ${interviewData.meetingLink}\n(Notification sent)`);
    setIsInterviewDialogOpen(false);
    setSelectedCandidate(null);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'New': 'bg-blue-100 text-blue-800',
      'Shortlisted': 'bg-purple-100 text-purple-800',
      'In Interview': 'bg-yellow-100 text-yellow-800',
      'Feedback Call': 'bg-orange-100 text-orange-800',
      'Finalized': 'bg-green-100 text-green-800',
      'Hired': 'bg-emerald-100 text-emerald-800',
      'On Hold': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          {
            title: 'Total Candidates',
            value: kpis.totalCandidates,
            icon: Users,
            gradient: 'from-blue-600 via-indigo-600 to-blue-700',
            shadow: 'shadow-blue-500/30',
          },
          {
            title: 'Shortlisted',
            value: kpis.shortlisted,
            icon: UserCheck,
            gradient: 'from-purple-600 via-violet-600 to-purple-700',
            shadow: 'shadow-purple-500/30',
          },
          {
            title: 'In Interview',
            value: kpis.inInterview,
            icon: Calendar,
            gradient: 'from-yellow-600 via-amber-600 to-yellow-700',
            shadow: 'shadow-yellow-500/30',
          },
          {
            title: 'Hired',
            value: kpis.hired,
            icon: CheckCircle,
            gradient: 'from-emerald-600 via-teal-600 to-emerald-700',
            shadow: 'shadow-emerald-500/30',
          },
          {
            title: 'On Hold',
            value: kpis.onHold,
            icon: Clock,
            gradient: 'from-gray-600 via-slate-600 to-gray-700',
            shadow: 'shadow-gray-500/30',
          },
        ].map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${kpi.gradient} ${kpi.shadow} shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
            >
              {/* Animated gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-100`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              
              {/* Content */}
              <div className="relative z-10 p-4 lg:p-5">
                <div className="flex items-start justify-between gap-3">
                  {/* Icon */}
                  <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-sm flex-shrink-0 shadow-lg">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  
                  {/* Text Content */}
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
              
              {/* Decorative glow effects */}
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
                  placeholder="Search by name, email, phone, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
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
            <Select value={expFilter} onValueChange={setExpFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Experience</SelectItem>
                <SelectItem value="0-2">0-2 years</SelectItem>
                <SelectItem value="2-5">2-5 years</SelectItem>
                <SelectItem value="5-10">5-10 years</SelectItem>
                <SelectItem value="10+">10+ years</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAdd}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Candidate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Candidate</DialogTitle>
                  <DialogDescription>
                    Fill in the candidate details below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="candidateName">Candidate Name *</Label>
                      <Input
                        id="candidateName"
                        value={formData.candidateName}
                        onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactNumber">Contact Number *</Label>
                      <Input
                        id="contactNumber"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentOrganisation">Current Organisation</Label>
                      <Input
                        id="currentOrganisation"
                        value={formData.currentOrganisation}
                        onChange={(e) => setFormData({ ...formData, currentOrganisation: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="education">Education</Label>
                      <Input
                        id="education"
                        value={formData.education}
                        onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalExperience">Total Experience</Label>
                      <Input
                        id="totalExperience"
                        value={formData.totalExperience}
                        onChange={(e) => setFormData({ ...formData, totalExperience: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="assignedTo">Assigned To</Label>
                      <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recruiter" />
                        </SelectTrigger>
                        <SelectContent>
                          {recruiterOptions.map(recruiter => (
                            <SelectItem key={recruiter} value={recruiter}>{recruiter}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="callingDate">Calling Date</Label>
                    <Input
                      id="callingDate"
                      type="date"
                      value={formData.callingDate}
                      onChange={(e) => setFormData({ ...formData, callingDate: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="currentCTCFixed">Current CTC (Fixed)</Label>
                      <Input
                        id="currentCTCFixed"
                        type="number"
                        value={formData.currentCTCFixed}
                        onChange={(e) => setFormData({ ...formData, currentCTCFixed: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentCTCInHand">Current CTC (In-hand)</Label>
                      <Input
                        id="currentCTCInHand"
                        type="number"
                        value={formData.currentCTCInHand}
                        onChange={(e) => setFormData({ ...formData, currentCTCInHand: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expectedCTC">Expected CTC</Label>
                      <Input
                        id="expectedCTC"
                        type="number"
                        value={formData.expectedCTC}
                        onChange={(e) => setFormData({ ...formData, expectedCTC: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="noticePeriod">Notice Period</Label>
                      <Input
                        id="noticePeriod"
                        value={formData.noticePeriod}
                        onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="communicationSkills">Communication Skills</Label>
                      <Input
                        id="communicationSkills"
                        value={formData.communicationSkills}
                        onChange={(e) => setFormData({ ...formData, communicationSkills: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currentLocation">Current Location</Label>
                      <Input
                        id="currentLocation"
                        value={formData.currentLocation}
                        onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="willingToWorkInStartup">Willing to Work in Startup</Label>
                      <Select value={formData.willingToWorkInStartup} onValueChange={(value) => setFormData({ ...formData, willingToWorkInStartup: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="recruiterFeedback">Recruiter Feedback</Label>
                    <Textarea
                      id="recruiterFeedback"
                      value={formData.recruiterFeedback}
                      onChange={(e) => setFormData({ ...formData, recruiterFeedback: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="interviewerFeedback">Interviewer Feedback</Label>
                    <Textarea
                      id="interviewerFeedback"
                      value={formData.interviewerFeedback}
                      onChange={(e) => setFormData({ ...formData, interviewerFeedback: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="remark">Remark</Label>
                    <Textarea
                      id="remark"
                      value={formData.remark}
                      onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave}>Save Candidate</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => setIsInterviewDialogOpen(true)}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Schedule Interview
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Table */}
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
                  <TableHead>Contact Number</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Organisation</TableHead>
                  <TableHead>Education</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('totalExperience')}>
                    Total Experience {sortConfig?.key === 'totalExperience' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Assign Date</TableHead>
                  <TableHead>Status</TableHead>
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
                  paginatedCandidates.map((candidate) => (
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
                        <TableCell>{candidate.contactNumber}</TableCell>
                        <TableCell>{candidate.email}</TableCell>
                        <TableCell>{candidate.currentOrganisation}</TableCell>
                        <TableCell>{candidate.education}</TableCell>
                        <TableCell>{candidate.totalExperience}</TableCell>
                        <TableCell>{candidate.assignedTo}</TableCell>
                        <TableCell>{format(new Date(candidate.assignDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(candidate.status)}>
                            {candidate.status}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleScheduleInterview(candidate)}
                              title="Schedule Interview"
                            >
                              <CalendarIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(candidate)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(candidate.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(candidate.id) && (
                        <TableRow>
                          <TableCell colSpan={11} className="bg-muted/50">
                            <div className="p-4 space-y-4">
                              <div className="flex items-center gap-4 pb-3 border-b">
                                <div>
                                  <Label className="text-sm font-semibold">Quick Status Change</Label>
                                  <Select 
                                    value={candidate.status} 
                                    onValueChange={(value) => {
                                      if (value === 'Finalized') {
                                        updateCandidateStatus(candidate.id, 'Finalized', 'sourcing');
                                      } else {
                                        updateCandidate(candidate.id, { status: value });
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="w-[200px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {statusOptions.map(status => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-semibold mb-2">Calling Date</p>
                                <p className="text-sm">{candidate.callingDate ? format(new Date(candidate.callingDate), 'MMM dd, yyyy') : 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold mb-2">Current CTC (Fixed)</p>
                                <p className="text-sm">₹{candidate.currentCTCFixed?.toLocaleString() || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold mb-2">Current CTC (In-hand)</p>
                                <p className="text-sm">₹{candidate.currentCTCInHand?.toLocaleString() || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold mb-2">Expected CTC</p>
                                <p className="text-sm">₹{candidate.expectedCTC?.toLocaleString() || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold mb-2">Notice Period</p>
                                <p className="text-sm">{candidate.noticePeriod}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold mb-2">Communication Skills</p>
                                <p className="text-sm">{candidate.communicationSkills}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold mb-2">Current Location</p>
                                <p className="text-sm">{candidate.currentLocation}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold mb-2">Willing to Work in Startup</p>
                                <p className="text-sm">{candidate.willingToWorkInStartup}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm font-semibold mb-2">Recruiter Feedback</p>
                                <p className="text-sm">{candidate.recruiterFeedback}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm font-semibold mb-2">Interviewer Feedback</p>
                                <p className="text-sm">{candidate.interviewerFeedback}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm font-semibold mb-2">Remark</p>
                                <p className="text-sm">{candidate.remark}</p>
                              </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Candidate</DialogTitle>
            <DialogDescription>
              Update the candidate details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Same form fields as Add Dialog */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-candidateName">Candidate Name *</Label>
                <Input
                  id="edit-candidateName"
                  value={formData.candidateName}
                  onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-contactNumber">Contact Number *</Label>
                <Input
                  id="edit-contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-recruiterFeedback">Recruiter Feedback</Label>
              <Textarea
                id="edit-recruiterFeedback"
                value={formData.recruiterFeedback}
                onChange={(e) => setFormData({ ...formData, recruiterFeedback: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-interviewerFeedback">Interviewer Feedback</Label>
              <Textarea
                id="edit-interviewerFeedback"
                value={formData.interviewerFeedback}
                onChange={(e) => setFormData({ ...formData, interviewerFeedback: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-remark">Remark</Label>
              <Textarea
                id="edit-remark"
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Update Candidate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interview Scheduling Dialog */}
      <Dialog open={isInterviewDialogOpen} onOpenChange={setIsInterviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Schedule an interview for {selectedCandidate?.candidateName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="interviewer">Interviewer</Label>
              <Input
                id="interviewer"
                value={interviewData.interviewer}
                onChange={(e) => setInterviewData({ ...interviewData, interviewer: e.target.value })}
                placeholder="Enter interviewer name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="interview-date">Date</Label>
                <Input
                  id="interview-date"
                  type="date"
                  value={interviewData.date}
                  onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="interview-time">Time</Label>
                <Input
                  id="interview-time"
                  type="time"
                  value={interviewData.time}
                  onChange={(e) => setInterviewData({ ...interviewData, time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <div className="flex gap-2">
                <Input
                  id="meetingLink"
                  value={interviewData.meetingLink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(interviewData.meetingLink)}
                >
                  <Video className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Auto-generated meeting link</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInterviewDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveInterview}>Schedule Interview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

