'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Upload, Calendar, Users } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import PageHeader from '@/components/layout/PageHeader';
import StatisticsCards from '@/components/hrms/StatisticsCards';
import EmployeeTable from '@/components/hrms/EmployeeTable';
import EmployeeForm from '@/components/hrms/EmployeeForm';
import Modal from '@/components/common/Modal';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

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
    onLeave: 6
  };

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

  return (
    <div className="min-h-screen space-y-8">
      {/* Page Header */}
      <PageHeader
        title="HRMS Dashboard"
        description="Manage your human resources and track employee data"
        actions={[
          <Button
            key="add-employee"
            onClick={handleAddEmployee}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Employee
          </Button>,
          <Button
            key="upload-attendance"
            variant="secondary"
            onClick={handleUploadAttendance}
            icon={<Upload className="w-4 h-4" />}
          >
            Upload Attendance
          </Button>
        ]}
      />

      {/* Statistics Cards */}
      <StatisticsCards {...stats} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="glass" className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <Users className="w-7 h-7 text-neutral-900" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-lg">Employee Management</h3>
              <p className="text-sm text-neutral-700 mt-1">View and manage employees</p>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <Calendar className="w-7 h-7 text-neutral-900" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-lg">Attendance Tracking</h3>
              <p className="text-sm text-neutral-700 mt-1">Monitor daily attendance</p>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <Upload className="w-7 h-7 text-neutral-900" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-lg">Bulk Upload</h3>
              <p className="text-sm text-neutral-700 mt-1">Upload attendance data</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Employee table removed as requested */}

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
