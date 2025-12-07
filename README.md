# LinkedIn Job Scraper

Automated LinkedIn job scraper with session persistence and Gmail API verification code fetching.

## Features

✅ **Session Persistence** - Saves login cookies to avoid repeated logins and CAPTCHAs  
✅ **Gmail API Integration** - Automatically fetches verification codes from your Gmail  
✅ **Company Details** - Extracts comprehensive company information  
✅ **External Apply URLs** - Captures direct application links  
✅ **Flexible Filtering** - Search by keywords, location, date, experience level, job type, and remote options  
✅ **TypeScript** - Fully typed for better DX

## Installation

```bash
npm install linkedin-job-scraper
```

### Prerequisites

1. **Playwright Browser**:

```bash
npx playwright install chromium
```

2. **LinkedIn Account**: Valid LinkedIn credentials

3. **Gmail API OAuth2 Tokens** (for automatic verification):

```bash
npm run gmail:token
```

## Quick Start

1. **Create `linkedin-scraper.config.cjs` in your project root:**

```javascript
module.exports = {
    email: 'your-linkedin-email@example.com',
    password: 'your-linkedin-password',
    headless: false,
    gmailClientId: 'your-gmail-client-id.apps.googleusercontent.com',
    gmailClientSecret: 'your-gmail-client-secret',
    gmailRedirectUri: 'http://localhost',
    gmailRefreshToken: 'your-gmail-refresh-token',
    gmailAccessToken: 'your-gmail-access-token',
    sessionFile: './sessions/linkedin-session.json',
    tokenFile: './sessions/gmail-token.json',
};
```

2. **Use the scraper:**

```typescript
import { LinkedInScraper } from 'linkedin-job-scraper';

const scraper = new LinkedInScraper();

const jobs = await scraper.searchJobs(
    {
        keywords: 'Software Engineer',
        location: 'San Francisco, CA',
        datePosted: 'past-week',
        experienceLevel: ['entry-level', 'associate'],
        jobType: ['full-time'],
        remote: ['remote', 'hybrid'],
    },
    10, // max jobs
);

console.log(`Found ${jobs.length} jobs`);
await scraper.close();
```

## Configuration

### Configuration File

Create a `linkedin-scraper.config.cjs` file in your project root:

```javascript
module.exports = {
    // LinkedIn Credentials
    email: 'your-email@gmail.com',
    password: 'your-password',

    // Browser options
    headless: false, // Set to true to run without visible browser
    silent: false, // Set to true to suppress console output

    // Gmail API OAuth2 Credentials (for automatic verification code fetching)
    gmailClientId: 'your-client-id.apps.googleusercontent.com',
    gmailClientSecret: 'your-client-secret',
    gmailRedirectUri: 'http://localhost',
    gmailRefreshToken: 'your-refresh-token',
    gmailAccessToken: 'your-access-token',

    // Optional: Custom file paths
    sessionFile: './sessions/linkedin-session.json',
    tokenFile: './sessions/gmail-token.json',
};
```

> **Note:** For security, you can load values from environment variables in the config file:
>
> ```javascript
> email: process.env.LINKEDIN_EMAIL,
> ```

> **Important:** Add `linkedin-scraper.config.cjs` to `.gitignore` if it contains sensitive credentials.

### Gmail API Setup

1. **Generate OAuth2 tokens**:

```bash
npm run gmail:token
```

2. Follow the authorization URL printed in the terminal

3. Paste the authorization code when prompted

4. Tokens will be saved to `token.json`

5. Copy the tokens to your `.env` file

## Usage

### Basic Search

After creating your `linkedin-scraper.config.cjs` file:

```typescript
import { LinkedInScraper } from 'linkedin-job-scraper';

const scraper = new LinkedInScraper();

try {
    const jobs = await scraper.searchJobs(
        {
            keywords: 'Full Stack Developer',
            location: 'Remote',
        },
        20,
    );

    jobs.forEach((job) => {
        console.log(`${job.title} at ${job.companyName}`);
        console.log(`Location: ${job.location}`);
        console.log(`Apply: ${job.applyUrl}\n`);
    });
} finally {
    await scraper.close();
}
```

### Advanced Filtering

```typescript
const jobs = await scraper.searchJobs(
    {
        keywords: 'Machine Learning Engineer',
        location: 'New York, NY',
        datePosted: 'past-24-hours', // 'past-24-hours' | 'past-week' | 'past-month'
        experienceLevel: ['mid-senior', 'director'], // 'internship' | 'entry-level' | 'associate' | 'mid-senior' | 'director' | 'executive'
        jobType: ['full-time', 'contract'], // 'full-time' | 'part-time' | 'contract' | 'temporary' | 'volunteer' | 'internship'
        remote: ['remote'], // 'on-site' | 'remote' | 'hybrid'
    },
    50,
);
```

