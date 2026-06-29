import globals from "globals";
import { defineConfig } from "eslint/config";
import stylistic from "@stylistic/eslint-plugin";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default defineConfig([
  {
    plugins: {
      "@stylistic": stylistic,
      "simple-import-sort": simpleImportSort,
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: { globals: globals.browser },
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

      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      "@stylistic/eol-last": ["error", "always"],
      "@stylistic/indent": ["error", 4],
      "@stylistic/comma-spacing": ["error", { before: false, after: true }],
    },
  },
]);
