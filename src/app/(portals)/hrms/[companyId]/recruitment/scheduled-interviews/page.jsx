'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCompany } from '@/lib/context/CompanyContext';
import { 
  Calendar,
  Clock,
  User,
  Video,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import ScheduleInterviewDialog from '../components/ScheduleInterviewDialog';

export default function ScheduledInterviewsPage() {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [interviewerFilter, setInterviewerFilter] = useState('All Interviewers');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [interviewerList, setInterviewerList] = useState(['All Interviewers']);
  const [editingInterview, setEditingInterview] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get company name helper - optimized for fast loading
  const getCompanyName = () => {
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
    
    return company;
  };

  // Fetch scheduled interviews
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const company = getCompanyName();
        const token = localStorage.getItem('auth_token');
        
        const params = new URLSearchParams();
        // For HRMS Admin Portal - don't send company to get all data
        if (statusFilter && statusFilter !== 'All Status') {
          params.append('status', statusFilter);
        }
        if (interviewerFilter && interviewerFilter !== 'All Interviewers') {
          params.append('interviewer', interviewerFilter);
        }
        if (dateFilter) {
          params.append('date', dateFilter);
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }

        const headers = {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
        // For HRMS Admin Portal - don't send company header to get all data

        const res = await fetch(`/api/hrms-portal/recruitment/interviews?${params.toString()}`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setInterviews(json.data.interviews || []);
            setInterviewerList(json.data.interviewers || ['All Interviewers']);
          }
        }
      } catch (err) {
        console.error('Fetch interviews error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [companyId, currentCompany, statusFilter, interviewerFilter, dateFilter, searchQuery, refreshTrigger]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      const timeStr = timeString && timeString !== 'N/A' ? timeString : '';
      return timeStr ? `${dateStr} at ${timeStr}` : dateStr;
    } catch (e) {
      return 'N/A';
    }
  };

  const getInterviewStatusColor = (status) => {
    const colors = {
      'Scheduled': 'bg-blue-100 text-blue-700',
      'Upcoming': 'bg-yellow-100 text-yellow-700',
      'Completed': 'bg-green-100 text-green-700',
      'Cancelled': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const isUpcoming = (dateString) => {
    if (!dateString) return false;
    try {
      const interviewDate = new Date(dateString);
      const now = new Date();
      return interviewDate > now && interviewDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000;
    } catch (e) {
      return false;
    }
  };

  const isPast = (dateString) => {
    if (!dateString) return false;
    try {
      const interviewDate = new Date(dateString);
      const now = new Date();
      return interviewDate < now;
    } catch (e) {
      return false;
    }
  };

  const handleEditInterview = (interview) => {
    // Format date for the input field (YYYY-MM-DD)
    let formattedDate = '';
    if (interview.interviewDate) {
      try {
        const date = new Date(interview.interviewDate);
        formattedDate = date.toISOString().split('T')[0];
      } catch (e) {
        console.error('Error formatting date:', e);
      }
    }
    
    setEditingInterview({
      ...interview,
      formattedDate
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateInterview = async (interviewData) => {
    if (!editingInterview?.candidateId) return;

    try {
      const company = getCompanyName();
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      // Update candidate interview details
      const updateData = {
        interviewDate: interviewData.date ? new Date(interviewData.date).toISOString() : null,
        interviewTime: interviewData.time,
        interviewer: interviewData.interviewer,
        meetingLink: interviewData.meetingLink,
        interviewScheduledAt: interviewData.scheduledAt ? new Date(interviewData.scheduledAt).toISOString() : null
      };

      const res = await fetch(`/api/hrms-portal/recruitment/candidates/${editingInterview.candidateId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setRefreshTrigger(prev => prev + 1);
          setEditingInterview(null);
          setIsEditDialogOpen(false);
          alert('Interview updated successfully!');
        } else {
          alert('Failed to update interview: ' + (json.error || 'Unknown error'));
        }
      } else {
        const errorText = await res.text();
        alert('Failed to update interview: ' + errorText);
      }
    } catch (error) {
      console.error('Update interview error:', error);
      alert('Failed to update interview: ' + error.message);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Scheduled Interviews</h1>
          <p className="text-sm text-slate-600 mt-1">View and manage all scheduled interviews</p>
        </div>
        <Link
          href={`/hrms/${companyId}/recruitment`}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Back to Candidates
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-600">Loading interviews...</div>
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
                  placeholder="Search by candidate name, email, interviewer..."
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
                <option>Scheduled</option>
                <option>Upcoming</option>
                <option>Completed</option>
              </select>
              <select
                value={interviewerFilter}
                onChange={(e) => setInterviewerFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {interviewerList.map((interviewer) => (
                  <option key={interviewer} value={interviewer}>{interviewer}</option>
                ))}
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Filter by date"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800"
                  title="Clear date filter"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interviews Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Candidate</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Position</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Interviewer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Meeting Link</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Interview Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {interviews.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-sm text-slate-500">
                      No scheduled interviews found.
                    </td>
                  </tr>
                ) : (
                  interviews.map((interview) => (
                    <tr 
                      key={interview.id} 
                      className={`hover:bg-slate-50 ${
                        isUpcoming(interview.scheduledAt) ? 'bg-yellow-50' : ''
                      } ${isPast(interview.scheduledAt) ? 'opacity-75' : ''}`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{interview.candidateName}</div>
                        <div className="text-xs text-slate-500">{interview.email}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{interview.contact}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{interview.position}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <div className="text-sm text-slate-600">{interview.interviewer}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <div className="text-sm text-slate-600">
                            {formatDate(interview.interviewDate)}
                          </div>
                        </div>
                        {interview.interviewTime && interview.interviewTime !== 'N/A' && (
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <div className="text-xs text-slate-500">{interview.interviewTime}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {interview.meetingLink && interview.meetingLink !== 'N/A' ? (
                          <a
                            href={interview.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            <Video className="w-4 h-4" />
                            Join Meeting
                          </a>
                        ) : (
                          <span className="text-sm text-slate-400">No link</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          interview.status === 'Interview Scheduled' ? 'bg-blue-100 text-blue-700' :
                          interview.status === 'Hired' ? 'bg-green-100 text-green-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {interview.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInterviewStatusColor(interview.interviewStatus)}`}>
                          {interview.interviewStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleEditInterview(interview)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit Interview"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {!loading && interviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {interviews.filter(i => i.interviewStatus === 'Scheduled').length}
                </div>
                <div className="text-sm text-blue-700">Scheduled</div>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-900">
                  {interviews.filter(i => i.interviewStatus === 'Upcoming').length}
                </div>
                <div className="text-sm text-yellow-700">Upcoming (Next 24h)</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-900">
                  {interviews.filter(i => i.interviewStatus === 'Completed').length}
                </div>
                <div className="text-sm text-green-700">Completed</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Interview Dialog */}
      {editingInterview && (
        <ScheduleInterviewDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSchedule={handleUpdateInterview}
          candidateName={editingInterview.candidateName}
          initialData={{
            interviewer: editingInterview.interviewer || '',
            date: editingInterview.formattedDate || (editingInterview.interviewDate ? new Date(editingInterview.interviewDate).toISOString().split('T')[0] : ''),
            time: editingInterview.interviewTime || '',
            meetingLink: editingInterview.meetingLink || ''
          }}
        />
      )}
    </div>
  );
}

