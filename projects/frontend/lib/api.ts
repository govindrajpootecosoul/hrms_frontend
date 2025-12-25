import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Mock data for client-side use when backend is not available
export const mockData = {
  dashboard: {
    stats: {
      totalEmployees: 142,
      activeEmployees: 138,
      todayAttendance: 135,
      pendingLeaves: 7,
      upcomingBirthdays: 12,
    },
    departmentDistribution: [
      { name: 'Engineering', value: 45 },
      { name: 'Sales', value: 28 },
      { name: 'Human Resources', value: 18 },
      { name: 'Finance', value: 22 },
      { name: 'Marketing', value: 15 },
      { name: 'Operations', value: 14 },
    ],
    attendanceTrends: [
      { date: '2025-01-08', present: 132, absent: 6 }, // Monday
      { date: '2025-01-09', present: 130, absent: 8 }, // Tuesday
      { date: '2025-01-10', present: 135, absent: 3 }, // Wednesday
      { date: '2025-01-11', present: 132, absent: 6 }, // Thursday
      { date: '2025-01-12', present: 138, absent: 0 }, // Friday
      { date: '2025-01-13', present: 0, absent: 0 }, // Saturday (will be filtered out)
      { date: '2025-01-14', present: 0, absent: 0 }, // Sunday (will be filtered out)
      { date: '2025-01-15', present: 135, absent: 3 }, // Monday
      { date: '2025-01-16', present: 134, absent: 4 }, // Tuesday
      { date: '2025-01-17', present: 137, absent: 1 }, // Wednesday
      { date: '2025-01-18', present: 136, absent: 2 }, // Thursday
      { date: '2025-01-19', present: 138, absent: 0 }, // Friday
    ],
    recentActivities: [
      { id: '1', type: 'New Hire', description: 'Jane Smith joined Sales department as Sales Executive', date: '2025-01-15' },
      { id: '2', type: 'Leave Approved', description: 'John Doe\'s leave request approved for 3 days', date: '2025-01-14' },
      { id: '3', type: 'Promotion', description: 'Sarah Johnson promoted to Senior Engineering Manager', date: '2025-01-13' },
      { id: '4', type: 'New Hire', description: 'Michael Chen joined Engineering team as Full Stack Developer', date: '2025-01-12' },
      { id: '5', type: 'Department Change', description: 'Robert Wilson transferred from Sales to Marketing', date: '2025-01-11' },
      { id: '6', type: 'Leave Approved', description: 'Emily Davis leave request approved for medical reasons', date: '2025-01-10' },
      { id: '7', type: 'New Hire', description: 'Lisa Anderson joined Finance department as Financial Analyst', date: '2025-01-09' },
      { id: '8', type: 'Promotion', description: 'David Brown promoted to Team Lead in Engineering', date: '2025-01-08' },
      { id: '9', type: 'New Hire', description: 'Alex Kumar joined HR team as Talent Acquisition Specialist', date: '2025-01-07' },
      { id: '10', type: 'Resignation', description: 'Mark Thompson resigned from Operations department', date: '2025-01-06' },
      { id: '11', type: 'Leave Approved', description: 'Priya Sharma leave request approved for personal work', date: '2025-01-05' },
      { id: '12', type: 'New Hire', description: 'Kevin Lee joined Marketing team as Digital Marketing Manager', date: '2025-01-04' },
      { id: '13', type: 'Salary Revision', description: 'Annual salary revision completed for all employees', date: '2025-01-03' },
      { id: '14', type: 'Award', description: 'Employee of the Month: Rachel Green from Finance', date: '2025-01-02' },
      { id: '15', type: 'Training Completed', description: '15 employees completed Cybersecurity Certification', date: '2025-01-01' },
      { id: '16', type: 'Policy Update', description: 'New Work From Home policy implemented', date: '2024-12-30' },
    ],
    upcomingEvents: [
      { id: '1', type: 'Interview', title: 'Interview - Senior Software Engineer', date: '2025-01-20', time: '10:00 AM' },
      { id: '2', type: 'Training', title: 'HR Training Session - New Policies', date: '2025-01-22', time: '2:00 PM' },
      { id: '3', type: 'Meeting', title: 'Quarterly Review Meeting - Q4 2024', date: '2025-01-18', time: '11:00 AM' },
      { id: '4', type: 'Workshop', title: 'Leadership Development Workshop', date: '2025-01-25', time: '9:00 AM' },
      { id: '5', type: 'Interview', title: 'Interview - Sales Executive Position', date: '2025-01-19', time: '3:00 PM' },
      { id: '6', type: 'Training', title: 'Product Training Session - New Features', date: '2025-01-23', time: '10:00 AM' },
      { id: '7', type: 'Meeting', title: 'Team Building Activity - Outdoor Event', date: '2025-01-26', time: '2:00 PM' },
      { id: '8', type: 'Workshop', title: 'Digital Marketing Workshop - SEO & SEM', date: '2025-01-24', time: '1:00 PM' },
      { id: '9', type: 'Interview', title: 'Interview - Finance Manager', date: '2025-01-21', time: '11:00 AM' },
      { id: '10', type: 'Training', title: 'Cybersecurity Awareness Training', date: '2025-01-27', time: '3:00 PM' },
      { id: '11', type: 'Meeting', title: 'All Hands Meeting - Company Updates', date: '2025-01-17', time: '4:00 PM' },
      { id: '12', type: 'Workshop', title: 'Agile Methodology Workshop', date: '2025-01-28', time: '10:00 AM' },
      { id: '13', type: 'Announcement', title: 'Company Annual Day Celebration', date: '2025-01-31', time: '6:00 PM' },
      { id: '14', type: 'Training', title: 'Data Analytics Training - Power BI', date: '2025-01-29', time: '2:00 PM' },
      { id: '15', type: 'Meeting', title: 'Board Meeting - Strategic Planning', date: '2025-01-16', time: '10:00 AM' },
      { id: '16', type: 'Event', title: 'Hackathon 2025 - Innovation Challenge', date: '2025-02-01', time: '9:00 AM' },
    ],
    monthlyHeadcounts: [
      { month: 'Jan 2024', headcount: 125 },
      { month: 'Feb 2024', headcount: 128 },
      { month: 'Mar 2024', headcount: 130 },
      { month: 'Apr 2024', headcount: 132 },
      { month: 'May 2024', headcount: 135 },
      { month: 'Jun 2024', headcount: 138 },
      { month: 'Jul 2024', headcount: 140 },
      { month: 'Aug 2024', headcount: 139 },
      { month: 'Sep 2024', headcount: 141 },
      { month: 'Oct 2024', headcount: 140 },
      { month: 'Nov 2024', headcount: 142 },
      { month: 'Dec 2024', headcount: 142 },
      { month: 'Jan 2025', headcount: 142 },
    ],
    upcomingLeavesAndFestivals: [
      { id: '1', type: 'Leave', name: 'John Doe', date: '2025-01-20', reason: 'Personal Leave', department: 'Engineering' },
      { id: '2', type: 'Festival', name: 'Republic Day', date: '2025-01-26', reason: 'National Holiday', department: 'All' },
      { id: '3', type: 'Leave', name: 'Jane Smith', date: '2025-01-22', reason: 'Sick Leave', department: 'Sales' },
      { id: '4', type: 'Leave', name: 'Mike Johnson', date: '2025-01-25', reason: 'Casual Leave', department: 'Finance' },
      { id: '5', type: 'Festival', name: 'Makar Sankranti', date: '2025-01-14', reason: 'Regional Holiday', department: 'All' },
      { id: '6', type: 'Leave', name: 'Sarah Williams', date: '2025-01-18', reason: 'Earned Leave', department: 'Marketing' },
      { id: '7', type: 'Leave', name: 'David Brown', date: '2025-01-21', reason: 'Personal Leave', department: 'Engineering' },
      { id: '8', type: 'Festival', name: 'Pongal', date: '2025-01-15', reason: 'Regional Holiday', department: 'All' },
      { id: '9', type: 'Leave', name: 'Emily Davis', date: '2025-01-24', reason: 'Sick Leave', department: 'Human Resources' },
      { id: '10', type: 'Leave', name: 'Robert Wilson', date: '2025-01-19', reason: 'Casual Leave', department: 'Sales' },
      { id: '11', type: 'Festival', name: 'Basant Panchami', date: '2025-02-03', reason: 'Regional Holiday', department: 'All' },
      { id: '12', type: 'Leave', name: 'Lisa Anderson', date: '2025-01-23', reason: 'Personal Leave', department: 'Finance' },
      { id: '13', type: 'Leave', name: 'Alex Kumar', date: '2025-01-27', reason: 'Earned Leave', department: 'Human Resources' },
      { id: '14', type: 'Festival', name: 'Maha Shivaratri', date: '2025-02-26', reason: 'Regional Holiday', department: 'All' },
      { id: '15', type: 'Leave', name: 'Priya Sharma', date: '2025-01-28', reason: 'Sick Leave', department: 'Engineering' },
      { id: '16', type: 'Leave', name: 'Kevin Lee', date: '2025-01-29', reason: 'Casual Leave', department: 'Marketing' },
    ],
    birthdayCalendar: [
      { id: '1', name: 'John Doe', date: '2025-01-15', department: 'Engineering' },
      { id: '2', name: 'Jane Smith', date: '2025-01-20', department: 'Sales' },
      { id: '3', name: 'Mike Johnson', date: '2025-01-25', department: 'Finance' },
      { id: '4', name: 'Sarah Williams', date: '2025-01-18', department: 'Marketing' },
      { id: '5', name: 'David Brown', date: '2025-01-22', department: 'Engineering' },
      { id: '6', name: 'Emily Davis', date: '2025-01-28', department: 'Human Resources' },
      { id: '7', name: 'Robert Wilson', date: '2025-01-16', department: 'Sales' },
      { id: '8', name: 'Lisa Anderson', date: '2025-01-30', department: 'Finance' },
      { id: '9', name: 'Alex Kumar', date: '2025-01-19', department: 'Human Resources' },
      { id: '10', name: 'Priya Sharma', date: '2025-01-24', department: 'Engineering' },
      { id: '11', name: 'Kevin Lee', date: '2025-01-17', department: 'Marketing' },
      { id: '12', name: 'Mark Thompson', date: '2025-01-26', department: 'Operations' },
      { id: '13', name: 'Rachel Green', date: '2025-01-21', department: 'Finance' },
      { id: '14', name: 'Tom Anderson', date: '2025-01-23', department: 'Engineering' },
      { id: '15', name: 'Sophie Martin', date: '2025-01-27', department: 'Sales' },
      { id: '16', name: 'James Wilson', date: '2025-01-29', department: 'Marketing' },
    ],
    workAnniversaryCalendar: [
      { id: 'wa1', name: 'John Doe', date: '2020-01-15', department: 'Engineering', years: 5 },
      { id: 'wa2', name: 'Jane Smith', date: '2021-01-20', department: 'Sales', years: 4 },
      { id: 'wa3', name: 'Mike Johnson', date: '2019-01-25', department: 'Finance', years: 6 },
      { id: 'wa4', name: 'Sarah Williams', date: '2022-01-18', department: 'Marketing', years: 3 },
      { id: 'wa5', name: 'David Brown', date: '2020-01-22', department: 'Engineering', years: 5 },
      { id: 'wa6', name: 'Emily Davis', date: '2021-01-28', department: 'Human Resources', years: 4 },
      { id: 'wa7', name: 'Robert Wilson', date: '2018-01-16', department: 'Sales', years: 7 },
      { id: 'wa8', name: 'Lisa Anderson', date: '2023-01-30', department: 'Finance', years: 2 },
      { id: 'wa9', name: 'Alex Kumar', date: '2020-01-19', department: 'Human Resources', years: 5 },
      { id: 'wa10', name: 'Priya Sharma', date: '2019-01-24', department: 'Engineering', years: 6 },
      { id: 'wa11', name: 'Kevin Lee', date: '2022-01-17', department: 'Marketing', years: 3 },
      { id: 'wa12', name: 'Mark Thompson', date: '2021-01-26', department: 'Operations', years: 4 },
      { id: 'wa13', name: 'Rachel Green', date: '2020-01-21', department: 'Finance', years: 5 },
      { id: 'wa14', name: 'Tom Anderson', date: '2019-01-23', department: 'Engineering', years: 6 },
      { id: 'wa15', name: 'Sophie Martin', date: '2022-01-27', department: 'Sales', years: 3 },
      { id: 'wa16', name: 'James Wilson', date: '2021-01-29', department: 'Marketing', years: 4 },
    ],
  },
  orgChart: {
    summary: {
      totalDepartments: 6,
      totalEmployeesMapped: 142,
      cxoCount: 5,
      directorCount: 12,
      managerCount: 24,
    },
    treemap: [
      {
        name: 'CXO Leadership',
        children: [
          {
            name: 'Chief Executive Officer',
            role: 'CEO',
            department: 'Corporate',
            children: [
              { name: 'Chief Technology Officer', role: 'CTO', department: 'Technology', value: 6 },
              { name: 'Chief People Officer', role: 'CPO', department: 'People Ops', value: 5 },
              { name: 'Chief Revenue Officer', role: 'CRO', department: 'Revenue', value: 5 },
              { name: 'Chief Finance Officer', role: 'CFO', department: 'Finance', value: 4 },
              { name: 'Chief Operations Officer', role: 'COO', department: 'Operations', value: 4 },
            ],
          },
        ],
      },
      {
        name: 'Director Layer',
        children: [
          { name: 'Engineering Directors', department: 'Engineering', value: 3 },
          { name: 'Product & Design Directors', department: 'Product', value: 2 },
          { name: 'Sales Directors', department: 'Sales', value: 2 },
          { name: 'Customer Success Directors', department: 'Customer Success', value: 2 },
          { name: 'People & Culture Directors', department: 'Human Resources', value: 1 },
          { name: 'Finance Directors', department: 'Finance', value: 2 },
          { name: 'Operations Directors', department: 'Operations', value: 2 },
        ],
      },
      {
        name: 'Manager Layer',
        children: [
          { name: 'Senior Engineering Managers', department: 'Engineering', value: 6 },
          { name: 'Senior Product Managers', department: 'Product', value: 3 },
          { name: 'Regional Sales Managers', department: 'Sales', value: 4 },
          { name: 'Customer Success Managers', department: 'Customer Success', value: 3 },
          { name: 'HR Business Partners', department: 'Human Resources', value: 2 },
          { name: 'Finance Managers', department: 'Finance', value: 3 },
          { name: 'Operations Managers', department: 'Operations', value: 3 },
        ],
      },
    ],
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
      {
        id: 'operations',
        name: 'Operations & Delivery',
        description: 'Oversees customer success, project delivery, and support operations.',
        headcount: 30,
        cxo: { name: 'Mehul Arora', title: 'Chief Operations Officer' },
        directors: [
          { name: 'Payal Chatterjee', title: 'Director - Customer Success' },
          { name: 'Siddharth Bedi', title: 'Director - Delivery Excellence' },
        ],
        seniorManagers: [
          { name: 'Keshav Prasad', title: 'Senior Manager - Customer Experience' },
          { name: 'Mitali Anand', title: 'Senior Manager - Program Delivery' },
        ],
        managers: [
          { name: 'Rohan Kulkarni', title: 'Success Manager - Strategic Accounts', teams: 2 },
          { name: 'Sanya Kapoor', title: 'Success Manager - SMB Accounts', teams: 2 },
          { name: 'Hemant Chopra', title: 'Support Operations Manager', teams: 1 },
        ],
        leads: [
          { name: 'Simran Gill', title: 'Lead - Onboarding', focus: 'Implementation' },
          { name: 'Vivek Nair', title: 'Lead - Support QA', focus: 'Service Quality' },
        ],
      },
      {
        id: 'marketing',
        name: 'Marketing & Brand',
        description: 'Shapes brand storytelling, demand generation, and product marketing narratives.',
        headcount: 20,
        cxo: { name: 'Ritika De', title: 'Chief Marketing Officer' },
        directors: [
          { name: 'Anurag Sethi', title: 'Director - Demand Generation' },
        ],
        seniorManagers: [
          { name: 'Ipsita Roy', title: 'Senior Marketing Manager - Digital' },
          { name: 'Rudra Patel', title: 'Senior Marketing Manager - Product Marketing' },
        ],
        managers: [
          { name: 'Kavya Jain', title: 'Campaign Manager', teams: 1 },
          { name: 'Sidharth Khanna', title: 'Brand Communications Manager', teams: 1 },
          { name: 'Tanya Oberoi', title: 'Events & Partnerships Manager', teams: 1 },
        ],
        leads: [
          { name: 'Harini Rao', title: 'Lead - Content Strategy', focus: 'Thought Leadership' },
          { name: 'Puneet Kaur', title: 'Lead - Growth Marketing', focus: 'Lifecycle Journeys' },
        ],
      },
    ],
  },
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
    {
      id: '3',
      employeeId: 'EMP003',
      name: 'Mike Davis',
      jobTitle: 'Sales Director',
      department: 'Sales',
      location: 'Los Angeles',
      status: 'Active',
      tenure: '1 year 6 months',
      email: 'mike.davis@company.com',
      phone: '+1 234-567-8902',
      joiningDate: '2023-07-20',
    },
    {
      id: '4',
      employeeId: 'EMP004',
      name: 'Lisa Wilson',
      jobTitle: 'Marketing Specialist',
      department: 'Marketing',
      location: 'Miami',
      status: 'Active',
      tenure: '8 months',
      email: 'lisa.wilson@company.com',
      phone: '+1 234-567-8903',
      joiningDate: '2024-05-15',
    },
    {
      id: '5',
      employeeId: 'EMP005',
      name: 'David Brown',
      jobTitle: 'Finance Analyst',
      department: 'Finance',
      location: 'Boston',
      status: 'Inactive',
      tenure: '2 years 1 month',
      email: 'david.brown@company.com',
      phone: '+1 234-567-8904',
      joiningDate: '2022-12-01',
    },
    {
      id: '6',
      employeeId: 'EMP006',
      name: 'Emily Chen',
      jobTitle: 'Product Manager',
      department: 'IT',
      location: 'New York',
      status: 'Active',
      tenure: '1 year 2 months',
      email: 'emily.chen@company.com',
      phone: '+1 234-567-8905',
      joiningDate: '2023-11-10',
    },
    {
      id: '7',
      employeeId: 'EMP007',
      name: 'Robert Taylor',
      jobTitle: 'Operations Manager',
      department: 'Operations',
      location: 'Chicago',
      status: 'Active',
      tenure: '4 years 5 months',
      email: 'robert.taylor@company.com',
      phone: '+1 234-567-8906',
      joiningDate: '2020-08-05',
    },
    {
      id: '8',
      employeeId: 'EMP008',
      name: 'Jennifer Martinez',
      jobTitle: 'Business Analyst',
      department: 'Finance',
      location: 'Boston',
      status: 'Active',
      tenure: '1 year 11 months',
      email: 'jennifer.martinez@company.com',
      phone: '+1 234-567-8907',
      joiningDate: '2023-02-14',
    },
    {
      id: '9',
      employeeId: 'EMP009',
      name: 'James Anderson',
      jobTitle: 'Sales Executive',
      department: 'Sales',
      location: 'Los Angeles',
      status: 'Active',
      tenure: '6 months',
      email: 'james.anderson@company.com',
      phone: '+1 234-567-8908',
      joiningDate: '2024-07-01',
    },
    {
      id: '10',
      employeeId: 'EMP010',
      name: 'Amanda White',
      jobTitle: 'Content Writer',
      department: 'Marketing',
      location: 'Miami',
      status: 'Active',
      tenure: '1 year 4 months',
      email: 'amanda.white@company.com',
      phone: '+1 234-567-8909',
      joiningDate: '2023-09-20',
    },
  ],
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
  expensesModule: {
    overview: {
      kpis: {
        totalClaims: 128,
        pendingApprovals: 18,
        approvedClaims: 92,
        rejectedClaims: 6,
        outstandingAdvances: 18500,
        settledAmount: 74200,
        avgReimbursementTime: 4.2,
      },
      categoryBreakdown: [
        { name: 'Travel', value: 42000 },
        { name: 'Meals', value: 15800 },
        { name: 'Client Visit', value: 28600 },
        { name: 'Office Supplies', value: 11200 },
        { name: 'Others', value: 5400 },
      ],
      monthlyTrends: [
        { month: 'Aug', raised: 42, settled: 35 },
        { month: 'Sep', raised: 48, settled: 44 },
        { month: 'Oct', raised: 52, settled: 50 },
        { month: 'Nov', raised: 60, settled: 55 },
        { month: 'Dec', raised: 58, settled: 57 },
        { month: 'Jan', raised: 63, settled: 49 },
      ],
      departmentSpend: [
        { department: 'Sales', amount: 38000 },
        { department: 'Engineering', amount: 24500 },
        { department: 'Marketing', amount: 19800 },
        { department: 'HR', amount: 8600 },
        { department: 'Operations', amount: 21400 },
      ],
      advanceComparison: [
        { month: 'Sep', advance: 20000, actual: 18800 },
        { month: 'Oct', advance: 24500, actual: 23800 },
        { month: 'Nov', advance: 28000, actual: 27500 },
        { month: 'Dec', advance: 31000, actual: 30100 },
        { month: 'Jan', advance: 33500, actual: 31900 },
      ],
      recentClaims: [
        { id: 'CLM010', employee: 'John Doe', type: 'Non-Advance', amount: 1200, date: '2025-01-12', status: 'Pending Finance' },
        { id: 'CLM009', employee: 'Jane Smith', type: 'Advance Settlement', amount: 4600, date: '2025-01-19', status: 'Pending HR' },
        { id: 'CLM008', employee: 'Emily Chen', type: 'Non-Advance', amount: 980, date: '2025-01-18', status: 'Pending Manager' },
        { id: 'CLM007', employee: 'Robert Taylor', type: 'Non-Advance', amount: 1500, date: '2025-01-16', status: 'Approved' },
        { id: 'CLM006', employee: 'Mike Davis', type: 'Non-Advance', amount: 890, date: '2025-01-14', status: 'Rejected' },
      ],
    },
    expenses: [
      {
        id: 'EXP001',
        employeeId: 'EMP003',
        employeeName: 'John Doe',
        category: 'Travel',
        amount: 1200,
        date: '2025-01-12',
        paymentMode: 'UPI',
        projectCode: 'PR-391',
        description: 'Client visit travel',
        receiptUrl: '/receipts/exp001.pdf',
        status: 'Pending',
      },
      {
        id: 'EXP002',
        employeeId: 'EMP004',
        employeeName: 'Jane Smith',
        category: 'Meals',
        amount: 450,
        date: '2025-01-10',
        paymentMode: 'Card',
        description: 'Team dinner with client',
        status: 'Approved',
      },
      {
        id: 'EXP003',
        employeeId: 'EMP002',
        employeeName: 'Department Manager',
        category: 'Office Supplies',
        amount: 780,
        date: '2025-01-08',
        paymentMode: 'Cash',
        description: 'Printer cartridges',
        status: 'Paid',
      },
      {
        id: 'EXP004',
        employeeId: 'EMP005',
        employeeName: 'Sales Manager',
        category: 'Client Visit',
        amount: 2150,
        date: '2025-01-05',
        paymentMode: 'Bank Transfer',
        projectCode: 'CL-552',
        description: 'Client entertainment',
        status: 'Rejected',
      },
    ],
    advances: [
      {
        id: 'ADV001',
        employeeId: 'EMP004',
        employeeName: 'Jane Smith',
        requestedAmount: 5000,
        purpose: 'Outstation Travel - Mumbai',
        requestedOn: '2025-01-02',
        expectedStartDate: '2025-01-15',
        expectedEndDate: '2025-01-18',
        mode: 'Bank Transfer',
        status: 'Released',
        releasedAmount: 5000,
        settlement: {
          actualExpense: 4600,
          balance: 400,
          balanceType: 'Refund',
        },
      },
      {
        id: 'ADV002',
        employeeId: 'EMP003',
        employeeName: 'John Doe',
        requestedAmount: 3200,
        purpose: 'Conference Attendance',
        requestedOn: '2025-01-05',
        expectedStartDate: '2025-01-20',
        expectedEndDate: '2025-01-22',
        mode: 'Bank Transfer',
        status: 'Approved',
      },
    ],
    claims: [
      {
        id: 'CLM009',
        employeeId: 'EMP004',
        employeeName: 'Jane Smith',
        type: 'Advance Settlement',
        category: 'Travel',
        totalExpense: 4600,
        againstAdvance: 'ADV001',
        pendingAmount: 400,
        status: 'Pending HR Approval',
        submittedOn: '2025-01-19',
      },
      {
        id: 'CLM010',
        employeeId: 'EMP003',
        employeeName: 'John Doe',
        type: 'Non-Advance',
        category: 'Internet',
        totalExpense: 1200,
        pendingAmount: 0,
        status: 'Pending Finance Approval',
        submittedOn: '2025-01-12',
      },
    ],
    approvals: {
      manager: [
        { id: 'APM001', employeeName: 'Emily Chen', claimId: 'CLM011', amount: 980, stage: 'Manager', submittedOn: '2025-01-18', status: 'Pending', policyFlags: ['Over meal limit by ₹80'] },
      ],
      hr: [
        { id: 'APH001', employeeName: 'Jane Smith', claimId: 'CLM009', amount: 4600, stage: 'HR', submittedOn: '2025-01-19', status: 'Pending' },
      ],
      finance: [
        { id: 'APF001', employeeName: 'John Doe', claimId: 'CLM010', amount: 1200, stage: 'Finance', submittedOn: '2025-01-12', status: 'Pending' },
      ],
    },
    policies: {
      categories: [
        { id: 'CAT001', name: 'Travel', limitPerDay: 3000, limitPerMonth: 20000, requiresReceipt: true, paymentModes: ['Card', 'UPI', 'Bank Transfer'] },
        { id: 'CAT002', name: 'Meals', limitPerDay: 1200, limitPerMonth: 8000, requiresReceipt: true, paymentModes: ['Card', 'Cash', 'UPI'] },
        { id: 'CAT003', name: 'Office Supplies', limitPerDay: 5000, limitPerMonth: 15000, requiresReceipt: true, paymentModes: ['Card', 'Bank Transfer'] },
      ],
      paymentModes: ['Cash', 'Card', 'UPI', 'Bank Transfer'],
      travelPolicy: {
        mileageRate: 12,
        lodgingCap: 4500,
        mealCap: 1200,
        internationalAllowance: 80,
      },
      autoFlagRules: [
        { id: 'RULE001', name: 'Exceeds Category Limit', condition: 'Amount > category.limitPerDay', action: 'Flag for HR review' },
        { id: 'RULE002', name: 'Receipt Missing', condition: 'Receipt not uploaded', action: 'Flag for employee follow-up' },
      ],
    },
    reports: {
      generated: 68,
      pending: 7,
      avgTurnaround: 3.4,
      violationCount: 5,
      types: [
        { id: 'expense-category', name: 'Category-wise expense report', description: 'Breakdown of expenses by categories' },
        { id: 'expense-employee', name: 'Employee-wise expense report', description: 'Expenses raised per employee' },
        { id: 'expense-department', name: 'Department-wise monthly spend', description: 'Department spend trends' },
        { id: 'advance-outstanding', name: 'Advance outstanding report', description: 'Track pending advances' },
        { id: 'turnaround-time', name: 'Reimbursement turnaround time', description: 'Cycle time analysis' },
        { id: 'policy-violation', name: 'Policy violation report', description: 'Flagged expenses summary' },
      ],
    },
  },
};

