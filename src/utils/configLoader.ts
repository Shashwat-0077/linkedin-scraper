import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

/**
 * Configuration interface matching the expected structure in linkedin-scraper.config.cjs
 */
export interface LinkedInScraperConfig {
    // LinkedIn credentials
    email: string;
    password: string;
    headless?: boolean;
    silent?: boolean;

    // Gmail API credentials
    gmailClientId: string;
    gmailClientSecret: string;
    gmailRedirectUri: string;
    gmailRefreshToken: string;
    gmailAccessToken: string;

    // File paths
    sessionFile?: string;
    tokenFile?: string;
}

/**
 * Finds the config file by searching upward from the current working directory
 * @returns Absolute path to the config file
 */
function findConfigFile(): string | null {
    const configFileName = 'linkedin-scraper.config.cjs';
    let currentDir = process.cwd();
    const root = path.parse(currentDir).root;

    // Search upward from current directory to root
    while (currentDir !== root) {
        const configPath = path.join(currentDir, configFileName);
        if (fs.existsSync(configPath)) {
            return configPath;
        }
        currentDir = path.dirname(currentDir);
    }

    // Check root directory
    const rootConfigPath = path.join(root, configFileName);
    if (fs.existsSync(rootConfigPath)) {
        return rootConfigPath;
    }

    return null;
}

/**
 * Validates that all required configuration fields are present
 * @param config - Configuration object to validate
 * @throws Error if required fields are missing
 */
function validateConfig(config: any): asserts config is LinkedInScraperConfig {
    const requiredFields = [
        'email',
        'password',
        'gmailClientId',
        'gmailClientSecret',
        'gmailRedirectUri',
        'gmailRefreshToken',
        'gmailAccessToken',
    ];

    const missingFields = requiredFields.filter((field) => !config[field]);

    if (missingFields.length > 0) {
        throw new Error(
            `Missing required fields in linkedin-scraper.config.cjs: ${missingFields.join(', ')}\n` +
                `Please ensure all required fields are defined in your config file.`,
        );
    }
}

/**
 * Loads and validates configuration from linkedin-scraper.config.cjs (synchronously)
 * @returns Validated configuration object
 * @throws Error if config file not found or invalid
 */
export function loadConfigSync(): LinkedInScraperConfig {
    const configPath = findConfigFile();

    if (!configPath) {
        throw new Error(
            'Configuration file "linkedin-scraper.config.cjs" not found.\n' +
                'Please create this file in your project root directory.\n' +
                'See the documentation for configuration options: https://github.com/Shashwat-0077/linkedin-scraper',
        );
    }

    let config: any;
    try {
        // For ESM compatibility: use createRequire to load CommonJS modules
        const require = createRequire(import.meta.url);
        const configModule = require(configPath);
        config = configModule.default || configModule;
    } catch (error) {
        throw new Error(`Failed to load configuration from ${configPath}:\n${(error as Error).message}`);
    }

    if (!config || typeof config !== 'object') {
        throw new Error(
            `Invalid configuration in ${configPath}.\n` + 'The config file must export a configuration object.',
        );
    }

    validateConfig(config);

    return config;
}

/**
 * Loads and validates configuration from linkedin-scraper.config.cjs (async version)
 * @returns Validated configuration object
 * @throws Error if config file not found or invalid
 */
export async function loadConfig(): Promise<LinkedInScraperConfig> {
    const configPath = findConfigFile();

    if (!configPath) {
        throw new Error(
            'Configuration file "linkedin-scraper.config.cjs" not found.\n' +
                'Please create this file in your project root directory.\n' +
                'See the documentation for configuration options: https://github.com/Shashwat-0077/linkedin-scraper',
        );
    }

    let config: any;
    try {
        // Use dynamic import for ESM compatibility with .cjs files
        const configModule = await import(`file://${configPath}`);
        config = configModule.default || configModule;
    } catch (error) {
        throw new Error(`Failed to load configuration from ${configPath}:\n${(error as Error).message}`);
    }

    if (!config || typeof config !== 'object') {
        throw new Error(
            `Invalid configuration in ${configPath}.\n` + 'The config file must export a configuration object.',
        );
    }

    validateConfig(config);

    return config;
}
