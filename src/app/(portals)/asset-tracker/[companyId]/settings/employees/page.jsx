'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import PageHeader from '@/components/layout/PageHeader';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import Card from '@/components/common/Card';

const EmployeesSettingsPage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();
  
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@company.com',
      department: 'IT',
      designation: 'Software Engineer',
      biometricId: 'EMP001',
      status: 'active'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      department: 'HR',
      designation: 'HR Manager',
      biometricId: 'EMP002',
      status: 'active'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      department: 'Finance',
      designation: 'Finance Analyst',
      biometricId: 'EMP003',
      status: 'active'
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    biometricId: ''
  });

  const handleAddEmployee = () => {
    setFormData({
      name: '',
      email: '',
      department: '',
      designation: '',
      biometricId: ''
    });
    setSelectedEmployee(null);
    setShowAddEmployee(true);
  };

  const handleEditEmployee = (employee) => {
    setFormData({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      designation: employee.designation,
      biometricId: employee.biometricId
    });
    setSelectedEmployee(employee);
    setShowEditEmployee(true);
  };

  const handleDeleteEmployee = (employee) => {
    if (confirm(`Are you sure you want to delete ${employee.name}?`)) {
      setEmployees(prev => prev.filter(emp => emp.id !== employee.id));
      toast.success(`${employee.name} has been deleted successfully`);
    }
  };

  const handleSubmitEmployee = () => {
    if (selectedEmployee) {
      // Update existing employee
      setEmployees(prev => prev.map(emp => 
        emp.id === selectedEmployee.id 
          ? { ...emp, ...formData, updatedAt: new Date().toISOString() }
          : emp
      ));
      toast.success('Employee updated successfully');
    } else {
      // Add new employee
      const newEmployee = {
        id: Date.now().toString(),
        ...formData,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setEmployees(prev => [...prev, newEmployee]);
      toast.success('Employee added successfully');
    }
    
    setShowAddEmployee(false);
    setShowEditEmployee(false);
    setSelectedEmployee(null);
  };

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (value, employee) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center mr-3">
            <span className="text-xs font-medium text-neutral-600">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-neutral-900">{value}</div>
            <div className="text-sm text-neutral-500">{employee.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      title: 'Department',
      render: (value) => (
        <span className="text-sm text-neutral-600">{value}</span>
      )
    },
    {
      key: 'designation',
      title: 'Designation',
      render: (value) => (
        <span className="text-sm text-neutral-600">{value}</span>
      )
    },
    {
      key: 'biometricId',
      title: 'Biometric ID',
      render: (value) => (
        <span className="font-mono text-sm font-medium text-primary-600">
          {value}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    }
  ];

  const actions = [
    {
      icon: <Edit className="w-4 h-4" />,
      title: 'Edit Employee',
      onClick: (employee) => handleEditEmployee(employee)
    },
    {
      icon: <Trash2 className="w-4 h-4" />,
      title: 'Delete Employee',
      variant: 'danger',
      onClick: (employee) => handleDeleteEmployee(employee)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Employee Settings"
        description="Manage employees who can be assigned assets"
        actions={[
          <Button
            key="add-employee"
            onClick={handleAddEmployee}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Employee
          </Button>
        ]}
      />

      {/* Employee Table */}
      <Card>
        <Table
          columns={columns}
          data={employees}
          actions={actions}
          emptyMessage="No employees found. Add employees to assign assets."
        />
      </Card>

      {/* Add/Edit Employee Modal */}
      <Modal
        isOpen={showAddEmployee || showEditEmployee}
        onClose={() => {
          setShowAddEmployee(false);
          setShowEditEmployee(false);
        }}
        title={selectedEmployee ? 'Edit Employee' : 'Add Employee'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
          
          <Input
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
            required
          />
          
          <Input
            label="Designation"
            value={formData.designation}
            onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
            required
          />
          
          <Input
            label="Biometric ID"
            value={formData.biometricId}
            onChange={(e) => setFormData(prev => ({ ...prev, biometricId: e.target.value }))}
            required
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              onClick={() => {
                setShowAddEmployee(false);
                setShowEditEmployee(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitEmployee}>
              {selectedEmployee ? 'Update Employee' : 'Add Employee'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeesSettingsPage;