// Helper function to use mock data when backend is unavailable
export async function apiCall(endpoint: string, options: any = {}) {
  try {
    // Try real API call first
    if (options.method === 'GET') {
      return await api.get(endpoint);
    } else if (options.method === 'POST') {
      return await api.post(endpoint, options.data);
    }
    return await api.request({ url: endpoint, ...options });
  } catch (error: any) {
    // If backend is not available, use mock data
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      console.warn('Backend not available, using mock data for:', endpoint);
      
      // Map endpoints to mock data
      if (endpoint === '/dashboard/stats') {
        return { data: mockData.dashboard.stats };
      }
      if (endpoint === '/dashboard/department-distribution') {
        return { data: mockData.dashboard.departmentDistribution };
      }
      if (endpoint === '/dashboard/attendance-trends') {
        return { data: mockData.dashboard.attendanceTrends };
      }
      if (endpoint === '/dashboard/recent-activities') {
        return { data: mockData.dashboard.recentActivities };
      }
      if (endpoint === '/dashboard/upcoming-events') {
        return { data: mockData.dashboard.upcomingEvents };
      }
      if (endpoint === '/org-chart') {
        return { data: mockData.orgChart };
      }
      if (endpoint === '/employees') {
        return { data: mockData.employees };
      }
      if (endpoint === '/expenses/overview') {
        return { data: mockData.expensesModule.overview };
      }
      if (endpoint === '/expenses') {
        return { data: mockData.expensesModule.expenses };
      }
      if (endpoint === '/expenses/advances') {
        return { data: mockData.expensesModule.advances };
      }
      if (endpoint === '/expenses/claims') {
        return { data: mockData.expensesModule.claims };
      }
      if (endpoint === '/expenses/approvals') {
        return { data: mockData.expensesModule.approvals };
      }
      if (endpoint === '/expenses/policies') {
        return { data: mockData.expensesModule.policies };
      }
      if (endpoint === '/expenses/reports/summary') {
        return { data: mockData.expensesModule.reports };
      }
      
      // Return empty array for list endpoints
      return { data: [] };
    }
    throw error;
  }
}

export default api;
