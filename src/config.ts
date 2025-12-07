import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Load environment variables
dotenv.config();

// Create require for loading CommonJS modules in ESM
const require = createRequire(import.meta.url);

// Load user config file if it exists (try both .cjs and .js)
let userConfig: any = {};
const configPaths = [
    path.join(process.cwd(), 'linkedin-scraper.config.cjs'),
    path.join(process.cwd(), 'linkedin-scraper.config.js'),
];

for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
        try {
            userConfig = require(configPath);
            console.log(`✓ Loaded config from ${path.basename(configPath)}`);
            break;
        } catch (error) {
            console.warn(`⚠ Failed to load ${path.basename(configPath)}:`, (error as Error).message);
        }
    }
}

export interface Config {
    LINKEDIN_URL: string;
    LOGIN_URL: string;
    JOBS_SEARCH_URL: string;
    EMAIL: string;
    PASSWORD: string;
    TIMEOUT: number;
    HEADLESS: boolean;
    GMAIL_CLIENT_ID: string;
    GMAIL_CLIENT_SECRET: string;
    GMAIL_REDIRECT_URI: string;
    GMAIL_REFRESH_TOKEN: string;
    GMAIL_ACCESS_TOKEN: string;
    SESSION_FILE: string;
    TOKEN_FILE: string;
}

export const config: Config = {
    // LinkedIn URLs
    LINKEDIN_URL: 'https://www.linkedin.com',
    LOGIN_URL: 'https://www.linkedin.com/login',
    JOBS_SEARCH_URL: 'https://www.linkedin.com/jobs/search',

    // Credentials from environment variables or config file
    EMAIL: userConfig.linkedin?.email || process.env.LINKEDIN_EMAIL || '',
    PASSWORD: userConfig.linkedin?.password || process.env.LINKEDIN_PASSWORD || '',

    // Playwright settings
    TIMEOUT: 10000, // 10 seconds
    HEADLESS: userConfig.headless !== undefined ? userConfig.headless : process.env.HEADLESS === 'true',

    // Gmail API OAuth2 Credentials
    GMAIL_CLIENT_ID: userConfig.gmail?.clientId || process.env.GMAIL_CLIENT_ID || '',
    GMAIL_CLIENT_SECRET: userConfig.gmail?.clientSecret || process.env.GMAIL_CLIENT_SECRET || '',
    GMAIL_REDIRECT_URI: userConfig.gmail?.redirectUri || process.env.GMAIL_REDIRECT_URI || 'http://localhost',
    GMAIL_REFRESH_TOKEN: userConfig.gmail?.refreshToken || process.env.GMAIL_REFRESH_TOKEN || '',
    GMAIL_ACCESS_TOKEN: userConfig.gmail?.accessToken || process.env.GMAIL_ACCESS_TOKEN || '',

    // File paths - resolve relative paths to absolute
    SESSION_FILE: userConfig.sessionFile
        ? path.resolve(process.cwd(), userConfig.sessionFile)
        : process.env.SESSION_FILE
        ? path.resolve(process.cwd(), process.env.SESSION_FILE)
        : path.join(process.cwd(), 'linkedin-session.json'),
    TOKEN_FILE: userConfig.tokenFile
        ? path.resolve(process.cwd(), userConfig.tokenFile)
        : process.env.TOKEN_FILE
        ? path.resolve(process.cwd(), process.env.TOKEN_FILE)
        : path.join(process.cwd(), 'token.json'),
};
