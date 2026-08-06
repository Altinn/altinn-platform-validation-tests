import globals from "globals";
import { defineConfig } from "eslint/config";
import stylistic from "@stylistic/eslint-plugin";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import jsdoc from "eslint-plugin-jsdoc";
import unusedImports from "eslint-plugin-unused-imports";

export default defineConfig([
  {
    plugins: {
      "@stylistic": stylistic,
      "simple-import-sort": simpleImportSort,
      jsdoc,
      "unused-imports": unusedImports,
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    languageOptions: {
      globals: {
        __ENV: "readonly",
        __ITER: "readonly",
      },
    },
  },
  {
    rules: {
      semi: 2,
      quotes: 2,
      "no-undef": 2,

      "unused-imports/no-unused-imports": "error",

      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      "@stylistic/eol-last": ["error", "always"],
      "@stylistic/indent": ["error", 4],
      "@stylistic/comma-spacing": ["error", { before: false, after: true }],

      "no-multiple-empty-lines": ["error", { max: 1 }],
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "import", next: "*" },
        { blankLine: "any", prev: "import", next: "import" }
      ],

      "jsdoc/check-alignment": "error",
      "jsdoc/check-indentation": "error",
      "jsdoc/check-line-alignment": "error",
      "jsdoc/multiline-blocks": [
        "error",
        {
          noSingleLineBlocks: true,
        },
      ],
      "jsdoc/require-asterisk-prefix": "error",
      "jsdoc/tag-lines": [
        "error",
        "never",
        {
          startLines: 1,
        },
      ],
      "jsdoc/sort-tags": "error",
      "jsdoc/check-param-names": "error",
      "jsdoc/check-tag-names": "error",
      "jsdoc/check-types": "error",
      "jsdoc/require-param": "error",
      "jsdoc/require-param-description": "error",
      "jsdoc/require-returns": "error",
      "jsdoc/require-returns-description": "error",
    },
  },
]);
