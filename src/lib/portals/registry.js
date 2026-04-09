/**
 * Six product portals — UI under src/app/<portal-path>, BFF routes under src/app/api/portals/<id>/.
 * Backend can run monolith (server.js) or per-service (hrms_backend/servers/*).
 */
export const PORTALS = [
  {
    id: 'hrms',
    name: 'HRMS Portal',
    description:
      'Human resources, employee data, attendance tracking, and workforce analytics.',
    appPathPrefix: '/hrms',
    apiPortalFolder: 'hrms',
    publicApiPrefixes: ['/api/hrms', '/api/hrms-portal'],
    backendScript: 'start:hrms',
  },
  {
    id: 'asset-tracker',
    name: 'Asset Tracker Portal',
    description: 'Company assets, assignments, maintenance, and utilization.',
    appPathPrefix: '/asset-tracker',
    apiPortalFolder: 'asset-tracker',
    publicApiPrefixes: ['/api/asset-tracker'],
    backendScript: 'start:assets',
  },
  {
    id: 'finance',
    name: 'Organisation Tools',
    description: 'Organisational tools, financial operations, and business utilities.',
    appPathPrefix: '/finance',
    apiPortalFolder: 'finance',
    publicApiPrefixes: ['/api/finance'],
    backendScript: 'start:finance',
  },
  {
    id: 'project-tracker',
    name: 'Project Tracker',
    description: 'Projects, tasks, and deadlines (often a dedicated workspace URL).',
    appPathPrefix: null,
    apiPortalFolder: null,
    publicApiPrefixes: [],
    backendScript: null,
  },
  {
    id: 'employee-portal',
    name: 'Employee Portal',
    description: 'Self-service HR for the logged-in employee.',
    appPathPrefix: '/employee-portal',
    apiPortalFolder: 'employee-portal',
    publicApiPrefixes: ['/api/employee-portal', '/api/employee'],
    backendScript: 'start:employee',
  },
  {
    id: 'query-tracker',
    name: 'Query Tracker',
    description: 'Customer queries, support tickets, and interactions.',
    appPathPrefix: '/query-tracker',
    apiPortalFolder: null,
    publicApiPrefixes: ['/api/query-tracker'],
    backendScript: 'start:query-tracker',
  },
];
