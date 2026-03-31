---
name: qa-inspector
description: UI QA inspector using Playwright to catch visual bugs, layout issues, broken interactions, responsive design failures, and accessibility problems across mobile/tablet/desktop breakpoints. Produces a severity-graded QA report with screenshots. Use whenever someone says "QA this", "check the UI", "something looks broken", "test these changes visually", "how does this look on mobile", "visual review", "screenshot this page", "UI issues", or when git diff touches frontend files (.tsx, .jsx, .vue, .css, emotion styles, styled-components). Always invoke this skill — not bug-finder — when the concern is about how something looks or behaves in the browser.
---

# QA Inspector

Runs Playwright against a live dev server to capture UI state across breakpoints and interactions, then analyzes screenshots visually to produce a QA report. No baseline comparison needed — analyzes current state only.

**Breakpoints always tested:** mobile (375×812) · tablet (768×1024) · desktop (1440×900)  
**Interactions:** desktop only (click buttons, tabs, triggers) — mobile/tablet get visual screenshots only

---

## Step 1: Parse Input

Determine what to test:

| Input | What to do |
|---|---|
| "check these changes" / git diff | `git diff --name-only HEAD` or `git diff --name-only --cached` — get changed frontend files only |
| Specific file or component name | Note which files — map to routes in Step 3 |
| URL or route | Test that route directly |
| "check this page / feature" | Extract route from context or ask |

For git diff: collect the file list only. Don't read file contents yet — you'll do that in Step 6 only if a visual issue needs code context.

---

## Step 2: Discover Project Context

Read as little as possible to get what you need. Check in order:

1. `CLAUDE.md` or `README.md` — often has port + dev command explicitly
2. `package.json` → `scripts.dev` / `scripts.start` for dev command; check for `--port` flags
3. `.env` / `.env.local` → `PORT`, `NEXT_PUBLIC_PORT`, `VITE_PORT`
4. Framework config: `next.config.*` (default 3000), `vite.config.*` (default 5173)
5. `package.json` dependencies → identify framework (next, vite, nuxt, create-react-app, etc.)

Result: a compact context block like:
```
Framework: Next.js 15 (App Router)
Port: 3001
Dev command: npm run dev
Routes source: src/app/
```

---

## Step 3: Map Changed Files to Routes

Only applicable when input is files/components rather than a direct URL.

**Next.js App Router** (`src/app/`):  
`src/app/[locale]/orders/page.tsx` → `/orders`  
`src/app/(auth)/login/page.tsx` → `/login`  

**Next.js Pages Router** (`src/pages/`):  
`src/pages/orders/index.tsx` → `/orders`  

**Vite / React Router**:  
Grep for the component name in router config files (`routes.tsx`, `App.tsx`, `router.ts`, `router/index.ts`). Pattern: `path: "/foo"` near the component name.

**Vue Router**:  
Check `src/router/index.ts` — find routes where `component` imports the changed file.

**If you can't determine routes**: ask the user rather than guessing.

**Scope limit**: cap at **5 routes per run**. If more are affected, ask the user to prioritize.

---

## Step 4: Server Management

**Check if already running:**
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:{PORT}/ 2>/dev/null
```

- Returns 200/301/302/304 → server is up. **Note: you did NOT start it** — do not stop it later.
- Anything else → start it.

**Starting the server:**
```bash
nohup {dev_command} > /tmp/qa-dev-server.log 2>&1 &
echo $! > /tmp/qa-dev-server.pid
```

**Wait for ready** (poll every 2s, 60s max):
```bash
for i in $(seq 1 30); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:{PORT}/ 2>/dev/null)
  echo "$STATUS" | grep -qE "^(200|301|302|304)$" && echo "ready" && break
  sleep 2
