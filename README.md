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

### Option 1: Config File (Recommended)

Create a `linkedin-scraper.config.js` file in your project root:

```javascript
module.exports = {
    // File Paths - Where to store session and token files
    sessionFile: './linkedin-session.json',
    tokenFile: './token.json',

    // Browser Settings
    headless: false,

    // Optional: Override credentials (not recommended - use .env instead)
    // linkedin: {
    //     email: 'your-email@gmail.com',
    //     password: 'your-password'
    // },

    // Optional: Gmail API settings
    // gmail: {
    //     clientId: 'your-client-id',
    //     clientSecret: 'your-client-secret',
    //     redirectUri: 'http://localhost',
    //     refreshToken: 'your-refresh-token',
    //     accessToken: 'your-access-token'
    // }
};
```

**Priority**: Config file > Environment variables > Defaults

### Option 2: Environment Variables

Create a `.env` file in your project root:

```bash
# LinkedIn Credentials
LINKEDIN_EMAIL=your-email@gmail.com
LINKEDIN_PASSWORD=your-password

# Browser Settings
HEADLESS=false

# Gmail API OAuth2 Credentials (for automatic verification code fetching)
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REDIRECT_URI=http://localhost
GMAIL_REFRESH_TOKEN=your-refresh-token
GMAIL_ACCESS_TOKEN=your-access-token

# File Paths (optional - defaults to project root)
# Customize where session and token files are stored
SESSION_FILE=/custom/path/linkedin-session.json
TOKEN_FILE=/custom/path/token.json
```

**File Path Configuration**:

-   `SESSION_FILE`: Location to store LinkedIn session cookies (default: `./linkedin-session.json`)
-   `TOKEN_FILE`: Location to store Gmail OAuth2 tokens (default: `./token.json`)

These path options allow you to:

-   Store sensitive files in a secure directory
-   Share session/token files across multiple projects
-   Keep your project directory clean

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

```typescript
const scraper = new LinkedInScraper(
    'custom-email@gmail.com',
    'custom-password',
    true, // headless mode
);
```

## API Reference

### `LinkedInScraper`

#### Constructor

```typescript
new LinkedInScraper(email?: string, password?: string, headless?: boolean)
```

-   `email`: LinkedIn email (defaults to `process.env.LINKEDIN_EMAIL`)
-   `password`: LinkedIn password (defaults to `process.env.LINKEDIN_PASSWORD`)
-   `headless`: Run browser in headless mode (defaults to `process.env.HEADLESS`)

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
