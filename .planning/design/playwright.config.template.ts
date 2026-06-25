// TEMPLATE Playwright pour les projets Next.js du système SIMPLE & EFFICACE.
// À copier en racine de projet (playwright.config.ts) au 1er besoin de vision/E2E.
// Principe "moins de scripts" : Playwright = UN outil de vision réutilisé par
// (1) le détecteur visuel ui-guard, (2) les screenshots de checkpoint VERIFY, (3) l'E2E des parcours critiques.
// PAS un .spec.ts par feature.

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['json', { outputFile: '.planning/_playwright-results.json' }]],
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  // 3 breakpoints = les 3 vues présentées au checkpoint visuel humain.
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'tablet', use: { ...devices['iPad Pro'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  // Claude lance le serveur lui-même (cf. principe checkpoints : l'humain ne lance jamais une commande).
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
