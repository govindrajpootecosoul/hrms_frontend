'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface Candidate {
  id: string;
  candidateName: string;
  contactNumber: string;
  email: string;
  currentOrganisation: string;
  education: string;
  totalExperience: string;
  assignedTo: string;
  assignDate: string;
  status: string;
  callingDate?: string;
  currentCTCFixed?: number;
  currentCTCInHand?: number;
  expectedCTC?: number;
  noticePeriod?: string;
  communicationSkills?: string;
  currentLocation?: string;
  willingToWorkInStartup?: string;
  recruiterFeedback?: string;
  interviewerFeedback?: string;
  remark?: string;
  // Recruitment & Hiring specific
  hiringStatus?: 'Hired' | 'Rejected' | 'Awaiting';
  // Onboarding specific
  position?: string;
  offerStatus?: string;
  joiningDate?: string;
  onboardingStage?: string;
}

interface CandidateContextType {
  sourcingCandidates: Candidate[];
  hiringCandidates: Candidate[];
  onboardingCandidates: Candidate[];
  updateCandidateStatus: (candidateId: string, newStatus: string, tab: 'sourcing' | 'hiring' | 'onboarding') => void;
  updateHiringStatus: (candidateId: string, hiringStatus: 'Hired' | 'Rejected' | 'Awaiting') => void;
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (candidateId: string, updates: Partial<Candidate>) => void;
  deleteCandidate: (candidateId: string, tab: 'sourcing' | 'hiring' | 'onboarding') => void;
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined);

