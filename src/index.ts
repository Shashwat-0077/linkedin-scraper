// Main exports for the linkedin-job-scraper package
export { LinkedInScraper, LinkedInScraperOptions } from './LinkedInScraper.js';
export { GmailService, GmailCredentials } from './services/GmailService.js';
export { config } from './config.js';

// Export all types
export type { Job, SearchFilters, UnifiedFilters, LinkedInScraperConfig } from './types/index.js';
export { LinkedInFilters } from './types/index.js';
