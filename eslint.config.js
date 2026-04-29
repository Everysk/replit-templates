import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import barrelFiles from 'eslint-plugin-barrel-files'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.replit_integration_files/**', '.local/**']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'barrel-files': barrelFiles },
    rules: {
      'barrel-files/avoid-barrel-files': 'error',
      'barrel-files/avoid-re-export-all': 'error',
      'barrel-files/avoid-namespace-import': 'error',
    },
  },
])