// Initial mock data
const initialSourcingCandidates: Candidate[] = [
  {
    id: '1',
    candidateName: 'John Doe',
    contactNumber: '+91 9876543210',
    email: 'john.doe@example.com',
    currentOrganisation: 'Tech Corp',
    education: 'B.Tech Computer Science',
    totalExperience: '5 years',
    assignedTo: 'Sarah Johnson',
    assignDate: '2025-01-10',
    status: 'Shortlisted',
    callingDate: '2025-01-08',
    currentCTCFixed: 800000,
    currentCTCInHand: 650000,
    expectedCTC: 1000000,
    noticePeriod: '30 days',
    communicationSkills: 'Good',
    currentLocation: 'Bangalore',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Strong technical background, good communication skills.',
    interviewerFeedback: 'Performed well in technical round.',
    remark: 'Suitable for Senior Developer role.',
  },
  {
    id: '2',
    candidateName: 'Jane Smith',
    contactNumber: '+91 9876543211',
    email: 'jane.smith@example.com',
    currentOrganisation: 'StartupXYZ',
    education: 'M.Tech Software Engineering',
    totalExperience: '3 years',
    assignedTo: 'Mike Wilson',
    assignDate: '2025-01-12',
    status: 'In Interview',
    callingDate: '2025-01-11',
    currentCTCFixed: 600000,
    currentCTCInHand: 500000,
    expectedCTC: 850000,
    noticePeriod: '15 days',
    communicationSkills: 'Excellent',
    currentLocation: 'Mumbai',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Excellent problem-solving skills.',
    interviewerFeedback: 'Pending',
    remark: 'Second round scheduled.',
  },
  {
    id: '4',
    candidateName: 'Emily Davis',
    contactNumber: '+91 9876543213',
    email: 'emily.davis@example.com',
    currentOrganisation: 'MidTech Solutions',
    education: 'B.Sc Computer Science',
    totalExperience: '2 years',
    assignedTo: 'Mike Wilson',
    assignDate: '2025-01-13',
    status: 'New',
    callingDate: '2025-01-13',
    currentCTCFixed: 400000,
    currentCTCInHand: 350000,
    expectedCTC: 600000,
    noticePeriod: '20 days',
    communicationSkills: 'Average',
    currentLocation: 'Pune',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Fresh perspective, eager to learn.',
    interviewerFeedback: 'Not scheduled yet',
    remark: 'Initial screening completed.',
  },
  {
    id: '5',
    candidateName: 'Michael Chen',
    contactNumber: '+91 9876543214',
    email: 'michael.chen@example.com',
    currentOrganisation: 'CloudTech',
    education: 'M.Tech Cloud Computing',
    totalExperience: '4 years',
    assignedTo: 'Sarah Johnson',
    assignDate: '2025-01-11',
    status: 'On Hold',
    callingDate: '2025-01-10',
    currentCTCFixed: 900000,
    currentCTCInHand: 720000,
    expectedCTC: 1200000,
    noticePeriod: '60 days',
    communicationSkills: 'Good',
    currentLocation: 'Hyderabad',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Good candidate but long notice period.',
    interviewerFeedback: 'On hold due to notice period.',
    remark: 'Will reconsider after notice period negotiation.',
  },
  {
    id: '9',
    candidateName: 'Robert Martinez',
    contactNumber: '+91 9876543218',
    email: 'robert.martinez@example.com',
    currentOrganisation: 'DevOps Solutions',
    education: 'B.Tech IT',
    totalExperience: '4 years',
    assignedTo: 'Sarah Johnson',
    assignDate: '2025-01-15',
    status: 'In Interview',
    callingDate: '2025-01-14',
    currentCTCFixed: 850000,
    currentCTCInHand: 680000,
    expectedCTC: 1100000,
    noticePeriod: '30 days',
    communicationSkills: 'Very Good',
    currentLocation: 'Bangalore',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Strong DevOps background with Kubernetes expertise.',
    interviewerFeedback: 'Technical round completed, awaiting HR round.',
    remark: 'Good candidate for DevOps Engineer role.',
  },
  {
    id: '10',
    candidateName: 'Priya Patel',
    contactNumber: '+91 9876543219',
    email: 'priya.patel@example.com',
    currentOrganisation: 'Mobile Apps Inc',
    education: 'B.E Computer Science',
    totalExperience: '3 years',
    assignedTo: 'Sarah Johnson',
    assignDate: '2025-01-16',
    status: 'In Interview',
    callingDate: '2025-01-15',
    currentCTCFixed: 700000,
    currentCTCInHand: 560000,
    expectedCTC: 950000,
    noticePeriod: '20 days',
    communicationSkills: 'Good',
    currentLocation: 'Bangalore',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Excellent mobile app developer with React Native experience.',
    interviewerFeedback: 'First round passed, second round scheduled.',
    remark: 'Promising candidate for Mobile Developer position.',
  },
  {
    id: '11',
    candidateName: 'Kevin Zhang',
    contactNumber: '+91 9876543220',
    email: 'kevin.zhang@example.com',
    currentOrganisation: 'AI Innovations',
    education: 'M.Tech AI/ML',
    totalExperience: '5 years',
    assignedTo: 'Mike Wilson',
    assignDate: '2025-01-14',
    status: 'In Interview',
    callingDate: '2025-01-13',
    currentCTCFixed: 1200000,
    currentCTCInHand: 960000,
    expectedCTC: 1500000,
    noticePeriod: '45 days',
    communicationSkills: 'Excellent',
    currentLocation: 'Mumbai',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Strong ML/AI background with TensorFlow expertise.',
    interviewerFeedback: 'Technical assessment completed, strong candidate.',
    remark: 'Suitable for Senior ML Engineer role.',
  },
  {
    id: '12',
    candidateName: 'Sneha Reddy',
    contactNumber: '+91 9876543221',
    email: 'sneha.reddy@example.com',
    currentOrganisation: 'E-commerce Platform',
    education: 'B.Tech Computer Science',
    totalExperience: '2 years',
    assignedTo: 'Mike Wilson',
    assignDate: '2025-01-17',
    status: 'In Interview',
    callingDate: '2025-01-16',
    currentCTCFixed: 550000,
    currentCTCInHand: 450000,
    expectedCTC: 750000,
    noticePeriod: '15 days',
    communicationSkills: 'Good',
    currentLocation: 'Mumbai',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Good frontend developer with Vue.js experience.',
    interviewerFeedback: 'Initial screening passed, technical round pending.',
    remark: 'Junior Developer position.',
  },
  {
    id: '13',
    candidateName: 'Rajesh Kumar',
    contactNumber: '+91 9876543222',
    email: 'rajesh.kumar@example.com',
    currentOrganisation: 'Banking Software',
    education: 'M.Tech Software Engineering',
    totalExperience: '6 years',
    assignedTo: 'David Lee',
    assignDate: '2025-01-13',
    status: 'In Interview',
    callingDate: '2025-01-12',
    currentCTCFixed: 1300000,
    currentCTCInHand: 1040000,
    expectedCTC: 1600000,
    noticePeriod: '30 days',
    communicationSkills: 'Very Good',
    currentLocation: 'Delhi',
    willingToWorkInStartup: 'No',
    recruiterFeedback: 'Experienced backend developer with Java Spring expertise.',
    interviewerFeedback: 'Technical rounds completed, awaiting final decision.',
    remark: 'Senior Backend Developer role.',
  },
  {
    id: '14',
    candidateName: 'Anita Desai',
    contactNumber: '+91 9876543223',
    email: 'anita.desai@example.com',
    currentOrganisation: 'Healthcare Tech',
    education: 'B.E Information Technology',
    totalExperience: '4 years',
    assignedTo: 'David Lee',
    assignDate: '2025-01-15',
    status: 'In Interview',
    callingDate: '2025-01-14',
    currentCTCFixed: 900000,
    currentCTCInHand: 720000,
    expectedCTC: 1150000,
    noticePeriod: '25 days',
    communicationSkills: 'Excellent',
    currentLocation: 'Delhi',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Strong full-stack developer with Node.js and React.',
    interviewerFeedback: 'First round completed successfully.',
    remark: 'Full Stack Developer position.',
  },
  {
    id: '15',
    candidateName: 'Vikram Singh',
    contactNumber: '+91 9876543224',
    email: 'vikram.singh@example.com',
    currentOrganisation: 'Gaming Studio',
    education: 'B.Tech Computer Science',
    totalExperience: '3 years',
    assignedTo: 'Emma Brown',
    assignDate: '2025-01-16',
    status: 'In Interview',
    callingDate: '2025-01-15',
    currentCTCFixed: 750000,
    currentCTCInHand: 600000,
    expectedCTC: 1000000,
    noticePeriod: '20 days',
    communicationSkills: 'Good',
    currentLocation: 'Hyderabad',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Game developer with Unity and C# experience.',
    interviewerFeedback: 'Technical assessment in progress.',
    remark: 'Game Developer role.',
  },
  {
    id: '16',
    candidateName: 'Meera Nair',
    contactNumber: '+91 9876543225',
    email: 'meera.nair@example.com',
    currentOrganisation: 'EdTech Platform',
    education: 'M.Tech Computer Science',
    totalExperience: '5 years',
    assignedTo: 'Emma Brown',
    assignDate: '2025-01-14',
    status: 'In Interview',
    callingDate: '2025-01-13',
    currentCTCFixed: 1100000,
    currentCTCInHand: 880000,
    expectedCTC: 1400000,
    noticePeriod: '30 days',
    communicationSkills: 'Very Good',
    currentLocation: 'Hyderabad',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Experienced in building scalable web applications.',
    interviewerFeedback: 'Multiple rounds completed, strong candidate.',
    remark: 'Senior Software Engineer position.',
  },
  {
    id: '17',
    candidateName: 'Arjun Menon',
    contactNumber: '+91 9876543226',
    email: 'arjun.menon@example.com',
    currentOrganisation: 'FinTech Startup',
    education: 'B.Tech Computer Engineering',
    totalExperience: '4 years',
    assignedTo: 'James Taylor',
    assignDate: '2025-01-15',
    status: 'In Interview',
    callingDate: '2025-01-14',
    currentCTCFixed: 950000,
    currentCTCInHand: 760000,
    expectedCTC: 1200000,
    noticePeriod: '25 days',
    communicationSkills: 'Good',
    currentLocation: 'Pune',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Backend developer with Python and Django expertise.',
    interviewerFeedback: 'Technical round scheduled.',
    remark: 'Backend Developer role.',
  },
  {
    id: '18',
    candidateName: 'Kavita Sharma',
    contactNumber: '+91 9876543227',
    email: 'kavita.sharma@example.com',
    currentOrganisation: 'Social Media Platform',
    education: 'B.E Computer Science',
    totalExperience: '3 years',
    assignedTo: 'James Taylor',
    assignDate: '2025-01-17',
    status: 'In Interview',
    callingDate: '2025-01-16',
    currentCTCFixed: 680000,
    currentCTCInHand: 544000,
    expectedCTC: 900000,
    noticePeriod: '15 days',
    communicationSkills: 'Excellent',
    currentLocation: 'Pune',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Frontend developer with Angular and TypeScript.',
    interviewerFeedback: 'Initial screening passed.',
    remark: 'Frontend Developer position.',
  },
  {
    id: '19',
    candidateName: 'Nikhil Agarwal',
    contactNumber: '+91 9876543228',
    email: 'nikhil.agarwal@example.com',
    currentOrganisation: 'Cloud Services',
    education: 'M.Tech Cloud Computing',
    totalExperience: '5 years',
    assignedTo: 'Lisa Anderson',
    assignDate: '2025-01-14',
    status: 'In Interview',
    callingDate: '2025-01-13',
    currentCTCFixed: 1150000,
    currentCTCInHand: 920000,
    expectedCTC: 1450000,
    noticePeriod: '30 days',
    communicationSkills: 'Very Good',
    currentLocation: 'Bangalore',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Cloud architect with AWS and Azure certifications.',
    interviewerFeedback: 'Technical assessment completed, excellent performance.',
    remark: 'Cloud Architect role.',
  },
  {
    id: '20',
    candidateName: 'Divya Iyer',
    contactNumber: '+91 9876543229',
    email: 'divya.iyer@example.com',
    currentOrganisation: 'SaaS Platform',
    education: 'B.Tech Information Technology',
    totalExperience: '3 years',
    assignedTo: 'Lisa Anderson',
    assignDate: '2025-01-16',
    status: 'In Interview',
    callingDate: '2025-01-15',
    currentCTCFixed: 720000,
    currentCTCInHand: 576000,
    expectedCTC: 950000,
    noticePeriod: '20 days',
    communicationSkills: 'Good',
    currentLocation: 'Bangalore',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Full-stack developer with MERN stack experience.',
    interviewerFeedback: 'First round completed, awaiting second round.',
    remark: 'Full Stack Developer position.',
  },
];

