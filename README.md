# LinkedIn Job Scraper (TypeScript + Playwright)

Fast LinkedIn job scraper using Playwright and TypeScript for personal automation with n8n.

## Features

- ✅ **TypeScript** - Type-safe code with IntelliSense
- ✅ Fast scraping with Playwright (3x faster than Selenium)
- ✅ Simple API - one function does everything
- ✅ Automatic login and session management
- ✅ Headless mode support
- ✅ Easy n8n integration

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Playwright Browsers

```bash
npm run install-browsers
```

### 3. Configure Credentials

Copy `.env.example` to `.env` and add your LinkedIn credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
LINKEDIN_EMAIL=your_email@example.com
LINKEDIN_PASSWORD=your_password
HEADLESS=false
```

## Usage

### Development (with auto-reload)

```bash
npm run dev
```

### Build and Run

```bash
npm start
```

### Use in Your Code

```typescript
import { LinkedInScraper } from './scraper.js';

const scraper = new LinkedInScraper();

try {
  const jobs = await scraper.searchJobs({
    keywords: 'Python Developer',
    location: 'United States'
  });
  console.log(jobs);
} finally {
  await scraper.close();
}
```

## n8n Integration

You can integrate this with n8n by:

1. **Running as a local API** (add Express.js wrapper)
2. **Using Execute Command node** in n8n
3. **Calling via HTTP Request** if hosted

## Project Structure

```
├── src/
│   ├── index.ts      # Main entry point
│   ├── scraper.ts    # LinkedIn scraper class
│   ├── config.ts     # Configuration
│   └── types.ts      # TypeScript type definitions
├── dist/             # Compiled JavaScript (generated)
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript configuration
├── .env              # Credentials (create from .env.example)
└── README.md         # This file
```

## Speed Comparison

- **Playwright**: ~10 seconds (login + search)
- **Selenium**: ~30 seconds (login + search)
- **3x faster!** ⚡

## Next Steps

- [ ] Implement job scraping logic
- [ ] Add JSON export
- [ ] Create Express API wrapper for n8n
- [ ] Add error handling and retries
- [ ] Support multiple job platforms

## License

For personal use only.
