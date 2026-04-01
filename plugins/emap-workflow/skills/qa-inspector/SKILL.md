---
name: qa-inspector
description: UI QA inspector using Claude Code's Playwright plugin to catch visual bugs, layout issues, broken interactions, responsive design failures, accessibility problems, and browser-visible security issues. Produces a severity-graded QA report with screenshots plus network request/response artifacts. Use whenever someone says "QA this", "check the UI", "something looks broken", "test these changes visually", "how does this look on mobile", "visual review", "screenshot this page", "UI issues", or when git diff touches frontend files (.tsx, .jsx, .vue, .css, emotion styles, styled-components). Always invoke this skill — not bug-finder — when the concern is about how something looks or behaves in the browser.
---

# QA Inspector

Uses the Claude Code Playwright plugin to navigate to routes, capture screenshots, test interactions, and collect network traffic. When there are uncommitted UI changes, captures a **before** (stashed) and **after** (restored) state for direct comparison. Analyzes screenshots and network data to produce a QA + browser-security report.

**Responsiveness:** Resize the browser to check how the layout adapts across different viewport sizes.
**Interactions:** Click buttons, tabs, and other interactive elements to reveal hidden states.

---

## Step 1: Parse Input

Determine what to test:

| Input | What to do |
|---|---|
| "check these changes" / git diff | `git diff --name-only HEAD` or `git diff --name-only --cached` — get changed frontend files only |
| Specific file or component name | Note which files — map to routes in Step 3 |
| URL or route | Test that route directly |
| "check this page / feature" | Extract route from context or ask |

For git diff: collect the file list only. Don't read file contents yet — you'll do that in Step 4 only if needed to identify the visible behavior to test, or later in Step 8 if a visual issue needs code context.

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

## Step 4: Build Scenario Checklist

Before opening the browser, create a compact scenario checklist that will drive the QA session.

**Goal:** turn the diff / route / component context into explicit things to verify so the run is directed, not purely exploratory.

For each route, write **3-8 concrete scenarios** across these buckets as applicable:
- **Happy path:** primary user flow on that route
- **Changed behavior:** what the modified UI/component is supposed to do now
- **Interaction states:** modal, drawer, tab, dropdown, pagination, submit, empty state
- **Responsive states:** narrow/mobile and medium/tablet behaviors
- **Negative or edge state:** invalid input, missing data, long text, empty results, disabled control
- **Regression risk:** adjacent UI that could break because it shares layout, state, or API data

Use only minimal context:
1. Route(s) from Step 3
2. Input wording from the user
3. Changed file names from git diff
4. Read source files only if needed to identify the visible user behavior that changed

Write the checklist in this compact format before testing:

```markdown
## Scenario Checklist

### /route
- [ ] S1 Happy path: User can ...
- [ ] S2 Changed behavior: Updated ... shows ...
- [ ] S3 Interaction: Clicking "..." opens ...
- [ ] S4 Responsive: At mobile width, ...
- [ ] S5 Edge case: With empty / long / invalid data, ...
```

Rules:
- Prefer specific scenarios over generic ones like "page looks fine"
- Reference actual visible controls or states when known
- Keep it short enough to execute in one QA pass
- If the route is unclear, ask the user instead of inventing scenarios
- If there are more than 8 meaningful scenarios, keep only the highest-risk ones

This checklist is working memory for the run. You do not need to save it to a separate file unless the user asks.

---

## Step 5: Server Management

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

## Step 6: Before/After Setup (UI changes only)

Skip this step entirely if the input is not related to UI file changes (e.g. pure URL check or non-frontend diff).

**Check for uncommitted changes:**
```bash
git diff --name-only HEAD
git diff --name-only --cached
```

If there are uncommitted changes to frontend files (`.tsx`, `.jsx`, `.vue`, `.css`, styles):

1. **Stash changes:**
   ```bash
   git stash push -m "qa-inspector-before"
   ```

2. **Wait for server to recompile** (poll until stable, max 30s):
   ```bash
   for i in $(seq 1 15); do sleep 2; STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:{PORT}/ 2>/dev/null); echo "$STATUS" | grep -qE "^(200|301|302|304)$" && echo "ready" && break; done
   ```

3. **Capture "before" screenshots** for all routes — full Step 7 capture sequence (navigate, resize, interactions).
   Label these mentally as **BEFORE**.

4. **Restore changes:**
   ```bash
   git stash pop
   ```

5. **Wait for server to recompile** (same poll as above).

6. **Capture "after" screenshots** for the same routes — full Step 7 capture sequence again.
   Label these mentally as **AFTER**.

If there are **no uncommitted frontend changes**, skip this step and do a single capture pass in Step 7.

---

## Step 7: Capture with Playwright Plugin

Use the Claude Code Playwright plugin tools directly. For each route, execute against the scenario checklist from Step 4 rather than clicking randomly.

**1. Navigate and take initial screenshot:**
- `browser_navigate` → go to `{baseUrl}{route}`
- `browser_take_screenshot` → capture initial state
- `browser_network_requests` → collect network traffic after page load

**2. Check the scenario checklist first:**
- Review the route's scenario items and decide which visible actions and states must be exercised
- Prioritize `Happy path` and `Changed behavior` items before lower-priority exploratory checks
- If a scenario depends on a specific state (logged in, seeded data, viewport width), set that up first or note it as blocked

**3. Check responsiveness:**
- Use `browser_resize` to test the layout at different viewport sizes (narrow/mobile, medium/tablet, wide/desktop)
- After each resize, `browser_take_screenshot` to capture the layout
- Look for layout breaks, overflow, or elements that stop adapting

