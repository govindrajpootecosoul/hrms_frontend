'use client';

import { useState } from 'react';
import {
  FileText,
  Download,
  Mail,
  Settings,
  Users,
  Calendar,
  FileCheck,
  TrendingUp,
  UserCheck,
  Building2,
  Shield,
  Clock,
  ClipboardList,
  Briefcase,
  FileSpreadsheet,
  Wallet,
  PiggyBank,
  Sparkles
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';

const reportTypes = [
  {
    id: 'birthday',
    name: 'Birthday Report',
    description: 'List of employees with upcoming birthdays',
    icon: Calendar,
    gradient: 'from-pink-600 via-rose-600 to-pink-700',
    shadow: 'shadow-pink-500/30',
  },
  {
    id: 'contact',
    name: 'Contact Directory',
    description: 'Employee contact information directory',
    icon: Users,
    gradient: 'from-blue-600 via-indigo-600 to-blue-700',
    shadow: 'shadow-blue-500/30',
  },
  {
    id: 'id-card',
    name: 'ID Card Directory',
    description: 'Employee ID card information',
    icon: UserCheck,
    gradient: 'from-purple-600 via-violet-600 to-purple-700',
    shadow: 'shadow-purple-500/30',
  },
  {
    id: 'department',
    name: 'Department Report',
    description: 'Department-wise employee distribution',
    icon: Building2,
    gradient: 'from-emerald-600 via-teal-600 to-emerald-700',
    shadow: 'shadow-emerald-500/30',
  },
  {
    id: 'insurance',
    name: 'Insurance Report',
    description: 'Employee insurance and health benefits',
    icon: Shield,
    gradient: 'from-cyan-600 via-blue-600 to-cyan-700',
    shadow: 'shadow-cyan-500/30',
  },
  {
    id: 'all-employee',
    name: 'All Employee Data Report',
    description: 'Complete employee master data',
    icon: FileText,
    gradient: 'from-orange-600 via-amber-600 to-orange-700',
    shadow: 'shadow-orange-500/30',
  },
  {
    id: 'attendance',
    name: 'Attendance Report',
    description: 'Daily and monthly attendance records',
    icon: Clock,
    gradient: 'from-yellow-600 via-amber-600 to-yellow-700',
    shadow: 'shadow-yellow-500/30',
  },
  {
    id: 'tenure',
    name: 'Tenure Report',
    description: 'Employee tenure and service period',
    icon: TrendingUp,
    gradient: 'from-green-600 via-emerald-600 to-green-700',
    shadow: 'shadow-green-500/30',
  },
  {
    id: 'candidate-interview',
    name: 'Candidate Interview Report',
    description: 'Interview and recruitment statistics',
    icon: Briefcase,
    gradient: 'from-indigo-600 via-purple-600 to-indigo-700',
    shadow: 'shadow-indigo-500/30',
  },
  {
    id: 'office-policy',
    name: 'Office Policy Report',
    description: 'Company policies and acknowledgments',
    icon: ClipboardList,
    gradient: 'from-red-600 via-rose-600 to-red-700',
    shadow: 'shadow-red-500/30',
  },
  {
    id: 'new-joining',
    name: 'New Joining Form Report',
    description: 'New employee joining forms and data',
    icon: FileCheck,
    gradient: 'from-teal-600 via-cyan-600 to-teal-700',
    shadow: 'shadow-teal-500/30',
  },
];

// Mock KPI data
const expenseReportTypes = [
  {
    id: 'expense-category',
    name: 'Category-wise Expense Report',
    description: 'Breakdown of expenses by categories',
    icon: FileText,
    gradient: 'from-blue-600 via-cyan-600 to-blue-700',
    shadow: 'shadow-blue-500/30',
  },
  {
    id: 'expense-employee',
    name: 'Employee-wise Expense Report',
    description: 'Expenses claimed per employee',
    icon: Users,
    gradient: 'from-emerald-600 via-teal-600 to-green-700',
    shadow: 'shadow-emerald-500/30',
  },
  {
    id: 'expense-department',
    name: 'Department-wise Monthly Spend',
    description: 'Monthly spend by department',
    icon: Building2,
    gradient: 'from-purple-600 via-indigo-600 to-purple-700',
    shadow: 'shadow-purple-500/30',
  },
  {
    id: 'advance-outstanding',
    name: 'Advance Outstanding Report',
    description: 'Track balances pending settlement',
    icon: FileCheck,
    gradient: 'from-amber-600 via-orange-600 to-amber-700',
    shadow: 'shadow-amber-500/30',
  },
  {
    id: 'turnaround-time',
    name: 'Reimbursement Turnaround Time',
    description: 'Average processing duration',
    icon: Clock,
    gradient: 'from-cyan-600 via-blue-600 to-cyan-700',
    shadow: 'shadow-cyan-500/30',
  },
  {
    id: 'policy-violation',
    name: 'Policy Violation Report',
    description: 'Flagged expenses summary',
    icon: Shield,
    gradient: 'from-rose-600 via-pink-600 to-rose-700',
    shadow: 'shadow-rose-500/30',
  },
  {
    id: 'expense-budget-log',
    name: 'Expense Budget Log',
    description: 'Actual vs planned spending for each cost center',
    icon: Wallet,
    gradient: 'from-slate-600 via-slate-500 to-slate-700',
    shadow: 'shadow-slate-500/30',
  },
  {
    id: 'advance-budget-log',
    name: 'Advance Budget Log',
    description: 'Budget tracking for advances and settlements',
    icon: PiggyBank,
    gradient: 'from-fuchsia-600 via-purple-600 to-fuchsia-700',
    shadow: 'shadow-fuchsia-500/30',
  },
];

const mockKPIs = {
  totalReportsGenerated: 247,
  reportsDownloadedToday: 18,
  activeReportTypes: 11,
  scheduledReports: 5,
};

const allReportDefinitions = [...reportTypes, ...expenseReportTypes];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    dateRange: 'last-month',
    startDate: '',
    endDate: '',
    department: 'all',
    status: 'all',
    format: 'pdf',
  });

  const handleDownload = (reportId, format) => {
    const report = allReportDefinitions.find(r => r.id === reportId);
    alert(`Downloading ${report?.name} as ${format.toUpperCase()}...\n(Simulated download)`);
  };

  const handleSend = (reportId, format) => {
    const report = allReportDefinitions.find(r => r.id === reportId);
    alert(`${report?.name} (${format.toUpperCase()}) sent via email!\n(Simulated email)`);
  };

  const handleZipDownload = (reportName) => {
    alert(`Packaging ${reportName} receipts as ZIP...\n(Simulated download)`);
  };

  const handleConfigure = (reportId) => {
    setSelectedReport(reportId);
    setIsConfigModalOpen(true);
  };

  const handleGenerateReport = () => {
    const report = allReportDefinitions.find(r => r.id === selectedReport);
    alert(`Generating ${report?.name} with configured settings...\n\nDate Range: ${reportConfig.dateRange}\nDepartment: ${reportConfig.department}\nStatus: ${reportConfig.status}\nFormat: ${reportConfig.format.toUpperCase()}`);
    setIsConfigModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Reports Generated',
            value: mockKPIs.totalReportsGenerated,
            icon: FileText,
            gradient: 'from-blue-600 via-indigo-600 to-blue-700',
            shadow: 'shadow-blue-500/30',
          },
          {
            title: 'Reports Downloaded Today',
            value: mockKPIs.reportsDownloadedToday,
            icon: Download,
            gradient: 'from-green-600 via-emerald-600 to-green-700',
            shadow: 'shadow-green-500/30',
          },
          {
            title: 'Active Report Types',
            value: mockKPIs.activeReportTypes,
            icon: FileCheck,
            gradient: 'from-purple-600 via-violet-600 to-purple-700',
            shadow: 'shadow-purple-500/30',
          },
          {
            title: 'Scheduled Reports',
            value: mockKPIs.scheduledReports,
            icon: Calendar,
            gradient: 'from-orange-600 via-amber-600 to-orange-700',
            shadow: 'shadow-orange-500/30',
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

      {/* Standard Reports Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Standard Reports</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Generate comprehensive reports for employee data, attendance, and organizational insights.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <Card
                key={report.id}
                className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer border-2 hover:border-opacity-50 p-0 overflow-hidden"
              >
                <div className={`p-6 transition-all duration-300 rounded-lg group-hover:bg-gradient-to-br ${report.gradient} group-hover:bg-opacity-90`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${report.gradient} ${report.shadow} shadow-lg group-hover:bg-white/20 group-hover:backdrop-blur-sm`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-white transition-colors">{report.name}</h3>
                      <p className="text-sm text-muted-foreground group-hover:text-white/90 transition-colors">{report.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => handleDownload(report.id, 'pdf')}
                      className="flex-1 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30 bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(report.id, 'xlsx')}
                      className="flex-1 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30 bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Excel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSend(report.id, 'pdf')}
                      className="flex-1 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30 bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Send
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleConfigure(report.id)}
                      className="flex-1 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30 bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Expense & Reimbursement Reports Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Expense & Reimbursement Reports</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Export category-wise, employee-wise, and policy violation summaries.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenseReportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <Card
                key={report.id}
                className="border-2 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer hover:border-opacity-50 p-0 overflow-hidden"
              >
                <div className={`p-5 space-y-4 rounded-lg transition-all duration-300 group-hover:bg-gradient-to-br ${report.gradient} group-hover:bg-opacity-90`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${report.gradient} ${report.shadow} group-hover:bg-white/20 group-hover:backdrop-blur-sm`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg transition-colors group-hover:text-white">{report.name}</h3>
                      <p className="text-sm text-muted-foreground transition-colors group-hover:text-white/90">{report.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleDownload(report.id, 'pdf')}
                      className="flex-1 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30 bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(report.id, 'xlsx')}
                      className="flex-1 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30 bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleZipDownload(report.name)}
                      className="flex-1 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30 bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Receipts ZIP
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Configuration Modal */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setSelectedReport(null);
        }}
        title={selectedReport ? `Configure Report - ${allReportDefinitions.find(r => r.id === selectedReport)?.name}` : 'Configure Report'}
        size="md"
        footer={
          <>
            <Button
              onClick={() => {
                setIsConfigModalOpen(false);
                setSelectedReport(null);
              }}
              className="bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button onClick={handleGenerateReport} className="bg-blue-600 text-white hover:bg-blue-700">
              Generate Report
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date Range</label>
            <select
              value={reportConfig.dateRange}
              onChange={(e) => setReportConfig({ ...reportConfig, dateRange: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:ring-2 focus:border-primary-300 focus:ring-primary-200 transition-all duration-200"
            >
              <option value="today">Today</option>
              <option value="last-week">Last Week</option>
              <option value="last-month">Last Month</option>
              <option value="last-quarter">Last Quarter</option>
              <option value="last-year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {reportConfig.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <Input
                  type="date"
                  value={reportConfig.startDate}
                  onChange={(e) => setReportConfig({ ...reportConfig, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <Input
                  type="date"
                  value={reportConfig.endDate}
                  onChange={(e) => setReportConfig({ ...reportConfig, endDate: e.target.value })}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Department</label>
            <select
              value={reportConfig.department}
              onChange={(e) => setReportConfig({ ...reportConfig, department: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:ring-2 focus:border-primary-300 focus:ring-primary-200 transition-all duration-200"
            >
              <option value="all">All Departments</option>
              <option value="engineering">Engineering</option>
              <option value="sales">Sales</option>
              <option value="hr">Human Resources</option>
              <option value="finance">Finance</option>
              <option value="marketing">Marketing</option>
              <option value="operations">Operations</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={reportConfig.status}
              onChange={(e) => setReportConfig({ ...reportConfig, status: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:ring-2 focus:border-primary-300 focus:ring-primary-200 transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Export Format</label>
            <select
              value={reportConfig.format}
              onChange={(e) => setReportConfig({ ...reportConfig, format: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:ring-2 focus:border-primary-300 focus:ring-primary-200 transition-all duration-200"
            >
              <option value="pdf">PDF</option>
              <option value="xlsx">Excel (.xlsx)</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
