'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCompany } from '@/lib/context/CompanyContext';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText,
  Search,
  Eye,
  Edit,
  Sparkles,
  Trash2
} from 'lucide-react';
import AddCandidateDialog from '../components/AddCandidateDialog';

export default function OnboardingPage() {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [stageFilter, setStageFilter] = useState('All Stages');
  const [recruiterFilter, setRecruiterFilter] = useState('All Recruiters');
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [kpiCards, setKpiCards] = useState([]);
  const [hrList, setHrList] = useState(['All Recruiters']);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [deletingCandidate, setDeletingCandidate] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewingCandidate, setViewingCandidate] = useState(null);

  // Fetch onboarding candidates data
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
        if (stageFilter && stageFilter !== 'All Stages') {
          params.append('stage', stageFilter);
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

        const res = await fetch(`/api/hrms-portal/recruitment/onboarding?${params.toString()}`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const data = json.data;
            setCandidates(data.candidates || []);
            
            // Set KPI Cards
            if (data.kpis) {
              setKpiCards([
                { 
                  title: 'TOTAL ONBOARDINGS', 
                  value: String(data.kpis.totalOnboardings || 0), 
                  icon: Users, 
                  gradient: 'from-blue-600 via-indigo-600 to-blue-700'
                },
                { 
                  title: 'PENDING OFFERS', 
                  value: String(data.kpis.pendingOffers || 0), 
                  icon: Clock, 
                  gradient: 'from-orange-500 via-amber-500 to-orange-600'
                },
                { 
                  title: 'OFFERS ACCEPTED', 
                  value: String(data.kpis.offersAccepted || 0), 
                  icon: CheckCircle2, 
                  gradient: 'from-green-600 via-green-500 to-green-700'
                },
                { 
                  title: 'OFFERS DECLINED', 
                  value: String(data.kpis.offersDeclined || 0), 
                  icon: XCircle, 
                  gradient: 'from-red-600 via-red-500 to-red-700'
                },
                { 
                  title: 'COMPLETED ONBOARDINGS', 
                  value: String(data.kpis.completedOnboardings || 0), 
                  icon: FileText, 
                  gradient: 'from-teal-700 via-teal-600 to-teal-800'
                },
              ]);
            }
            
            setHrList(data.hrList || ['All Recruiters']);
          }
        }
      } catch (err) {
        console.error('Fetch onboarding candidates error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [companyId, currentCompany, statusFilter, stageFilter, recruiterFilter, searchQuery, refreshTrigger]);

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

  const handleOfferStatusChange = async (candidateId, newStatus) => {
    try {
      if (!candidateId) {
        alert('Candidate ID is missing');
        return;
      }

      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(String(candidateId));
      if (!isValidObjectId && !isNaN(candidateId)) {
        alert('Cannot update status: Candidate data is not properly saved. Please refresh the page and try again.');
        return;
      }

      const company = getCompanyName();
      if (!company) {
        alert('Company information is missing. Please refresh the page.');
        return;
      }

      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      // For HRMS Admin Portal - don't send company header to allow all data access
      // headers['x-company'] = company;

      const res = await fetch(`/api/hrms-portal/recruitment/candidates/${candidateId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ offerStatus: newStatus }),
      });

      const responseText = await res.text();
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        alert('Failed to update offer status: Invalid response from server');
        return;
      }

      if (res.ok) {
        if (json.success) {
          setRefreshTrigger(prev => prev + 1);
        } else {
          alert('Failed to update offer status: ' + (json.error || 'Unknown error'));
        }
      } else {
        alert('Failed to update offer status: ' + (json.error || `Server error (${res.status})`));
      }
    } catch (error) {
      console.error('Update offer status error:', error);
      alert('Failed to update offer status: ' + (error.message || 'Network error'));
    }
  };

  const handleOnboardingStageChange = async (candidateId, newStage) => {
    try {
      if (!candidateId) {
        alert('Candidate ID is missing');
        return;
      }

      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(String(candidateId));
      if (!isValidObjectId && !isNaN(candidateId)) {
        alert('Cannot update stage: Candidate data is not properly saved. Please refresh the page and try again.');
        return;
      }

      const company = getCompanyName();
      if (!company) {
        alert('Company information is missing. Please refresh the page.');
        return;
      }

      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      // For HRMS Admin Portal - don't send company header to allow all data access
      // headers['x-company'] = company;

      // Calculate progress based on stage
      const progressMap = {
        'Offer': 0,
        'Form': 15,
        'Verification': 65,
        'Policy': 15,
        'Asset': 100
      };
      const progress = progressMap[newStage] || 0;

      const res = await fetch(`/api/hrms-portal/recruitment/candidates/${candidateId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ 
          onboardingStage: newStage,
          progress: progress
        }),
      });

      const responseText = await res.text();
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        alert('Failed to update onboarding stage: Invalid response from server');
        return;
      }

      if (res.ok) {
        if (json.success) {
          setRefreshTrigger(prev => prev + 1);
        } else {
          alert('Failed to update onboarding stage: ' + (json.error || 'Unknown error'));
        }
      } else {
        alert('Failed to update onboarding stage: ' + (json.error || `Server error (${res.status})`));
      }
    } catch (error) {
      console.error('Update onboarding stage error:', error);
      alert('Failed to update onboarding stage: ' + (error.message || 'Network error'));
    }
  };

  const handleJoiningDateChange = async (candidateId, newDate) => {
    try {
      if (!candidateId) {
        alert('Candidate ID is missing');
        return;
      }

      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(String(candidateId));
      if (!isValidObjectId && !isNaN(candidateId)) {
        alert('Cannot update joining date: Candidate data is not properly saved. Please refresh the page and try again.');
        return;
      }

      const company = getCompanyName();
      if (!company) {
        alert('Company information is missing. Please refresh the page.');
        return;
      }

      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      // For HRMS Admin Portal - don't send company header to allow all data access
      // headers['x-company'] = company;

      const res = await fetch(`/api/hrms-portal/recruitment/candidates/${candidateId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ joiningDate: newDate }),
      });

      const responseText = await res.text();
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        alert('Failed to update joining date: Invalid response from server');
        return;
      }

      if (res.ok) {
        if (json.success) {
          setRefreshTrigger(prev => prev + 1);
        } else {
          alert('Failed to update joining date: ' + (json.error || 'Unknown error'));
        }
      } else {
        alert('Failed to update joining date: ' + (json.error || `Server error (${res.status})`));
      }
    } catch (error) {
      console.error('Update joining date error:', error);
      alert('Failed to update joining date: ' + (error.message || 'Network error'));
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

      const { id, ...dataWithoutId } = candidateData;
      const apiData = {
        ...dataWithoutId,
        company: company
      };

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
        } else {
          console.error('Failed to delete candidate:', json.error || 'Unknown error');
          setDeletingCandidate(null);
        }
      } else {
        const errorText = await res.text();
        console.error('Failed to delete candidate:', errorText);
        setDeletingCandidate(null);
      }
    } catch (error) {
      console.error('Delete candidate error:', error);
      setDeletingCandidate(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-600">Loading onboarding candidates...</div>
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
                placeholder="Search by name, email, contact, or position..."
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
              <option>Accepted</option>
              <option>Sent</option>
              <option>Pending</option>
              <option>Declined</option>
            </select>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All Stages</option>
              <option>Offer</option>
              <option>Form</option>
              <option>Verification</option>
              <option>Policy</option>
              <option>Asset</option>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Position</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Recruiter / Assigned HR</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Offer Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Joining Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Onboarding Stage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Progress</th>
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
                    <div className="text-sm text-slate-600">{candidate.position}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{candidate.recruiter}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <select
                      value={candidate.offerStatus}
                      onChange={(e) => handleOfferStatusChange(candidate.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${candidate.offerStatusColor} focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                    >
                      <option value="Sent">Sent</option>
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Declined">Declined</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="date"
                      value={(() => {
                        if (!candidate.joiningDate || candidate.joiningDate === 'N/A') return '';
                        try {
                          // Try to parse the date string (could be formatted like "Jan 15, 2024" or ISO string)
                          const date = new Date(candidate.joiningDate);
                          if (isNaN(date.getTime())) return '';
                          return date.toISOString().split('T')[0];
                        } catch (e) {
                          return '';
                        }
                      })()}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleJoiningDateChange(candidate.id, e.target.value);
                        }
                      }}
                      className="text-sm text-slate-600 border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Set joining date"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <select
                      value={candidate.onboardingStage}
                      onChange={(e) => handleOnboardingStageChange(candidate.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${candidate.onboardingStageColor} focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                    >
                      <option value="Offer">Offer</option>
                      <option value="Form">Form</option>
                      <option value="Verification">Verification</option>
                      <option value="Policy">Policy</option>
                      <option value="Asset">Asset</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            candidate.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${candidate.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600 font-medium">{candidate.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setViewingCandidate(candidate)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                        title="View Candidate Details"
                      >
                        <Eye className="w-4 h-4" />
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

      {/* View Candidate Details Dialog */}
      {viewingCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setViewingCandidate(null)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Candidate Details</h3>
              <button
                onClick={() => setViewingCandidate(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Name</label>
                <p className="text-sm text-slate-900 mt-1">{viewingCandidate.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <p className="text-sm text-slate-900 mt-1">{viewingCandidate.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Contact</label>
                <p className="text-sm text-slate-900 mt-1">{viewingCandidate.contact}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Position</label>
                <p className="text-sm text-slate-900 mt-1">{viewingCandidate.position}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Recruiter</label>
                <p className="text-sm text-slate-900 mt-1">{viewingCandidate.recruiter}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Offer Status</label>
                <p className="text-sm text-slate-900 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${viewingCandidate.offerStatusColor}`}>
                    {viewingCandidate.offerStatus}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Joining Date</label>
                <p className="text-sm text-slate-900 mt-1">{viewingCandidate.joiningDate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Onboarding Stage</label>
                <p className="text-sm text-slate-900 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${viewingCandidate.onboardingStageColor}`}>
                    {viewingCandidate.onboardingStage}
                  </span>
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-700">Progress</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        viewingCandidate.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${viewingCandidate.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-600 font-medium">{viewingCandidate.progress}%</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingCandidate(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
