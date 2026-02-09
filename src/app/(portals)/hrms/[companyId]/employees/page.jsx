'use client';

import { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Plus, 
  Search, 
  List, 
  LayoutGrid,
  MoreVertical,
  Sparkles,
  Users,
  UserCheck,
  Building2,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import AddEmployeeDialog from './components/AddEmployeeDialog';

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null); // Track which employee's menu is open

  // Employee Data
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: 'HR Manager',
      jobTitle: 'HR Manager',
      department: 'Human Resources',
      location: 'Bangalore',
      status: 'Active',
      tenure: '2 years',
      joiningDate: '2022-01-15'
    },
    {
      id: 2,
      name: 'Department Manager',
      jobTitle: 'Department Manager',
      department: 'Engineering',
      location: 'Mumbai',
      status: 'Active',
      tenure: '3 years',
      joiningDate: '2021-03-20'
    },
    {
      id: 3,
      name: 'John Doe',
      jobTitle: 'Software Engineer',
      department: 'Engineering',
      location: 'Bangalore',
      status: 'Active',
      tenure: '1 year',
      joiningDate: '2023-06-10'
    },
    {
      id: 4,
      name: 'Jane Smith',
      jobTitle: 'Sales Executive',
      department: 'Sales',
      location: 'Delhi',
      status: 'Active',
      tenure: '6 months',
      joiningDate: '2023-12-01'
    },
    {
      id: 5,
      name: 'Sales Manager',
      jobTitle: 'Sales Manager',
      department: 'Sales',
      location: 'Mumbai',
      status: 'Active',
      tenure: '4 years',
      joiningDate: '2020-08-15'
    },
  ]);

  // Handle adding/updating employee
  const handleSaveEmployee = (employeeData) => {
    if (employeeToEdit) {
      // Update existing employee
      setEmployees((prev) => 
        prev.map((emp) => emp.id === employeeToEdit.id ? employeeData : emp)
      );
    } else {
      // Add new employee
      setEmployees((prev) => [employeeData, ...prev]);
    }
  };

  // Handle edit employee
  const handleEditEmployee = (employee) => {
    setEmployeeToEdit(employee);
    setIsAddDialogOpen(true);
  };

  // Handle delete employee
  const handleDeleteEmployee = (employee) => {
    if (confirm(`Are you sure you want to delete ${employee.name}?`)) {
      setEmployees((prev) => prev.filter((emp) => emp.id !== employee.id));
      alert('Employee deleted successfully!');
    }
  };

  // Handle opening dialog for new employee
  const handleAddNewEmployee = () => {
    setEmployeeToEdit(null);
    setIsAddDialogOpen(true);
  };

  // Download Excel template
  const handleDownloadTemplate = () => {
    // Define all employee fields with headers
    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Date of Birth',
      'Gender',
      'Address',
      'City',
      'State',
      'Zip Code',
      'Emergency Contact',
      'Emergency Phone',
      'Employee ID',
      'Job Title',
      'Department',
      'Location',
      'Reporting Manager',
      'Joining Date',
      'Bank Account Number',
      'IFSC Code',
      'PAN Number',
      'Aadhaar Number',
      'UAN Number',
      'ESI Number',
      'PF Number'
    ];

    // Create a sample row with empty values and instructions
    const sampleRow = [
      'John', // First Name
      'Doe', // Last Name
      'john.doe@example.com', // Email
      '1234567890', // Phone
      '1990-01-15', // Date of Birth (YYYY-MM-DD format)
      'Male', // Gender (Male/Female/Other)
      '123 Main Street', // Address
      'Bangalore', // City
      'Karnataka', // State
      '560001', // Zip Code
      'Jane Doe', // Emergency Contact
      '9876543210', // Emergency Phone
      '', // Employee ID (leave empty for auto-generation)
      'Software Engineer', // Job Title
      'Engineering', // Department
      'Bangalore', // Location
      'Manager Name', // Reporting Manager
      '2024-01-15', // Joining Date (YYYY-MM-DD format)
      '', // Bank Account Number (optional)
      '', // IFSC Code (optional)
      '', // PAN Number (optional)
      '', // Aadhaar Number (optional)
      '', // UAN Number (optional)
      '', // ESI Number (optional)
      '' // PF Number (optional)
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);

    // Set column widths
    const colWidths = headers.map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Employee Template');

    // Generate Excel file and download
    XLSX.writeFile(wb, 'Employee_Bulk_Upload_Template.xlsx');
  };

  // Handle bulk upload
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('companyId', window.location.pathname.split('/')[2] || '');

      const response = await fetch('/api/hrms/employees/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Add new employees to the list
        if (result.employees && result.employees.length > 0) {
          setEmployees((prev) => [...result.employees, ...prev]);
        }
        alert(`Successfully imported ${result.created || 0} employee(s).${result.errors && result.errors.length > 0 ? `\n\nErrors:\n${result.errors.map(e => `Row ${e.row}: ${e.errors.join(', ')}`).join('\n')}` : ''}`);
      } else {
        alert(`Error: ${result.error || 'Failed to upload employees'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Calculate KPI metrics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((emp) => emp.status === 'Active').length;
  const departments = [...new Set(employees.map(emp => emp.department))];
  const departmentsCount = departments.length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newThisMonth = employees.filter((emp) => {
    if (!emp.joiningDate) return false;
    const joinDate = new Date(emp.joiningDate);
    return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
  }).length;

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           emp.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           emp.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment = departmentFilter === 'All Departments' || emp.department === departmentFilter;
      const matchesLocation = locationFilter === 'All Locations' || emp.location === locationFilter;
      return matchesSearch && matchesDepartment && matchesLocation;
    });
  }, [searchQuery, departmentFilter, locationFilter, employees]);

  // Gradient colors for employee cards
  const gradients = [
    'from-blue-600 via-indigo-600 to-blue-700',
    'from-green-600 via-emerald-600 to-green-700',
    'from-purple-600 via-violet-600 to-purple-700',
    'from-pink-600 via-rose-600 to-pink-700',
    'from-cyan-600 via-blue-600 to-cyan-700',
    'from-orange-600 via-amber-600 to-orange-700',
    'from-yellow-600 via-amber-600 to-yellow-700',
    'from-teal-600 via-cyan-600 to-teal-700',
    'from-indigo-600 via-purple-600 to-indigo-700',
    'from-red-600 via-rose-600 to-red-700',
  ];

  const shadows = [
    'shadow-blue-500/30',
    'shadow-green-500/30',
    'shadow-purple-500/30',
    'shadow-pink-500/30',
    'shadow-cyan-500/30',
    'shadow-orange-500/30',
    'shadow-yellow-500/30',
    'shadow-teal-500/30',
    'shadow-indigo-500/30',
    'shadow-red-500/30',
  ];

  return (
    <div className="space-y-6 relative">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Employees',
            value: totalEmployees,
            icon: Users,
            gradient: 'from-blue-600 via-indigo-600 to-blue-700',
            shadow: 'shadow-blue-500/30',
          },
          {
            title: 'Active Employees',
            value: activeEmployees,
            icon: UserCheck,
            gradient: 'from-green-600 via-emerald-600 to-green-700',
            shadow: 'shadow-green-500/30',
          },
          {
            title: 'Total Departments',
            value: departmentsCount,
            icon: Building2,
            gradient: 'from-purple-600 via-violet-600 to-purple-700',
            shadow: 'shadow-purple-500/30',
          },
          {
            title: 'New This Month',
            value: newThisMonth,
            icon: TrendingUp,
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

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
          <p className="text-sm text-slate-600 mt-1">Manage your company employees</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleDownloadTemplate}
            className="bg-green-600 text-white hover:bg-green-700"
            icon={<Download className="w-4 h-4" />}
          >
            Download Template
          </Button>
          <label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleBulkUpload}
              className="hidden"
              disabled={isUploading}
            />
            <Button
              as="span"
              className="bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
              icon={<Upload className="w-4 h-4" />}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Excel'}
            </Button>
          </label>
          <Button
            onClick={handleAddNewEmployee}
            className="bg-blue-600 text-white hover:bg-blue-700"
            icon={<Plus className="w-4 h-4" />}
          >
            Add New Employee
          </Button>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <Card className="border-2">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex gap-3 flex-wrap items-center">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option>All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option>All Locations</option>
                <option>Bangalore</option>
                <option>Mumbai</option>
                <option>Delhi</option>
                <option>Hyderabad</option>
                <option>Pune</option>
              </select>
              {/* View Toggle Buttons */}
              <div className="flex items-center gap-2 border border-slate-300 rounded-lg p-1 bg-slate-50">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Employee List/Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee, index) => {
            const gradient = gradients[index % gradients.length];
            const shadow = shadows[index % shadows.length];
            return (
              <Card
                key={employee.id}
                className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer border-2 hover:border-opacity-50 p-0 overflow-hidden"
              >
                <div className={`p-6 transition-all duration-300 rounded-lg group-hover:bg-gradient-to-br ${gradient} group-hover:bg-opacity-90`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient} ${shadow} shadow-lg group-hover:bg-white/20 group-hover:backdrop-blur-sm`}>
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-white transition-colors">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground group-hover:text-white/90 transition-colors">{employee.jobTitle || 'No title'}</p>
                      <p className="text-xs text-muted-foreground group-hover:text-white/80 transition-colors mt-1">{employee.department}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground group-hover:text-white/80 transition-colors">Location</p>
                      <p className="text-sm font-medium group-hover:text-white transition-colors">{employee.location || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground group-hover:text-white/80 transition-colors">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        employee.status === 'Active'
                          ? 'bg-green-100 text-green-700 group-hover:bg-white/20 group-hover:text-white'
                          : 'bg-gray-100 text-gray-700 group-hover:bg-white/20 group-hover:text-white'
                      }`}>
                        {employee.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200 group-hover:border-white/30">
                    <div>
                      <p className="text-xs text-muted-foreground group-hover:text-white/80 transition-colors">Tenure</p>
                      <p className="text-sm font-medium group-hover:text-white transition-colors">{employee.tenure || '-'}</p>
                    </div>
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionMenuOpen(actionMenuOpen === employee.id ? null : employee.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 group-hover:text-white transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {actionMenuOpen === employee.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-10">
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditEmployee(employee);
                                setActionMenuOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Employee
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEmployee(employee);
                                setActionMenuOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Employee
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-2">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">EMPLOYEE NAME</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">JOB TITLE</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">DEPARTMENT</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">LOCATION</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">STATUS</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">TENURE</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredEmployees.map((employee) => (
                  <tr 
                    key={employee.id} 
                    className="hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{employee.name}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{employee.jobTitle || '-'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{employee.department}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{employee.location || '-'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{employee.tenure || '-'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuOpen(actionMenuOpen === employee.id ? null : employee.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {actionMenuOpen === employee.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-10">
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditEmployee(employee);
                                  setActionMenuOpen(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Edit Employee
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEmployee(employee);
                                  setActionMenuOpen(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Employee
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* HR Copilot Floating Button */}
      <button className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-slate-900 transition-colors flex items-center gap-2 z-50">
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">HR Copilot</span>
      </button>

      {/* Add/Edit Employee Dialog */}
      <AddEmployeeDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEmployeeToEdit(null);
          }
        }}
        onSave={handleSaveEmployee}
        existingEmployees={employees}
        employeeToEdit={employeeToEdit}
      />

      {/* Click outside to close action menu */}
      {actionMenuOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setActionMenuOpen(null)}
        />
      )}
    </div>
  );
}
