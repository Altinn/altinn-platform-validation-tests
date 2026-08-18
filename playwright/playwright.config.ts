import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Miljøet velges med TEST_ENV, som npm-scriptene setter. URLene ligger i
// .env.<miljø> og er sjekket inn. Hemmeligheter ligger i .env, eller i
// .env.<miljø>.local når de er miljøspesifikke; begge er gitignorert.
//
// dotenv overstyrer aldri en variabel som allerede er satt, så rekkefølgen her
// gir presedensen: ekte env (Kubernetes) > .env.<miljø>.local > .env.<miljø> > .env.
// Miljøfila vinner over .env, slik at en verdi du legger i .env bare gjelder de
// miljøene som ikke har sin egen.
const environment = process.env.TEST_ENV || 'at23';

dotenv.config({ path: path.join(__dirname, `.env.${environment}.local`), quiet: true });
dotenv.config({ path: path.join(__dirname, `.env.${environment}`), quiet: true });
dotenv.config({ path: path.join(__dirname, '.env'), quiet: true });

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
