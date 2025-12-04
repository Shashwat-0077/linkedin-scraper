import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { config } from './config.js';
import { Job, SearchFilters, LinkedInFilters } from './types.js';

interface CompanyDetails {
    companyWebsite: string;
    companyDescription: string;
    companyAddress: string;
    companyEmployeesCount: string;
    industries: string;
}

export class LinkedInScraper {
    private email: string;
    private password: string;
    private headless: boolean;
    private browser: Browser | null = null;
    private page: Page | null = null;
    private loggedIn: boolean = false;

    // Company details extraction system
    private companyQueue: Set<string> = new Set();
    private companyDetailsCache: Map<string, CompanyDetails> = new Map();
    private companyWorkerContext: BrowserContext | null = null;
    private companyWorkerPage: Page | null = null;
    private isProcessingQueue: boolean = false;

    constructor(email?: string, password?: string, headless?: boolean) {
        this.email = email || config.EMAIL;
        this.password = password || config.PASSWORD;
        this.headless = headless !== undefined ? headless : config.HEADLESS;
    }

    private async initBrowser(): Promise<void> {
        if (this.browser) return;

        console.log('Initializing browser...');
        this.browser = await chromium.launch({
            headless: this.headless,
            args: ['--no-sandbox', '--disable-dev-shm-usage'],
        });

        this.page = await this.browser.newPage();

        await this.page.setExtraHTTPHeaders({
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        });

        console.log('✓ Browser initialized');
    }

    private async initCompanyWorker(): Promise<void> {
        if (!this.browser || this.companyWorkerContext) return;

        console.log('🔧 Initializing company details worker...');

        // Create separate browser context for company scraping
        this.companyWorkerContext = await this.browser.newContext();
        this.companyWorkerPage = await this.companyWorkerContext.newPage();

        // Set same headers as main page
        await this.companyWorkerPage.setExtraHTTPHeaders({
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        });

        // Login to LinkedIn in worker context
        console.log('🔐 Logging into LinkedIn in worker context...');
        try {
            await this.companyWorkerPage.goto(config.LOGIN_URL, { waitUntil: 'domcontentloaded' });
            await this.companyWorkerPage.fill('#username', this.email);
            await this.companyWorkerPage.fill('#password', this.password);
            await this.companyWorkerPage.click('button[type="submit"]');
            await this.companyWorkerPage.waitForTimeout(3000);
            console.log('✓ Worker logged in successfully');
        } catch (error) {
            console.log('⚠ Worker login failed, continuing anyway...');
        }

        console.log('✓ Company worker initialized and ready');
    }

