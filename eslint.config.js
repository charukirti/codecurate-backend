import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.node } },
  tseslint.configs.recommended,

  {
    rules: {
      "no-console": "warn",

      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
      }],

      "prefer-const": "off",

      "@typescript-eslint/no-empty-object-type": 'off',
      "@typescript-eslint/no-explicit-any": "warn"
    },

  },
  {
    ignores: ["dist/**", "build/**", "node_modules/**", "*.config.js"]
  }


]);
