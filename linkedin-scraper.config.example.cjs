/**
 * LinkedIn Scraper Configuration File
 *
 * This file contains all the configuration needed for the linkedin-job-scraper package.
 * Place this file in your project root directory as 'linkedin-scraper.config.cjs'
 *
 * IMPORTANT: This file should NOT be committed to version control if it contains
 * sensitive credentials. Add it to your .gitignore file.
 *
 * For production use, consider loading values from environment variables:
 * email: process.env.LINKEDIN_EMAIL
 */

module.exports = {
    // ===== LinkedIn Credentials =====
    // Your LinkedIn account email and password
    email: 'your-linkedin-email@example.com',
    password: 'your-linkedin-password',

    // ===== Browser Options =====
    // Run browser in headless mode (no visible window)
    headless: false,

    // Suppress all console output
    silent: false,

    // ===== Gmail API Credentials =====
    // Required for automatic verification code retrieval during LinkedIn login
    // Follow these steps to get your Gmail API credentials:
    // 1. Go to https://console.cloud.google.com/
    // 2. Create a new project or select existing one
    // 3. Enable Gmail API for your project
    // 4. Create OAuth 2.0 credentials (Desktop app)
    // 5. Download credentials and use client_id and client_secret below
    // 6. Run 'npx linkedin-gmail-token' to generate refresh and access tokens

    gmailClientId: 'your-gmail-client-id.apps.googleusercontent.com',
    gmailClientSecret: 'your-gmail-client-secret',
    gmailRedirectUri: 'http://localhost',
    gmailRefreshToken: 'your-gmail-refresh-token',
    gmailAccessToken: 'your-gmail-access-token',

    // ===== File Paths =====
    // Optional: Custom paths for session and token storage
    // If not specified, defaults will be used
    sessionFile: './sessions/linkedin-session.json',
    tokenFile: './sessions/gmail-token.json',
};
