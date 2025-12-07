#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('Installing Playwright chromium...');

try {
    execSync('npx playwright install chromium', { stdio: 'inherit' });
    console.log('Playwright browser installed successfully.');
} catch (e) {
    console.error('Browser installation failed:', e);
}
