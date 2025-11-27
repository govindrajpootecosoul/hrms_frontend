'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Upload, Calendar, Users, UserCheck, UserX, Clock, ChevronRight, FileText, BarChart2 } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import StatisticsCards from '@/components/hrms/StatisticsCards';
import EmployeeForm from '@/components/hrms/EmployeeForm';
import Modal from '@/components/common/Modal';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import BarGraph from '@/components/charts/BarGraph';
import PieChart from '@/components/charts/PieChart';
import LineChart from '@/components/charts/LineChart';
import ListView from '@/components/layout/ListView';
import { 
  mockDepartmentDistribution, 
  mockAttendanceTrends,
  mockAttendanceDays,
  mockEmployeeStatus,
  mockGenderDistribution,
  mockHeadcountTrend,
  mockHeadcountMonths
} from '@/lib/utils/hrmsMockData';

const HRMSDashboard = () => {
  const params = useParams();
  const companyId = params.companyId;

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEditEmployee, setShowEditEmployee] = useState(false);

  // Mock data - replace with actual API calls
  const stats = {
    totalEmployees: 156,
    presentToday: 142,
    absentToday: 8,
    upcomingBirthday: 6
  };

  const statCards = [
    {
      key: 'total-employees',
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: <Users className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', // professional blue
      subtitle: 'Across all departments'
    },
    {
      key: 'present-today',
      title: 'Present Today',
      value: stats.presentToday,
      icon: <UserCheck className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #0f766e, #22c55e)', // teal to green
      badge: stats.totalEmployees > 0
        ? {
            variant: stats.presentToday / stats.totalEmployees >= 0.8 ? 'success' : 'warning',
            text: `${Math.round((stats.presentToday / stats.totalEmployees) * 100)}% attendance`
          }
        : null
    },
    {
      key: 'absent-today',
      title: 'Absent Today',
      value: stats.absentToday,
      icon: <UserX className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #b91c1c, #f97316)' // deep red to amber
    },
    {
      key: 'upcoming-birthday',
      title: 'Upcoming Birthday',
      value: stats.upcomingBirthday,
      icon: <Clock className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #7c3aed, #ec4899)' // purple to pink
    }
  ];

  const employees = [
    {
      id: '1',
      biometricId: 'EMP001',
      name: 'John Doe',
      email: 'john.doe@company.com',
      department: 'IT',
      phone: '+1 234 567 8900',
      status: 'active'
    },
    {
      id: '2',
      biometricId: 'EMP002',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      department: 'HR',
      phone: '+1 234 567 8901',
      status: 'active'
    },
    {
      id: '3',
      biometricId: 'EMP003',
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      department: 'Finance',
      phone: '+1 234 567 8902',
      status: 'on-leave'
    }
  ];

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setShowAddEmployee(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEditEmployee(true);
  };

  const handleViewEmployee = (employee) => {
    // Navigate to employee detail page
    console.log('View employee:', employee);
  };

  const handleDeleteEmployee = (employee) => {
    if (confirm(`Are you sure you want to delete ${employee.name}?`)) {
      console.log('Delete employee:', employee);
    }
  };

  const handleSubmitEmployee = (formData) => {
    console.log('Submit employee:', formData);
    setShowAddEmployee(false);
    setShowEditEmployee(false);
    setSelectedEmployee(null);
  };

  const handleExportEmployees = () => {
    console.log('Export employees');
  };

  const handleUploadAttendance = () => {
    console.log('Upload attendance');
  };

  const handleRunReports = () => {
    console.log('Run reports');
  };

  const handleBroadcastUpdate = () => {
    console.log('Broadcast update');
  };

  // Mock list data for ListView components
  const birthdayAndAnniversaryItems = [
    {
      id: '1',
      title: 'Tom Anderson',
      description: 'Engineering • 6 years',
      date: 'Jan 23',
      tag: { label: 'Anniversary', variant: 'info' }
    },
    {
      id: '2',
      title: 'Priya Sharma',
      description: 'Product • 3 years',
      date: 'Jan 24',
      tag: { label: 'Birthday', variant: 'warning' }
    },
    {
      id: '3',
      title: 'Mike Johnson',
      description: 'Finance • 2 years',
      date: 'Jan 25',
      tag: { label: 'Anniversary', variant: 'info' }
    },
    {
      id: '4',
      title: 'John Doe',
      description: 'Engineering • 5 years',
      date: 'Jan 26',
      tag: { label: 'Anniversary', variant: 'info' }
    }
  ];

  const upcomingLeavesAndFestivalsItems = [
    {
      id: '1',
      title: 'Republic Day',
      description: 'National Holiday',
      date: 'Jan 26',
      tag: { label: 'Festival', variant: 'info' }
    },
    {
      id: '2',
      title: 'Jane Smith',
      description: 'Sick Leave • Sales',
      date: 'Jan 22',
      tag: { label: 'Leave', variant: 'warning' }
    },
    {
      id: '3',
      title: 'Mike Johnson',
      description: 'Casual Leave • Finance',
      date: 'Jan 25',
      tag: { label: 'Leave', variant: 'warning' }
    },
    {
      id: '4',
      title: 'Makar Sankranti',
      description: 'Regional Holiday',
      date: 'Jan 14',
      tag: { label: 'Festival', variant: 'info' }
    },
    {
      id: '5',
      title: 'Sarah Williams',
      description: 'Earned Leave • Marketing',
      date: 'Jan 18',
      tag: { label: 'Leave', variant: 'warning' }
    }
  ];

  const peoplePulseItems = [
    {
      id: '1',
      title: 'Jane Smith joined Sales department as Sales Executive',
      date: 'Jan 15',
      tag: { label: 'New Hire', variant: 'info' }
    },
    {
      id: '2',
      title: "John Doe's leave request approved for 3 days",
      date: 'Jan 14',
      tag: { label: 'Leave Approved', variant: 'success' }
    },
    {
      id: '3',
      title: 'Sarah Johnson promoted to Senior Engineering Manager',
      date: 'Jan 13',
      tag: { label: 'Promotion', variant: 'info' }
    },
    {
      id: '4',
      title: 'Michael Chen joined Engineering team as Full Stack Developer',
      date: 'Jan 12',
      tag: { label: 'New Hire', variant: 'info' }
    },
    {
      id: '5',
      title: 'Robert Wilson transferred from Sales to Marketing',
      date: 'Jan 11',
      tag: { label: 'Department Change', variant: 'info' }
    },
    {
      id: '6',
      title: 'Emily Davis leave request approved for medical reasons',
      date: 'Jan 10',
      tag: { label: 'Leave Approved', variant: 'success' }
    }
  ];

  const talentPipelineItems = [
    {
      id: '1',
      title: 'Interview – Senior Software Engineer',
      description: 'Interview',
      date: 'Jan 20 • 10:00 AM',
      tag: { label: 'Interview' }
    },
    {
      id: '2',
      title: 'HR Training Session – New Policies',
      description: 'Training',
      date: 'Jan 22 • 2:00 PM',
      tag: { label: 'Training' }
    },
    {
      id: '3',
      title: 'Quarterly Review Meeting – Q4 2024',
      description: 'Meeting',
      date: 'Jan 18 • 11:00 AM',
      tag: { label: 'Meeting' }
    },
    {
      id: '4',
      title: 'Leadership Development Workshop',
      description: 'Workshop',
      date: 'Jan 25 • 9:00 AM',
      tag: { label: 'Workshop' }
    },
    {
      id: '5',
      title: 'Interview – Sales Executive Position',
      description: 'Interview',
      date: 'Jan 19 • 3:00 PM',
      tag: { label: 'Interview' }
    }
  ];

  return (
    <div className="min-h-screen space-y-8">
      {/* Top statistic cards */}
      <StatisticsCards cards={statCards} />

      {/* Quick Actions */}
      <Card className="mt-2">
        <h2 className="text-lg font-semibold text-neutral-900 mb-1">
          Quick Actions
        </h2>
        <p className="text-sm text-neutral-600 mb-4">
          Jump into frequent HR workflows
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Add Employee */}
          <div className="cursor-pointer rounded-xl border border-[#073346] text-black shadow-sm hover:shadow-md transition-all duration-300 p-5 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold mb-1">Add Employee</h3>
              <p className="text-sm text-black/80">Onboard a new team member</p>
            </div>
            <Button
              size="sm"
              className="bg-[#A28752] hover:bg-[#745E39] border-[#A28752] text-white"
              onClick={handleAddEmployee}
              icon={<Plus className="w-4 h-4" />}
            >
              Add
            </Button>
          </div>

          {/* Approve Leaves */}
          <div className="cursor-pointer rounded-xl border border-[#073346] text-black shadow-sm hover:shadow-md transition-all duration-300 p-5 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold mb-1">Approve Leaves</h3>
              <p className="text-sm text-black/80">Review pending leave requests</p>
            </div>
            <Button
              size="sm"
              className="bg-[#A28752] hover:bg-[#745E39] border-[#A28752] text-white"
              icon={<Calendar className="w-4 h-4" />}
            >
              View
            </Button>
          </div>

          {/* Run Reports */}
          <div className="cursor-pointer rounded-xl border border-[#073346] text-black shadow-sm hover:shadow-md transition-all duration-300 p-5 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold mb-1">Run Reports</h3>
              <p className="text-sm text-black/80">View workforce analytics</p>
            </div>
            <Button
              size="sm"
              className="bg-[#A28752] hover:bg-[#745E39] border-[#A28752] text-white"
              onClick={handleRunReports}
              icon={<BarChart2 className="w-4 h-4" />}
            >
              Open
            </Button>
          </div>

          {/* Broadcast Update */}
          <div className="cursor-pointer rounded-xl border border-[#745073346E39] text-black shadow-sm hover:shadow-md transition-all duration-300 p-5 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold mb-1">Broadcast Update</h3>
              <p className="text-sm text-black/80">Send HR announcement</p>
            </div>
            <Button
              size="sm"
              className="bg-[#A28752] hover:bg-[#745E39] border-[#A28752] text-white"
              onClick={handleBroadcastUpdate}
              icon={<FileText className="w-4 h-4" />}
              iconPosition="right"
            >
              Compose
            </Button>
          </div>
        </div>
      </Card>

      {/* Insights and lists - 3-column bento layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Employee Insights - headcount trend (top-left, without background card) */}
        <div className="lg:col-span-4">
          <LineChart
            title="Employee Insights"
            subtitle="Monthly headcount trend"
            data={mockHeadcountTrend}
            categories={mockHeadcountMonths}
            seriesName="Headcount"
            height={340}
            colors={['#6366f1']}
            fillArea
            yAxisOptions={{ min: 100, max: 160, tickAmount: 5 }}
            xAxisOptions={{ min: 0, max: 12, tickAmount: 12 }}
          />
        </div>

        {/* Birthday Calendar & Work Anniversary (top-center) */}
        <ListView
          title="Birthday Calendar & Work Anniversary"
          subtitle="This month birthdays and work anniversaries"
          items={birthdayAndAnniversaryItems}
          scrollable
          maxHeight={340}
          autoScroll
          autoScrollSpeed={40}
          className="lg:col-span-4"
        />

        {/* Upcoming Leaves & Festivals (right column spanning two rows) */}
        <ListView
          title="Upcoming Leaves & Festivals"
          subtitle="Upcoming events and holidays"
          items={upcomingLeavesAndFestivalsItems}
          scrollable
          maxHeight={520}
          autoScroll
          autoScrollSpeed={40}
          className="lg:col-span-4 lg:row-span-2"
        />

        {/* People Pulse (bottom left) */}
        <ListView
          title="People Pulse"
          subtitle="Latest movements across the organization"
          items={peoplePulseItems}
          scrollable={false}
          className="lg:col-span-4"
        />

        {/* Talent Pipeline & Events (bottom middle) */}
        <ListView
          title="Talent Pipeline & Events"
          subtitle="Next 5 interviews, trainings or workshops"
          items={talentPipelineItems}
          scrollable={false}
          className="lg:col-span-4"
        />
      </div>

      {/* Modals */}
      <Modal
        isOpen={showAddEmployee}
        onClose={() => setShowAddEmployee(false)}
        title="Add New Employee"
        size="xl"
      >
        <EmployeeForm
          onSubmit={handleSubmitEmployee}
          onCancel={() => setShowAddEmployee(false)}
        />
      </Modal>

      <Modal
        isOpen={showEditEmployee}
        onClose={() => setShowEditEmployee(false)}
        title="Edit Employee"
        size="xl"
      >
        <EmployeeForm
          employee={selectedEmployee}
          onSubmit={handleSubmitEmployee}
          onCancel={() => setShowEditEmployee(false)}
        />
      </Modal>
    </div>
  );
};

export default HRMSDashboard;
