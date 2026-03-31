#!/usr/bin/env node
/**
 * QA Runner — Playwright-based UI screenshot and interaction collector
 * Usage: node qa-runner.js <config.json>
 *
 * Config shape:
 * {
 *   baseUrl: string,            // e.g. "http://localhost:3001"
 *   routes: string[],           // e.g. ["/", "/orders", "/customers"]
 *   outputDir: string,          // absolute path for screenshots + manifest
 *   maxInteractionsPerPage: number  // default 6
 * }
 *
 * Outputs:
 *   {outputDir}/{routeKey}-{breakpoint}.png   — initial screenshots
 *   {outputDir}/{routeKey}-desktop-action-N-{label}.png — post-interaction screenshots
 *   {outputDir}/manifest.json — full record of what was captured
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BREAKPOINTS = [
  { name: 'mobile',  width: 375,  height: 812  },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'desktop', width: 1440, height: 900  },
];

// Interactive elements to try clicking (in priority order)
const INTERACTIVE_SELECTORS = [
  'button:visible',
  '[role="button"]:visible',
  '[role="tab"]:visible',
  '[role="menuitem"]:visible',
  'details > summary:visible',
  'a[href]:not([href^="http"]):not([href^="//"]):visible', // internal links only
];

function routeToKey(route) {
  return route.replace(/^\//, '').replace(/\//g, '_') || 'home';
}

function slugify(text) {
  return (text || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 30)
    .replace(/-$/, '');
}

async function takeScreenshot(page, filePath) {
  try {
    await page.screenshot({ path: filePath, fullPage: true, timeout: 15000 });
    return true;
  } catch {
    return false;
  }
}

async function run() {
  const configPath = process.argv[2];
  if (!configPath) {
    console.error('Usage: node qa-runner.js <config.json>');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const {
    baseUrl,
    routes,
    outputDir,
    maxInteractionsPerPage = 6,
  } = config;

  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const manifest = {
    baseUrl,
    capturedAt: new Date().toISOString(),
    routes: [],
  };

  for (const route of routes) {
    console.log(`\n→ Testing route: ${route}`);
    const routeKey = routeToKey(route);
    const routeEntry = { route, routeKey, screenshots: [], errors: [] };

    // ── Screenshots at all 3 breakpoints ────────────────────────────────────
    for (const bp of BREAKPOINTS) {
      const page = await browser.newPage();
      await page.setViewportSize({ width: bp.width, height: bp.height });

      try {
        const response = await page.goto(`${baseUrl}${route}`, {
          waitUntil: 'networkidle',
          timeout: 30000,
        });

        const status = response?.status() ?? 0;
        const screenshotFile = `${routeKey}-${bp.name}.png`;
        const screenshotPath = path.join(outputDir, screenshotFile);

        const saved = await takeScreenshot(page, screenshotPath);

        routeEntry.screenshots.push({
          breakpoint: bp.name,
          viewport: `${bp.width}×${bp.height}`,
          file: screenshotFile,
          path: screenshotPath,
          httpStatus: status,
          type: 'initial',
          saved,
        });

        console.log(`  ✓ ${bp.name} (${bp.width}px)`);

        // ── Interactions — desktop only ──────────────────────────────────────
        if (bp.name === 'desktop') {
          const startUrl = page.url();
          let interactionCount = 0;

          // Collect candidates from all selectors, deduplicated
          const candidates = [];
          for (const sel of INTERACTIVE_SELECTORS) {
            if (interactionCount >= maxInteractionsPerPage) break;
            try {
              const els = await page.$$(sel);
              for (const el of els) {
                if (candidates.length >= maxInteractionsPerPage * 2) break;
                candidates.push(el);
              }
            } catch { /* selector not found */ }
          }

          for (const el of candidates) {
            if (interactionCount >= maxInteractionsPerPage) break;

            try {
              const isVisible = await el.isVisible().catch(() => false);
              if (!isVisible) continue;

              const label = await el.evaluate(e =>
                (e.getAttribute('aria-label') || e.textContent || e.tagName)
                  .trim().slice(0, 40)
              ).catch(() => 'element');

              const urlBefore = page.url();

              await el.click({ timeout: 3000, force: false });
              await page.waitForTimeout(700);

              // If navigated away, go back and skip screenshot
              if (page.url() !== urlBefore) {
                await page.goBack({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
                await page.waitForTimeout(400);
                continue;
              }

              const actionFile = `${routeKey}-desktop-action-${interactionCount}-${slugify(label)}.png`;
              const actionPath = path.join(outputDir, actionFile);
              const actionSaved = await takeScreenshot(page, actionPath);

              if (actionSaved) {
                routeEntry.screenshots.push({
                  breakpoint: 'desktop',
                  viewport: '1440×900',
                  file: actionFile,
                  path: actionPath,
                  type: 'interaction',
                  action: `clicked: "${label}"`,
                  saved: true,
                });
                console.log(`  ✓ interaction ${interactionCount + 1}: clicked "${label}"`);
                interactionCount++;
              }

              // If something opened (modal/drawer), close it before next element
              const closeButton = await page.$('[aria-label="Close"]:visible, [aria-label="close"]:visible, button[data-dismiss]:visible').catch(() => null);
              if (closeButton) {
                await closeButton.click({ timeout: 2000 }).catch(() => {});
                await page.waitForTimeout(400);
              }

            } catch { /* element became stale or click failed — skip */ }
          }
        }

      } catch (err) {
        routeEntry.errors.push({ breakpoint: bp.name, message: err.message });
        console.warn(`  ✗ ${bp.name}: ${err.message}`);
      }

      await page.close();
    }

    manifest.routes.push(routeEntry);
  }

  await browser.close();

  const manifestPath = path.join(outputDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  const total = manifest.routes
    .flatMap(r => r.screenshots)
    .filter(s => s.saved).length;

  console.log(`\n✓ Done. ${total} screenshots saved to: ${outputDir}`);
  console.log(`✓ Manifest: ${manifestPath}`);
}

run().catch(err => {
  console.error('\nQA Runner failed:', err.message);
  process.exit(1);
});
