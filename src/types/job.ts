export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  remote: boolean;
  benefits: string[];
  postedDate: Date;
  applicationDeadline?: Date;
  contactEmail: string;
  tags: string[];
  isActive: boolean;
  isSaved?: boolean; // Optional property to track if job is saved by current user
}

export interface JobApplication {
  id?: string;
  jobId: string;
  userId: string;
  userEmail: string;
  userName: string;
  coverLetter?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: any; // Firebase Timestamp
  updatedAt: any; // Firebase Timestamp
}

export interface SavedJob {
  id?: string;
  jobId: string;
  userId: string;
  userEmail: string;
  savedAt: any; // Firebase Timestamp
}

export interface JobFilters {
  jobType: string;
  experienceLevel: string;
  salaryRange: string;
  remote: boolean;
}

export interface SearchParams {
  query: string;
  location: string;
  filters: JobFilters;
}
