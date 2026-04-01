---
name: ready-for-review
description: Mark PR as ready for manager review after all checks and QA pass. Final handoff step.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash, mcp__claude_ai_Slack__slack_send_message, mcp__jira__*
---

## Ready for Manager Review — Final Handoff

!`cat ${CLAUDE_PLUGIN_ROOT}/templates/jira-mcp-check.md`

### Step 1: Pre-Flight Verification
Verify all workflow steps were completed:

1. **Plan exists:** Check `.claude/plans/` for a plan file
2. **Review passed:** Check `.claude/reviews/` for a review report with "PASS" status
3. **QA scenarios generated:** Check `.claude/qa/` for test scenario file
4. **No uncommitted changes:** Run `git status` to verify clean working tree
5. **Branch is up to date:** Run `git log main..HEAD --oneline` to summarize all commits

If any step is missing, warn the developer and list what needs to be done first.

### Step 2: Prepare PR
Check if a PR already exists:
```bash
gh pr view --json number,title,url 2>/dev/null
```

**If no PR exists,** create one:
```bash
gh pr create --title "[JIRA-KEY] Brief description" --body "..."
```

**If PR exists,** update it.

PR body should include:
```markdown
## Summary
- **Jira Issue:** [ID and title]
- **Plan:** Approved on [date]

## Changes
[Bullet list from git log main..HEAD --oneline]

## Review Status
- [x] Code review passed
- [x] Security audit passed
- [x] Code quality checks passed
- [x] QA test scenarios generated

## Test Scenarios
[Summary of test coverage from QA scenarios file]

## Files Changed
[Output of git diff main...HEAD --stat]
```

### Step 3: Mark as Ready
```bash
gh pr ready
```

If there are specific reviewers to assign (ask user if not known):
```bash
gh pr edit --add-reviewer <reviewer>
```

### Step 4: Update Jira
- Update task status to "In Review" or "Ready for Review"
- Add PR link as a comment

### Step 5: Notify Team
Send Slack notification to #emap-pr-reviews (or ask user for channel):
```
🚀 PR ready for manager review
Task: [JIRA-KEY] — [title]
PR: [PR URL]
Review: All checks passed
QA: [N] test scenarios prepared
Reviewer: [assigned reviewer]
```

### Output
Display:
- PR URL
- Summary of all checks passed
- Next step: Awaiting manager review
