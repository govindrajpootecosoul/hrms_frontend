'use client';

// Centralized reusable mock data for HRMS employees and company.
// This keeps sample data consistent across list and detail pages
// and allows easy replacement with API calls later.

// Primary mock company for the HRMS portal
export const mockCompany = {
  id: '1',
  name: 'EcoSoul',
  logo: '/ecosoulLogo.svg'
};

export const mockEmployees = [
  {
    id: '1',
    biometricId: 'EMP001',
    name: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+1 234 567 8900',
    department: 'IT',
    designation: 'Software Engineer',
    gender: 'male',
    dateOfBirth: '1990-05-15',
    status: 'active',
    fatherName: 'Robert Doe',
    personalEmail: 'john.personal@gmail.com',
    maritalStatus: 'Single',
    bloodGroup: 'O+',
    address: '123 Main St, City, State 12345',
    emergencyContact: '+1 234 567 8901',
    accountNumber: '1234567890',
    ifscCode: 'SBIN0001234',
    bankName: 'State Bank of India',
    branch: 'Main Branch',
    panNumber: 'ABCDE1234F',
    aadharNumber: '123456789012',
    uanNumber: '123456789012',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2023-12-01T15:30:00Z'
  },
  {
    id: '2',
    biometricId: 'EMP002',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    phone: '+1 234 567 8902',
    department: 'HR',
    designation: 'HR Manager',
    gender: 'female',
    dateOfBirth: '1988-08-22',
    status: 'active',
    fatherName: 'Michael Smith',
    personalEmail: 'jane.personal@gmail.com',
    maritalStatus: 'Married',
    bloodGroup: 'A+',
    address: '456 Oak Ave, City, State 12345',
    emergencyContact: '+1 234 567 8903',
    accountNumber: '0987654321',
    ifscCode: 'HDFC0001234',
    bankName: 'HDFC Bank',
    branch: 'City Branch',
    panNumber: 'FGHIJ5678K',
    aadharNumber: '987654321098',
    uanNumber: '987654321098',
    createdAt: '2023-02-20T09:00:00Z',
    updatedAt: '2023-11-15T14:20:00Z'
  },
  {
    id: '3',
    biometricId: 'EMP003',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    phone: '+1 234 567 8904',
    department: 'Finance',
    designation: 'Finance Analyst',
    gender: 'male',
    dateOfBirth: '1992-12-10',
    status: 'on-leave',
    fatherName: 'David Johnson',
    personalEmail: 'mike.personal@gmail.com',
    maritalStatus: 'Single',
    bloodGroup: 'B+',
    address: '789 Pine St, City, State 12345',
    emergencyContact: '+1 234 567 8905',
    accountNumber: '1122334455',
    ifscCode: 'ICIC0001234',
    bankName: 'ICICI Bank',
    branch: 'Downtown Branch',
    panNumber: 'KLMNO9012P',
    aadharNumber: '112233445566',
    uanNumber: '112233445566',
    createdAt: '2023-03-10T11:00:00Z',
    updatedAt: '2023-10-30T16:45:00Z'
  }
];

export function getEmployeeById(employeeId) {
  return mockEmployees.find(e => e.id === String(employeeId));
}

// Mock data for charts and graphs
export const mockDepartmentDistribution = [
  { label: 'Engineering', value: 45 },
  { label: 'Sales', value: 20 },
  { label: 'Human Resources', value: 15 },
  { label: 'Finance', value: 25 },
  { label: 'Marketing', value: 10 },
  { label: 'Operations', value: 10 }
];

export const mockDepartmentDistributionSimple = [45, 20, 15, 25, 10, 10];
export const mockDepartmentCategories = ['Engineering', 'Sales', 'Human Resources', 'Finance', 'Marketing', 'Operations'];

// Attendance trends - last 7 working days
export const mockAttendanceTrends = [142, 145, 138, 140, 143, 141, 144];
export const mockAttendanceDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Monthly attendance data
export const mockMonthlyAttendance = [142, 138, 145, 140, 143, 141, 144, 139, 142, 140, 143, 145];
export const mockMonthCategories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Employee status distribution
export const mockEmployeeStatus = [
  { label: 'Active', value: 120 },
  { label: 'On Leave', value: 8 },
  { label: 'Inactive', value: 5 },
  { label: 'Probation', value: 15 },
  { label: 'Terminated', value: 8 }
];

// Gender distribution
export const mockGenderDistribution = [
  { label: 'Male', value: 82 },
  { label: 'Female', value: 60 }
];

// Headcount per month for line charts
export const mockHeadcountTrend = [
  { label: 'Jan', value: 148 },
  { label: 'Feb', value: 149 },
  { label: 'Mar', value: 150 },
  { label: 'Apr', value: 151 },
  { label: 'May', value: 152 },
  { label: 'Jun', value: 153 },
  { label: 'Jul', value: 154 },
  { label: 'Aug', value: 155 },
  { label: 'Sep', value: 156 },
  { label: 'Oct', value: 157 },
  { label: 'Nov', value: 158 },
  { label: 'Dec', value: 159 }
];

export const mockHeadcountTrendSimple = mockHeadcountTrend.map(item => item.value);
export const mockHeadcountMonths = mockHeadcountTrend.map(item => item.label);

// Designation distribution
export const mockDesignationDistribution = [
  { label: 'Software Engineer', value: 35 },
  { label: 'Senior Software Engineer', value: 20 },
  { label: 'Team Lead', value: 12 },
  { label: 'Manager', value: 8 },
  { label: 'Senior Manager', value: 5 },
  { label: 'Director', value: 3 }
];

// Age group distribution
export const mockAgeGroupDistribution = [
  { label: '20-25', value: 15 },
  { label: '26-30', value: 45 },
  { label: '31-35', value: 35 },
  { label: '36-40', value: 25 },
  { label: '41-45', value: 15 },
  { label: '46+', value: 6 }
];

// Organizational hierarchy mock data for organization chart
export const mockOrgChart = {
  id: 'ceo',
  title: 'CEO',
  subtitle: 'Overall strategic leadership',
  color: 'from-primary-500 to-primary-600',
  imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CEO',
  children: [
    {
      id: 'cxo',
      title: 'CXO Leadership',
      subtitle: 'Finance, HR, Technology, Sales',
      color: 'from-emerald-500 to-emerald-600',
      imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CXO',
      children: [
        {
          id: 'vp-eng',
          title: 'VP Engineering',
          subtitle: 'Platform, Product, QA',
          color: 'from-sky-500 to-sky-600',
          imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VPEngineering'
        },
        {
          id: 'vp-sales',
          title: 'VP Sales',
          subtitle: 'Regional & Enterprise',
          color: 'from-orange-500 to-orange-600',
          imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VPSales'
        },
        {
          id: 'vp-hr',
          title: 'VP HR',
          subtitle: 'People, Culture & Talent',
          color: 'from-violet-500 to-violet-600',
          imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VPHR'
        }
      ]
    },
    {
      id: 'directors',
      title: 'Directors',
      subtitle: 'Department leadership and strategy',
      color: 'from-fuchsia-500 to-fuchsia-600',
      imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Directors',
      children: [
        {
          id: 'eng-directors',
          title: 'Engineering Directors',
          subtitle: 'Backend, Frontend, DevOps',
          color: 'from-indigo-500 to-indigo-600',
          imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EngDirectors'
        },
        {
          id: 'biz-directors',
          title: 'Business Directors',
          subtitle: 'Marketing, Finance, Operations',
          color: 'from-rose-500 to-rose-600',
          imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BizDirectors'
        }
      ]
    }
  ]
};

