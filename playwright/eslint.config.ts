import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import playwright from "eslint-plugin-playwright";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import stylistic from "@stylistic/eslint-plugin";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

export default defineConfig(
    {
        ignores: [
            "node_modules/",
            "playwright-report/",
            "test-results/",
            "blob-report/",
            "playwright/.cache/",
            "dist/",
        ],
    },

    eslint.configs.recommended,
    ...tseslint.configs.recommended,

    {
        files: [
            "tests/**/*.ts",
            "fixtures/**/*.ts",
            "flows/**/*.ts",
            "pages/**/*.ts",
            "config/**/*.ts",
            "playwright.config.ts",
        ],

        plugins: {
            playwright,
            "@stylistic": stylistic,
            "simple-import-sort": simpleImportSort,
            "unused-imports": unusedImports,
        },

        rules: {
            ...playwright.configs["flat/recommended"].rules,

            // Playwright
            "playwright/no-skipped-test": "warn",
            "playwright/no-focused-test": "error",
            "playwright/no-wait-for-timeout": "error",
            "playwright/prefer-web-first-assertions": "error",

            // General
            "no-trailing-spaces": "error",
            "no-multiple-empty-lines": ["error", { max: 1 }],

            // Imports
            "unused-imports/no-unused-imports": "error",
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",

            // Formatting
            "@stylistic/eol-last": ["error", "always"],
            "@stylistic/indent": ["error", 4],
            "@stylistic/comma-spacing": [
                "error",
                {
                    before: false,
                    after: true,
                },
            ],
            "@stylistic/linebreak-style": ["error", "unix"],
            "@stylistic/quotes": ["error", "double"],
            "@stylistic/semi": ["error", "always"],

            // Spacing around blocks/statements
            "padding-line-between-statements": [
                "error",
                { blankLine: "always", prev: "import", next: "*" },
                { blankLine: "any", prev: "import", next: "import" },
            ],
        },
    },
);
