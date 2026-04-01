---
name: develop
description: Start implementing a Jira issue using the approved development plan. Guides the developer through each implementation step.
disable-model-invocation: true
argument-hint: <JIRA-ISSUE-KEY>
allowed-tools: Read, Edit, Write, Grep, Glob, Bash, Agent, mcp__jira__*, mcp__claude_ai_Slack__slack_send_message
effort: max
---

## Development Phase — Implement Task $ARGUMENTS

!`cat ${CLAUDE_SKILL_DIR}/../../templates/jira-mcp-check.md`

### Step 1: Load the Approved Plan
Read the development plan from `.claude/plans/$ARGUMENTS.md`.
If no plan exists, inform the developer:
> "No plan found for $ARGUMENTS. Run `/emap-workflow:analyze $ARGUMENTS` first."

Display the plan summary: task title, implementation steps, files to modify, and database changes.

### Step 2: Pre-Development Setup

**Branch Check:**
- Verify current branch matches the task: should contain `$ARGUMENTS` in the branch name
- If not, suggest: `git checkout -b $ARGUMENTS-description`

**Database Migrations (if needed per plan):**
- Create migration files as outlined in the plan
- Define schema changes (columns, indexes, foreign keys)
- Run `php artisan migrate` to apply

**Seeders (if needed per plan):**
- Create or update seeders for test data

### Step 3: Backend Implementation (Laravel)

Follow the plan's implementation steps in order. For each step:

**Models:**
- Create/update Eloquent models
- Define `$fillable`, `$casts`, relationships
- Add scopes if needed

**Form Requests:**
- Create Form Request classes for validation
- Define `rules()`, `messages()`, and `authorize()`

**Services:**
- Create/update Service classes for business logic
- Keep controllers thin — delegate to services
- Handle edge cases and error scenarios

**Controllers:**
- Create/update API controllers
- Use dependency injection for services
- Use Form Requests for validation
- Return consistent API responses: `{ status, message, data }`

**Routes:**
- Add routes in `routes/api.php` or appropriate route file
- Apply middleware (auth, role-based permissions)
- Follow RESTful naming conventions

**Events & Notifications (if needed):**
- Create events for side effects
- Create listeners/notifications

### Step 4: Frontend Implementation (Vue.js)

**Components:**
- Create/update Vue components as outlined in the plan
- Define props with type validation
- Use computed properties for reactive data
- Implement loading and error states

**API Integration:**
- Use the project's API service layer for HTTP calls
- Handle success/error responses
- Show user feedback (toasts, alerts)

**State Management (if needed):**
- Update Vuex store (state, mutations, actions, getters)
- Keep mutations synchronous, actions for async

**Routing (if needed):**
- Add Vue Router entries for new pages

### Step 5: Write Tests

**PHP Tests (Pest/PHPUnit):**
- Unit tests for Service methods
- Feature tests for API endpoints
- Test validation rules
- Test authorization/permissions

**JavaScript Tests (if applicable):**
- Component rendering tests
- Event handling tests

### Step 6: Verify Implementation

Run these checks before marking development as complete:

```bash
# Ensure no syntax errors
php artisan route:list | grep -i "related-route"

# Run existing tests to catch regressions
php artisan test --filter=RelatedTest

# Check for obvious issues
php artisan migrate:status
```

### Step 7: Development Complete

1. Update the plan file `.claude/plans/$ARGUMENTS.md` with:
   - Actual files created/modified (vs planned)
   - Any deviations from the plan and why
   - Development completion timestamp

2. Send Slack notification:
   ```
   🛠️ Development complete for $ARGUMENTS
   Task: [title]
   Files changed: [count]
   Migrations: [yes/no]
   Next step: Run /emap-workflow:full-review
   ```

3. Remind the developer:
   > "Development complete. Run `/emap-workflow:full-review` to start the review cycle."

### Guidelines During Development
- Follow existing patterns in the codebase — check similar features for reference
- Keep commits atomic and well-described
- No debug code (`dd()`, `console.log`, `dump()`)
- No hardcoded values — use config/env
- No commented-out code
- Ask the developer for clarification if any plan step is ambiguous
