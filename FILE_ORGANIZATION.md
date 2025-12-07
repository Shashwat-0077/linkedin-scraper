# Job Scraper API - File Organization

## Project Structure

```
src/
├── api/                        # API Server (new)
│   ├── server.ts              # Express server entry point
│   ├── routes/
│   │   └── jobs.ts            # API route handlers
│   └── middleware/
│       └── errorHandler.ts    # Error handling
│
├── scrapers/                   # Platform scrapers (new)
│   ├── base/
│   │   ├── BaseScraper.ts     # Abstract base class
│   │   └── ScraperFactory.ts  # Factory pattern
│   ├── linkedin/
│   │   ├── LinkedInScraper.ts # LinkedIn API wrapper
│   │   ├── gmailService.ts    # Gmail verification
│   │   └── companyWorker.ts   # Company details worker
│   └── [future platforms]/
│
├── types/                      # Type definitions (new)
│   ├── job.ts                 # Job interface
│   ├── scraper.ts             # Scraper interfaces
│   └── api.ts                 # API types
│
├── scraper.ts                  # Original LinkedIn scraper (CLI)
├── gmailService.ts             # Gmail service (CLI)
├── companyWorker.ts            # Company worker (CLI)
├── types.ts                    # Type definitions (CLI)
├── config.ts                   # Configuration (shared)
└── index.ts                    # CLI entry point
```

## Usage

### API Server (Headless)

```bash
npm run api
```

Server runs on http://localhost:3000

### CLI (Original)

```bash
npm run dev
```

Backward compatible command-line scraper

## Files Explanation

**API-related files** (new architecture):

-   `src/api/` - REST API implementation
-   `src/scrapers/` - Extensible scraper architecture
-   `src/types/` - Unified type definitions

**CLI-related files** (original, kept for backward compatibility):

-   `src/scraper.ts` - Original LinkedIn scraper
-   `src/gmailService.ts` - Gmail verification service
-   `src/companyWorker.ts` - Parallel company processing
-   `src/types.ts` - Original type definitions
-   `src/index.ts` - CLI entry point

**Shared files**:

-   `src/config.ts` - Configuration used by both CLI and API

## Why Keep Both?

The original CLI files are kept for:

1. **Backward compatibility** - `npm run dev` still works
2. **Wrapper pattern** - API wraps existing scraper
3. **No duplication** - API reuses proven CLI logic

Future: Original files can be deprecated once all platforms are migrated to the new architecture.
