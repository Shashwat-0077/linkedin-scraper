import path from 'path';

/**
 * Configuration constants for LinkedIn Scraper
 * All user-specific settings should be passed via LinkedInScraperOptions
 */
export interface Config {
    LINKEDIN_URL: string;
    LOGIN_URL: string;
    JOBS_SEARCH_URL: string;
    TIMEOUT: number;
    SESSION_FILE: string;
    TOKEN_FILE: string;
}

export const config: Config = {
    // LinkedIn URLs (constants)
    LINKEDIN_URL: 'https://www.linkedin.com',
    LOGIN_URL: 'https://www.linkedin.com/login',
    JOBS_SEARCH_URL: 'https://www.linkedin.com/jobs/search',

    // Playwright settings
    TIMEOUT: 10000, // 10 seconds

    // Default file paths (can be overridden in LinkedInScraperOptions)
    SESSION_FILE: path.join(process.cwd(), 'linkedin-session.json'),
    TOKEN_FILE: path.join(process.cwd(), 'token.json'),
};
