import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint'; // Importación desde el core de ESLint
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/array-type': 'error',
    },
  },
  {
    ignores: [
      'dist',
      'node_modules',
      'coverage',
      '*.config.js',
      '*.config.mjs',
    ],
  },
]);
