import { LinkedInScraper } from './scraper.js';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

async function main(): Promise<void> {
    // Initialize scraper (credentials from .env file)
    const scraper = new LinkedInScraper();

    try {
        // Search for jobs with filters - everything happens in one call!
        const jobs = await scraper.searchJobs(
            {
                keywords: 'Full stack',
                location: 'Bengaluru, India',
                datePosted: 'past-week',
                experienceLevel: ['entry-level'],
                jobType: ['full-time'],
                remote: ['remote', 'hybrid', 'on-site'],
            },
            5,
        );

        console.log(`\n✅ Found ${jobs.length} jobs\n`);

        // Display jobs
        jobs.forEach((job, index) => {
            console.log(`${index + 1}. ${job.title}`);
            console.log(`   Company: ${job.companyName}`);
            console.log(`   Location: ${job.location}`);
            if (job.employmentType) console.log(`   Type: ${job.employmentType}`);
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

        // Keep browser open to see results
        console.log('Press Enter to close the browser...');
        await waitForEnter();
    } catch (error) {
        console.error('\n✗ Error:', (error as Error).message);
    } finally {
        // Clean up
        await scraper.close();
    }
}

// Helper function to wait for Enter key
function waitForEnter(): Promise<void> {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('', () => {
            rl.close();
            resolve();
        });
    });
}

main();
