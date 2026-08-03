// TEMPLATE — le runner de vérification UI du système SIMPLE & EFFICACE.
// À copier en tests/e2e/ui-verify.spec.ts au 1er besoin de checkpoint visuel.
//
// UN runner pour tout : captures, accessibilité, styles calculés, mouvement,
// performance, textes visibles. Pas un script par dimension.
//
// Produit, par breakpoint, un `ui-report.<breakpoint>.json` que
// `$HOME/.claude/se/scripts/ui-verdict.cjs` croise avec les règles UI (`.planning/rules/ui-rules.json` du projet s'il existe, sinon `~/.claude/se/rules/ui-rules.json`) pour rendre
// un verdict BLOCK / FLAG / PASS mesuré. Une métrique absente ne bloque jamais.
//
// Lancement (Claude, jamais l'humain) :
//   UI_ROUTE=/dashboard UI_NAME=dashboard npx playwright test tests/e2e/ui-verify.spec.ts
//   node "$HOME/.claude/se/scripts/ui-verdict.cjs" --name dashboard
//
// Variables d'environnement (Playwright ne transmet pas de flags custom) :
//   UI_ROUTE        route à vérifier (défaut '/')
//   UI_NAME         nom court de l'écran, sert de préfixe de fichier (défaut 'page')
//   UI_OUTDIR       dossier de sortie (défaut '.planning/_ui')
//   UI_STATES_FILE  manifeste d'états à capturer (voir plus bas) — optionnel
//   UI_ACCENT_VAR   variable CSS de l'accent (défaut '--color-accent')
//
// Manifeste d'états (`.planning/design/states.<name>.json`), optionnel :
//   { "expected": ["loading","empty","error","success","disabled"],
//     "reachable": [ { "name": "empty", "route": "/projects?mock=empty" } ] }
// Sans manifeste, `states.missing` est absent du rapport → règle SKIPPED, pas de blocage.

import fs from 'node:fs';
import path from 'node:path';
import { test, expect, type Page } from '@playwright/test';

const ROUTE = process.env.UI_ROUTE || '/';
const NAME = process.env.UI_NAME || 'page';
const OUT_DIR = process.env.UI_OUTDIR || '.planning/_ui';
const ACCENT_VAR = process.env.UI_ACCENT_VAR || '--color-accent';
const STATES_FILE = process.env.UI_STATES_FILE || `.planning/design/states.${NAME}.json`;

const SPACING_GRID = 4;
const TOUCH_TARGET_MIN_PX = 44;
const TOUCH_TARGET_EXCEPTIONS = [TOUCH_TARGET_MIN_PX];
const STANDARD_SPACING_SCALE = [0, 4, 8, 16, 24, 32, 48, 64];
const MAX_TRANSITION_MS = 400;
const MIN_TYPE_SCALE_RATIO = 1.125;
const MAX_SAMPLES = 20;
const TAB_PROBE_COUNT = 40;
const FOCUS_PROBE_LIMIT = 30;
const SETTLE_MS = 400;
const PERF_OBSERVER_WINDOW_MS = 500;
const REDUCED_MOTION_TOLERANCE_MS = 100;
const MAX_TEXT_SAMPLES = 200;
const MAX_TEXT_LENGTH = 300;
const MIN_VISIBLE_OPACITY = 0.05;
const BODY_SIZE_RANGE_PX = [12, 18];
// axe rule ids that mean 'an interactive control has no accessible name'
const UNLABELED_CONTROL_RULES = ['button-name', 'link-name', 'input-image-alt', 'aria-command-name', 'label'];
const CONTRAST_RULES = ['color-contrast', 'color-contrast-enhanced'];

const INTERACTIVE_SELECTOR =
  'a[href], button, input, select, textarea, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [tabindex]:not([tabindex="-1"])';

type Report = Record<string, unknown>;