const initialHiringCandidates: Candidate[] = [
  {
    id: '6',
    candidateName: 'Alex Thompson',
    contactNumber: '+91 9876543215',
    email: 'alex.thompson@example.com',
    currentOrganisation: 'DataTech Solutions',
    education: 'M.Tech Data Science',
    totalExperience: '6 years',
    assignedTo: 'Sarah Johnson',
    assignDate: '2025-01-08',
    status: 'Finalized',
    hiringStatus: 'Awaiting',
    callingDate: '2025-01-05',
    currentCTCFixed: 1100000,
    currentCTCInHand: 880000,
    expectedCTC: 1400000,
    noticePeriod: '30 days',
    communicationSkills: 'Excellent',
    currentLocation: 'Bangalore',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Strong data science background with ML expertise.',
    interviewerFeedback: 'Excellent performance in all rounds.',
    remark: 'Ready for offer rollout.',
  },
  {
    id: '7',
    candidateName: 'Lisa Anderson',
    contactNumber: '+91 9876543216',
    email: 'lisa.anderson@example.com',
    currentOrganisation: 'WebDev Inc',
    education: 'B.Tech Computer Engineering',
    totalExperience: '4 years',
    assignedTo: 'Mike Wilson',
    assignDate: '2025-01-09',
    status: 'Finalized',
    hiringStatus: 'Awaiting',
    callingDate: '2025-01-06',
    currentCTCFixed: 950000,
    currentCTCInHand: 760000,
    expectedCTC: 1200000,
    noticePeriod: '20 days',
    communicationSkills: 'Very Good',
    currentLocation: 'Mumbai',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Great frontend developer with React expertise.',
    interviewerFeedback: 'Strong technical skills, good cultural fit.',
    remark: 'Awaiting final approval.',
  },
  {
    id: '8',
    candidateName: 'David Kumar',
    contactNumber: '+91 9876543217',
    email: 'david.kumar@example.com',
    currentOrganisation: 'FinTech Corp',
    education: 'B.E Computer Science',
    totalExperience: '5 years',
    assignedTo: 'David Lee',
    assignDate: '2025-01-07',
    status: 'Finalized',
    hiringStatus: 'Rejected',
    callingDate: '2025-01-04',
    currentCTCFixed: 1000000,
    currentCTCInHand: 800000,
    expectedCTC: 1300000,
    noticePeriod: '45 days',
    communicationSkills: 'Good',
    currentLocation: 'Delhi',
    willingToWorkInStartup: 'No',
    recruiterFeedback: 'Good candidate but salary expectations too high.',
    interviewerFeedback: 'Technical skills good but not aligned with budget.',
    remark: 'Rejected due to budget constraints.',
  },
];

