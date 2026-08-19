import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    testMatch: '**/*.spec.ts',
    fullyParallel: true,
    // Minst én retry overalt, slik at en flaky kjøring ikke rapporteres som feil.
    // Traces skrives ved første retry, så et reelt problem har full sporing.
    retries: process.env.CI ? 2 : 1,
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
