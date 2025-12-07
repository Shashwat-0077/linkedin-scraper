import { LinkedInScraper } from './scraper.js';
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

        // Auto-close after saving results
    } catch (error) {
        console.error('\n✗ Error:', (error as Error).message);
    } finally {
        // Clean up
        console.log('Closing browser...');
        await scraper.close();
    }
}

main();
