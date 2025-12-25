// Mock data for employee portal
export const mockData = {
  employees: [
    {
      id: '1',
      employeeId: 'EMP001',
      name: 'John Smith',
      jobTitle: 'Senior Software Engineer',
      department: 'IT',
      location: 'New York',
      status: 'Active',
      tenure: '2 years 3 months',
      email: 'john.smith@company.com',
      phone: '+1 234-567-8900',
      joiningDate: '2022-10-15',
    },
    {
      id: '2',
      employeeId: 'EMP002',
      name: 'Sarah Johnson',
      jobTitle: 'HR Manager',
      department: 'Human Resources',
      location: 'Chicago',
      status: 'Active',
      tenure: '3 years 8 months',
      email: 'sarah.johnson@company.com',
      phone: '+1 234-567-8901',
      joiningDate: '2021-05-10',
    },
  ],
  orgChart: {
    departments: [
      {
        id: 'engineering',
        name: 'Engineering & Product',
        description: 'Responsible for building core platform capabilities, product experiences, and innovation initiatives.',
        headcount: 58,
        cxo: { name: 'Ananya Iyer', title: 'Chief Technology Officer' },
        directors: [
          { name: 'Rahul Verma', title: 'Director of Platform Engineering' },
          { name: 'Tanvi Kulkarni', title: 'Director of Product Engineering' },
          { name: 'Gaurav Malhotra', title: 'Director of Product Strategy' },
        ],
        seniorManagers: [
          { name: 'Sneha Reddy', title: 'Senior Engineering Manager - Platform' },
          { name: 'Karthik Nayak', title: 'Senior Engineering Manager - Applications' },
          { name: 'Pooja Bansal', title: 'Senior Product Manager - Employee Experience' },
        ],
        managers: [
          { name: 'Aditya Rao', title: 'Engineering Manager - Core APIs', teams: 3 },
          { name: 'Megha Sharma', title: 'Engineering Manager - Mobile Apps', teams: 2 },
          { name: 'Harshith Menon', title: 'Product Manager - Attendance Suite', teams: 1 },
          { name: 'Ishita Deshpande', title: 'Product Manager - Insights & Analytics', teams: 1 },
        ],
        leads: [
          { name: 'Rohit Sinha', title: 'Tech Lead - Microservices', focus: 'Platform Reliability' },
          { name: 'Neha Kapoor', title: 'Tech Lead - Frontend Guild', focus: 'Design Systems' },
          { name: 'Suresh Pillai', title: 'QA Lead', focus: 'Automation & Compliance' },
          { name: 'Aparna Gupta', title: 'UX Lead', focus: 'Experience Research' },
        ],
      },
      {
        id: 'sales',
        name: 'Revenue & Growth',
        description: 'Drives revenue, pipeline generation, and customer acquisition across geographies.',
        headcount: 32,
        cxo: { name: 'Vikram Mehta', title: 'Chief Revenue Officer' },
        directors: [
          { name: 'Kiran Batra', title: 'Director - Enterprise Sales' },
          { name: 'Abhishek Patel', title: 'Director - Mid-Market Sales' },
        ],
        seniorManagers: [
          { name: 'Sonal Thakur', title: 'Senior Sales Manager - West' },
          { name: 'Farhan Shaikh', title: 'Senior Sales Manager - South' },
        ],
        managers: [
          { name: 'Prateek Ghosh', title: 'Regional Manager - Mumbai', teams: 2 },
          { name: 'Riya Narang', title: 'Regional Manager - Delhi NCR', teams: 2 },
          { name: 'Sahil D\'Souza', title: 'Inside Sales Manager', teams: 1 },
        ],
        leads: [
          { name: 'Ankit Tiwari', title: 'Sales Lead - BFSI', focus: 'Enterprise Accounts' },
          { name: 'Divya Saxena', title: 'Sales Lead - Tech Sector', focus: 'SaaS & Startups' },
          { name: 'Nishant Bose', title: 'BD Lead - Channel Partners', focus: 'Alliances' },
        ],
      },
      {
        id: 'people',
        name: 'People & Culture',
        description: 'Builds a people-first culture with focus on talent management, engagement, and compliance.',
        headcount: 24,
        cxo: { name: 'Leena Prakash', title: 'Chief People Officer' },
        directors: [
          { name: 'Mansi Sheth', title: 'Director - Talent Success' },
        ],
        seniorManagers: [
          { name: 'Arunima Bose', title: 'Senior HR Manager - Talent Development' },
          { name: 'Tarun Jha', title: 'Senior HR Manager - Total Rewards' },
        ],
        managers: [
          { name: 'Shweta Purohit', title: 'HR Business Partner - Tech', teams: 1 },
          { name: 'Mohan Krishnan', title: 'HR Business Partner - Commercial', teams: 1 },
          { name: 'Rashmi Nair', title: 'L&D Manager', teams: 1 },
        ],
        leads: [
          { name: 'Deepika Kaul', title: 'Lead - Talent Acquisition', focus: 'Strategic Hiring' },
          { name: 'Prerna Dixit', title: 'Lead - Culture & Engagement', focus: 'Programs' },
        ],
      },
      {
        id: 'finance',
        name: 'Finance & Governance',
        description: 'Ensures financial health, statutory compliance, and strategic investments.',
        headcount: 18,
        cxo: { name: 'Raghav Biyani', title: 'Chief Finance Officer' },
        directors: [
          { name: 'Vivaan Kapoor', title: 'Director - Financial Planning & Analysis' },
          { name: 'Sanjana Rao', title: 'Director - Compliance & Controls' },
        ],
        seniorManagers: [
          { name: 'Nitin Sawant', title: 'Senior Finance Manager - Controllership' },
          { name: 'Jasleen Arora', title: 'Senior Finance Manager - Treasury' },
        ],
        managers: [
          { name: 'Kunal Chopra', title: 'Finance Manager - Revenue Assurance', teams: 1 },
          { name: 'Priti Iyer', title: 'Finance Manager - Payroll & Benefits', teams: 1 },
        ],
        leads: [
          { name: 'Aakash Jain', title: 'Lead - Statutory Compliance', focus: 'Regulatory Edge' },
          { name: 'Bhavna Sethi', title: 'Lead - Business Finance', focus: 'Unit Economics' },
        ],
      },
    ],
  },
  employeePortal: {
    announcements: [
      { id: 'ann1', title: 'FY25 Kickoff Townhall', date: '2025-01-21', type: 'event', audience: 'All employees' },
      { id: 'ann2', title: 'Cybersecurity Refresher Due Friday', date: '2025-01-17', type: 'reminder', audience: 'Product & Tech' },
      { id: 'ann3', title: 'People Pulse Survey Results', date: '2025-01-15', type: 'update', audience: 'Company-wide' },
    ],
    tasks: [
      { id: 'task1', label: 'Submit travel reimbursement', due: 'Due in 2 days', status: 'pending' },
      { id: 'task2', label: 'Complete OKR checkpoint', due: 'This week', status: 'in-progress' },
      { id: 'task3', label: 'Upload quarterly goals', due: 'Completed', status: 'done' },
    ],
    leaveBalances: [
      { type: 'Casual Leave', balance: 4 },
      { type: 'Sick Leave', balance: 3 },
      { type: 'Earned Leave', balance: 5 },
      { type: 'Work From Home', balance: 2 },
      { type: 'Compensatory Off', balance: 1 },
      { type: 'LOP', balance: 0 },
    ],
    attendanceLast7Days: [
      { day: 'Mon', status: 'Present', hours: 8.2 },
      { day: 'Tue', status: 'Present', hours: 7.9 },
      { day: 'Wed', status: 'WFH', hours: 8.5 },
      { day: 'Thu', status: 'Present', hours: 8.1 },
      { day: 'Fri', status: 'Present', hours: 6.4 },
      { day: 'Sat', status: 'Weekend', hours: 0 },
      { day: 'Sun', status: 'Weekend', hours: 0 },
    ],
    quickStats: {
      leaveBalance: 12,
      upcomingShift: '09:30 AM Tomorrow',
      pendingRequests: 1,
      lastPayout: 'Jan 5, 2025',
    },
    assets: [
      { name: 'MacBook Pro 14"', tag: 'IT-45821', status: 'In Use' },
      { name: 'Access Card HQ-12F', tag: 'SEC-1893', status: 'In Use' },
    ],
    recentRequests: [
      { id: 'REQ-2831', type: 'Leave', status: 'Approved', submitted: 'Jan 12', details: '2 days - Personal errand' },
      { id: 'REQ-2842', type: 'WFH', status: 'Pending', submitted: 'Jan 15', details: 'Client calls from home' },
      { id: 'EXP-9921', type: 'Expense', status: 'Paid', submitted: 'Jan 08', details: 'Client dinner - ₹2,150' },
    ],
    learningJourneys: [
      { id: 'lj1', title: 'AI for HR Leaders', progress: 68, due: 'Feb 28', badge: 'In progress' },
      { id: 'lj2', title: 'Advanced Presentation Storytelling', progress: 42, due: 'Mar 12', badge: 'New' },
      { id: 'lj3', title: 'Wellbeing Micro-habits', progress: 90, due: 'Feb 05', badge: 'Almost done' },
    ],
    kudos: [
      { id: 'k1', from: 'Priya S.', message: 'Thanks for stepping in on the West Coast client review!', date: 'Jan 17' },
      { id: 'k2', from: 'Rohit P.', message: 'Your demo deck helped us close the enterprise pilot.', date: 'Jan 14' },
    ],
    communityHighlights: [
      { id: 'ch1', title: 'Wellness Wednesday: Breathwork workshop', time: 'Jan 24 • 4:00 PM', location: 'Townhall' },
      { id: 'ch2', title: 'Product Jam: Ideas that shipped in Q4', time: 'Jan 27 • 11:30 AM', location: 'Zoom' },
    ],
  },
};
