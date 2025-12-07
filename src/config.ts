import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface Config {
    LINKEDIN_URL: string;
    LOGIN_URL: string;
    JOBS_SEARCH_URL: string;
    EMAIL: string;
    PASSWORD: string;
    TIMEOUT: number;
    HEADLESS: boolean;
    GMAIL_EMAIL: string;
    GMAIL_PASSWORD: string;
}

export const config: Config = {
    // LinkedIn URLs
    LINKEDIN_URL: 'https://www.linkedin.com',
    LOGIN_URL: 'https://www.linkedin.com/login',
    JOBS_SEARCH_URL: 'https://www.linkedin.com/jobs/search',

    // Credentials from environment variables
    EMAIL: process.env.LINKEDIN_EMAIL || '',
    PASSWORD: process.env.LINKEDIN_PASSWORD || '',

    // Playwright settings
    TIMEOUT: 10000, // 10 seconds
    HEADLESS: process.env.HEADLESS === 'true',

    // Gmail credentials for verification code fetching (browser automation)
    GMAIL_EMAIL: process.env.GMAIL_EMAIL || process.env.LINKEDIN_EMAIL || '',
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD || process.env.LINKEDIN_PASSWORD || '',
};
