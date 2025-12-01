export interface Job {
  title: string;
  company: string;
  location?: string;
  description?: string;
  jobUrl?: string;
  postedDate?: string;
  employmentType?: string;
  seniorityLevel?: string;
}

export interface SearchFilters {
  keywords?: string;
  location?: string;
  datePosted?: 'past-24h' | 'past-week' | 'past-month' | 'any';
  experienceLevel?: 'internship' | 'entry' | 'associate' | 'mid-senior' | 'director' | 'executive';
  jobType?: 'full-time' | 'part-time' | 'contract' | 'temporary' | 'volunteer' | 'internship';
  remote?: 'on-site' | 'remote' | 'hybrid';
}
