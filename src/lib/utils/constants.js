// HRMS Constants
export const HRMS_DEPARTMENTS = [
  'Data Analytics',
  'Human Resources', 
  'Finance',
  'Marketing',
  'Supply Chain',
  'Operations',
  'Sales',
  'IT',
  'Legal',
  'Admin'
];

export const HRMS_DESIGNATIONS = [
  'Software Engineer',
  'Senior Software Engineer',
  'Team Lead',
  'Manager',
  'Senior Manager',
  'Director',
  'VP',
  'C-Level'
];

export const HRMS_BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

export const HRMS_MARITAL_STATUS = [
  'Single',
  'Married',
  'Divorced',
  'Widowed'
];

// Asset Tracker Constants
export const ASSET_STATUS = [
  { value: 'assigned', label: 'Assigned', color: 'blue' },
  { value: 'available', label: 'Available', color: 'green' },
  { value: 'maintenance', label: 'Maintenance', color: 'orange' },
  { value: 'broken', label: 'Broken', color: 'red' }
];

export const ATTENDANCE_STATUS = [
  { value: 'present', label: 'Present', color: 'green' },
  { value: 'absent', label: 'Absent', color: 'red' },
  { value: 'half-day', label: 'Half Day', color: 'orange' },
  { value: 'on-leave', label: 'On Leave', color: 'blue' }
];

// Asset Categories (can be extended)
export const ASSET_CATEGORIES = [
  { id: 'computer', name: 'Computer', prefix: 'COM', subcategories: [
    { id: 'laptop', name: 'Laptop', code: 'LAP' },
    { id: 'desktop', name: 'Desktop', code: 'DES' },
    { id: 'server', name: 'Server', code: 'SER' }
  ]},
  { id: 'external', name: 'External Device', prefix: 'EXT', subcategories: [
    { id: 'monitor', name: 'Monitor', code: 'MON' },
    { id: 'keyboard', name: 'Keyboard', code: 'KEY' },
    { id: 'mouse', name: 'Mouse', code: 'MOU' }
  ]},
  { id: 'furniture', name: 'Furniture', prefix: 'FUR', subcategories: [
    { id: 'chair', name: 'Chair', code: 'CHA' },
    { id: 'desk', name: 'Desk', code: 'DES' },
    { id: 'cabinet', name: 'Cabinet', code: 'CAB' }
  ]}
];

// Button sizes
export const BUTTON_SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
};

// Modal sizes
export const MODAL_SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4'
};

// Table pagination
export const PAGINATION_LIMITS = [10, 25, 50, 100];

// Date formats
export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  input: 'yyyy-MM-dd',
  time: 'HH:mm',
  datetime: 'MMM dd, yyyy HH:mm'
};

// File upload limits
export const FILE_LIMITS = {
  image: { maxSize: 5 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp'] },
  csv: { maxSize: 10 * 1024 * 1024, types: ['text/csv', 'application/csv'] },
  document: { maxSize: 20 * 1024 * 1024, types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] }
};

// API Configuration
// Uses NEXT_PUBLIC_API_URL from .env.local file
// This ensures the API URL is always in sync with the network configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;