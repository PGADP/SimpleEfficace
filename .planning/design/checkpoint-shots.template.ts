// TEMPLATE — helper de capture pour les checkpoints visuels. UN helper réutilisable,
// pas un script par feature (principe "moins de scripts").
// À copier en tests/e2e/checkpoint-shots.ts au 1er besoin.
//
// Usage par Claude au moment d'un checkpoint visuel (gate VERIFY) :
//   npx playwright test tests/e2e/checkpoint-shots.ts -- --route=/dashboard --name=dashboard
// → capture la route sur les 3 breakpoints dans .planning/phases/<phase>/screenshots/
//   puis Claude lit les PNG et les présente à l'humain pour le GO/NO-GO.

import { test } from '@playwright/test';

const route = process.env.SHOT_ROUTE || '/';
const name = process.env.SHOT_NAME || 'page';
const outDir = process.env.SHOT_OUTDIR || '.planning/_screenshots';

// Un test par projet (desktop/tablet/mobile) via la config — le nom de projet sert de suffixe.
test(`checkpoint shot: ${name}`, async ({ page }, testInfo) => {
  await page.goto(route);
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: `${outDir}/${name}-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