    private async scrapeCompanyDetailsInWorker(companyUrl: string): Promise<CompanyDetails> {
        const defaultDetails: CompanyDetails = {
            companyWebsite: '',
            companyDescription: '',
            companyAddress: '',
            companyEmployeesCount: '',
            industries: '',
        };

        if (!this.companyWorkerPage) {
            return defaultDetails;
        }

        try {
            console.log(`      🏢 Fetching: ${companyUrl.split('/').pop()}`);

            await this.companyWorkerPage.goto(companyUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 15000,
            });
            await this.companyWorkerPage.waitForTimeout(2000);

            const details: CompanyDetails = { ...defaultDetails };

            // Extract company website
            try {
                const websiteElement = await this.companyWorkerPage.$('a[href*="http"]:not([href*="linkedin.com"])');
                if (websiteElement) {
                    const href = await websiteElement.getAttribute('href');
                    if (href && !href.includes('linkedin.com')) {
                        details.companyWebsite = href;
                    }
                }
            } catch (e) {
                // Website not found
            }

            // Extract company description/tagline
            try {
                const descriptionSelectors = [
                    '.org-top-card-summary__tagline',
                    '.break-words.white-space-pre-wrap',
                    'p.break-words',
                ];

                for (const selector of descriptionSelectors) {
                    const descElement = await this.companyWorkerPage.$(selector);
                    if (descElement) {
                        const text = await descElement.textContent();
                        if (text && text.trim()) {
                            details.companyDescription = text.trim();
                            break;
                        }
                    }
                }
            } catch (e) {
                // Description not found
            }

            // Extract company info (employees, industry)
            try {
                const infoItems = await this.companyWorkerPage.$$('.org-top-card-summary-info-list__info-item');

                for (const item of infoItems) {
                    const text = await item.textContent();
                    if (!text) continue;

                    const trimmedText = text.trim();

                    // Check for employee count
                    if (trimmedText.includes('employees') || trimmedText.includes('employee')) {
                        details.companyEmployeesCount = trimmedText;
                    }

                    // Check for industry
                    if (
                        !trimmedText.includes('employees') &&
                        !trimmedText.includes('followers') &&
                        trimmedText.length > 5 &&
                        trimmedText.length < 100
                    ) {
                        if (!details.industries) {
                            details.industries = trimmedText;
                        }
                    }
                }
            } catch (e) {
                // Info items not found
            }

            // Extract company address/location
            try {
                const locationSelectors = [
                    '.org-top-card-summary-info-list__info-item:has-text("·")',
                    '.org-page-details__definition-text',
                ];

                for (const selector of locationSelectors) {
                    const locElement = await this.companyWorkerPage.$(selector);
                    if (locElement) {
                        const text = await locElement.textContent();
                        if (text && text.trim() && text.includes(',')) {
                            details.companyAddress = text.trim();
                            break;
                        }
                    }
                }
            } catch (e) {
                // Address not found
            }

            console.log(`      ✓ Extracted details for ${companyUrl.split('/').pop()}`);
            return details;
        } catch (error) {
            console.log(`      ⚠ Error: ${(error as Error).message}`);
            return defaultDetails;
        }
    }

    private async processCompanyQueue(): Promise<void> {
        if (this.isProcessingQueue || !this.companyWorkerPage) return;

        this.isProcessingQueue = true;
        console.log(`\n🔄 Processing ${this.companyQueue.size} companies in parallel...`);

        for (const companyUrl of this.companyQueue) {
            // Skip if already cached
            if (this.companyDetailsCache.has(companyUrl)) {
                console.log(`      ⏭️  Cached: ${companyUrl.split('/').pop()}`);
                continue;
            }

            try {
                const details = await this.scrapeCompanyDetailsInWorker(companyUrl);
                this.companyDetailsCache.set(companyUrl, details);
            } catch (error) {
                console.log(`      ⚠ Failed: ${companyUrl.split('/').pop()}`);
                // Cache empty details to avoid retrying
                this.companyDetailsCache.set(companyUrl, {
                    companyWebsite: '',
                    companyDescription: '',
                    companyAddress: '',
                    companyEmployeesCount: '',
                    industries: '',
                });
            }
        }

        console.log(`✓ Finished processing company details\n`);
        this.isProcessingQueue = false;
    }

    private async login(): Promise<boolean> {
        if (this.loggedIn) return true;

        if (!this.email || !this.password) {
            throw new Error('Email and password are required. Set them in .env file or pass to constructor.');
        }

        if (!this.browser || !this.page) {
            await this.initBrowser();
        }

        if (!this.page) {
            throw new Error('Page not initialized');
        }

        try {
            console.log('Logging into LinkedIn...');
            await this.page.goto(config.LOGIN_URL, { waitUntil: 'domcontentloaded' });

            await this.page.fill('#username', this.email);
            await this.page.fill('#password', this.password);
            await this.page.click('button[type="submit"]');
            await this.page.waitForTimeout(3000);

            const currentUrl = this.page.url();

            if (currentUrl.includes('feed') || currentUrl.includes('mynetwork') || currentUrl.includes('jobs')) {
                console.log('✓ Login successful!');
                this.loggedIn = true;
                return true;
            } else if (currentUrl.includes('challenge') || currentUrl.includes('checkpoint')) {
                console.log('⚠ LinkedIn security challenge detected. Please complete it manually in the browser.');
                await this.page.waitForURL((url) => url.href.includes('feed') || url.href.includes('jobs'), {
                    timeout: 120000,
                });
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

    private buildSearchUrl(filters?: SearchFilters): string {
        const params = new URLSearchParams();

        if (filters?.keywords) {
            params.append('keywords', filters.keywords);
        }

        if (filters?.location) {
            params.append('location', filters.location);
        }

        if (filters?.datePosted && filters.datePosted !== 'any-time') {
            const dateValue = LinkedInFilters.datePosted[filters.datePosted];
            if (dateValue) {
                params.append('f_TPR', dateValue);
            }
        }

        if (filters?.experienceLevel && filters.experienceLevel.length > 0) {
            const experienceLevels = filters.experienceLevel
                .map((level) => LinkedInFilters.experienceLevel[level])
                .filter(Boolean)
                .join(',');
            if (experienceLevels) {
                params.append('f_E', experienceLevels);
            }
        }

        if (filters?.jobType && filters.jobType.length > 0) {
            const jobTypes = filters.jobType
                .map((type) => LinkedInFilters.jobType[type])
                .filter(Boolean)
                .join(',');
            if (jobTypes) {
                params.append('f_JT', jobTypes);
            }
        }

        if (filters?.remote && filters.remote.length > 0) {
            const remoteOptions = filters.remote
                .map((option) => LinkedInFilters.remote[option])
                .filter(Boolean)
                .join(',');
            if (remoteOptions) {
                params.append('f_WT', remoteOptions);
            }
        }

        const queryString = params.toString();
        return queryString ? `${config.JOBS_SEARCH_URL}?${queryString}` : config.JOBS_SEARCH_URL;
    }

    private async scrapeJobListings(maxJobs: number = 10): Promise<Job[]> {
        if (!this.page) {
            throw new Error('Page not initialized');
        }

        const allJobs: Job[] = [];

        try {
            console.log(`\n📋 Scraping up to ${maxJobs} job listings...`);
            console.log('   Waiting for job listings to load...');

            await this.page.waitForTimeout(5000);

            // Save debug info
            await this.page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
            console.log('   📸 Saved debug-screenshot.png');

            // LinkedIn uses pagination - scrape jobs page by page
            console.log('   Scraping jobs through pagination...');

            let currentPage = 1;
            const maxPages = Math.ceil(maxJobs / 25); // LinkedIn shows ~25 jobs per page

            while (allJobs.length < maxJobs && currentPage <= maxPages) {
                console.log(`   📄 Processing page ${currentPage}...`);

                // Wait for jobs to load on current page
                await this.page.waitForTimeout(2000);

                // Try many selectors to find job cards on this page
                const selectors = [
                    'li[data-occludable-job-id]',
                    'ul.scaffold-layout__list-container > li',
                    '.jobs-search-results__list-item',
                    'li.jobs-search-results__list-item',
                    'ul.jobs-search__results-list > li',
                    '.scaffold-layout__list li',
                ];

                let jobCards: any[] = [];
                for (const selector of selectors) {
                    jobCards = await this.page.$$(selector);
                    if (jobCards.length > 0) {
                        console.log(`   ✓ Found ${jobCards.length} jobs on page ${currentPage}`);
                        break;
                    }
                }

                if (jobCards.length === 0) {
                    console.log(`   ⚠ No jobs found on page ${currentPage}`);
                    break;
                }

                // Scrape jobs on THIS page before moving to next page
                const jobsToScrapeOnPage = Math.min(jobCards.length, maxJobs - allJobs.length);

                for (let i = 0; i < jobsToScrapeOnPage; i++) {
                    try {
                        const jobCard = jobCards[i];
                        await jobCard.scrollIntoViewIfNeeded();
                        await jobCard.click();
                        await this.page.waitForTimeout(3000);

                        // Extract job ID
                        const jobId = await jobCard.evaluate((el: any) => {
                            return el.getAttribute('data-occludable-job-id') || '';
                        });

                        // Extract basic info from card
                        const title = await jobCard.evaluate((el: any) => {
                            const titleEl = el.querySelector(
                                '.job-card-list__title, .artdeco-entity-lockup__title, a.job-card-container__link',
                            );
                            return titleEl?.textContent?.trim() || '';
                        });

                        const companyName = await jobCard.evaluate((el: any) => {
                            const companyEl = el.querySelector(
                                '.job-card-container__primary-description, .artdeco-entity-lockup__subtitle',
                            );
                            return companyEl?.textContent?.trim() || '';
                        });

                        const location = await jobCard.evaluate((el: any) => {
                            const locationEl = el.querySelector(
                                '.job-card-container__metadata-item, .artdeco-entity-lockup__caption',
                            );
                            return locationEl?.textContent?.trim() || '';
                        });

                        const jobUrl = await jobCard.evaluate((el: any) => {
                            const linkEl = el.querySelector('a[href*="/jobs/view/"]');
                            return linkEl?.getAttribute('href')?.split('?')[0] || '';
                        });

                        const link = jobUrl ? `https://www.linkedin.com${jobUrl}` : '';

                        // Extract detailed info from job details panel
                        let description = '';
                        let employmentType = '';
                        let seniorityLevel = '';
                        let postedAt = '';
                        let companyLogo = '';
                        let companyLinkedinUrl = '';
                        let salary = '';
                        let applyUrl = link;

                        try {
                            // Wait for details panel
                            await this.page.waitForSelector(
                                '.jobs-search__job-details--container, .job-details-jobs-unified-top-card',
                                { timeout: 3000 },
                            );

                            // Get description
                            const descElement = await this.page.$(
                                '.jobs-description__content, .jobs-description-content__text, .jobs-box__html-content',
                            );
                            if (descElement) {
                                description = ((await descElement.textContent()) || '').trim();
                            }

                            // Get company logo
                            const logoElement = await this.page.$(
                                '.jobs-company__logo img, .job-details-jobs-unified-top-card__company-logo img',
                            );
                            if (logoElement) {
                                companyLogo = (await logoElement.getAttribute('src')) || '';
                            }

                            // Get company LinkedIn URL
                            const companyLinkElement = await this.page.$('a[href*="/company/"]');
                            if (companyLinkElement) {
                                const href = await companyLinkElement.getAttribute('href');
                                if (href) {
                                    // Check if href is already a full URL or just a path
                                    let cleanUrl = '';
                                    if (href.startsWith('http')) {
                                        cleanUrl = href.split('?')[0];
                                    } else {
                                        cleanUrl = `https://www.linkedin.com${href.split('?')[0]}`;
                                    }
                                    // Remove /life suffix if present
                                    companyLinkedinUrl = cleanUrl.replace(/\/life$/, '');

                                    // Add to queue and start processing immediately (non-blocking)
                                    if (companyLinkedinUrl) {
                                        this.companyQueue.add(companyLinkedinUrl);

                                        // Start processing in background if not already running
                                        if (!this.isProcessingQueue) {
                                            // Fire and forget - process in parallel
                                            this.processCompanyQueue().catch((err) => {
                                                console.log('⚠ Queue processing error:', err.message);
                                            });
                                        }
                                    }
                                }
                            }

                            // Get job criteria
                            const criteriaItems = await this.page.$$(
                                '.job-details-jobs-unified-top-card__job-insight, .jobs-unified-top-card__job-insight',
                            );

                            for (const item of criteriaItems) {
                                const text = (await item.textContent()) || '';
                                const trimmedText = text.trim();

                                if (
                                    trimmedText.includes('Full-time') ||
                                    trimmedText.includes('Part-time') ||
                                    trimmedText.includes('Contract') ||
                                    trimmedText.includes('Temporary')
                                ) {
                                    employmentType = trimmedText;
                                } else if (
                                    trimmedText.includes('Entry level') ||
                                    trimmedText.includes('Mid-Senior') ||
                                    trimmedText.includes('Director') ||
                                    trimmedText.includes('Executive')
                                ) {
                                    seniorityLevel = trimmedText;
                                }
                            }

                            // Get posted date
                            const postedElement = await this.page.$(
                                '.job-details-jobs-unified-top-card__posted-date, .jobs-unified-top-card__posted-date, time',
                            );
                            if (postedElement) {
                                postedAt = ((await postedElement.textContent()) || '').trim();
                            }

                            // Get salary if available
                            const salaryElement = await this.page.$(
                                '.job-details-jobs-unified-top-card__job-insight--highlight, .salary',
                            );
                            if (salaryElement) {
                                salary = ((await salaryElement.textContent()) || '').trim();
                            }
                        } catch (detailError) {
                            console.log(`   ⚠ Could not load all details for job ${allJobs.length + 1}`);
                        }

                        const job: Job = {
                            id: jobId,
                            title,
                            link,
                            applyUrl,
                            location,
                            postedAt,
                            companyName,
                            companyLogo,
                            companyLinkedinUrl,
                            companyWebsite: '',
                            companyDescription: '',
                            companyAddress: '',
                            companyEmployeesCount: '',
                            description,
                            employmentType,
                            seniorityLevel,
                            salary,
                            salaryInfo: salary,
                            industries: '',
                            jobFunction: '',
                            jobPosterName: '',
                            jobPosterTitle: '',
                            jobPosterPhoto: '',
                            jobPosterProfileUrl: '',
                        };

                        allJobs.push(job);
                        console.log(`   ✓ Scraped ${allJobs.length}/${maxJobs}: ${job.title} at ${job.companyName}`);
                    } catch (error) {
                        console.log(`   ✗ Error scraping job ${allJobs.length + 1}:`, (error as Error).message);
                        continue;
                    }
                }

                // If we have enough jobs, stop
                if (allJobs.length >= maxJobs) {
                    console.log(`   ✓ Reached target of ${maxJobs} jobs!`);
                    break;
                }

                // Try to find and click the "Next" button
                const nextButtonSelectors = [
                    'button[aria-label="View next page"]',
                    'button[aria-label="Next"]',
                    '.artdeco-pagination__button--next',
                    'button.artdeco-pagination__button--next',
                ];

                let nextButton: any = null;
                for (const selector of nextButtonSelectors) {
                    nextButton = await this.page.$(selector);
                    if (nextButton) {
                        const isDisabled = await nextButton.evaluate(
                            (el: any) => el.disabled || el.getAttribute('aria-disabled') === 'true',
                        );
                        if (!isDisabled) {
                            break;
                        } else {
                            nextButton = null;
                        }
                    }
                }

                if (!nextButton) {
                    console.log(`   ⚠ No more pages available. Total jobs: ${allJobs.length}`);
                    break;
                }

                // Click the next button
                console.log(`   ➡️  Clicking Next to load page ${currentPage + 1}...`);
                await nextButton.click();
                await this.page.waitForTimeout(3000); // Wait for next page to load
                currentPage++;
            }

            console.log(`\n✓ Successfully scraped ${allJobs.length} jobs!`);

            // Wait for company details queue to finish processing (if running)
            if (this.companyQueue.size > 0) {
                console.log(`\n⏳ Waiting for company details processing to complete...`);

                // Wait for queue processing to finish
                while (this.isProcessingQueue) {
                    await this.page.waitForTimeout(500);
                }

                // Enrich jobs with company details from cache
                console.log(`\n📝 Enriching jobs with company details...`);
                for (const job of allJobs) {
                    if (job.companyLinkedinUrl && this.companyDetailsCache.has(job.companyLinkedinUrl)) {
                        const details = this.companyDetailsCache.get(job.companyLinkedinUrl)!;
                        job.companyWebsite = details.companyWebsite;
                        job.companyDescription = details.companyDescription;
                        job.companyAddress = details.companyAddress;
                        job.companyEmployeesCount = details.companyEmployeesCount;
                        job.industries = details.industries;
                    }
                }
                console.log(`✓ Jobs enriched with company details\n`);
            }

            return allJobs;
        } catch (error) {
            console.error('Error scraping job listings:', (error as Error).message);
            return allJobs;
        }
    }

    async searchJobs(filters?: SearchFilters, maxJobs: number = 10): Promise<Job[]> {
        console.log('\n=== Starting LinkedIn Job Search ===\n');

        try {
            if (!this.loggedIn) {
                const loginSuccess = await this.login();
                if (!loginSuccess) {
                    throw new Error('Login failed');
                }
            }

            const searchUrl = this.buildSearchUrl(filters);
            console.log('🔍 Search URL:', searchUrl);

            if (!this.page) {
                throw new Error('Browser not initialized.');
            }

            console.log('\nApplying filters...');
            if (filters?.keywords) console.log(`   Keywords: ${filters.keywords}`);
            if (filters?.location) console.log(`   Location: ${filters.location}`);
            if (filters?.datePosted) console.log(`   Date Posted: ${filters.datePosted}`);
            if (filters?.experienceLevel) console.log(`   Experience Level: ${filters.experienceLevel.join(', ')}`);
            if (filters?.jobType) console.log(`   Job Type: ${filters.jobType.join(', ')}`);
            if (filters?.remote) console.log(`   Remote: ${filters.remote.join(', ')}`);

            await this.page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
            await this.page.waitForTimeout(3000);

            console.log('\n✓ Filters applied successfully!');

            // Initialize company details worker
            await this.initCompanyWorker();

            const jobs = await this.scrapeJobListings(maxJobs);

            return jobs;
        } catch (error) {
            console.error('Error during job search:', (error as Error).message);
            throw error;
        }
    }

    async close(): Promise<void> {
        // Close company worker context first
        if (this.companyWorkerContext) {
            await this.companyWorkerContext.close();
            this.companyWorkerContext = null;
            this.companyWorkerPage = null;
        }

        if (this.browser) {
            console.log('\nClosing browser...');
            await this.browser.close();
            this.browser = null;
            this.page = null;
            this.loggedIn = false;
        }
    }
}
