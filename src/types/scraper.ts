// Supported job platforms
export type SupportedPlatform = 'linkedin' | 'foundit' | 'wellfound' | 'indeed';

// Date filter options
export type DatePosted = 'any-time' | 'past-month' | 'past-week' | 'past-24-hours';

// Experience levels
export type ExperienceLevel = 'internship' | 'entry-level' | 'associate' | 'mid-senior' | 'director' | 'executive';

// Job types
export type JobType = 'full-time' | 'part-time' | 'contract' | 'temporary' | 'volunteer' | 'internship' | 'other';

// Remote work types
export type RemoteType = 'on-site' | 'remote' | 'hybrid';

// Unified filter interface for all platforms
export interface UnifiedFilters {
    keywords?: string;
    location?: string;
    datePosted?: DatePosted;
    experienceLevel?: ExperienceLevel[];
    jobType?: JobType[];
    remote?: RemoteType[];
    // Add more unified filters as needed
}

// Scraper configuration
export interface ScraperConfig {
    headless?: boolean;
    timeout?: number;
    retries?: number;
}

// Abstract base scraper interface
export interface IBaseScraper {
    initialize(): Promise<void>;
    searchJobs(filters: UnifiedFilters, maxJobs: number): Promise<any[]>;
    close(): Promise<void>;
}