### Custom Configuration

All configuration is done via the `linkedin-scraper.config.cjs` file. Simply edit this file to customize settings:

```javascript
// linkedin-scraper.config.cjs
module.exports = {
    email: 'your-email@gmail.com',
    password: 'your-password',
    headless: true, // Run in headless mode
    silent: true, // Suppress console output
    gmailClientId: 'your-client-id',
    gmailClientSecret: 'your-client-secret',
    gmailRedirectUri: 'http://localhost',
    gmailRefreshToken: 'your-refresh-token',
    gmailAccessToken: 'your-access-token',
    sessionFile: './custom/path/session.json',
    tokenFile: './custom/path/token.json',
};
```

## API Reference

### `LinkedInScraper`

#### Constructor

```typescript
new LinkedInScraper();
```

Configuration is loaded automatically from `linkedin-scraper.config.cjs` in your project root.

**Configuration Options:**

```typescript
interface LinkedInScraperConfig {
    email: string; // LinkedIn email (required)
    password: string; // LinkedIn password (required)
    headless?: boolean; // Run browser in headless mode (default: false)
    silent?: boolean; // Suppress all console output (default: false)
    gmailClientId: string; // Gmail API client ID (required)
    gmailClientSecret: string; // Gmail API client secret (required)
    gmailRedirectUri: string; // Gmail OAuth redirect URI (required)
    gmailRefreshToken: string; // Gmail OAuth refresh token (required)
    gmailAccessToken: string; // Gmail OAuth access token (required)
    sessionFile?: string; // Path to save LinkedIn session cookies (optional)
    tokenFile?: string; // Path to save Gmail tokens (optional)
}
```

#### Methods

##### `searchJobs(filters, maxJobs)`

Searches for jobs on LinkedIn.

```typescript
searchJobs(filters?: SearchFilters, maxJobs: number = 10): Promise<Job[]>
```

**Parameters:**

-   `filters`: Search filters (optional)
-   `maxJobs`: Maximum number of jobs to scrape (default: 10)

**Returns:** Array of `Job` objects

##### `close()`

Closes the browser and cleans up resources.

```typescript
close(): Promise<void>
```

### Types

#### `SearchFilters`

```typescript
interface SearchFilters {
    keywords?: string;
    location?: string;
    datePosted?: 'any-time' | 'past-24-hours' | 'past-week' | 'past-month';
    experienceLevel?: Array<'internship' | 'entry-level' | 'associate' | 'mid-senior' | 'director' | 'executive'>;
    jobType?: Array<'full-time' | 'part-time' | 'contract' | 'temporary' | 'volunteer' | 'internship'>;
    remote?: Array<'on-site' | 'remote' | 'hybrid'>;
}
```

#### `Job`

```typescript
interface Job {
    id: string;
    title: string;
    link: string;
    applyUrl: string;
    location: string;
    postedAt: string;
    companyName: string;
    companyLinkedinUrl?: string;
    companyWebsite?: string;
    companyDescription?: string;
    companyAddress?: string;
    companyEmployeesCount?: string;
    description: string;
    industries?: string;
}
```

## Session Persistence

The scraper automatically saves your login session to `linkedin-session.json` after successful authentication. On subsequent runs:

1. ✅ Loads saved cookies
2. ✅ Validates session
3. ✅ Skips login if session is valid
4. ✅ Only logs in again if session expired

This **dramatically reduces CAPTCHA challenges** and speeds up execution.

## How It Works

1. **Initialization**: Launches Playwright browser
2. **Session Check**: Loads saved cookies if available
3. **Login**: Authenticates with LinkedIn (if needed)
4. **Verification**: Automatically fetches code from Gmail API if challenged
5. **Search**: Applies filters and navigates job listings
6. **Scraping**: Extracts job details and company information
7. **Company Details**: Fetches additional company data in parallel
8. **Cleanup**: Closes browser and saves session

##Troubleshooting

### CAPTCHA Challenges

-   Session persistence reduces CAPTCHAs by ~90%
-   If CAPTCHA appears, complete it manually in the browser
-   The session will be saved for future runs

### Gmail Verification Not Working

```bash
# Regenerate tokens
npm run gmail:token

# Check tokens in .env
# Ensure refresh_token is valid
```

### Session Not Loading

```bash
# Delete saved session and login again
rm linkedin-session.json
```

## Examples

See the [`examples/`](./examples/) directory for more usage examples.

## License

ISC

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

**Note**: This tool is for educational purposes. Please respect LinkedIn's Terms of Service and use responsibly.
