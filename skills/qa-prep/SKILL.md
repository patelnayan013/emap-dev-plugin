---
name: qa-prep
description: Generate detailed QA test scenarios based on the implemented feature and Linear task requirements
disable-model-invocation: true
argument-hint: <LINEAR-TASK-ID>
allowed-tools: Read, Grep, Glob, Bash, Agent, mcp__linear__*, mcp__claude_ai_Slack__slack_send_message
effort: high
---

## QA Test Scenario Generation

Generate comprehensive test scenarios for **$ARGUMENTS**.

### Step 1: Gather Context

**From Linear:**
- Fetch task $ARGUMENTS details, acceptance criteria, and requirements
- Get any linked tasks or parent epic context
- Check for QA-specific notes or labels

**From Code:**
- Run `git diff main...HEAD --stat` for change overview
- Run `git diff main...HEAD --name-only` for affected files
- Read each changed file to understand the implementation
- Identify new API endpoints from route files
- Identify new UI components or modified views
- Check database migrations for schema changes

### Step 2: Analyze Implementation
- Map each acceptance criterion to the actual code that implements it
- Identify input validation rules (from Form Requests)
- Identify authorization rules (from policies/middleware)
- Identify edge cases from conditional logic in the code
- Note any third-party integrations involved

### Step 3: Generate Test Scenarios

Use the template:
!`cat ${CLAUDE_SKILL_DIR}/../../templates/qa-scenarios.md`

Fill in with SPECIFIC scenarios based on the actual implementation:

**Functional Tests (P0 — Must Test):**
- One scenario per acceptance criterion (happy path)
- Include exact steps with specific field values
- Reference actual form fields, buttons, and URLs from the Vue components

**Edge Cases (P1):**
- Empty/null inputs for each field
- Maximum length inputs
- Special characters (SQL injection attempts, XSS payloads)
- Concurrent operations (if applicable)
- Boundary values from validation rules

**Negative Tests (P1):**
- Unauthorized access attempts (wrong role, not logged in)
- Invalid data submissions
- Missing required fields
- Duplicate entries (if applicable)

**API Tests (P0):**
- For each new/modified endpoint:
  - Valid request with expected response
  - Missing auth token
  - Invalid payload
  - Missing required fields
  - Response structure validation

**UI/UX Tests (P1):**
- Loading states during API calls
- Error message display
- Form validation feedback
- Responsive design (if frontend changes)
- Browser compatibility notes

**Regression Tests (P2):**
- List related features that could be affected
- Key workflows to verify still work

### Step 4: Save & Share
1. Save to `.claude/qa/$ARGUMENTS-scenarios.md`
2. Send Slack notification:
   ```
   📋 QA test scenarios ready for $ARGUMENTS
   Task: [title]
   Total scenarios: [count]
   P0 (Critical): [count]
   P1 (Important): [count]
   P2 (Regression): [count]
   Document: .claude/qa/$ARGUMENTS-scenarios.md
   ```

### Output
Display the full test scenario document and confirm sharing.
