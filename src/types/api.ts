import { SupportedPlatform, UnifiedFilters } from './scraper.js';
import { Job } from './job.js';

// API Request Types
export interface JobSearchRequest {
    filters: UnifiedFilters;
    maxJobs?: number;
}

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string;
}

export interface JobSearchResponse extends ApiResponse<Job[]> {
    platform: SupportedPlatform;
    count: number;
}

export interface PlatformsResponse extends ApiResponse<string[]> {
    platforms: SupportedPlatform[];
}

export interface HealthResponse {
    status: 'healthy' | 'unhealthy';
    uptime: number;
    timestamp: string;
}