const initialOnboardingCandidates: any[] = [
  {
    id: 'on1',
    candidateName: 'John Doe',
    email: 'john.doe@example.com',
    contactNumber: '+91 9876543210',
    contact: '+91 9876543210',
    currentOrganisation: 'Tech Corp',
    education: 'B.Tech Computer Science',
    totalExperience: '5 years',
    assignedTo: 'Sarah Johnson',
    recruiter: 'Sarah Johnson',
    assignDate: '2025-01-10',
    status: 'Hired',
    callingDate: '2025-01-08',
    currentCTCFixed: 800000,
    currentCTCInHand: 650000,
    expectedCTC: 1000000,
    noticePeriod: '30 days',
    communicationSkills: 'Good',
    currentLocation: 'Bangalore',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Strong technical background, good communication skills.',
    interviewerFeedback: 'Performed well in technical round.',
    remark: 'Suitable for Senior Developer role.',
    position: 'Senior Software Engineer',
    offerStatus: 'Accepted',
    joiningDate: '2025-02-15',
    onboardingStage: 'Form',
    stageProgress: 40,
    offerDetails: {
      positionTitle: 'Senior Software Engineer',
      offeredCTC: 1200000,
      doj: '2025-02-15',
      offerSentDate: '2025-01-20',
      offerAcceptedDate: '2025-01-22',
    },
    policyAcknowledgment: {
      codeOfConduct: { acknowledged: true, date: '2025-01-25' },
      leavePolicy: { acknowledged: true, date: '2025-01-25' },
      nda: { acknowledged: false, date: null },
    },
    joiningForm: {
      completed: false,
      link: 'https://forms.example.com/john-doe-12345',
    },
    hrVerification: {
      verified: false,
      employeeCode: '',
      department: '',
      designation: '',
      reportingManager: '',
      doj: '2025-02-15',
      pfNo: '',
      esiNo: '',
      uanNo: '',
      verifiedBy: '',
      verifiedDate: '',
      remarks: '',
    },
    assetAllocation: {
      laptop: { assigned: false, serialNumber: '', issuanceDate: '', acknowledged: false },
      emailId: { assigned: false, email: '', issuanceDate: '', acknowledged: false },
      accessBadge: { assigned: false, badgeNumber: '', issuanceDate: '', acknowledged: false },
    },
    probation: {
      status: 'On Probation',
      duration: '3 months',
      confirmationReviewDate: '2025-05-15',
      confirmed: false,
    },
    welcome: {
      emailSent: false,
      orientationAssigned: false,
      acknowledgment: false,
    },
  },
  {
    id: 'on2',
    candidateName: 'Jane Smith',
    email: 'jane.smith@example.com',
    contactNumber: '+91 9876543211',
    contact: '+91 9876543211',
    currentOrganisation: 'StartupXYZ',
    education: 'M.Tech Software Engineering',
    totalExperience: '3 years',
    assignedTo: 'Mike Wilson',
    recruiter: 'Mike Wilson',
    assignDate: '2025-01-12',
    status: 'Hired',
    callingDate: '2025-01-11',
    currentCTCFixed: 600000,
    currentCTCInHand: 500000,
    expectedCTC: 850000,
    noticePeriod: '15 days',
    communicationSkills: 'Excellent',
    currentLocation: 'Mumbai',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Excellent problem-solving skills.',
    interviewerFeedback: 'Pending',
    remark: 'Second round scheduled.',
    position: 'Product Manager',
    offerStatus: 'Sent',
    joiningDate: '2025-02-20',
    onboardingStage: 'Offer',
    stageProgress: 15,
    offerDetails: {
      positionTitle: 'Product Manager',
      offeredCTC: 1500000,
      doj: '2025-02-20',
      offerSentDate: '2025-01-25',
      offerAcceptedDate: null,
    },
    policyAcknowledgment: {
      codeOfConduct: { acknowledged: false, date: null },
      leavePolicy: { acknowledged: false, date: null },
      nda: { acknowledged: false, date: null },
    },
    joiningForm: {
      completed: false,
      link: 'https://forms.example.com/jane-smith-12346',
    },
    hrVerification: {
      verified: false,
      employeeCode: '',
      department: '',
      designation: '',
      reportingManager: '',
      doj: '2025-02-20',
      pfNo: '',
      esiNo: '',
      uanNo: '',
      verifiedBy: '',
      verifiedDate: '',
      remarks: '',
    },
    assetAllocation: {
      laptop: { assigned: false, serialNumber: '', issuanceDate: '', acknowledged: false },
      emailId: { assigned: false, email: '', issuanceDate: '', acknowledged: false },
      accessBadge: { assigned: false, badgeNumber: '', issuanceDate: '', acknowledged: false },
    },
    probation: {
      status: 'Pending',
      duration: '3 months',
      confirmationReviewDate: '',
      confirmed: false,
    },
    welcome: {
      emailSent: false,
      orientationAssigned: false,
      acknowledgment: false,
    },
  },
  {
    id: 'on3',
    candidateName: 'Robert Brown',
    email: 'robert.brown@example.com',
    contactNumber: '+91 9876543212',
    contact: '+91 9876543212',
    currentOrganisation: 'BigTech Inc',
    education: 'B.E Information Technology',
    totalExperience: '7 years',
    assignedTo: 'Sarah Johnson',
    recruiter: 'Sarah Johnson',
    assignDate: '2025-01-09',
    status: 'Hired',
    callingDate: '2025-01-07',
    currentCTCFixed: 1200000,
    currentCTCInHand: 950000,
    expectedCTC: 1500000,
    noticePeriod: '45 days',
    communicationSkills: 'Very Good',
    currentLocation: 'Delhi',
    willingToWorkInStartup: 'No',
    recruiterFeedback: 'Extensive experience in full-stack development.',
    interviewerFeedback: 'Excellent candidate, ready to join.',
    remark: 'Offer letter sent.',
    position: 'Full Stack Developer',
    offerStatus: 'Accepted',
    joiningDate: '2025-02-10',
    onboardingStage: 'Verification',
    stageProgress: 60,
    offerDetails: {
      positionTitle: 'Full Stack Developer',
      offeredCTC: 1000000,
      doj: '2025-02-10',
      offerSentDate: '2025-01-15',
      offerAcceptedDate: '2025-01-17',
    },
    policyAcknowledgment: {
      codeOfConduct: { acknowledged: true, date: '2025-01-20' },
      leavePolicy: { acknowledged: true, date: '2025-01-20' },
      nda: { acknowledged: true, date: '2025-01-20' },
    },
    joiningForm: {
      completed: true,
      link: 'https://forms.example.com/robert-brown-12347',
    },
    hrVerification: {
      verified: false,
      employeeCode: 'EMP001',
      department: 'Engineering',
      designation: 'Full Stack Developer',
      reportingManager: 'John Manager',
      doj: '2025-02-10',
      pfNo: 'PF123456',
      esiNo: 'ESI789012',
      uanNo: 'UAN345678',
      verifiedBy: '',
      verifiedDate: '',
      remarks: '',
    },
    assetAllocation: {
      laptop: { assigned: true, serialNumber: 'LAP001234', issuanceDate: '2025-01-28', acknowledged: true },
      emailId: { assigned: true, email: 'robert.brown@company.com', issuanceDate: '2025-01-28', acknowledged: true },
      accessBadge: { assigned: false, badgeNumber: '', issuanceDate: '', acknowledged: false },
    },
    probation: {
      status: 'On Probation',
      duration: '3 months',
      confirmationReviewDate: '2025-05-10',
      confirmed: false,
    },
    welcome: {
      emailSent: true,
      orientationAssigned: true,
      acknowledgment: false,
    },
  },
  {
    id: 'on4',
    candidateName: 'Emily Davis',
    email: 'emily.davis@example.com',
    contactNumber: '+91 9876543213',
    contact: '+91 9876543213',
    currentOrganisation: 'MidTech Solutions',
    education: 'B.Sc Computer Science',
    totalExperience: '2 years',
    assignedTo: 'Mike Wilson',
    recruiter: 'Mike Wilson',
    assignDate: '2025-01-13',
    status: 'Hired',
    callingDate: '2025-01-13',
    currentCTCFixed: 400000,
    currentCTCInHand: 350000,
    expectedCTC: 600000,
    noticePeriod: '20 days',
    communicationSkills: 'Average',
    currentLocation: 'Pune',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Fresh perspective, eager to learn.',
    interviewerFeedback: 'Not scheduled yet',
    remark: 'Initial screening completed.',
    position: 'Junior Developer',
    offerStatus: 'Accepted',
    joiningDate: '2025-02-25',
    onboardingStage: 'Policy',
    stageProgress: 30,
    offerDetails: {
      positionTitle: 'Junior Developer',
      offeredCTC: 600000,
      doj: '2025-02-25',
      offerSentDate: '2025-01-28',
      offerAcceptedDate: '2025-01-30',
    },
    policyAcknowledgment: {
      codeOfConduct: { acknowledged: true, date: '2025-02-01' },
      leavePolicy: { acknowledged: false, date: null },
      nda: { acknowledged: false, date: null },
    },
    joiningForm: {
      completed: false,
      link: 'https://forms.example.com/emily-davis-12348',
    },
    hrVerification: {
      verified: false,
      employeeCode: '',
      department: '',
      designation: '',
      reportingManager: '',
      doj: '2025-02-25',
      pfNo: '',
      esiNo: '',
      uanNo: '',
      verifiedBy: '',
      verifiedDate: '',
      remarks: '',
    },
    assetAllocation: {
      laptop: { assigned: false, serialNumber: '', issuanceDate: '', acknowledged: false },
      emailId: { assigned: false, email: '', issuanceDate: '', acknowledged: false },
      accessBadge: { assigned: false, badgeNumber: '', issuanceDate: '', acknowledged: false },
    },
    probation: {
      status: 'On Probation',
      duration: '3 months',
      confirmationReviewDate: '2025-05-25',
      confirmed: false,
    },
    welcome: {
      emailSent: false,
      orientationAssigned: false,
      acknowledgment: false,
    },
  },
  {
    id: 'on5',
    candidateName: 'Michael Chen',
    email: 'michael.chen@example.com',
    contactNumber: '+91 9876543214',
    contact: '+91 9876543214',
    currentOrganisation: 'CloudTech',
    education: 'M.Tech Cloud Computing',
    totalExperience: '4 years',
    assignedTo: 'Sarah Johnson',
    recruiter: 'Sarah Johnson',
    assignDate: '2025-01-11',
    status: 'Hired',
    callingDate: '2025-01-10',
    currentCTCFixed: 900000,
    currentCTCInHand: 720000,
    expectedCTC: 1200000,
    noticePeriod: '60 days',
    communicationSkills: 'Good',
    currentLocation: 'Hyderabad',
    willingToWorkInStartup: 'Yes',
    recruiterFeedback: 'Good candidate but long notice period.',
    interviewerFeedback: 'On hold due to notice period.',
    remark: 'Will reconsider after notice period negotiation.',
    position: 'Cloud Engineer',
    offerStatus: 'Accepted',
    joiningDate: '2025-03-15',
    onboardingStage: 'Asset',
    stageProgress: 75,
    offerDetails: {
      positionTitle: 'Cloud Engineer',
      offeredCTC: 1200000,
      doj: '2025-03-15',
      offerSentDate: '2025-01-18',
      offerAcceptedDate: '2025-01-20',
    },
    policyAcknowledgment: {
      codeOfConduct: { acknowledged: true, date: '2025-01-25' },
      leavePolicy: { acknowledged: true, date: '2025-01-25' },
      nda: { acknowledged: true, date: '2025-01-25' },
    },
    joiningForm: {
      completed: true,
      link: 'https://forms.example.com/michael-chen-12349',
    },
    hrVerification: {
      verified: true,
      employeeCode: 'EMP002',
      department: 'Cloud Infrastructure',
      designation: 'Cloud Engineer',
      reportingManager: 'Jane Manager',
      doj: '2025-03-15',
      pfNo: 'PF234567',
      esiNo: 'ESI890123',
      uanNo: 'UAN456789',
      verifiedBy: 'HR Team',
      verifiedDate: '2025-02-05',
      remarks: 'All documents verified successfully.',
    },
    assetAllocation: {
      laptop: { assigned: true, serialNumber: 'LAP002345', issuanceDate: '2025-02-10', acknowledged: true },
      emailId: { assigned: true, email: 'michael.chen@company.com', issuanceDate: '2025-02-10', acknowledged: true },
      accessBadge: { assigned: true, badgeNumber: 'BADGE001', issuanceDate: '2025-02-10', acknowledged: false },
    },
    probation: {
      status: 'On Probation',
      duration: '3 months',
      confirmationReviewDate: '2025-06-15',
      confirmed: false,
    },
    welcome: {
      emailSent: true,
      orientationAssigned: true,
      acknowledgment: true,
    },
  },
];

