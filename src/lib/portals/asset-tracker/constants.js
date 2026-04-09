export const ASSET_STATUS = [
  { value: 'assigned', label: 'Assigned', color: 'blue' },
  { value: 'available', label: 'Available', color: 'green' },
  { value: 'maintenance', label: 'Maintenance', color: 'orange' },
  { value: 'broken', label: 'Broken', color: 'red' },
];

export const ASSET_CATEGORIES = [
  {
    id: 'computer',
    name: 'Computer',
    prefix: 'COM',
    subcategories: [
      { id: 'laptop', name: 'Laptop', code: 'LAP' },
      { id: 'desktop', name: 'Desktop', code: 'DES' },
      { id: 'server', name: 'Server', code: 'SER' },
    ],
  },
  {
    id: 'external',
    name: 'External Device',
    prefix: 'EXT',
    subcategories: [
      { id: 'monitor', name: 'Monitor', code: 'MON' },
      { id: 'keyboard', name: 'Keyboard', code: 'KEY' },
      { id: 'mouse', name: 'Mouse', code: 'MOU' },
    ],
  },
  {
    id: 'furniture',
    name: 'Furniture',
    prefix: 'FUR',
    subcategories: [
      { id: 'chair', name: 'Chair', code: 'CHA' },
      { id: 'desk', name: 'Desk', code: 'DES' },
      { id: 'cabinet', name: 'Cabinet', code: 'CAB' },
    ],
  },
];
