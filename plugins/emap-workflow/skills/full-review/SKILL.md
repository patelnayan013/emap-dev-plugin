---
name: full-review
description: Run the complete review cycle - code review, security audit, and quality check in an automated loop until all checks pass
disable-model-invocation: true
allowed-tools: Read, Edit, Write, Grep, Glob, Bash, Agent, mcp__claude_ai_Slack__slack_send_message
effort: max
---

## Full Review Cycle (Automated Loop)

Run ALL review checks in sequence. If ANY check finds issues, fix them and re-run
ALL checks from the beginning. Continue until all pass (maximum 3 iterations).

!`cat ${CLAUDE_SKILL_DIR}/../../templates/linear-mcp-check.md`

### Pre-Check
1. Verify there are changes to review: `git diff main...HEAD --name-only`
2. If no changes, inform the user and exit
3. Create the review report file: `.claude/reviews/review-$(date +%Y%m%d-%H%M%S).md`

### Review Loop (Max 3 Iterations)

Track the current iteration number and report it.

**--- ITERATION [N] ---**

#### Phase 1: Code Review
Run the full code review as defined in the review skill:
- Check Laravel conventions (thin controllers, service layer, form requests)
- Check Vue best practices (prop validation, single responsibility, no console.log)
- Check general standards (no debug code, no commented blocks, naming conventions)
- Fix all issues found automatically
- Record: issues found, issues fixed

#### Phase 2: Security Audit
Run the full security audit as defined in the security-audit skill:
- OWASP Top 10 scan on all changed files
- Check access control, injection, XSS, CSRF, authentication
- Check for hardcoded secrets, sensitive data exposure
- Fix all vulnerabilities found
- Record: vulnerabilities found, vulnerabilities fixed

#### Phase 3: Code Quality
Run the full quality check as defined in the quality-check skill:
- Run PHP CS Fixer and ESLint
- Check architecture patterns and performance
- Check for N+1 queries, large functions, missing eager loading
- Fix all quality issues
- Record: issues found, issues fixed

#### Phase 4: Decision
- Count total issues fixed in this iteration
- If 0 issues fixed across all 3 phases → ALL CHECKS PASS → Exit loop
- If issues were fixed → Go back to Phase 1 (next iteration)
- If max iterations (3) reached → Exit with remaining issues flagged

### Post-Review

#### Generate Report
Use the review report template:
!`cat ${CLAUDE_SKILL_DIR}/../../templates/review-report.md`

Fill in all sections with actual findings from the review iterations.
Save to `.claude/reviews/` directory.

#### Notify Team
Send Slack notification:
- If ALL PASS:
  ```
  ✅ Full review passed for branch [branch-name]
  Iterations: [N]
  Issues fixed: [total]
  Ready for QA testing.
  ```
- If issues remain:
  ```
  ⚠️ Review completed for branch [branch-name] with [N] remaining issues
  Iterations: 3 (max reached)
  Please review manually: [list of remaining issues]
  ```

### Output
Display:
1. Summary of each iteration (issues found → fixed)
2. Final review report
3. Next steps (QA prep or manual fixes needed)
