import { SupportedPlatform } from './scraper.js';

export interface Job {
    platform: SupportedPlatform;
    id?: string;
    title: string;
    link: string;
    applyUrl?: string;
    location?: string;
    postedAt?: string;

    // Company Info
    companyName: string;
    companyWebsite?: string;
    companyLinkedinUrl?: string;
    companyDescription?: string;
    companyAddress?: string;
    companyEmployeesCount?: string;

    // Job Details
    description?: string;
    industries?: string;
}