export function CandidateProvider({ children }: { children: ReactNode }) {
  const [sourcingCandidates, setSourcingCandidates] = useState<Candidate[]>(initialSourcingCandidates);
  const [hiringCandidates, setHiringCandidates] = useState<Candidate[]>(initialHiringCandidates);
  const [onboardingCandidates, setOnboardingCandidates] = useState<any[]>(initialOnboardingCandidates);

  const updateCandidateStatus = (candidateId: string, newStatus: string, tab: 'sourcing' | 'hiring' | 'onboarding') => {
    if (tab === 'sourcing') {
      setSourcingCandidates(prev => {
        const candidate = prev.find(c => c.id === candidateId);
        if (!candidate) return prev;
        
        if (newStatus === 'Finalized') {
          // Move to hiring
          const updatedCandidate = { ...candidate, status: newStatus, hiringStatus: 'Awaiting' as const };
          setHiringCandidates(prevHiring => [...prevHiring, updatedCandidate]);
          return prev.filter(c => c.id !== candidateId);
        }
        
        return prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c);
      });
    }
  };

  const updateHiringStatus = (candidateId: string, hiringStatus: 'Hired' | 'Rejected' | 'Awaiting') => {
    setHiringCandidates(prev => {
      const candidate = prev.find(c => c.id === candidateId);
      if (!candidate) return prev;
      
      const updatedCandidate = { ...candidate, hiringStatus, status: hiringStatus === 'Hired' ? 'Hired' : candidate.status };
      
      if (hiringStatus === 'Hired') {
        // Move to onboarding with all required properties initialized
        const joiningDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days from now
        const onboardingCandidate: any = {
          ...updatedCandidate,
          position: candidate.position || 'Senior Developer',
          recruiter: candidate.assignedTo,
          contact: candidate.contactNumber,
          offerStatus: 'Accepted',
          joiningDate: joiningDate,
          onboardingStage: 'Offer',
          stageProgress: 15,
          offerDetails: {
            positionTitle: candidate.position || 'Senior Developer',
            offeredCTC: candidate.expectedCTC || 0,
            doj: joiningDate,
            offerSentDate: new Date().toISOString().split('T')[0],
            offerAcceptedDate: new Date().toISOString().split('T')[0],
          },
          policyAcknowledgment: {
            codeOfConduct: { acknowledged: false, date: null },
            leavePolicy: { acknowledged: false, date: null },
            nda: { acknowledged: false, date: null },
          },
          joiningForm: {
            completed: false,
            link: `https://forms.example.com/${candidate.id}-${Date.now()}`,
          },
          hrVerification: {
            verified: false,
            employeeCode: '',
            department: '',
            designation: '',
            reportingManager: '',
            doj: joiningDate,
            pfNo: '',
            esiNo: '',
            uanNo: '',
            verifiedBy: '',
            verifiedDate: '',
            remarks: '',
          },
          assetAllocation: {
            laptop: { assigned: false, serialNumber: '', issuanceDate: '', acknowledged: false },
            emailId: { assigned: false, email: '', issuanceDate: '', acknowledged: false },
            accessBadge: { assigned: false, badgeNumber: '', issuanceDate: '', acknowledged: false },
          },
          probation: {
            status: 'On Probation',
            duration: '3 months',
            confirmationReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            confirmed: false,
          },
          welcome: {
            emailSent: false,
            orientationAssigned: false,
            acknowledgment: false,
          },
        };
        setOnboardingCandidates(prevOnboarding => [...prevOnboarding, onboardingCandidate]);
        return prev.filter(c => c.id !== candidateId);
      }
      
      return prev.map(c => c.id === candidateId ? updatedCandidate : c);
    });
  };

  const addCandidate = (candidate: Candidate) => {
    setSourcingCandidates(prev => [...prev, candidate]);
  };

  const updateCandidate = (candidateId: string, updates: Partial<Candidate>) => {
    // Update in sourcing
    setSourcingCandidates(prev => 
      prev.map(c => c.id === candidateId ? { ...c, ...updates } : c)
    );
    // Update in hiring
    setHiringCandidates(prev => 
      prev.map(c => c.id === candidateId ? { ...c, ...updates } : c)
    );
    // Update in onboarding
    setOnboardingCandidates(prev => 
      prev.map(c => c.id === candidateId ? { ...c, ...updates } : c)
    );
  };

  const deleteCandidate = (candidateId: string, tab: 'sourcing' | 'hiring' | 'onboarding') => {
    if (tab === 'sourcing') {
      setSourcingCandidates(prev => prev.filter(c => c.id !== candidateId));
    } else if (tab === 'hiring') {
      setHiringCandidates(prev => prev.filter(c => c.id !== candidateId));
    } else if (tab === 'onboarding') {
      setOnboardingCandidates(prev => prev.filter(c => c.id !== candidateId));
    }
  };

  return (
    <CandidateContext.Provider
      value={{
        sourcingCandidates,
        hiringCandidates,
        onboardingCandidates,
        updateCandidateStatus,
        updateHiringStatus,
        addCandidate,
        updateCandidate,
        deleteCandidate,
      }}
    >
      {children}
    </CandidateContext.Provider>
  );
}

export function useCandidates() {
  const context = useContext(CandidateContext);
  if (context === undefined) {
    throw new Error('useCandidates must be used within a CandidateProvider');
  }
  return context;
}

