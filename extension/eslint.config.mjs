import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import pluginTs from "typescript-eslint";

const BASE_CONFIG = {
  files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  languageOptions: { globals: globals.browser },
};

const IGNORES = { ignores: ["src/vendor/", "dist_*"] };

const TS_CONFIGS = [
  ...pluginTs.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];

/** @type {import('eslint').Linter.Config[]} */
export default [
  BASE_CONFIG,
  pluginJs.configs.recommended,
  ...TS_CONFIGS,
  pluginReact.configs.flat["jsx-runtime"],
  IGNORES,
];
