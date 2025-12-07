import { IBaseScraper, UnifiedFilters } from '../../types/scraper.js';
import { Job } from '../../types/job.js';

/**
 * Abstract base class for all job platform scrapers
 * All platform scrapers must extend this class
 */
export abstract class BaseScraper implements IBaseScraper {
    protected headless: boolean;

    constructor(headless: boolean = true) {
        this.headless = headless;
    }

    /**
     * Initialize the scraper (browser, authentication, etc.)
     */
    abstract initialize(): Promise<void>;

    /**
     * Search for jobs with given filters
     */
    abstract searchJobs(filters: UnifiedFilters, maxJobs: number): Promise<Job[]>;

    /**
     * Clean up resources (close browser, etc.)
     */
    abstract close(): Promise<void>;

    /**
     * Optional: Hook to run before search
     */
    protected async beforeSearch(): Promise<void> {
        // Override in subclass if needed
    }

    /**
     * Optional: Hook to run after search
     */
    protected async afterSearch(): Promise<void> {
        // Override in subclass if needed
    }
}
