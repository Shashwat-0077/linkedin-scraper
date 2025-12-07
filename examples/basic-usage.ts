import { LinkedInScraper } from '../src/LinkedInScraper.js';
import fs from 'fs';
import path from 'path';

/**
 * Basic usage example for linkedin-job-scraper package
 *
 * NOTE: Configuration is loaded from linkedin-scraper.config.cjs file
 * in your project root directory. See the example config file for details.
 */

async function main(): Promise<void> {
    // All configuration is loaded from linkedin-scraper.config.cjs
    const scraper = new LinkedInScraper();

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
