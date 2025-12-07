// Main exports for the linkedin-job-scraper package
export { LinkedInScraper, LinkedInScraperOptions } from './LinkedInScraper.js';
export { GmailService, GmailCredentials } from './services/GmailService.js';
export { config } from './config.js';

// Export all types
export type { Job, SearchFilters, LinkedInFilters } from './types.js';
export type { UnifiedFilters } from './types/scraper.js';
