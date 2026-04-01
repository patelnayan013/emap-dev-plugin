---
name: review
description: Run code review on changed files against main branch - checks conventions, patterns, and best practices
disable-model-invocation: true
allowed-tools: Read, Edit, Write, Grep, Glob, Bash, Agent
effort: high
---

## Code Review

Review all files changed compared to the main branch.

!`cat ${CLAUDE_SKILL_DIR}/../../templates/jira-mcp-check.md`

### Step 1: Identify Changed Files
Run: `git diff main...HEAD --name-only` to get the list of changed files.
If no changes found, inform the user and exit.

### Step 2: Review Each File
For each changed file, check:

**PHP/Laravel Files (.php):**
- Business logic should be in Service classes, NOT in Controllers
- Form validation should use Form Request classes
- Eloquent relationships properly defined
- Use of `$fillable` or `$guarded` on all models
- Proper use of dependency injection
- Return types and type hints on methods
- No `dd()`, `dump()`, `var_dump()`, or `print_r()` left in code
- Database queries use Eloquent/Query Builder with parameter binding
- Proper use of Laravel collections instead of raw array loops
- API responses follow consistent format (status, message, data)
- Proper exception handling with try-catch where needed
- No hardcoded values — use config/env

**Vue/JavaScript Files (.vue, .js):**
- Props have type validation defined
- Components follow single-responsibility principle
- Computed properties used instead of methods for reactive data
- No direct DOM manipulation (use Vue reactivity)
- Event handling follows $emit pattern (child to parent)
- Vuex mutations are synchronous, actions for async
- No `console.log` left in code
- API calls use the project's API service layer
- Proper error handling on async operations
- No memory leaks (event listeners cleaned up in beforeDestroy)

**General:**
- No commented-out code blocks
- No TODO/FIXME without a Jira issue reference
- Consistent naming conventions
- No duplicate logic — check if similar logic exists elsewhere
- Functions under 50 lines (suggest splitting if longer)

### Step 3: Fix Issues
For each issue found:
1. Describe the issue with file:line reference
2. Explain why it's a problem
3. Apply the fix automatically
4. Mark as FIXED in the report

### Step 4: Report
Output a summary table:
| # | File | Line | Severity | Issue | Status |
|---|------|------|----------|-------|--------|

Report total issues found, fixed, and any requiring manual attention.
