import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    "dist",
    "node_modules",
  ]),

  {
    files: ["**/*.{js,jsx}"],

    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      globals: globals.browser,

      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    rules: {

      /*
       * React 19
       */

      "react-hooks/set-state-in-effect": "off",

      /*
       * Fast Refresh
       */

      "react-refresh/only-export-components": "off",

      /*
       * Development
       */

      "no-unused-vars": "off",

      "no-undef": "error",

      "no-unreachable": "error",

      "no-constant-condition": "off",
    },
  },
]);