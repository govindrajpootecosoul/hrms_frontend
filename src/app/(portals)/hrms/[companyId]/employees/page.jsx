'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, LayoutGrid, List } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import Table from '@/components/common/Table';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Badge from '@/components/common/Badge';
import EmployeeForm from '@/components/hrms/EmployeeForm';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { CometCard } from '@/components/hrms/ProfilePicCard';
import { mockEmployees } from '@/lib/utils/hrmsMockData';
import { HRMS_DEPARTMENTS } from '@/lib/utils/constants';

const EmployeesPage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();
  
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState(mockEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const router = useRouter();
  
  const pageSize = 15;

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

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchTerm || 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.biometricId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
    const matchesStatus = !statusFilter || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Reset pagination when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, statusFilter, employees]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedEmployees = filteredEmployees.slice(startIdx, startIdx + pageSize);

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    ...HRMS_DEPARTMENTS.map(dept => ({ value: dept, label: dept }))
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'on-leave', label: 'On Leave' }
  ];

  const columns = [
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
      key: 'name',
      title: 'Name',
      render: (value, employee) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-neutral-100 border border-neutral-200 rounded-full flex items-center justify-center mr-3">
            <span className="text-xs font-medium text-neutral-700">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-neutral-900">{value}</div>
            <div className="text-sm text-neutral-600">{employee.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      title: 'Department',
      render: (value) => (
        <span className="text-sm text-neutral-700">
          {value}
        </span>
      )
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (value) => (
        <span className="text-sm text-neutral-700">{value}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => {
        const statusConfig = {
          active: { variant: 'success', label: 'Active' },
          inactive: { variant: 'danger', label: 'Inactive' },
          'on-leave': { variant: 'warning', label: 'On Leave' }
        };
        const config = statusConfig[value] || { variant: 'info', label: value };
        return <Badge size="sm">{config.label}</Badge>;
      }
    }
  ];

  const actions = [
    {
      icon: <Eye className="w-4 h-4" />,
      title: 'View Employee',
      onClick: (employee) => handleViewEmployee(employee)
    },
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
    <div className="min-h-screen space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-900">
          Employee Management
        </h1>
      </div>

      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Button onClick={handleAddEmployee} icon={<Plus className="w-4 h-4" />} className="bg-[#A28752] text-white">
            Add Employee
          </Button>
          <Button onClick={handleExportEmployees} icon={<Download className="w-4 h-4" />} className="bg-[#A28752] text-white">
            Export CSV
          </Button>
        </div>
        
        <div className="text-sm text-neutral-600">
          {filteredEmployees.length} of {employees.length} employees
        </div>
      </div>

      {/* View Toggle - Above Filters */}
      <div className="flex justify-end mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-primary-100 text-primary-600'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
            aria-label="List view"
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-primary-100 text-primary-600'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
        
        <Select
          options={departmentOptions}
          value={departmentFilter}
          onChange={setDepartmentFilter}
          icon={<Filter className="w-4 h-4" />}
        />
        
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {/* Employee Table or Grid */}
      {viewMode === 'list' ? (
        <Table
          columns={columns}
          data={paginatedEmployees}
          loading={false}
          actions={actions}
          pagination={true}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onRowClick={handleViewEmployee}
          emptyMessage="No employees found. Add your first employee to get started."
        />
      ) : (
        <div className="space-y-6">
          {paginatedEmployees.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              No employees found. Add your first employee to get started.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10">
                {paginatedEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    onClick={() => handleViewEmployee(employee)}
                    className="cursor-pointer"
                  >
                    <CometCard
                      imageUrl={employee.imageUrl}
                      name={employee.name}
                      designation={employee.designation}
                      className="w-[100%] h-[100%]"
                    />
                  </div>
                ))}
              </div>
              
              {/* Pagination for Grid View */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-neutral-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

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
