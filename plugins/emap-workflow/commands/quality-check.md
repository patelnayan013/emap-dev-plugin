---
name: quality-check
description: Run code quality checks - linting, formatting, best practices, and performance patterns
disable-model-invocation: true
allowed-tools: Read, Edit, Write, Grep, Glob, Bash, Agent
effort: high
---

## Code Quality Check

Verify code quality standards on all changed files.

!`cat ${CLAUDE_PLUGIN_ROOT}/templates/jira-mcp-check.md`

### Step 1: Automated Linting

**PHP — Run PHP CS Fixer:**
```bash
./vendor/bin/php-cs-fixer fix --dry-run --diff --config=.php_cs_fixer.php
```
If issues found, run without `--dry-run` to auto-fix:
```bash
./vendor/bin/php-cs-fixer fix --config=.php_cs_fixer.php
```

**JavaScript/Vue — Run ESLint:**
```bash
npx eslint --ext .js,.vue resources/ --no-error-on-unmatched-pattern
```
If fixable issues found:
```bash
npx eslint --fix --ext .js,.vue resources/ --no-error-on-unmatched-pattern
```

### Step 2: Architecture & Pattern Checks

**Laravel Patterns:**
- Controllers should be thin — max 10-15 lines per method
- Business logic belongs in Services (`app/Services/`)
- Database queries belong in Repositories or Models, not Controllers
- Use Laravel Events for side effects (email, notifications, logging)
- Config values accessed via `config()` helper, not `env()` directly (except in config files)
- Use Laravel's built-in features (Collections, Str helpers) instead of raw PHP

**Vue Patterns:**
- Components under 300 lines (suggest splitting if larger)
- Reusable logic extracted to mixins or composables
- API calls go through a service layer, not directly in components
- Proper loading/error states on async operations
- v-for always has :key binding
- Avoid watchers when computed properties suffice

**Database & Performance:**
- Check for N+1 query patterns:
  - Look for relationship access inside loops without eager loading
  - Verify `with()` is used for relationships accessed in collections
- Check for missing database indexes on frequently queried columns
- Large datasets should use pagination, not `->get()` on unbounded queries
- Use `select()` to limit columns when full model isn't needed
- Cache expensive queries where appropriate

### Step 3: Fix Issues
- Apply all auto-fixable linting issues
- Refactor code that violates patterns (with developer confirmation for large changes)
- Add eager loading where N+1 detected
- Report issues that need manual attention

### Step 4: Report
| Check | Result | Issues Found | Auto-Fixed | Manual Required |
|-------|--------|-------------|------------|-----------------|
| PHP CS Fixer | PASS/FAIL | N | N | N |
| ESLint | PASS/FAIL | N | N | N |
| Controller Size | PASS/FAIL | N | N | N |
| N+1 Queries | PASS/FAIL | N | N | N |
| Vue Components | PASS/FAIL | N | N | N |
| Performance | PASS/FAIL | N | N | N |
