import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Serwist compiles the service worker bundle into public/ on every build.
    'public/sw.js',
    'public/workbox-*.js',
    // Browser-tool artefacts and brand source images, not application code.
    '.playwright-mcp/**',
    'public/*.png',
    'public/**/*.jpg',
    // Accidental OneDrive duplicate; nothing here is served or built.
    'public - Copy/**',
  ]),
])

export default eslintConfig
