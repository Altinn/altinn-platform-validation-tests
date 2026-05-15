import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
    features: 'tests/features/**/*.feature',
    steps: 'tests/steps/**/*.ts',
});

export default defineConfig({
    testDir,
    use: {
        headless: false,
        trace: 'on',
        video: 'retain-on-failure',
    },
});
