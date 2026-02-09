'use client';

import { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Search,
  Sparkles
} from 'lucide-react';

export default function RecruitmentHiringPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [recruiterFilter, setRecruiterFilter] = useState('All Recruiters');

  // KPI Cards
  const kpiCards = [
    { 
      title: 'TOTAL CANDIDATES', 
      value: '3', 
      icon: Users, 
      gradient: 'from-purple-600 via-purple-500 to-purple-700'
    },
    { 
      title: 'HIRED', 
      value: '0', 
      icon: CheckCircle2, 
      gradient: 'from-green-600 via-green-500 to-green-700'
    },
    { 
      title: 'REJECTED', 
      value: '1', 
      icon: XCircle, 
      gradient: 'from-red-600 via-red-500 to-red-700'
    },
    { 
      title: 'AWAITING', 
      value: '2', 
      icon: Clock, 
      gradient: 'from-orange-500 via-orange-400 to-orange-600'
    },
  ];

  // Candidate Data
  const candidates = [
    {
      id: 1,
      name: 'Alex Thompson',
      email: 'alex.thompson@example.com',
      contact: '+919876543215',
      organisation: 'DataTech Solutions',
      assignedTo: 'Sarah Johnson',
      interviewStatus: 'Finalized',
      interviewStatusColor: 'bg-green-100 text-green-700',
      hiringStatus: 'Awaiting',
      hiringStatusColor: 'bg-orange-100 text-orange-700',
      activeAction: 'awaiting'
    },
    {
      id: 2,
      name: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      contact: '+919876543216',
      organisation: 'WebDev Inc',
      assignedTo: 'Mike Wilson',
      interviewStatus: 'Finalized',
      interviewStatusColor: 'bg-green-100 text-green-700',
      hiringStatus: 'Awaiting',
      hiringStatusColor: 'bg-orange-100 text-orange-700',
      activeAction: 'awaiting'
    },
    {
      id: 3,
      name: 'David Kumar',
      email: 'david.kumar@example.com',
      contact: '+919876543217',
      organisation: 'FinTech Corp',
      assignedTo: 'David Lee',
      interviewStatus: 'Finalized',
      interviewStatusColor: 'bg-green-100 text-green-700',
      hiringStatus: 'Rejected',
      hiringStatusColor: 'bg-red-100 text-red-700',
      activeAction: 'rejected'
    },
  ];

  return (
    <div className="space-y-6 relative">
      {/* KPI Cards */}
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

      {/* Search and Filter Bar */}
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
              <option>All Recruiters</option>
              <option>Sarah Johnson</option>
              <option>Mike Wilson</option>
              <option>David Lee</option>
              <option>Emma Brown</option>
              <option>James Taylor</option>
              <option>Lisa Anderson</option>
            </select>
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
                    <div className="flex items-center gap-1">
                      <button 
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          candidate.activeAction === 'hired' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Hired
                      </button>
                      <button 
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          candidate.activeAction === 'rejected' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Rejected
                      </button>
                      <button 
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          candidate.activeAction === 'awaiting' 
                            ? 'bg-orange-100 text-orange-700' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Awaiting
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* HR Copilot Floating Button */}
      <button className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-slate-900 transition-colors flex items-center gap-2 z-50">
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">HR Copilot</span>
      </button>
    </div>
  );
}