/** Collect everything measurable from the rendered page in a single browser round-trip. */
async function collectFromDom(page: Page, accentVar: string) {
  return page.evaluate(
    ({
      accentVar,
      grid,
      touchMin,
      touchExceptions,
      standardScale,
      maxTransitionMs,
      minScaleRatio,
      maxSamples,
      interactiveSelector,
      minOpacity,
      bodyRange,
      maxTextLength,
      maxTextSamples,
    }) => {
      const sample = <T,>(arr: T[]) => arr.slice(0, maxSamples);
      const round = (n: number) => Math.round(n * 100) / 100;

      const describe = (el: Element): string => {
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const cls = typeof el.className === 'string' && el.className
          ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}`
          : '';
        return `${tag}${id}${cls}`;
      };

      const isVisible = (el: Element): boolean => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        const cs = getComputedStyle(el);
        return cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > minOpacity;
      };

      const hasOwnText = (el: Element): boolean =>
        Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent || '').trim().length > 0);

      const parseColor = (value: string): [number, number, number, number] | null => {
        const m = value.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const parts = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
        if (parts.length < 3 || parts.some(Number.isNaN)) return null;
        return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1];
      };

      const all = Array.from(document.querySelectorAll('*')).filter(isVisible);

      // --- Typography -----------------------------------------------------
      const sizes = new Map<number, string>();
      const weights = new Map<number, string>();
      const families = new Map<string, string>();
      let bodyLineHeightRatio: number | null = null;

      for (const el of all) {
        if (!hasOwnText(el)) continue;
        const cs = getComputedStyle(el);
        const size = round(parseFloat(cs.fontSize));
        const weight = parseInt(cs.fontWeight, 10) || 400;
        const family = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
        if (size > 0 && !sizes.has(size)) sizes.set(size, describe(el));
        if (!weights.has(weight)) weights.set(weight, describe(el));
        if (family && !families.has(family)) families.set(family, describe(el));

        // The most-used size below 20px stands in for body copy.
        if (size >= bodyRange[0] && size <= bodyRange[1] && bodyLineHeightRatio === null) {
          const lh = parseFloat(cs.lineHeight);
          if (!Number.isNaN(lh)) bodyLineHeightRatio = round(lh / size);
        }
      }

      const sortedSizes = [...sizes.keys()].sort((a, b) => a - b);
      const adjacentSizesTooClose: string[] = [];
      for (let i = 1; i < sortedSizes.length; i += 1) {
        const ratio = sortedSizes[i] / sortedSizes[i - 1];
        if (ratio < minScaleRatio) {
          adjacentSizesTooClose.push(`${sortedSizes[i - 1]}px / ${sortedSizes[i]}px (ratio ${round(ratio)})`);
        }
      }

      // --- Spacing --------------------------------------------------------
      const offGrid = new Map<string, string>();
      const outsideScale = new Map<string, string>();
      const spacingProps = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'rowGap', 'columnGap'] as const;

      for (const el of all) {
        const cs = getComputedStyle(el);
        for (const prop of spacingProps) {
          const raw = cs[prop];
          if (!raw || !raw.endsWith('px')) continue;
          const value = parseFloat(raw);
          if (!Number.isFinite(value) || value === 0) continue;
          const rounded = Math.round(value);
          if (touchExceptions.includes(rounded)) continue;
          const key = `${rounded}px`;
          if (rounded % grid !== 0 && !offGrid.has(key)) offGrid.set(key, `${key} sur ${describe(el)} (${prop})`);
          else if (rounded % grid === 0 && !standardScale.includes(rounded) && !outsideScale.has(key)) {
            outsideScale.set(key, `${key} sur ${describe(el)} (${prop})`);
          }
        }
      }

      // --- Touch targets ---------------------------------------------------
      const smallTouchTargets: string[] = [];
      for (const el of Array.from(document.querySelectorAll(interactiveSelector))) {
        if (!isVisible(el)) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width < touchMin || rect.height < touchMin) {
          smallTouchTargets.push(`${describe(el)} — ${Math.round(rect.width)}×${Math.round(rect.height)}px`);
        }
      }

      // --- Color -----------------------------------------------------------
      const pureBlackOrWhite: string[] = [];
      const accentRaw = getComputedStyle(document.documentElement).getPropertyValue(accentVar).trim();
      let accentArea = 0;
      const viewportArea = window.innerWidth * window.innerHeight;

      // Resolve the accent token to a comparable rgb() string.
      let accentRgb: string | null = null;
      if (accentRaw) {
        const probe = document.createElement('div');
        probe.style.color = `var(${accentVar})`;
        probe.style.position = 'absolute';
        probe.style.pointerEvents = 'none';
        document.body.appendChild(probe);
        const resolved = getComputedStyle(probe).color;
        probe.remove();
        const parsed = parseColor(resolved);
        if (parsed) accentRgb = `${parsed[0]},${parsed[1]},${parsed[2]}`;
      }

      for (const el of all) {
        const cs = getComputedStyle(el);
        for (const [prop, value] of [['color', cs.color], ['background-color', cs.backgroundColor]] as const) {
          const parsed = parseColor(value);
          if (!parsed || parsed[3] === 0) continue;
          const [r, g, b] = parsed;
          if ((r === 0 && g === 0 && b === 0) || (r === 255 && g === 255 && b === 255)) {
            if (pureBlackOrWhite.length < maxSamples) pureBlackOrWhite.push(`${describe(el)} (${prop})`);
          }
          if (accentRgb && prop === 'background-color' && `${r},${g},${b}` === accentRgb) {
            const rect = el.getBoundingClientRect();
            accentArea += Math.max(0, rect.width) * Math.max(0, rect.height);
          }
        }
      }

      // --- Layout ----------------------------------------------------------
      const docWidth = document.documentElement.clientWidth;
      const horizontalOverflow: string[] = [];
      if (document.documentElement.scrollWidth > docWidth + 1) {
        for (const el of all) {
          const rect = el.getBoundingClientRect();
          if (rect.right > docWidth + 1 && rect.width <= docWidth) {
            horizontalOverflow.push(`${describe(el)} dépasse de ${Math.round(rect.right - docWidth)}px`);
            if (horizontalOverflow.length >= maxSamples) break;
          }
        }
        if (horizontalOverflow.length === 0) horizontalOverflow.push(`document (${document.documentElement.scrollWidth}px pour ${docWidth}px de viewport)`);
      }

      // --- Motion ----------------------------------------------------------
      const longTransitions: string[] = [];
      for (const el of all) {
        const cs = getComputedStyle(el);
        const durations = [...cs.transitionDuration.split(','), ...cs.animationDuration.split(',')];
        for (const d of durations) {
          const trimmed = d.trim();
          if (!trimmed) continue;
          const ms = trimmed.endsWith('ms') ? parseFloat(trimmed) : parseFloat(trimmed) * 1000;
          if (Number.isFinite(ms) && ms > maxTransitionMs) {
            longTransitions.push(`${describe(el)} — ${Math.round(ms)}ms`);
            break;
          }
        }
        if (longTransitions.length >= maxSamples) break;
      }

      // --- Visible text (feeds /se-humanizer) -------------------------------
      const visibleText: string[] = [];
      const seenText = new Set<string>();
      for (const el of all) {
        if (!hasOwnText(el)) continue;
        const text = (el.textContent || '').trim().replace(/\s+/g, ' ');
        if (text.length < 2 || text.length > maxTextLength || seenText.has(text)) continue;
        seenText.add(text);
        visibleText.push(text);
      }

      return {
        typography: {
          sizeCount: sizes.size,
          sizes: sortedSizes,
          weightCount: weights.size,
          weights: [...weights.keys()].sort((a, b) => a - b),
          familyCount: families.size,
          families: [...families.keys()],
          bodyLineHeightRatio,
          adjacentSizesTooClose: sample(adjacentSizesTooClose),
        },
        spacing: {
          offGridValues: sample([...offGrid.values()]),
          outsideStandardScale: sample([...outsideScale.values()]),
          smallTouchTargets: sample(smallTouchTargets),
        },
        color: {
          accentToken: accentRaw || null,
          accentAreaRatio: accentRgb ? round(accentArea / viewportArea) : null,
          pureBlackOrWhite: sample(pureBlackOrWhite),
        },
        layout: { horizontalOverflow: sample(horizontalOverflow) },
        motion: { longTransitions: sample(longTransitions) },
        text: { visible: visibleText.slice(0, maxTextSamples) },
      };
    },
    {
      accentVar,
      grid: SPACING_GRID,
      touchMin: TOUCH_TARGET_MIN_PX,
      touchExceptions: TOUCH_TARGET_EXCEPTIONS,
      standardScale: STANDARD_SPACING_SCALE,
      maxTransitionMs: MAX_TRANSITION_MS,
      minScaleRatio: MIN_TYPE_SCALE_RATIO,
      maxSamples: MAX_SAMPLES,
      interactiveSelector: INTERACTIVE_SELECTOR,
      minOpacity: MIN_VISIBLE_OPACITY,
      bodyRange: BODY_SIZE_RANGE_PX,
      maxTextLength: MAX_TEXT_LENGTH,
      maxTextSamples: MAX_TEXT_SAMPLES,
    },
  );
}

/** Focus each control and check something visibly changes. `outline: none` with no replacement is the target. */
async function collectFocusVisible(page: Page) {
  const handles = await page.locator(INTERACTIVE_SELECTOR).all();
  const missing: string[] = [];
  for (const handle of handles.slice(0, FOCUS_PROBE_LIMIT)) {
    if (!(await handle.isVisible().catch(() => false))) continue;
    const result = await handle
      .evaluate((el: HTMLElement) => {
        const snapshot = (node: Element) => {
          const cs = getComputedStyle(node);
          return `${cs.outlineStyle}|${cs.outlineWidth}|${cs.outlineColor}|${cs.boxShadow}|${cs.borderColor}|${cs.backgroundColor}`;
        };
        const before = snapshot(el);
        el.focus();
        const after = snapshot(el);
        const tag = el.tagName.toLowerCase();
        const label = el.getAttribute('aria-label') || (el.textContent || '').trim().slice(0, 30);
        return { changed: before !== after, id: `${tag}${label ? ` « ${label} »` : ''}` };
      })
      .catch(() => null);
    if (result && !result.changed) missing.push(result.id);
  }
  return missing;
}

/** Tab through the page; a focus that never moves is a trap. */
async function collectKeyboardTraps(page: Page) {
  const traps: string[] = [];
  const seen: string[] = [];
  for (let i = 0; i < TAB_PROBE_COUNT; i += 1) {
    await page.keyboard.press('Tab');
    const current = await page
      .evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return 'body';
        const label = el.getAttribute('aria-label') || (el.textContent || '').trim().slice(0, 20);
        return `${el.tagName.toLowerCase()}${label ? `:${label}` : ''}#${Array.from(document.querySelectorAll(el.tagName)).indexOf(el)}`;
      })
      .catch(() => 'unknown');
    seen.push(current);
    const tail = seen.slice(-4);
    if (tail.length === 4 && tail.every((v) => v === tail[0]) && tail[0] !== 'body') {
      traps.push(`focus bloqué sur ${tail[0]}`);
      break;
    }
  }
  return traps;
}

