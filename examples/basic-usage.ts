import { LinkedInScraper } from '../src/LinkedInScraper.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Basic usage example for linkedin-job-scraper package
 */

async function main(): Promise<void> {
    // All credentials are required
    const scraper = new LinkedInScraper({
        // LinkedIn credentials
        email: process.env.LINKEDIN_EMAIL!,
        password: process.env.LINKEDIN_PASSWORD!,
        headless: false,
        silent: true, // Set to true to suppress all console output

        // Gmail API credentials
        gmailClientId: process.env.GMAIL_CLIENT_ID!,
        gmailClientSecret: process.env.GMAIL_CLIENT_SECRET!,
        gmailRedirectUri: process.env.GMAIL_REDIRECT_URI || 'http://localhost',
        gmailRefreshToken: process.env.GMAIL_REFRESH_TOKEN!,
        gmailAccessToken: process.env.GMAIL_ACCESS_TOKEN!,

        sessionFile: './sessions/linkedin-session.json',
        tokenFile: './sessions/gmail-token.json',
    });

    try {
        // Search for jobs with filters
        const jobs = await scraper.searchJobs(
            {
                keywords: 'Full stack developer',
                location: 'Bengaluru, India',
                datePosted: 'past-week',
                experienceLevel: ['entry-level', 'associate'],
                jobType: ['full-time'],
                remote: ['remote', 'hybrid', 'on-site'],
            },
            10, // max jobs
        );

        console.log(`\n✅ Found ${jobs.length} jobs\n`);

        // Display jobs
        jobs.forEach((job, index) => {
            console.log(`${index + 1}. ${job.title}`);
            console.log(`   Company: ${job.companyName}`);
            console.log(`   Location: ${job.location}`);
            if (job.postedAt) console.log(`   Posted: ${job.postedAt}`);
            if (job.link) console.log(`   URL: ${job.link}`);
            console.log('');
        });

        // Save to JSON file
        const outputDir = path.join(process.cwd(), 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(outputDir, 'jobs.json');
        fs.writeFileSync(outputPath, JSON.stringify(jobs, null, 2), 'utf-8');
        console.log(`\n💾 Saved ${jobs.length} jobs to ${outputPath}\n`);
    } catch (error) {
        console.error('\n✗ Error:', (error as Error).message);
    } finally {
        // Clean up
        console.log('Closing browser...');
        await scraper.close();
    }
}

main();
