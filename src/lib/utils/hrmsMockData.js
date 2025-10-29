'use client';

// Centralized reusable mock data for HRMS employees.
// This keeps sample data consistent across list and detail pages
// and allows easy replacement with API calls later.

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