/** Core Web Vitals. INP is approximated by the latency of one real interaction. */
async function collectPerf(page: Page) {
  return page.evaluate(async (observerWindowMs) => {
    const lcp = await new Promise<number | null>((resolve) => {
      let value: number | null = null;
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
          if (last) value = Math.round(last.startTime);
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(value);
        }, observerWindowMs);
      } catch {
        resolve(null);
      }
    });

    const cls = await new Promise<number | null>((resolve) => {
      let total = 0;
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
            if (!entry.hadRecentInput) total += entry.value;
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(Math.round(total * 1000) / 1000);
        }, observerWindowMs);
      } catch {
        resolve(null);
      }
    });

    return { lcpMs: lcp, cls };
  }, PERF_OBSERVER_WINDOW_MS);
}

async function measureInteractionLatency(page: Page): Promise<number | null> {
  const target = page.locator('button, a[href], [role="button"]').first();
  if (!(await target.isVisible().catch(() => false))) return null;
  const started = Date.now();
  await target.hover().catch(() => {});
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  return Date.now() - started;
}

/** axe-core is optional: without it the a11y metrics are simply absent, and the rules are SKIPPED. */
async function collectAxe(page: Page) {
  let AxeBuilder: typeof import('@axe-core/playwright').default;
  try {
    ({ default: AxeBuilder } = await import('@axe-core/playwright'));
  } catch {
    return null;
  }

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  const bySeverity = (level: string) => results.violations.filter((v) => v.impact === level);
  const format = (v: (typeof results.violations)[number]) =>
    `${v.id} — ${v.help} (${v.nodes.length} élément${v.nodes.length > 1 ? 's' : ''}) : ${v.nodes[0]?.target.join(' ') ?? ''}`;

  return {
    criticalCount: bySeverity('critical').length,
    seriousCount: bySeverity('serious').length,
    moderateCount: bySeverity('moderate').length,
    violations: results.violations.map(format).slice(0, MAX_SAMPLES),
    contrastViolations: results.violations
      .filter((v) => CONTRAST_RULES.includes(v.id))
      .flatMap((v) => v.nodes.map((n) => `${n.target.join(' ')} — ${n.any[0]?.message ?? 'contraste insuffisant'}`))
      .slice(0, MAX_SAMPLES),
    unlabeledControls: results.violations
      .filter((v) => UNLABELED_CONTROL_RULES.includes(v.id))
      .flatMap((v) => v.nodes.map((n) => `${v.id} : ${n.target.join(' ')}`))
      .slice(0, MAX_SAMPLES),
  };
}

