import { BaseScraper } from '../base/BaseScraper.js';
import { UnifiedFilters } from '../../types/scraper.js';
import { Job } from '../../types/job.js';
import { LinkedInScraper as OriginalLinkedInScraper } from '../../scraper.js';
import { SearchFilters as LinkedInSearchFilters } from '../../types.js';

/**
 * LinkedIn scraper implementation extending BaseScraper
 * Wraps the original LinkedInScraper to conform to the base interface
 */
export class LinkedInScraper extends BaseScraper {
    private scraper: OriginalLinkedInScraper;
    private initialized: boolean = false;

    constructor(headless: boolean = true) {
        super(headless);
        this.scraper = new OriginalLinkedInScraper(undefined, undefined, headless);
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        // The original scraper initializes on first use
        // We'll mark as initialized after first login
        this.initialized = true;
    }

    async searchJobs(filters: UnifiedFilters, maxJobs: number = 10): Promise<Job[]> {
        // Convert UnifiedFilters to LinkedIn-specific filters
        const linkedInFilters: LinkedInSearchFilters = {
            keywords: filters.keywords,
            location: filters.location,
            datePosted: filters.datePosted as any,
            experienceLevel: filters.experienceLevel as any,
            jobType: filters.jobType as any,
            remote: filters.remote as any,
        };

        // Call the original scraper
        const jobs = await this.scraper.searchJobs(linkedInFilters, maxJobs);

        // Add platform field to each job
        return jobs.map((job) => ({
            ...job,
            platform: 'linkedin' as const,
        }));
    }

    async close(): Promise<void> {
        await this.scraper.close();
        this.initialized = false;
    }
}
