'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, List, Grid, MoreVertical } from 'lucide-react';
import { mockData } from '@/lib/api';
import AddEmployeeDialog from './components/AddEmployeeDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ViewMode = 'list' | 'grid';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      // Try API first, fallback to mock data
      const api = (await import('@/lib/api')).default;
      try {
        const response = await api.get('/employees');
        setEmployees(response.data);
      } catch (error: any) {
        // If backend is not available, use mock data
        if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
          console.warn('Backend not available, using mock data for employees');
          setEmployees(mockData.employees);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.warn('Using mock data for employees');
      setEmployees(mockData.employees);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp: any) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDepartment = selectedDepartment === 'all' || emp.department === selectedDepartment;
      const matchesLocation = selectedLocation === 'all' || emp.location === selectedLocation;

      return matchesSearch && matchesDepartment && matchesLocation;
    });
  }, [employees, searchTerm, selectedDepartment, selectedLocation]);

  const departments = useMemo(() => {
    const depts = new Set(employees.map((emp: any) => emp.department));
    return Array.from(depts).sort();
  }, [employees]);

  const locations = useMemo(() => {
    const locs = new Set(employees.map((emp: any) => emp.location));
    return Array.from(locs).sort();
  }, [employees]);

  const handleAddEmployee = (employeeData: any) => {
    setEmployees((prev) => [employeeData, ...prev]);
    alert('Employee added successfully!');
  };

  const getStatusColor = (status: string) => {
    return status === 'Active'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const getEmployeeProfile = (employee: any) => {
    const attendance = Array.from({ length: 10 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - index);
      const statuses = ['Present', 'Present', 'Present', 'Late', 'WFH', 'On Leave'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        status,
        hours: status === 'Present' ? (8 + Math.floor(Math.random() * 2)) : status === 'WFH' ? 7 : 0,
      };
    });

    const assetsByDept: Record<string, string[]> = {
      IT: ['MacBook Pro 14"', 'JetBrains License', 'Dell 27" Monitor', 'ID Card'],
      Sales: ['iPhone 14', 'Client Travel Card', 'ID Card'],
      'Human Resources': ['Surface Laptop', 'Adobe Sign', 'ID Card'],
      Marketing: ['MacBook Air', 'Canva Pro', 'Studio MIC', 'ID Card'],
      default: ['Laptop', 'ID Card'],
    };

    return {
      attendance,
      assets: assetsByDept[employee.department as keyof typeof assetsByDept] || assetsByDept.default,
      workSummary: [
        { label: 'Current Project', value: employee.department === 'IT' ? 'HRMS Mobile App' : 'Quarterly GTM' },
        { label: 'Manager', value: employee.reportingManager || 'N/A' },
        { label: 'Office Seat', value: `${employee.location} - ${Math.ceil(Math.random() * 30)}B` },
      ],
      notes: [
        'Completed security training last week.',
        'Upcoming performance check-in next Friday.',
        'Approved for hybrid work - Tue/Thu.'
      ],
    };
  };

  const openProfile = (employee: any) => {
    setSelectedEmployee(employee);
    setIsProfileOpen(true);
  };

  const handleAction = (employee: any, action: string) => {
    alert(`${action} clicked for ${employee.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">Manage your company employees</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add New Employee
        </Button>
      </div>

      {/* Filters and View Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Department Filter */}
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Location Filter */}
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 border rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee List/Grid View */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading employees...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No employees found</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">EMPLOYEE NAME</TableHead>
                    <TableHead className="font-semibold">JOB TITLE</TableHead>
                    <TableHead className="font-semibold">DEPARTMENT</TableHead>
                    <TableHead className="font-semibold">LOCATION</TableHead>
                    <TableHead className="font-semibold">STATUS</TableHead>
                    <TableHead className="font-semibold">TENURE</TableHead>
                    <TableHead className="font-semibold">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee: any) => (
                    <TableRow
                      key={employee.id}
                      className="cursor-pointer"
                      onClick={() => openProfile(employee)}
                    >
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.jobTitle}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.location}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(employee.status)}>
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{employee.tenure}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAction(employee, 'Edit')}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction(employee, 'Archive')}>
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction(employee, 'Delete')}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEmployees.map((employee: any) => (
                <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 cursor-pointer" onClick={() => openProfile(employee)}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground">{employee.jobTitle}</p>
                      </div>
                      <Badge className={getStatusColor(employee.status)}>
                        {employee.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Department:</span>
                        <span className="font-medium">{employee.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{employee.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tenure:</span>
                        <span className="font-medium">{employee.tenure}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full">
                            <MoreVertical className="h-4 w-4 mr-2" />
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction(employee, 'Edit')}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction(employee, 'Archive')}>
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction(employee, 'Delete')}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-5xl">
          {selectedEmployee && (() => {
            const profile = getEmployeeProfile(selectedEmployee);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedEmployee.name}</DialogTitle>
                  <DialogDescription>
                    {selectedEmployee.jobTitle} • {selectedEmployee.department} • {selectedEmployee.location}
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Overview & Work Details</CardTitle>
                      </CardHeader>
                      <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Employee ID</span>
                            <span className="font-medium">{selectedEmployee.employeeId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email</span>
                            <span className="font-medium">{selectedEmployee.email || '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Phone</span>
                            <span className="font-medium">{selectedEmployee.phone || '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <Badge className={getStatusColor(selectedEmployee.status)}>
                              {selectedEmployee.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p><span className="text-muted-foreground">Job Title:</span> {selectedEmployee.jobTitle}</p>
                          <p><span className="text-muted-foreground">Department:</span> {selectedEmployee.department}</p>
                          <p><span className="text-muted-foreground">Location:</span> {selectedEmployee.location}</p>
                          <p><span className="text-muted-foreground">Manager:</span> {selectedEmployee.reportingManager || '—'}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Insights</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {profile.workSummary.map((item) => (
                          <div key={item.label} className="flex justify-between">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="font-medium">{item.value}</span>
                          </div>
                        ))}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tenure</span>
                          <span className="font-medium">{selectedEmployee.tenure}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Joining Date</span>
                          <span className="font-medium">{selectedEmployee.joiningDate || '—'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Last 10 Days Attendance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-48 overflow-y-auto pr-2">
                          <div className="space-y-2 text-sm">
                            {profile.attendance.map((day, index) => (
                              <div key={index} className="flex justify-between border rounded-md px-3 py-2">
                                <span className="font-medium">{day.date}</span>
                                <span className="text-muted-foreground">{day.status}</span>
                                <span>{day.hours ? `${day.hours} hrs` : '—'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Allocated Assets</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {profile.assets.map((asset) => (
                          <div key={asset} className="flex items-center justify-between border rounded-md px-3 py-2">
                            <span>{asset}</span>
                            <Badge variant="outline">In Use</Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Notes & Reminders</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-3 text-sm">
                      {profile.notes.map((note, idx) => (
                        <div key={idx} className="rounded-md border px-3 py-2">
                          {note}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Add Employee Dialog */}
      <AddEmployeeDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddEmployee}
        existingEmployees={employees}
      />
    </div>
  );
}

