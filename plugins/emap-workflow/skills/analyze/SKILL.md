---
name: analyze
description: Analyze a Jira issue and generate a comprehensive development plan. Use when starting work on a new task.
disable-model-invocation: true
argument-hint: <JIRA-ISSUE-KEY> [optional developer notes]
allowed-tools: Read, Grep, Glob, Bash, Agent, mcp__jira__*, mcp__claude_ai_Slack__slack_send_message
effort: high
---

## Task Analysis & Development Plan Generation

**Parse arguments:** The first argument is the Jira issue key. Everything after the issue key is the developer's notes/thoughts for planning (optional).
- Example: `/emap-workflow:analyze EMAP-1234 I think we should use the existing notification service and add a new event listener`
- Extract the task ID (first argument) and developer notes (remaining text, if any).

You are analyzing a Jira issue to generate a development plan.

!`cat ${CLAUDE_SKILL_DIR}/../../templates/jira-mcp-check.md`

### Step 1: Fetch Task Details
Use the Atlassian Jira MCP tools to fetch the issue:
- Get the summary, description, acceptance criteria, labels, priority, assignee, and sprint if present
- Get linked/blocking issues and dependencies
- Get any comments or attachments with additional context

**Developer Notes:** If the developer provided additional notes/thoughts, incorporate them into the analysis. These notes represent the developer's initial ideas, preferred approach, or constraints to consider during planning. Display these notes in the plan under a "Developer Input" section and factor them into the technical approach.

### Step 2: Codebase Impact Analysis
Based on the task requirements (and developer notes if provided):
- Search the codebase for related files, controllers, models, services, and Vue components
- Identify which modules (under `modules/` or `app/`) are affected
- Check for existing patterns that should be followed
- Look at database migrations for related tables
- Check API routes in `routes/api.php` for related endpoints
- Identify potential side effects on other features

### Step 3: Generate Development Plan
Use this template structure:

!`cat ${CLAUDE_SKILL_DIR}/../../templates/plan-template.md`

Fill in ALL sections with specific details based on Steps 1-2.
Be specific about file paths and code patterns found in the codebase.
If developer notes were provided, include a **"Developer Input"** section in the plan showing the original notes and how they influenced the plan.

### Step 4: Save the Plan
Save the completed plan to: `.claude/plans/[TASK-ID].md`
Create the directory if it doesn't exist.

### Step 5: Developer Review & Approval (REQUIRED)
Display the full plan to the developer and ask for their review:

> **📋 Development plan generated for [TASK-ID]**
>
> Please review the plan above. You can:
> - **Request changes** — tell me what to modify and I'll update the plan
> - **Approve** — say "approve" or "looks good" to proceed with notifying the team
>
> The plan will NOT be shared until you approve it.

**Wait for the developer's response.**
- If the developer requests changes: update the plan, save it again, and re-display for approval. Repeat until approved.
- If the developer approves: proceed to Step 6.

**Do NOT proceed to Step 6 until the developer explicitly approves the plan.**

### Step 6: Update Jira Issue
- Add the approved plan as a comment on the Jira issue
- Update task status to "Plan Ready" (or equivalent workflow state)

### Step 7: Notify Team
Send a Slack message to the #emap-dev-plans channel (or ask user for the correct channel):
```
📋 Development plan generated for [TASK-ID]
Task: [task title]
Estimated effort: [S/M/L/XL]
Affected modules: [list]
Awaiting senior review.
```

### Output
Confirm that the plan has been approved, saved, posted to Jira, and shared on Slack.
