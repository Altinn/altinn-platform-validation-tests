import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    testMatch: '**/*.spec.ts',
    fullyParallel: true,
    retries: process.env.CI ? 2 : 0,
    reporter: [
        ['html', { open: 'never' }],
        ['junit', { outputFile: 'test-results.xml' }],
        ['json', { outputFile: 'test-results.json' }]
    ],
    timeout: 60000,
    use: {
        headless: true,
        trace: 'on-first-retry',
        video: 'retain-on-failure',
    },
});