done
```

If not ready after 60s: report to user, stop, do not proceed.

---

## Step 5: Check & Run Playwright

**Ensure Playwright is available:**
```bash
cd {project_root}
npx playwright --version 2>/dev/null || npm install --save-dev playwright
npx playwright install chromium --with-deps 2>/dev/null
```

**Generate config** at `/tmp/qa-{timestamp}/config.json`:
```json
{
  "baseUrl": "http://localhost:{PORT}",
  "routes": ["/", "/orders"],
  "outputDir": "/tmp/qa-{timestamp}/screenshots",
  "maxInteractionsPerPage": 6
}
```

**Run the bundled script** (SKILL_DIR is the directory containing this SKILL.md):
```bash
node {SKILL_DIR}/scripts/qa-runner.js /tmp/qa-{timestamp}/config.json
```

The script outputs:
- `screenshots/{routeKey}-mobile.png`, `...-tablet.png`, `...-desktop.png`
- `screenshots/{routeKey}-desktop-action-N-{label}.png` for each interaction
- `screenshots/manifest.json` with a full record of what was captured

If the script fails (Playwright not found, browser crash, etc.): check `manifest.json` for partial results and report what succeeded.

---

## Step 6: Analyze Screenshots

Read `manifest.json` first to understand the full capture set. Then analyze **one route at a time** — don't read all screenshots at once.

For each route, read its screenshots in this order: mobile → tablet → desktop → interactions.

Check for these issues in each screenshot:

**Layout & Visual**
- Elements overlapping or clipped
- Broken grid/flex alignment
- Excessive or missing whitespace
- Truncated text (missing ellipsis or overflow)
- Broken or missing images/icons
- Wrong colors, borders, or shadows

**Responsive**
- Layout doesn't adapt between mobile/tablet/desktop
- Content cut off or hidden on smaller screens
- Horizontal scrollbar on mobile/tablet
- Touch targets smaller than ~44px on mobile
- Font too small to read on mobile (<12px visually)

**Interactions** (desktop action screenshots)
- Modal/drawer didn't open, opened in wrong position, or has clipping
- Dropdown overlaps or goes off-screen
- Button shows no visual state change after click
- Form errors or states visually broken

**Content**
- Empty labels, placeholder text, or raw translation keys visible
- Numbers/dates in wrong format
- Missing required content

**Accessibility (visual)**
- Very low contrast text vs background
- Icon-only buttons with no accessible label visible
- Interactive elements with no visible focus state

Only read source files if you need code context to explain where a fix should go (e.g., which styled-component or class to change). Keep source file reads minimal.

---

## Step 7: Stop Server (only if you started it)

If you started the server in Step 4:
```bash
kill $(cat /tmp/qa-dev-server.pid) 2>/dev/null
rm -f /tmp/qa-dev-server.pid /tmp/qa-dev-server.log
```

Do nothing if the server was already running when you started.

---

## Step 8: Write QA Report

Save as `qa-report.md` in the current working directory if in a repo, otherwise `/tmp/qa-{timestamp}/qa-report.md`.

```markdown
# QA Report — {date}
**Scope:** {routes} | **Breakpoints:** mobile · tablet · desktop | **Interactions:** {N} captured

## Summary

| Severity | Count |
|---|---|
| 🔴 Critical | N |
| 🟠 High | N |
| 🟡 Medium | N |
| 🔵 Low | N |

## Issues

### [Short descriptive title]
**Severity:** 🔴 Critical  
**Route:** `/orders`  
**Breakpoint:** mobile  
**Screenshot:** `/tmp/qa-.../screenshots/orders-mobile.png`  
**Description:** Concise description of what's wrong and where on the page.  
**Suggested fix:** Point to the likely cause (component, style rule, media query).

---
```

**Severity guide:**
- 🔴 Critical — broken functionality, content unreadable, page unusable
- 🟠 High — significant visual defect clearly visible to users
- 🟡 Medium — noticeable but non-blocking layout or styling issue
- 🔵 Low — minor polish, spacing, or cosmetic issue

---

## Step 9: Present Results

```
QA report: {path}
Screenshots: {outputDir}

{N} issues found:
- 🔴 Critical: X
- 🟠 High: Y
- 🟡 Medium: Z
- 🔵 Low: W

Top issues:
1. [Title] — one-line summary
2. [Title] — one-line summary
3. [Title] — one-line summary
```

Then ask: "Want me to dig into any specific issue, check additional routes, or look at a particular breakpoint more closely?"

---

## Notes

- **Token discipline**: Analyze one route at a time. Never load all screenshots simultaneously.
- **5-route cap per run**: ask user to prioritize if more are affected.
- **Interactions at desktop only**: saves tokens; mobile/tablet interaction parity is rarely the QA concern.
- **Server rule**: stop only what you started. Never kill a pre-existing server.
- **Stack-agnostic**: always detect framework, port, and dev command — never assume.
- **SKILL_DIR**: the directory of this file. Pass its absolute path when running `qa-runner.js`.
