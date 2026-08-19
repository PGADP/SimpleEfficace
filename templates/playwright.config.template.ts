// TEMPLATE Playwright pour les projets Next.js du système SIMPLE & EFFICACE.
// À copier en racine de projet (playwright.config.ts) au 1er besoin de vision/E2E.
// Principe "moins de scripts" : Playwright = UN outil de vision réutilisé par
// (1) le runner de mesure ui-verify, (2) les screenshots de checkpoint VERIFY, (3) l'E2E des parcours critiques.
// PAS un .spec.ts par feature.
//
// Dépendances : npm i -D @playwright/test @axe-core/playwright
// (@axe-core/playwright est ce qui rend les verdicts d'accessibilité mesurés plutôt
//  qu'estimés. Sans lui, ui-verify tourne quand même et les règles WCAG sont SKIPPED.)

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
  // Playwright est le SEUL à lancer un serveur automatiquement : il le démarre s'il n'y en
  // a pas, réutilise celui de l'humain s'il tourne, et ne tue que ce qu'il a lancé.
  // Partout ailleurs, un process long est lancé par l'humain (cf. CONVENTIONS §12).
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
