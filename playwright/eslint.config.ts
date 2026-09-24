import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,

    {
        files: ['tests/**/*.{ts,tsx}'],
        plugins: {
            playwright,
        },
        rules: {
            ...playwright.configs['flat/recommended'].rules,

            // Project-specific preferences
            'playwright/no-skipped-test': 'warn',
            'playwright/no-focused-test': 'error',
            'playwright/no-wait-for-timeout': 'error',
            'playwright/prefer-web-first-assertions': 'error',
        },
    },

    {
        ignores: [
            'playwright-report/',
            'test-results/',
            'blob-report/',
            'playwright/.cache/',
            'dist/',
            'node_modules/',
        ],
    },
);
