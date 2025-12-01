import { chromium, Browser, Page } from 'playwright';
import { config } from './config.js';
import { Job, SearchFilters } from './types.js';

export class LinkedInScraper {
  private email: string;
  private password: string;
  private headless: boolean;
  private browser: Browser | null = null;
  private page: Page | null = null;
  private loggedIn: boolean = false;

  constructor(email?: string, password?: string, headless?: boolean) {
    this.email = email || config.EMAIL;
    this.password = password || config.PASSWORD;
    this.headless = headless !== undefined ? headless : config.HEADLESS;
  }

  private async initBrowser(): Promise<void> {
    if (this.browser) return; // Already initialized

    console.log('Initializing browser...');
    this.browser = await chromium.launch({
      headless: this.headless,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });

    this.page = await this.browser.newPage();

    // Set user agent
    await this.page.setExtraHTTPHeaders({
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    console.log('✓ Browser initialized');
  }

  private async login(): Promise<boolean> {
    if (this.loggedIn) return true; // Already logged in

    if (!this.email || !this.password) {
      throw new Error(
        'Email and password are required. Set them in .env file or pass to constructor.'
      );
    }

    // Initialize browser if not already done
    if (!this.browser || !this.page) {
      await this.initBrowser();
    }

    if (!this.page) {
      throw new Error('Page not initialized');
    }

    try {
      console.log('Logging into LinkedIn...');
      await this.page.goto(config.LOGIN_URL, { waitUntil: 'domcontentloaded' });

      // Fill email
      await this.page.fill('#username', this.email);

      // Fill password
      await this.page.fill('#password', this.password);

      // Click login button
      await this.page.click('button[type="submit"]');

      // Wait for navigation
      await this.page.waitForTimeout(3000);

      // Check if login was successful
      const currentUrl = this.page.url();

      if (
        currentUrl.includes('feed') ||
        currentUrl.includes('mynetwork') ||
        currentUrl.includes('jobs')
      ) {
        console.log('✓ Login successful!');
        this.loggedIn = true;
        return true;
      } else if (currentUrl.includes('challenge') || currentUrl.includes('checkpoint')) {
        console.log(
          '⚠ LinkedIn security challenge detected. Please complete it manually in the browser.'
        );
        // Wait for user to complete challenge
        await this.page.waitForURL(
          (url) => url.href.includes('feed') || url.href.includes('jobs'),
          { timeout: 120000 }
        );
        console.log('✓ Challenge completed!');
        this.loggedIn = true;
        return true;
      } else {
        console.log('⚠ Login status unclear. Current URL:', currentUrl);
        return false;
      }
    } catch (error) {
      console.error('✗ Login failed:', (error as Error).message);
      return false;
    }
  }

  private async navigateToJobs(): Promise<boolean> {
    if (!this.page) {
      throw new Error('Browser not initialized.');
    }

    try {
      console.log('Navigating to jobs page...');
      await this.page.goto(config.JOBS_SEARCH_URL, { waitUntil: 'domcontentloaded' });

      // Wait a bit for page to stabilize
      await this.page.waitForTimeout(2000);

      const currentUrl = this.page.url();
      if (currentUrl.includes('jobs/search') || currentUrl.includes('jobs')) {
        console.log('✓ Successfully navigated to jobs page');
        return true;
      } else {
        console.log('⚠ Unexpected URL:', currentUrl);
        return false;
      }
    } catch (error) {
      console.error('✗ Failed to navigate to jobs page:', (error as Error).message);
      return false;
    }
  }

  async searchJobs(filters?: SearchFilters): Promise<Job[]> {
    console.log('\n=== Starting LinkedIn Job Search ===\n');

    try {
      // Step 1: Login (if not already logged in)
      if (!this.loggedIn) {
        const loginSuccess = await this.login();
        if (!loginSuccess) {
          throw new Error('Login failed');
        }
      }

      // Step 2: Navigate to jobs page
      const navSuccess = await this.navigateToJobs();
      if (!navSuccess) {
        throw new Error('Failed to navigate to jobs page');
      }

      // Step 3: Perform search
      console.log('\n🔍 Searching for jobs...');
      if (filters?.keywords) console.log(`   Keywords: ${filters.keywords}`);
      if (filters?.location) console.log(`   Location: ${filters.location}`);

      // TODO: Implement actual job scraping logic here
      console.log('\n⚠ Job scraping logic - to be implemented in next step');

      return [];
    } catch (error) {
      console.error('Error during job search:', (error as Error).message);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      console.log('\nClosing browser...');
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.loggedIn = false;
    }
  }
}
