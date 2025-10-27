export interface UserProfile {
  authority: string;
  name: string;
  isClient: boolean;
  isFreelancer: boolean;
  reputation: number;
  completedJobs: number;
  createdAt: number;
  resume?: Resume;
  disputesRaised: number;
  disputesResolved: number;
  totalEarnings: number;
  totalSpent: number;
  activeJobs: number;
  pendingJobs: number;
  cancelledJobs: number;
}

export interface Resume {
  education: Education[];
  experience: Experience[];
  skills: string[];
  certifications: string[];
  portfolio: string[];
  lastUpdate: number;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: number;
  endDate?: number;
}

export interface Experience {
  company: string;
  position: string;
  description: string;
  startDate: number;
  endDate?: number;
}

export interface Job {
  authority: string;
  client: string;
  freelancer?: string;
  title: string;
  description: string;
  budget: number;
  deadline: number;
  status: JobStatus;
  createdAt: number;
  updatedAt: number;
  milestones: Milestone[];
  bidders: string[];
  dispute?: any;
}

export enum JobStatus {
  Open = 'Open',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Disputed = 'Disputed',
  Cancelled = 'Cancelled',
}

export interface Milestone {
  description: string;
  amount: number;
  completed: boolean;
}
  