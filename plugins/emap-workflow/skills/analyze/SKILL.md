---
name: analyze
description: Analyze a Linear task and generate a comprehensive development plan. Use when starting work on a new task.
disable-model-invocation: true
argument-hint: <LINEAR-TASK-ID>
allowed-tools: Read, Grep, Glob, Bash, Agent, mcp__linear__*, mcp__claude_ai_Slack__slack_send_message
effort: high
---

## Task Analysis & Development Plan Generation

You are analyzing Linear task **$ARGUMENTS** to generate a development plan.

### Step 1: Fetch Task Details
Use the Linear MCP tools to fetch the task:
- Get title, description, acceptance criteria, labels, priority, assignee
- Get linked/blocking tasks and dependencies
- Get any comments or attachments with additional context

If Linear MCP is not available, ask the user to paste the task details.

### Step 2: Codebase Impact Analysis
Based on the task requirements:
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

### Step 4: Save the Plan
Save the completed plan to: `.claude/plans/$ARGUMENTS.md`
Create the directory if it doesn't exist.

### Step 5: Update Linear Task
If Linear MCP is available:
- Add the plan as a comment on the Linear task
- Update task status to "Plan Ready" (or equivalent workflow state)

### Step 6: Notify Team
Send a Slack message to the #emap-dev-plans channel (or ask user for the correct channel):
```
📋 Development plan generated for $ARGUMENTS
Task: [task title]
Estimated effort: [S/M/L/XL]
Affected modules: [list]
Awaiting senior review.
```

### Output
Display the full plan to the developer and confirm all steps completed.
