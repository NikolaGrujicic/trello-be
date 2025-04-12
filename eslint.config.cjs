const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const typescriptParser = require("@typescript-eslint/parser");
const jest = require("eslint-plugin-jest");
const prettier = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
      },
      globals: {
        node: true,
        jest: true,
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      jest,
      prettier,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...jest.configs.recommended.rules,
      ...prettierConfig.rules,
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": ["warn", { allow: ["error"] }],
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
    },
  },
];
