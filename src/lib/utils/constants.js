export {
  HRMS_DEPARTMENTS,
  HRMS_DESIGNATIONS,
  HRMS_BLOOD_GROUPS,
  HRMS_MARITAL_STATUS,
  ATTENDANCE_STATUS,
} from '../portals/hrms/constants';

export { ASSET_STATUS, ASSET_CATEGORIES } from '../portals/asset-tracker/constants';

// Shared UI / app constants (not portal-specific)
export const BUTTON_SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const MODAL_SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

export const PAGINATION_LIMITS = [10, 25, 50, 100];

export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  input: 'yyyy-MM-dd',
  time: 'HH:mm',
  datetime: 'MMM dd, yyyy HH:mm',
};

export const FILE_LIMITS = {
  image: { maxSize: 5 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp'] },
  csv: { maxSize: 10 * 1024 * 1024, types: ['text/csv', 'application/csv'] },
  document: {
    maxSize: 20 * 1024 * 1024,
    types: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