**4. Capture accessibility snapshot:**
- `browser_snapshot` → get the DOM/accessibility tree to spot missing labels, roles, or structure issues

**5. Execute interactions (up to 6 per route):**
- Use `browser_snapshot` to find the specific controls needed for the checklist scenarios first
- `browser_click` each one, then `browser_take_screenshot` to capture the resulting state
- `browser_network_requests` after each interaction to capture triggered API calls
- If a navigation occurs, use `browser_navigate_back` to return before continuing
- If a modal/drawer opens, look for a close button and click it before the next interaction

**6. Track scenario status while testing:**
- Mark each scenario mentally as `pass`, `fail`, or `blocked`
- If exploratory testing finds an issue not covered by the checklist, record it separately as an additional finding

Collect all screenshots and network data mentally — no manifest file needed.

---

## Step 8: Analyze Screenshots And Network Traffic

Analyze **one route at a time**.

**If before/after captures were taken (Step 6):** compare BEFORE vs AFTER for each route first — note what visually changed, then evaluate whether each change is correct, degraded, or a regression. Use this comparison as the primary signal for UI issues.

**If single capture only:** review: initial state → resized states → interaction states → network traffic.

First evaluate the route against its checklist:
- Which scenarios passed as expected
- Which scenarios failed, and at which state or interaction
- Which scenarios were blocked because data, auth, or environment prerequisites were missing

Then do the broader visual, responsive, accessibility, and security analysis below.

Check for these issues:

**Layout & Visual**
- Elements overlapping or clipped
- Broken grid/flex alignment
- Excessive or missing whitespace
- Truncated text (missing ellipsis or overflow)
- Broken or missing images/icons
- Wrong colors, borders, or shadows

**Responsive**
- Layout doesn't adapt when the viewport is resized
- Content cut off or hidden on smaller widths
- Horizontal scrollbar appearing at narrow widths
- Touch targets too small on narrow viewports
- Font too small to read at narrow widths

**Interactions**
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

**Browser-Side Security / API Exposure**
- Sensitive data exposed in JSON or HTML responses (tokens, secrets, password hashes, internal IDs that should not be client-visible)
- Auth/session tokens sent in query params instead of headers/cookies
- State-changing requests missing obvious CSRF protection where applicable
- Overly permissive CORS headers (`Access-Control-Allow-Origin: *`) on authenticated endpoints
- Missing important response headers on HTML/doc responses: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Error responses leaking stack traces, SQL errors, framework internals, or verbose backend details
- Requests using insecure methods/patterns for sensitive actions (e.g. destructive action via GET)
- Payloads or responses containing raw PII/secrets in places that should be masked
- Unexpected third-party endpoints receiving sensitive data

Only read source files if you need code context to explain where a fix should go. Keep source file reads minimal.

---

## Step 9: Stop Server (only if you started it)

If you started the server in Step 5:
```bash
kill $(cat /tmp/qa-dev-server.pid) 2>/dev/null
rm -f /tmp/qa-dev-server.pid /tmp/qa-dev-server.log
```

Do nothing if the server was already running when you started.

---

## Step 10: Write QA Report

Save as `qa-report.md` in the current working directory if in a repo, otherwise `/tmp/qa-{timestamp}/qa-report.md`.

```markdown
# QA Report — {date}
**Scope:** {routes} | **Interactions:** {N} captured | **Mode:** before/after comparison / single pass

## Summary

| Severity | Count |
|---|---|
| 🔴 Critical | N |
| 🟠 High | N |
| 🟡 Medium | N |
| 🔵 Low | N |

## Scenario Checklist

### /route
- [pass] S1 Happy path: ...
- [fail] S2 Changed behavior: ...
- [blocked] S3 Edge case: ...

## Issues

### [Short descriptive title]
**Severity:** 🔴 Critical
**Route:** `/orders`
**Context:** before / after / initial load / narrow viewport / after clicking "{label}"
**Category:** Visual / Responsive / Accessibility / Security
**Description:** Concise description of what's wrong and where on the page.
**Suggested fix:** Point to the likely cause (component, style rule, media query).

---
```

**Severity guide:**
- 🔴 Critical — broken functionality, content unreadable, page unusable, or severe client-visible security exposure
- 🟠 High — significant visual defect clearly visible to users
- 🟡 Medium — noticeable but non-blocking layout issue or meaningful security hardening gap
- 🔵 Low — minor polish, spacing, or cosmetic issue

---

## Step 11: Present Results

```
QA report: {path}

{N} issues found:
- 🔴 Critical: X
- 🟠 High: Y
- 🟡 Medium: Z
- 🔵 Low: W

Scenario status:
- Passed: A
- Failed: B
- Blocked: C

Top issues:
1. [Title] — one-line summary
2. [Title] — one-line summary
3. [Title] — one-line summary
```

Then ask: "Want me to dig into any specific issue, check additional routes, or look at a particular viewport size more closely?"

---

## Notes

- **Token discipline**: Analyze one route at a time. Never load all screenshots simultaneously.
- **5-route cap per run**: ask user to prioritize if more are affected.
- **Interactions up to 6 per route**: prioritize buttons, tabs, and triggers that reveal UI state.
- **Checklist-first**: derive scenarios before testing, and spend interaction budget on those scenarios before exploratory clicks.
- **Server rule**: stop only what you started. Never kill a pre-existing server.
- **Stack-agnostic**: always detect framework, port, and dev command — never assume.
