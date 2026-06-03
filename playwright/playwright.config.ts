import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const bddTestDir = defineBddConfig({
    features: 'tests/bdd/features/**/*.feature',
    steps: [
        'tests/bdd/steps/**/*.ts',
        'fixtures/**/*.ts',
    ],
});

export default defineConfig({
    timeout: 60000,
    projects: [
        {
            name: 'bdd',
            testDir: bddTestDir,
        },

        {
            name: 'native',
            testDir: './tests',
            testMatch: '**/*.spec.ts',
        },
    ],

    use: {
        headless: true,
        trace: 'on',
        video: 'retain-on-failure',
    },
});
