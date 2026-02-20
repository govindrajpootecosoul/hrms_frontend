'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCompany } from '@/lib/context/CompanyContext';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Search,
  Sparkles,
  Edit,
  Trash2
} from 'lucide-react';
import AddCandidateDialog from '../components/AddCandidateDialog';

export default function RecruitmentHiringPage() {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [recruiterFilter, setRecruiterFilter] = useState('All Recruiters');
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [kpiCards, setKpiCards] = useState([]);
  const [hrList, setHrList] = useState(['All Recruiters']);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [deletingCandidate, setDeletingCandidate] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch hiring candidates data
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
        if (statusFilter && statusFilter !== 'All Status') {
          params.append('status', statusFilter);
        }
        if (recruiterFilter && recruiterFilter !== 'All Recruiters') {
          params.append('recruiter', recruiterFilter);
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }

        const headers = {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
        // For HRMS Admin Portal - don't send company header to get all data

        const res = await fetch(`/api/hrms-portal/recruitment/hiring?${params.toString()}`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const data = json.data;
            setCandidates(data.candidates || []);
            
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
                  title: 'HIRED', 
                  value: String(data.kpis.hired || 0), 
                  icon: CheckCircle2, 
                  gradient: 'from-green-600 via-green-500 to-green-700'
                },
                { 
                  title: 'REJECTED', 
                  value: String(data.kpis.rejected || 0), 
                  icon: XCircle, 
                  gradient: 'from-red-600 via-red-500 to-red-700'
                },
                { 
                  title: 'AWAITING', 
                  value: String(data.kpis.awaiting || 0), 
                  icon: Clock, 
                  gradient: 'from-orange-500 via-orange-400 to-orange-600'
                },
              ]);
            }
            
            setHrList(data.hrList || ['All Recruiters']);
          }
        }
      } catch (err) {
        console.error('Fetch hiring candidates error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [companyId, currentCompany, statusFilter, recruiterFilter, searchQuery, refreshTrigger]);

  // Reset to page 1 when filters change
  useEffect(() => {
    // Reset any pagination if needed
  }, [statusFilter, recruiterFilter, searchQuery]);

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

  const handleHiringAction = async (candidateId, action) => {
    try {
      if (!candidateId) {
        alert('Candidate ID is missing');
        return;
      }

      // Check if candidateId is a valid MongoDB ObjectId
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(String(candidateId));
      if (!isValidObjectId && !isNaN(candidateId)) {
        alert('Cannot update status: Candidate data is not properly saved. Please refresh the page and try again.');
        return;
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

      // Map action to status
      let hiringStatus = '';
      let status = '';
      if (action === 'hired') {
        hiringStatus = 'Hired';
        status = 'Hired';
      } else if (action === 'rejected') {
        hiringStatus = 'Rejected';
        status = 'Finalized'; // Keep status as Finalized so candidate stays in Recruitment & Hiring tab
      } else if (action === 'awaiting') {
        hiringStatus = 'Awaiting';
        status = 'Finalized'; // Keep as Finalized but with Awaiting hiring status
      }

      console.log('Updating hiring status:', { candidateId, action, hiringStatus, status, company });

      const res = await fetch(`/api/hrms-portal/recruitment/candidates/${candidateId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ 
          hiringStatus: hiringStatus,
          status: status
        }),
      });

      const responseText = await res.text();
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        alert('Failed to update hiring status: Invalid response from server');
        return;
      }

      if (res.ok) {
        if (json.success) {
          setRefreshTrigger(prev => prev + 1);
        } else {
          alert('Failed to update hiring status: ' + (json.error || 'Unknown error'));
        }
      } else {
        alert('Failed to update hiring status: ' + (json.error || `Server error (${res.status})`));
      }
    } catch (error) {
      console.error('Update hiring status error:', error);
      alert('Failed to update hiring status: ' + (error.message || 'Network error'));
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
      if (company) {
        // For HRMS Admin Portal - don't send company header to allow all data access
        // headers['x-company'] = company;
      }

      // Prepare candidate data for API (remove id field as MongoDB uses _id)
      const { id, ...dataWithoutId } = candidateData;
      const apiData = {
        ...dataWithoutId,
        company: company
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
      if (company) {
        // For HRMS Admin Portal - don't send company header to allow all data access
        // headers['x-company'] = company;
      }

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                placeholder="Q Search by name, email, contact, or organisation..."
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
              <option>Finalized</option>
              <option>Pending</option>
              <option>In Progress</option>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider w-8"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Candidate Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Current Organisation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Interview Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Hiring Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{candidate.name}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{candidate.email}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{candidate.contact}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{candidate.organisation}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{candidate.assignedTo}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${candidate.interviewStatusColor}`}>
                      {candidate.interviewStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${candidate.hiringStatusColor}`}>
                      {candidate.hiringStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleHiringAction(candidate.id, 'hired')}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            candidate.hiringStatus === 'Hired' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Hired
                        </button>
                        <button 
                          onClick={() => handleHiringAction(candidate.id, 'rejected')}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            candidate.hiringStatus === 'Rejected' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Rejected
                        </button>
                        <button 
                          onClick={() => handleHiringAction(candidate.id, 'awaiting')}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            candidate.hiringStatus === 'Awaiting' 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Awaiting
                        </button>
                      </div>
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
        onSave={editingCandidate ? handleUpdateCandidate : () => {}}
        existingCandidates={candidates}
        candidateToEdit={editingCandidate}
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
