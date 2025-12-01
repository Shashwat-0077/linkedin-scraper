import { LinkedInScraper } from './scraper.js';
import readline from 'readline';

async function main(): Promise<void> {
  // Initialize scraper (credentials from .env file)
  const scraper = new LinkedInScraper();

  try {
    // Search for jobs - everything happens in one call!
    const jobs = await scraper.searchJobs({
      keywords: 'Python Developer',
      location: 'United States',
    });

    console.log(`\nFound ${jobs.length} jobs`);

    // Keep browser open to see results
    console.log('\nPress Enter to close the browser...');
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
