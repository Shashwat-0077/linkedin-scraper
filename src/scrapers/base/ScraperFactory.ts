import { BaseScraper } from './BaseScraper.js';
import { SupportedPlatform } from '../../types/scraper.js';
import { LinkedInScraper } from '../linkedin/LinkedInScraper.js';

/**
 * Factory to create platform-specific scrapers
 */
export class ScraperFactory {
    /**
     * Create a scraper instance for the specified platform
     */
    static create(platform: SupportedPlatform, headless: boolean = true): BaseScraper {
        switch (platform) {
            case 'linkedin':
                return new LinkedInScraper(headless);

            case 'foundit':
                throw new Error('Foundit scraper not yet implemented');

            case 'wellfound':
                throw new Error('Wellfound scraper not yet implemented');

            case 'indeed':
                throw new Error('Indeed scraper not yet implemented');

            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
    }

    /**
     * Get list of supported platforms
     */
    static getSupportedPlatforms(): SupportedPlatform[] {
        return ['linkedin']; // Add more as they're implemented
    }

    /**
     * Check if a platform is supported
     */
    static isSupported(platform: string): platform is SupportedPlatform {
        return this.getSupportedPlatforms().includes(platform as SupportedPlatform);
    }
}
