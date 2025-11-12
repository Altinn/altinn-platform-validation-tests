import globals from "globals";
import { defineConfig } from "eslint/config";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfig([
  {
    plugins: {
      "@stylistic": stylistic
    },
  }, {
    files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.browser }
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
      "semi": 2,
      "quotes": 2,
      "no-undef": 2,
      "@stylistic/eol-last": ["error", "always"],
      "@stylistic/indent": ["error", 4],
    },
  },
]);