function readStatesManifest(): { expected: string[]; reachable: { name: string; route: string }[] } | null {
  if (!fs.existsSync(STATES_FILE)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(STATES_FILE, 'utf8'));
    return { expected: parsed.expected ?? [], reachable: parsed.reachable ?? [] };
  } catch {
    return null;
  }
}

test.describe.configure({ mode: 'serial' });

test(`ui-verify: ${NAME}`, async ({ page }, testInfo) => {
  const breakpoint = testInfo.project.name;
  const outDir = path.resolve(OUT_DIR);
  fs.mkdirSync(outDir, { recursive: true });

  await page.goto(ROUTE);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(SETTLE_MS);

  const dom = await collectFromDom(page, ACCENT_VAR);
  const perf = await collectPerf(page);
  const inpMs = await measureInteractionLatency(page);
  const axe = await collectAxe(page);
  const missingFocusVisible = await collectFocusVisible(page);
  const keyboardTraps = await collectKeyboardTraps(page);
  const hasPageLang = await page.evaluate(() => Boolean(document.documentElement.getAttribute('lang')));

  await page.screenshot({ path: path.join(outDir, `${NAME}-${breakpoint}.png`), fullPage: true });

  // --- Reduced motion pass ------------------------------------------------
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(SETTLE_MS);
  const animatedUnderReducedMotion = await page.evaluate((maxMs) => {
    const offenders: string[] = [];
    for (const el of Array.from(document.querySelectorAll('*'))) {
      const cs = getComputedStyle(el);
      const animMs = cs.animationDuration.split(',').map((d) => (d.trim().endsWith('ms') ? parseFloat(d) : parseFloat(d) * 1000));
      const running = cs.animationName !== 'none' && animMs.some((ms) => Number.isFinite(ms) && ms > maxMs);
      if (running) offenders.push(`${el.tagName.toLowerCase()} — ${cs.animationName} ${cs.animationDuration}`);
      if (offenders.length >= 20) break;
    }
    return offenders;
  }, REDUCED_MOTION_TOLERANCE_MS);
  await page.emulateMedia({ reducedMotion: null });

  // --- Declared states ----------------------------------------------------
  const manifest = readStatesManifest();
  let states: Report | undefined;
  if (manifest) {
    const captured: string[] = [];
    for (const state of manifest.reachable) {
      try {
        await page.goto(state.route);
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.waitForTimeout(SETTLE_MS);
        await page.screenshot({ path: path.join(outDir, `${NAME}-${state.name}-${breakpoint}.png`), fullPage: true });
        captured.push(state.name);
      } catch {
        // An unreachable state stays missing — that is the finding, not an error.
      }
    }
    states = { expected: manifest.expected, captured, missing: manifest.expected.filter((s) => !captured.includes(s)) };
  }

  const report: Report = {
    meta: { name: NAME, route: ROUTE, breakpoint, viewport: page.viewportSize(), generatedAt: new Date().toISOString() },
    ...dom,
    motion: { ...(dom.motion as Report), animatedUnderReducedMotion },
    perf: { ...perf, inpMs },
    ...(axe ? { a11y: { ...axe, missingFocusVisible, keyboardTraps, hasPageLang } } : { a11y: { missingFocusVisible, keyboardTraps, hasPageLang } }),
    ...(states ? { states } : {}),
    ...(axe ? {} : { _warnings: ['@axe-core/playwright absent — métriques WCAG non mesurées, règles correspondantes SKIPPED'] }),
  };

  fs.writeFileSync(path.join(outDir, `ui-report.${NAME}.${breakpoint}.json`), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  // The runner never fails the suite: judgement belongs to $HOME/.claude/se/scripts/ui-verdict.cjs.
  expect(report.meta).toBeTruthy();
});
