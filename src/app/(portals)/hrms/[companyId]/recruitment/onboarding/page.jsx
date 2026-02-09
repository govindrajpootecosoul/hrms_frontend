'use client';

import { useState } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText,
  Search,
  Eye,
  Edit,
  Sparkles
} from 'lucide-react';

export default function OnboardingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [stageFilter, setStageFilter] = useState('All Stages');
  const [recruiterFilter, setRecruiterFilter] = useState('All Recruiters');

  // KPI Cards
  const kpiCards = [
    { 
      title: 'TOTAL ONBOARDINGS', 
      value: '5', 
      icon: Users, 
      gradient: 'from-blue-600 via-indigo-600 to-blue-700'
    },
    { 
      title: 'PENDING OFFERS', 
      value: '1', 
      icon: Clock, 
      gradient: 'from-orange-500 via-amber-500 to-orange-600'
    },
    { 
      title: 'OFFERS ACCEPTED', 
      value: '4', 
      icon: CheckCircle2, 
      gradient: 'from-green-600 via-green-500 to-green-700'
    },
    { 
      title: 'OFFERS DECLINED', 
      value: '0', 
      icon: XCircle, 
      gradient: 'from-red-600 via-red-500 to-red-700'
    },
    { 
      title: 'COMPLETED ONBOARDINGS', 
      value: '0', 
      icon: FileText, 
      gradient: 'from-teal-700 via-teal-600 to-teal-800'
    },
  ];

  // Candidate Data
  const candidates = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      contact: '+91 9876543210',
      position: 'Senior Software Engineer',
      recruiter: 'Sarah Johnson',
      offerStatus: 'Accepted',
      offerStatusColor: 'bg-green-100 text-green-700',
      joiningDate: 'Feb 15, 2025',
      onboardingStage: 'Form',
      onboardingStageColor: 'bg-yellow-100 text-yellow-700',
      progress: 15
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      contact: '+91 9876543211',
      position: 'Product Manager',
      recruiter: 'Mike Wilson',
      offerStatus: 'Sent',
      offerStatusColor: 'bg-blue-100 text-blue-700',
      joiningDate: 'Feb 20, 2025',
      onboardingStage: 'Offer',
      onboardingStageColor: 'bg-blue-100 text-blue-700',
      progress: 0
    },
    {
      id: 3,
      name: 'Robert Brown',
      email: 'robert.brown@example.com',
      contact: '+91 9876543212',
      position: 'Full Stack Developer',
      recruiter: 'Sarah Johnson',
      offerStatus: 'Accepted',
      offerStatusColor: 'bg-green-100 text-green-700',
      joiningDate: 'Feb 10, 2025',
      onboardingStage: 'Verification',
      onboardingStageColor: 'bg-orange-100 text-orange-700',
      progress: 65
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      contact: '+91 9876543213',
      position: 'Junior Developer',
      recruiter: 'Mike Wilson',
      offerStatus: 'Accepted',
      offerStatusColor: 'bg-green-100 text-green-700',
      joiningDate: 'Feb 25, 2025',
      onboardingStage: 'Policy',
      onboardingStageColor: 'bg-purple-100 text-purple-700',
      progress: 15
    },
    {
      id: 5,
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      contact: '+91 9876543214',
      position: 'Cloud Engineer',
      recruiter: 'Sarah Johnson',
      offerStatus: 'Accepted',
      offerStatusColor: 'bg-green-100 text-green-700',
      joiningDate: 'Mar 15, 2025',
      onboardingStage: 'Asset',
      onboardingStageColor: 'bg-blue-100 text-blue-700',
      progress: 100
    },
  ];

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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${candidate.offerStatusColor}`}>
                      {candidate.offerStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{candidate.joiningDate}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${candidate.onboardingStageColor}`}>
                      {candidate.onboardingStage}
                    </span>
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
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit className="w-4 h-4" />
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
