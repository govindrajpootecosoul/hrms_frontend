'use client';

import { useState } from 'react';
import { 
  Users, 
  Target, 
  CalendarCheck, 
  CheckCircle2, 
  Hourglass,
  Search,
  Plus,
  Calendar,
  ChevronDown,
  Edit,
  Trash2,
  Sparkles
} from 'lucide-react';
import AddCandidateDialog from './components/AddCandidateDialog';
import ScheduleInterviewDialog from './components/ScheduleInterviewDialog';

export default function SourcingScreeningPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [recruiterFilter, setRecruiterFilter] = useState('All Recruiters');
  const [experienceFilter, setExperienceFilter] = useState('All Experience');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedCandidateForInterview, setSelectedCandidateForInterview] = useState(null);
  const itemsPerPage = 10;

  // KPI Cards
  const kpiCards = [
    { 
      title: 'TOTAL CANDIDATES', 
      value: '16', 
      icon: Users, 
      gradient: 'from-purple-600 via-purple-500 to-purple-700'
    },
    { 
      title: 'SHORTLISTED', 
      value: '1', 
      icon: Target, 
      gradient: 'from-purple-800 via-purple-700 to-purple-900'
    },
    { 
      title: 'IN INTERVIEW', 
      value: '13', 
      icon: CalendarCheck, 
      gradient: 'from-orange-500 via-orange-400 to-orange-600'
    },
    { 
      title: 'HIRED', 
      value: '0', 
      icon: CheckCircle2, 
      gradient: 'from-green-600 via-green-500 to-green-700'
    },
    { 
      title: 'ON HOLD', 
      value: '1', 
      icon: Hourglass, 
      gradient: 'from-slate-700 via-slate-600 to-slate-800'
    },
  ];

  // Candidate Data
  const allCandidates = [
    {
      id: 1,
      name: 'John Doe',
      contact: '+91 9876543210',
      email: 'john.doe@example.com',
      organisation: 'Tech Corp',
      education: 'B.Tech Computer Science',
      experience: '5 years',
      assignedTo: 'Sarah Johnson',
      assignDate: 'Jan 10, 2025',
      status: 'Shortlisted',
      statusColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 2,
      name: 'Jane Smith',
      contact: '+91 9876543211',
      email: 'jane.smith@example.com',
      organisation: 'StartupXYZ',
      education: 'M.Tech Software Engineering',
      experience: '3 years',
      assignedTo: 'Mike Wilson',
      assignDate: 'Jan 12, 2025',
      status: 'In Interview',
      statusColor: 'bg-yellow-100 text-yellow-700'
    },
    {
      id: 3,
      name: 'Emily Davis',
      contact: '+91 9876543213',
      email: 'emily.davis@example.com',
      organisation: 'MidTech Solutions',
      education: 'B.Sc Computer Science',
      experience: '2 years',
      assignedTo: 'Mike Wilson',
      assignDate: 'Jan 13, 2025',
      status: 'New',
      statusColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 4,
      name: 'Michael Chen',
      contact: '+91 9876543214',
      email: 'michael.chen@example.com',
      organisation: 'CloudTech',
      education: 'M.Tech Cloud Computing',
      experience: '4 years',
      assignedTo: 'Sarah Johnson',
      assignDate: 'Jan 11, 2025',
      status: 'On Hold',
      statusColor: 'bg-slate-100 text-slate-700'
    },
    {
      id: 5,
      name: 'Robert Martinez',
      contact: '+91 9876543218',
      email: 'robert.martinez@example.com',
      organisation: 'DevOps Solutions',
      education: 'B.Tech IT',
      experience: '4 years',
      assignedTo: 'Sarah Johnson',
      assignDate: 'Jan 15, 2025',
      status: 'In Interview',
      statusColor: 'bg-yellow-100 text-yellow-700'
    },
    {
      id: 6,
      name: 'Priya Patel',
      contact: '+91 9876543219',
      email: 'priya.patel@example.com',
      organisation: 'Mobile Apps Inc',
      education: 'B.E Computer Science',
      experience: '3 years',
      assignedTo: 'Sarah Johnson',
      assignDate: 'Jan 16, 2025',
      status: 'In Interview',
      statusColor: 'bg-yellow-100 text-yellow-700'
    },
    {
      id: 7,
      name: 'Kevin Zhang',
      contact: '+91 9876543220',
      email: 'kevin.zhang@example.com',
      organisation: 'AI Innovations',
      education: 'M.Tech AI/ML',
      experience: '5 years',
      assignedTo: 'Mike Wilson',
      assignDate: 'Jan 14, 2025',
      status: 'In Interview',
      statusColor: 'bg-yellow-100 text-yellow-700'
    },
    {
      id: 8,
      name: 'Sneha Reddy',
      contact: '+91 9876543221',
      email: 'sneha.reddy@example.com',
      organisation: 'E-commerce Platform',
      education: 'B.Tech Computer Science',
      experience: '2 years',
      assignedTo: 'Mike Wilson',
      assignDate: 'Jan 17, 2025',
      status: 'In Interview',
      statusColor: 'bg-yellow-100 text-yellow-700'
    },
    {
      id: 9,
      name: 'Rajesh Kumar',
      contact: '+91 9876543222',
      email: 'rajesh.kumar@example.com',
      organisation: 'Banking Software',
      education: 'M.Tech Software Engineering',
      experience: '6 years',
      assignedTo: 'David Lee',
      assignDate: 'Jan 13, 2025',
      status: 'In Interview',
      statusColor: 'bg-yellow-100 text-yellow-700'
    },
    {
      id: 10,
      name: 'Anita Desai',
      contact: '+91 9876543223',
      email: 'anita.desai@example.com',
      organisation: 'Healthcare Tech',
      education: 'B.E Information Technology',
      experience: '4 years',
      assignedTo: 'David Lee',
      assignDate: 'Jan 15, 2025',
      status: 'In Interview',
      statusColor: 'bg-yellow-100 text-yellow-700'
    },
    // Add 6 more candidates to reach 16 total
    {
      id: 11,
      name: 'Rahul Mehta',
      contact: '+91 9876543224',
      email: 'rahul.mehta@example.com',
      organisation: 'FinTech Corp',
      education: 'B.Tech Computer Science',
      experience: '3 years',
      assignedTo: 'Emma Brown',
      assignDate: 'Jan 14, 2025',
      status: 'In Interview',
      statusColor: 'bg-yellow-100 text-yellow-700'
    },
    {
      id: 12,
      name: 'Sneha Sharma',
      contact: '+91 9876543225',
      email: 'sneha.sharma@example.com',
      organisation: 'Data Analytics Inc',
      education: 'M.Tech Data Science',
      experience: '4 years',
      assignedTo: 'James Taylor',
      assignDate: 'Jan 16, 2025',
      status: 'In Interview',
      statusColor: 'bg-yellow-100 text-yellow-700'
    },
    {
      id: 13,
      name: 'Vikram Singh',
      contact: '+91 9876543226',
      email: 'vikram.singh@example.com',
      organisation: 'Cloud Services',
      education: 'B.E Computer Engineering',
      experience: '5 years',
      assignedTo: 'Lisa Anderson',
      assignDate: 'Jan 12, 2025',
      status: 'In Interview',
      statusColor: 'bg-yellow-100 text-yellow-700'
    },
    {
      id: 14,
      name: 'Priya Reddy',
      contact: '+91 9876543227',
      email: 'priya.reddy@example.com',
      organisation: 'Tech Solutions',
      education: 'B.Tech IT',
      experience: '2 years',
      assignedTo: 'Sarah Johnson',
      assignDate: 'Jan 18, 2025',
      status: 'In Interview',
      statusColor: 'bg-yellow-100 text-yellow-700'
    },
    {
      id: 15,
      name: 'Amit Kumar',
      contact: '+91 9876543228',
      email: 'amit.kumar@example.com',
      organisation: 'Software Services',
      education: 'M.Tech Software Engineering',
      experience: '6 years',
      assignedTo: 'Mike Wilson',
      assignDate: 'Jan 11, 2025',
      status: 'In Interview',
      statusColor: 'bg-yellow-100 text-yellow-700'
    },
    {
      id: 16,
      name: 'Neha Patel',
      contact: '+91 9876543229',
      email: 'neha.patel@example.com',
      organisation: 'Digital Solutions',
      education: 'B.Tech Computer Science',
      experience: '3 years',
      assignedTo: 'David Lee',
      assignDate: 'Jan 17, 2025',
      status: 'In Interview',
      statusColor: 'bg-yellow-100 text-yellow-700'
    },
  ];

  const [candidatesList, setCandidatesList] = useState(allCandidates);

  const handleAddCandidate = (candidateData) => {
    // Add the new candidate to the list
    const newCandidate = {
      id: candidatesList.length + 1,
      name: candidateData.candidateName,
      contact: candidateData.contactNumber,
      email: candidateData.email,
      organisation: candidateData.currentOrganisation,
      education: candidateData.education,
      experience: candidateData.totalExperience,
      assignedTo: candidateData.assignedTo,
      assignDate: new Date(candidateData.assignDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: candidateData.status,
      statusColor: getStatusColor(candidateData.status),
    };
    setCandidatesList([...candidatesList, newCandidate]);
    alert('Candidate added successfully!');
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'New': 'bg-blue-100 text-blue-700',
      'Shortlisted': 'bg-purple-100 text-purple-700',
      'In Interview': 'bg-yellow-100 text-yellow-700',
      'Feedback Call': 'bg-orange-100 text-orange-700',
      'Finalized': 'bg-indigo-100 text-indigo-700',
      'Hired': 'bg-green-100 text-green-700',
      'On Hold': 'bg-slate-100 text-slate-700',
    };
    return statusColors[status] || 'bg-slate-100 text-slate-700';
  };

  const totalCandidates = candidatesList.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const candidates = candidatesList.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalCandidates / itemsPerPage);

  return (
    <div className="space-y-6 relative">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${card.gradient} rounded-xl p-5 text-white shadow-lg`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{card.value}</div>
              <div className="text-xs text-white/90 uppercase tracking-wide">{card.title}</div>
            </div>
          );
        })}
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All Status</option>
              <option>New</option>
              <option>Shortlisted</option>
              <option>In Interview</option>
              <option>Hired</option>
              <option>On Hold</option>
            </select>
            <select
              value={recruiterFilter}
              onChange={(e) => setRecruiterFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All Recruiters</option>
              <option>Sarah Johnson</option>
              <option>Mike Wilson</option>
              <option>David Lee</option>
              <option>Emma Brown</option>
              <option>James Taylor</option>
              <option>Lisa Anderson</option>
            </select>
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All Experience</option>
              <option>0-2 Years</option>
              <option>2-5 Years</option>
              <option>5-10 Years</option>
              <option>10+ Years</option>
            </select>
            <button 
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Candidate</span>
            </button>
            <button 
              onClick={() => {
                setSelectedCandidateForInterview(null);
                setIsScheduleDialogOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Schedule Interview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider w-8"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Candidate Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Contact Number</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Current Organisation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Education</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Total Experience</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Assign Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{candidate.name}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{candidate.contact}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{candidate.email}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{candidate.organisation}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{candidate.education}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{candidate.experience}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{candidate.assignedTo}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{candidate.assignDate}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${candidate.statusColor}`}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setSelectedCandidateForInterview(candidate);
                          setIsScheduleDialogOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Schedule Interview"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Showing {startIndex + 1} to {Math.min(endIndex, totalCandidates)} of {totalCandidates} candidates
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* HR Copilot Floating Button */}
      <button className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-slate-900 transition-colors flex items-center gap-2 z-50">
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">HR Copilot</span>
      </button>

      {/* Add New Candidate Dialog */}
      <AddCandidateDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddCandidate}
        existingCandidates={candidatesList}
      />

      {/* Schedule Interview Dialog */}
      <ScheduleInterviewDialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        onSchedule={(interviewData) => {
          alert(`Interview scheduled successfully!\n\nInterviewer: ${interviewData.interviewer}\nDate: ${interviewData.date}\nTime: ${interviewData.time}\nMeeting Link: ${interviewData.meetingLink || 'Auto-generated'}`);
          console.log('Interview scheduled:', interviewData);
        }}
        candidateName={selectedCandidateForInterview?.name || ''}
      />
    </div>
  );
}
