'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import PageHeader from '@/components/layout/PageHeader';
import EmployeeTable from '@/components/hrms/EmployeeTable';
import EmployeeForm from '@/components/hrms/EmployeeForm';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { mockEmployees } from '@/lib/utils/hrmsMockData';

const EmployeesPage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();
  
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState(mockEmployees);
  const router = useRouter();

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setShowAddEmployee(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEditEmployee(true);
  };

  const handleViewEmployee = (employee) => {
    router.push(`/hrms/${companyId}/employees/${employee.id}`);
  };

  const handleDeleteEmployee = (employee) => {
    if (confirm(`Are you sure you want to delete ${employee.name}?`)) {
      setEmployees(prev => prev.filter(emp => emp.id !== employee.id));
      toast.success(`${employee.name} has been deleted successfully`);
    }
  };

  const handleSubmitEmployee = (formData) => {
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

  const handleExportEmployees = () => {
    // Mock export functionality
    toast.success('Employee data exported successfully');
  };

  return (
    <div className="min-h-screen space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Employee Management"
        description="Manage your company's employee data and information"
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
      <EmployeeTable
        employees={employees}
        onView={handleViewEmployee}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
        onAdd={handleAddEmployee}
        onExport={handleExportEmployees}
      />

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

export default EmployeesPage;
