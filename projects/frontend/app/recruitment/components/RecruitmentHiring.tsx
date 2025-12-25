'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useCandidates } from '../context/CandidateContext';
import { format } from 'date-fns';

export default function RecruitmentHiring() {
  const { hiringCandidates, updateHiringStatus } = useCandidates();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [recruiterFilter, setRecruiterFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const itemsPerPage = 10;

  // Calculate KPIs
  const kpis = useMemo(() => {
    return {
      totalCandidates: hiringCandidates.length,
      hired: hiringCandidates.filter(c => c.hiringStatus === 'Hired').length,
      rejected: hiringCandidates.filter(c => c.hiringStatus === 'Rejected').length,
      awaiting: hiringCandidates.filter(c => c.hiringStatus === 'Awaiting').length,
    };
  }, [hiringCandidates]);

  // Filter and sort candidates
  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = hiringCandidates.filter(candidate => {
      const matchesSearch = 
        candidate.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.contactNumber.includes(searchTerm) ||
        candidate.currentOrganisation.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || candidate.hiringStatus === statusFilter;
      const matchesRecruiter = recruiterFilter === 'all' || candidate.assignedTo === recruiterFilter;

      return matchesSearch && matchesStatus && matchesRecruiter;
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
  }, [hiringCandidates, searchTerm, statusFilter, recruiterFilter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredAndSortedCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleStatusChange = (candidateId: string, newStatus: 'Hired' | 'Rejected' | 'Awaiting') => {
    updateHiringStatus(candidateId, newStatus);
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'Hired':
        return 'bg-green-500';
      case 'Rejected':
        return 'bg-red-500';
      case 'Awaiting':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const recruiterOptions = ['Sarah Johnson', 'Mike Wilson', 'David Lee'];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Candidates',
            value: kpis.totalCandidates,
            icon: Users,
            gradient: 'from-blue-600 via-indigo-600 to-blue-700',
            shadow: 'shadow-blue-500/30',
          },
          {
            title: 'Hired',
            value: kpis.hired,
            icon: CheckCircle,
            gradient: 'from-emerald-600 via-teal-600 to-emerald-700',
            shadow: 'shadow-emerald-500/30',
          },
          {
            title: 'Rejected',
            value: kpis.rejected,
            icon: XCircle,
            gradient: 'from-red-600 via-rose-600 to-red-700',
            shadow: 'shadow-red-500/30',
          },
          {
            title: 'Awaiting',
            value: kpis.awaiting,
            icon: Clock,
            gradient: 'from-yellow-600 via-amber-600 to-yellow-700',
            shadow: 'shadow-yellow-500/30',
          },
        ].map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${kpi.gradient} ${kpi.shadow} shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
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
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, contact, or organisation..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Hired">Hired</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Awaiting">Awaiting</SelectItem>
              </SelectContent>
            </Select>
            <Select value={recruiterFilter} onValueChange={(value) => {
              setRecruiterFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Recruiter" />
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
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('candidateName')}
                  >
                    Candidate Name
                    {sortConfig?.key === 'candidateName' && (
                      <span className="ml-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('email')}
                  >
                    Email
                    {sortConfig?.key === 'email' && (
                      <span className="ml-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('contactNumber')}
                  >
                    Contact
                    {sortConfig?.key === 'contactNumber' && (
                      <span className="ml-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('currentOrganisation')}
                  >
                    Current Organisation
                    {sortConfig?.key === 'currentOrganisation' && (
                      <span className="ml-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('assignedTo')}
                  >
                    Assigned To
                    {sortConfig?.key === 'assignedTo' && (
                      <span className="ml-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead>Interview Status</TableHead>
                  <TableHead>Hiring Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No candidates found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCandidates.map((candidate) => (
                    <>
                      <TableRow 
                        key={candidate.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleRowExpansion(candidate.id)}
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
                        <TableCell>{candidate.contactNumber}</TableCell>
                        <TableCell>{candidate.currentOrganisation}</TableCell>
                        <TableCell>{candidate.assignedTo}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">Finalized</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(candidate.hiringStatus)}>
                            {candidate.hiringStatus || 'Awaiting'}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant={candidate.hiringStatus === 'Hired' ? 'default' : 'outline'}
                                onClick={() => handleStatusChange(candidate.id, 'Hired')}
                                className={candidate.hiringStatus === 'Hired' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                              >
                                Hired
                              </Button>
                              <Button
                                size="sm"
                                variant={candidate.hiringStatus === 'Rejected' ? 'default' : 'outline'}
                                onClick={() => handleStatusChange(candidate.id, 'Rejected')}
                                className={candidate.hiringStatus === 'Rejected' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                              >
                                Rejected
                              </Button>
                              <Button
                                size="sm"
                                variant={candidate.hiringStatus === 'Awaiting' ? 'default' : 'outline'}
                                onClick={() => handleStatusChange(candidate.id, 'Awaiting')}
                                className={candidate.hiringStatus === 'Awaiting' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : ''}
                              >
                                Awaiting
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(candidate.id) && (
                        <TableRow>
                          <TableCell colSpan={9} className="bg-muted/30">
                            <div className="p-4 space-y-3">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm font-semibold text-muted-foreground">Education</p>
                                  <p className="text-sm">{candidate.education}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-muted-foreground">Total Experience</p>
                                  <p className="text-sm">{candidate.totalExperience}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-muted-foreground">Calling Date</p>
                                  <p className="text-sm">{candidate.callingDate ? format(new Date(candidate.callingDate), 'MMM dd, yyyy') : 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-muted-foreground">Current CTC (Fixed)</p>
                                  <p className="text-sm">₹{candidate.currentCTCFixed?.toLocaleString() || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-muted-foreground">Expected CTC</p>
                                  <p className="text-sm">₹{candidate.expectedCTC?.toLocaleString() || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-muted-foreground">Notice Period</p>
                                  <p className="text-sm">{candidate.noticePeriod || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-muted-foreground">Communication Skills</p>
                                  <p className="text-sm">{candidate.communicationSkills || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-muted-foreground">Current Location</p>
                                  <p className="text-sm">{candidate.currentLocation || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-muted-foreground">Willing to Work in Startup</p>
                                  <p className="text-sm">{candidate.willingToWorkInStartup || 'N/A'}</p>
                                </div>
                              </div>
                              <div className="mt-4 space-y-2">
                                <div>
                                  <p className="text-sm font-semibold text-muted-foreground">Recruiter Feedback</p>
                                  <p className="text-sm">{candidate.recruiterFeedback || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-muted-foreground">Interviewer Feedback</p>
                                  <p className="text-sm">{candidate.interviewerFeedback || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-muted-foreground">Remark</p>
                                  <p className="text-sm">{candidate.remark || 'N/A'}</p>
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
            <div className="flex items-center justify-between border-t px-4 py-3">
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

