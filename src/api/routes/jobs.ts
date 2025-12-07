import { Router, Request, Response } from 'express';
import { ScraperFactory } from '../../scrapers/base/ScraperFactory.js';
import { JobSearchRequest, JobSearchResponse, PlatformsResponse, HealthResponse } from '../../types/api.js';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response<HealthResponse>) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

/**
 * GET /api/platforms
 * List all supported platforms
 */
router.get('/platforms', (req: Request, res: Response<PlatformsResponse>) => {
    const platforms = ScraperFactory.getSupportedPlatforms();

    res.json({
        success: true,
        platforms,
        data: platforms,
        timestamp: new Date().toISOString(),
    });
});

/**
 * POST /api/:platform/jobs/search
 * Search jobs for a specific platform
 */
router.post('/:platform/jobs/search', async (req: Request, res: Response<JobSearchResponse>) => {
    try {
        const platform = req.params.platform;

        // Validate platform
        if (!ScraperFactory.isSupported(platform)) {
            res.status(400).json({
                success: false,
                platform: platform as any,
                count: 0,
                error: `Unsupported platform: ${platform}. Supported platforms: ${ScraperFactory.getSupportedPlatforms().join(
                    ', ',
                )}`,
                timestamp: new Date().toISOString(),
            });
            return;
        }

        const { filters = {}, maxJobs = 10 }: JobSearchRequest = req.body;

        // Create scraper instance
        const scraper = ScraperFactory.create(platform);

        try {
            // Initialize and search
            await scraper.initialize();
            const jobs = await scraper.searchJobs(filters, maxJobs);

            res.json({
                success: true,
                platform,
                count: jobs.length,
                data: jobs,
                timestamp: new Date().toISOString(),
            });
        } finally {
            // Always close scraper
            await scraper.close();
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            platform: req.params.platform as any,
            count: 0,
            error: (error as Error).message,
            timestamp: new Date().toISOString(),
        });
    }
});

export default router;
