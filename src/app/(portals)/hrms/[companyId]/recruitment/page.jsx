'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCompany } from '@/lib/context/CompanyContext';
import * as XLSX from 'xlsx';
import { 
  Users, 
  Target, 
  CalendarCheck, 
  CheckCircle2, 
  Hourglass,
  Search,
  Plus,
  Calendar,
  Edit,
  Trash2,
  Sparkles,
  List,
  Download,
  Upload
} from 'lucide-react';
import Link from 'next/link';
import AddCandidateDialog from './components/AddCandidateDialog';
import ScheduleInterviewDialog from './components/ScheduleInterviewDialog';

export default function SourcingScreeningPage() {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [recruiterFilter, setRecruiterFilter] = useState('All Recruiters');
  const [experienceFilter, setExperienceFilter] = useState('All Experience');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedCandidateForInterview, setSelectedCandidateForInterview] = useState(null);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [deletingCandidate, setDeletingCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [candidatesList, setCandidatesList] = useState([]);
  const [kpiCards, setKpiCards] = useState([]);
  const [hrList, setHrList] = useState(['All Recruiters']);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const itemsPerPage = 10;

  // Fetch candidates data - optimized for immediate loading
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        
        // Get company name - prioritize multiple sources for faster loading
        let company = null;
        
        // 1. Try currentCompany from context (fastest if available)
        if (currentCompany?.name) {
          company = currentCompany.name;
        }
        
        // 2. Try sessionStorage (immediate access)
        if (!company && typeof window !== 'undefined') {
          company = sessionStorage.getItem('selectedCompany') || 
                   sessionStorage.getItem('adminSelectedCompany') ||
                   sessionStorage.getItem(`company_${companyId}`);
        }
        
        // 3. Try localStorage (fallback)
        if (!company && typeof window !== 'undefined') {
          const savedCompany = localStorage.getItem('selected_company');
          if (savedCompany) {
            try {
              const parsed = JSON.parse(savedCompany);
              company = parsed.name;
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
        
        // 4. If still no company, try to get from companyId
        if (!company && companyId && companyId !== 'undefined') {
          if (typeof window !== 'undefined') {
            company = sessionStorage.getItem(`company_${companyId}`);
          }
        }
        
        const params = new URLSearchParams();
        // For HRMS Admin Portal - don't send company to get all data
        // Only send company if explicitly needed for filtering
        // if (company) {
        //   params.append('company', company);
        // }
        if (statusFilter && statusFilter !== 'All Status') {
          params.append('status', statusFilter);
        }
        if (recruiterFilter && recruiterFilter !== 'All Recruiters') {
          params.append('recruiter', recruiterFilter);
        }
        if (experienceFilter && experienceFilter !== 'All Experience') {
          params.append('experience', experienceFilter);
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }

        const headers = {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
        // For HRMS Admin Portal - don't send company header to get all data
        // if (company) {
        //   headers['x-company'] = company;
        // }

        const res = await fetch(`/api/hrms-portal/recruitment/candidates?${params.toString()}`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const data = json.data;
            setCandidatesList(data.candidates || []);
            
            // Set KPI Cards
            if (data.kpis) {
              setKpiCards([
    { 
      title: 'TOTAL CANDIDATES', 
                  value: String(data.kpis.totalCandidates || 0), 
      icon: Users, 
      gradient: 'from-purple-600 via-purple-500 to-purple-700'
    },
    { 
      title: 'SHORTLISTED', 
                  value: String(data.kpis.shortlisted || 0), 
      icon: Target, 
      gradient: 'from-purple-800 via-purple-700 to-purple-900'
    },
    { 
      title: 'IN INTERVIEW', 
                  value: String(data.kpis.inInterview || 0), 
      icon: CalendarCheck, 
      gradient: 'from-orange-500 via-orange-400 to-orange-600'
    },
    { 
      title: 'HIRED', 
                  value: String(data.kpis.hired || 0), 
      icon: CheckCircle2, 
      gradient: 'from-green-600 via-green-500 to-green-700'
    },
    { 
      title: 'ON HOLD', 
                  value: String(data.kpis.onHold || 0), 
      icon: Hourglass, 
      gradient: 'from-slate-700 via-slate-600 to-slate-800'
    },
              ]);
            }
            
            setHrList(data.hrList || ['All Recruiters']);
          }
        }
      } catch (err) {
        console.error('Fetch candidates error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately - don't wait for currentCompany if we have sessionStorage
    fetchCandidates();
  }, [companyId, currentCompany, statusFilter, recruiterFilter, experienceFilter, searchQuery, refreshTrigger]);

  // Additional effect to trigger fetch when company becomes available
  useEffect(() => {
    if (currentCompany?.name && candidatesList.length === 0) {
      // Small delay to ensure state is ready
      const timer = setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentCompany?.name]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, recruiterFilter, experienceFilter, searchQuery]);

  const totalCandidates = candidatesList.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const candidates = candidatesList.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalCandidates / itemsPerPage);

  const getStatusColor = (status) => {
    const statusColors = {
      'New': 'bg-blue-100 text-blue-700',
      'Shortlisted': 'bg-purple-100 text-purple-700',
      'In Interview': 'bg-yellow-100 text-yellow-700',
      'Interview Scheduled': 'bg-yellow-100 text-yellow-700',
      'Interview Aligned': 'bg-yellow-100 text-yellow-700',
      'Hired': 'bg-green-100 text-green-700',
      'On Hold': 'bg-slate-100 text-slate-700',
    };
    return statusColors[status] || 'bg-slate-100 text-slate-700';
  };

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

  const handleAddCandidate = async (candidateData) => {
    try {
      const company = getCompanyName();
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      // For HRMS Admin Portal - don't send company header to allow all data access
      // if (company) {
      //   headers['x-company'] = company;
      // }

      // Prepare candidate data for API
      // For HRMS Admin Portal - company is optional
      const apiData = {
        ...candidateData,
        ...(company ? { company: company } : {})
      };

      // Save to database
      const res = await fetch('/api/hrms-portal/recruitment/candidates', {
        method: 'POST',
        headers,
        body: JSON.stringify(apiData),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setRefreshTrigger(prev => prev + 1);
          alert('Candidate added successfully!');
        } else {
          alert('Failed to add candidate: ' + (json.error || 'Unknown error'));
        }
      } else {
        const errorText = await res.text();
        alert('Failed to add candidate: ' + errorText);
      }
    } catch (error) {
      console.error('Add candidate error:', error);
      alert('Failed to add candidate: ' + error.message);
    }
  };

  const handleEditCandidate = async (candidateId) => {
    try {
      const company = getCompanyName();
      const token = localStorage.getItem('auth_token');
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      // For HRMS Admin Portal - don't send company header to allow all data access
      // if (company) {
      //   headers['x-company'] = company;
      // }

      // Fetch full candidate data from API
      const res = await fetch(`/api/hrms-portal/recruitment/candidates/${candidateId}`, {
        method: 'GET',
        headers,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          // Set the full candidate data for editing
          setEditingCandidate(json.data);
          setIsAddDialogOpen(true);
        } else {
          alert('Failed to fetch candidate data: ' + (json.error || 'Unknown error'));
        }
      } else {
        const errorText = await res.text();
        alert('Failed to fetch candidate data: ' + errorText);
      }
    } catch (error) {
      console.error('Fetch candidate error:', error);
      alert('Failed to fetch candidate data: ' + error.message);
    }
  };

  const handleUpdateCandidate = async (candidateData) => {
    try {
      if (!editingCandidate?.id) return;
      
      const company = getCompanyName();
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      // For HRMS Admin Portal - don't send company header to allow all data access
      // if (company) {
      //   headers['x-company'] = company;
      // }

      // Prepare candidate data for API (remove id field as MongoDB uses _id)
      const { id, ...dataWithoutId } = candidateData;
      const apiData = {
        ...dataWithoutId,
        ...(company ? { company: company } : {})
      };

      // Update in database
      const res = await fetch(`/api/hrms-portal/recruitment/candidates/${editingCandidate.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(apiData),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setRefreshTrigger(prev => prev + 1);
          setEditingCandidate(null);
          alert('Candidate updated successfully!');
        } else {
          alert('Failed to update candidate: ' + (json.error || 'Unknown error'));
        }
      } else {
        const errorText = await res.text();
        alert('Failed to update candidate: ' + errorText);
      }
    } catch (error) {
      console.error('Update candidate error:', error);
      alert('Failed to update candidate: ' + error.message);
    }
  };

  const handleDeleteCandidate = async () => {
    if (!deletingCandidate?.id) return;
    
    if (!confirm(`Are you sure you want to delete ${deletingCandidate.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const company = getCompanyName();
      const token = localStorage.getItem('auth_token');
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      // For HRMS Admin Portal - don't send company header to allow all data access
      // if (company) {
      //   headers['x-company'] = company;
      // }

      const res = await fetch(`/api/hrms-portal/recruitment/candidates/${deletingCandidate.id}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setRefreshTrigger(prev => prev + 1);
          setDeletingCandidate(null);
          alert('Candidate deleted successfully!');
        } else {
          alert('Failed to delete candidate: ' + (json.error || 'Unknown error'));
        }
      } else {
        const errorText = await res.text();
        alert('Failed to delete candidate: ' + errorText);
      }
    } catch (error) {
      console.error('Delete candidate error:', error);
      alert('Failed to delete candidate: ' + error.message);
    }
  };

  const handleScheduleInterview = async (interviewData) => {
    if (!selectedCandidateForInterview?.id) return;

    try {
      const company = getCompanyName();
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      // For HRMS Admin Portal - don't send company header to allow all data access
      // if (company) {
      //   headers['x-company'] = company;
      // }

      // Update candidate status to "Interview Scheduled" and add interview details
      const updateData = {
        status: 'Interview Scheduled',
        interviewDate: interviewData.date,
        interviewTime: interviewData.time,
        interviewer: interviewData.interviewer,
        meetingLink: interviewData.meetingLink,
        interviewScheduledAt: interviewData.scheduledAt
      };

      const res = await fetch(`/api/hrms-portal/recruitment/candidates/${selectedCandidateForInterview.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setRefreshTrigger(prev => prev + 1);
          setSelectedCandidateForInterview(null);
          alert(`Interview scheduled successfully!\n\nInterviewer: ${interviewData.interviewer}\nDate: ${interviewData.date}\nTime: ${interviewData.time}\nMeeting Link: ${interviewData.meetingLink || 'Auto-generated'}`);
        } else {
          alert('Failed to schedule interview: ' + (json.error || 'Unknown error'));
        }
      } else {
        const errorText = await res.text();
        alert('Failed to schedule interview: ' + errorText);
      }
    } catch (error) {
      console.error('Schedule interview error:', error);
      alert('Failed to schedule interview: ' + error.message);
    }
  };

  // Download Excel template
  const downloadTemplate = () => {
    const headers = [
      'Folder Name',
      'Candidate Name',
      'Contact Number',
      'Email',
      'Current Location',
      'Calling Date',
      'Current Organisation',
      'Education',
      'Total Experience',
      'Assigned To',
      'Status',
      'Current CTC (Fixed)',
      'Current CTC (In-hand)',
      'Expected CTC',
      'Notice Period',
      'Willing to Work in Startup',
      'Communication Skills',
      'Recruiter Feedback',
      'Interviewer Feedback',
      'Remark'
    ];

    // Create a sample row with example values
    const sampleRow = [
      'Folder_Example', // Folder Name
      'John Doe', // Candidate Name
      '9876543210', // Contact Number
      'john.doe@example.com', // Email
      'Bangalore', // Current Location
      '2024-01-15', // Calling Date (YYYY-MM-DD format)
      'Tech Corp', // Current Organisation
      'B.Tech Computer Science', // Education
      '5 years', // Total Experience
      'Recruiter Name', // Assigned To
      'New', // Status (New/Shortlisted/In Interview/Hired/On Hold)
      '800000', // Current CTC (Fixed)
      '650000', // Current CTC (In-hand)
      '1000000', // Expected CTC
      '30 days', // Notice Period
      'Yes', // Willing to Work in Startup (Yes/No)
      'Good', // Communication Skills (Excellent/Very Good/Good/Average/Poor)
      'Initial screening completed', // Recruiter Feedback
      '', // Interviewer Feedback (leave empty)
      '' // Remark (leave empty)
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);

    // Set column widths
    const colWidths = headers.map(() => ({ wch: 25 }));
    ws['!cols'] = colWidths;

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Candidate Template');

    // Generate Excel file and download
    XLSX.writeFile(wb, 'Candidate_Bulk_Upload_Template.xlsx');
  };

  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      if (!candidateId) {
        alert('Candidate ID is missing');
        return;
      }

      // Check if candidateId is a valid MongoDB ObjectId (24 hex characters)
      // If it's a number, it means the candidate wasn't properly saved to DB
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(String(candidateId));
      if (!isValidObjectId && !isNaN(candidateId)) {
        alert('Cannot update status: Candidate data is not properly saved. Please refresh the page and try again.');
        return;
      }

      // Optimistic update - update UI immediately before API call
      const candidateIndex = candidatesList.findIndex(c => c.id === candidateId);
      if (candidateIndex !== -1) {
        const statusColors = {
          'New': 'bg-blue-100 text-blue-700',
          'Shortlisted': 'bg-purple-100 text-purple-700',
          'In Interview': 'bg-yellow-100 text-yellow-700',
          'Interview Scheduled': 'bg-yellow-100 text-yellow-700',
          'Interview Aligned': 'bg-yellow-100 text-yellow-700',
          'Hired': 'bg-green-100 text-green-700',
          'On Hold': 'bg-slate-100 text-slate-700',
        };
        
        const updatedCandidates = [...candidatesList];
        updatedCandidates[candidateIndex] = {
          ...updatedCandidates[candidateIndex],
          status: newStatus,
          statusColor: statusColors[newStatus] || 'bg-slate-100 text-slate-700'
        };
        setCandidatesList(updatedCandidates);
        
        // Update KPI cards immediately
        const totalCandidates = updatedCandidates.length;
        const shortlisted = updatedCandidates.filter(c => c.status === 'Shortlisted').length;
        const inInterview = updatedCandidates.filter(c => c.status === 'In Interview' || c.status === 'Interview Scheduled' || c.status === 'Interview Aligned').length;
        const hired = updatedCandidates.filter(c => c.status === 'Hired').length;
        const onHold = updatedCandidates.filter(c => c.status === 'On Hold').length;
        
        setKpiCards([
          { 
            title: 'TOTAL CANDIDATES', 
            value: String(totalCandidates), 
            icon: Users, 
            gradient: 'from-purple-600 via-purple-500 to-purple-700'
          },
          { 
            title: 'SHORTLISTED', 
            value: String(shortlisted), 
            icon: Target, 
            gradient: 'from-purple-800 via-purple-700 to-purple-900'
          },
          { 
            title: 'IN INTERVIEW', 
            value: String(inInterview), 
            icon: CalendarCheck, 
            gradient: 'from-orange-500 via-orange-400 to-orange-600'
          },
          { 
            title: 'HIRED', 
            value: String(hired), 
            icon: CheckCircle2, 
            gradient: 'from-green-600 via-green-500 to-green-700'
          },
          { 
            title: 'ON HOLD', 
            value: String(onHold), 
            icon: Hourglass, 
            gradient: 'from-slate-700 via-slate-600 to-slate-800'
          },
        ]);
      }

      const company = getCompanyName();
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      // For HRMS Admin Portal - don't send company header to allow all data access
      // if (company) {
      //   headers['x-company'] = company;
      // }

      console.log('Updating status:', { candidateId, newStatus, company });

      const res = await fetch(`/api/hrms-portal/recruitment/candidates/${candidateId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      const responseText = await res.text();
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        // Revert optimistic update on error
        setRefreshTrigger(prev => prev + 1);
        alert('Failed to update status: Invalid response from server');
        return;
      }

      if (res.ok) {
        if (json.success) {
          // Refresh to ensure data is in sync with server
          setRefreshTrigger(prev => prev + 1);
          // Optionally show success message
          // alert('Status updated successfully!');
        } else {
          // Revert optimistic update on error
          setRefreshTrigger(prev => prev + 1);
          alert('Failed to update status: ' + (json.error || 'Unknown error'));
        }
      } else {
        // Revert optimistic update on error
        setRefreshTrigger(prev => prev + 1);
        alert('Failed to update status: ' + (json.error || `Server error (${res.status})`));
      }
    } catch (error) {
      console.error('Update status error:', error);
      // Revert optimistic update on error
      setRefreshTrigger(prev => prev + 1);
      alert('Failed to update status: ' + (error.message || 'Network error'));
    }
  };


  return (
    <div className="space-y-6 relative">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-600">Loading candidates...</div>
        </div>
      )}

      {/* KPI Cards */}
      {!loading && (
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
      )}

      {/* Search and Filter Bar */}
      {!loading && (
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
              {hrList.map((hr) => (
                <option key={hr} value={hr}>{hr}</option>
              ))}
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
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download Template</span>
            </button>
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
            <Link
              href={`/hrms/${companyId}/recruitment/scheduled-interviews`}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <List className="w-4 h-4" />
              <span className="text-sm font-medium">View Scheduled Interviews</span>
            </Link>
          </div>
        </div>
      </div>
      )}

      {/* Candidate Table */}
      {!loading && (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Folder Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Candidate Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Contact Number</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{candidate.folderName || 'N/A'}</div>
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
                    <div className="text-sm text-slate-600">{candidate.assignedTo}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <select
                      value={candidate.status}
                      onChange={(e) => handleStatusChange(candidate.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${candidate.statusColor} focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                    >
                      <option value="New">New</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="In Interview">In Interview</option>
                      <option value="Hired">Hired</option>
                      <option value="On Hold">On Hold</option>
                    </select>
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
                      <button 
                        onClick={() => handleEditCandidate(candidate.id)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Edit Candidate"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeletingCandidate(candidate)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete Candidate"
                      >
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
      )}

      {/* HR Copilot Floating Button */}
      <button className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-slate-900 transition-colors flex items-center gap-2 z-50">
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">HR Copilot</span>
      </button>

      {/* Add/Edit Candidate Dialog */}
      <AddCandidateDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEditingCandidate(null);
          }
        }}
        onSave={editingCandidate ? handleUpdateCandidate : handleAddCandidate}
        existingCandidates={candidatesList}
        candidateToEdit={editingCandidate}
      />

      {/* Schedule Interview Dialog */}
      <ScheduleInterviewDialog
        open={isScheduleDialogOpen}
        onOpenChange={(open) => {
          setIsScheduleDialogOpen(open);
          if (!open) {
            setSelectedCandidateForInterview(null);
          }
        }}
        onSchedule={handleScheduleInterview}
        candidateName={selectedCandidateForInterview?.name || ''}
      />

      {/* Delete Confirmation Dialog */}
      {deletingCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeletingCandidate(null)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Candidate</h3>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to delete <strong>{deletingCandidate.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingCandidate(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCandidate}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
