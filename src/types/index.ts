// Central export point for all types

// Job types
export type { Job } from './job.js';

// Scraper types
export type {
    SupportedPlatform,
    DatePosted,
    ExperienceLevel,
    JobType,
    RemoteType,
    UnifiedFilters,
    ScraperConfig,
    IBaseScraper,
} from './scraper.js';

// LinkedIn-specific types
export type { SearchFilters } from './linkedin.js';
export { LinkedInFilters } from './linkedin.js';

// API types
export type { JobSearchRequest, ApiResponse, JobSearchResponse, PlatformsResponse, HealthResponse } from './api.js';

// Config types
export type { LinkedInScraperConfig } from '../utils/configLoader.js';
