---
name: bug-finder
description: Multi-agent adversarial bug finder. Spawns 6 specialized agents across 3 rounds to find bugs, security issues, performance problems, and edge cases. Use this skill whenever someone asks to find bugs, review code changes, analyze a PR, investigate logs, check a GitHub issue, look at a Jira/Linear ticket, or wants a bug report. Triggers on: "find bugs", "review this PR", "check these changes", "analyze this issue", "something is broken", "look at these logs", "what could go wrong", "audit this", "test this feature", "edge cases", "security review", or any request to investigate potentially broken code. Always use this skill even if the user only pastes a snippet — partial analysis is better than none.
---

# Bug Finder

A 6-agent adversarial bug-finding system. Three rounds of investigation with built-in challenge mechanisms.

## How agent prompts work

Each agent's full instructions live in `agents/<name>.md`. Read each file yourself and compose the final agent prompt as:

```
{content of agents/<name>.md}

## PROJECT CONTEXT
{project_context}          ← Round 1 agents only

## SOURCE FILES TO ANALYZE
{source_files_content}     ← Round 1 agents only (relevant sections only — see Step 1)

## INPUT MATERIAL
{input_material}           ← Round 1 agents only

## Workspace
Write output to: {workspace}/round-N/<name>.md
```

Round 2 agents receive **only** round-1 findings — no project context, no source files. The findings already contain all relevant code context.

---

## Step 1: Parse the Input

| Input Type | Action |
|---|---|
| GitHub PR link | `gh pr diff <N>` + `gh pr view <N> --json files,additions,deletions,body`. Read changed files. |
| GitHub issue link | `gh issue view <N> --json title,body,comments,labels`. Read related code files. |
| Jira/Linear ticket | WebFetch the URL. Extract bug description and affected area. |
| Code diff / changed files | Use directly. |
| Error logs | Read stack trace files at the relevant line numbers. |
| Screenshot | Identify the UI component, read relevant code. |
| Bug description (text) | Extract feature + failure + expected behavior. Read related code. |
| "Check current changes" | Read recently modified files or ask the user which files changed. |

**Before dispatching agents, read the relevant source files yourself.** Agents work better with code pasted in than with file paths.

**Token discipline:** Paste only the relevant functions/sections, not entire files. For a PR, paste the diff plus the surrounding function context. For a bug report, paste the specific module/handler. Don't paste entire files that are mostly unrelated to the change.

**Small input shortcut:** For inputs < 100 lines (a single snippet or narrow single-file change), skip subagents entirely. Apply each agent's persona inline in sequence — Bug Hunter → Security Auditor → Performance Analyst → Devil's Advocate → Edge Case Specialist → synthesize. Saves full subagent overhead for low-complexity inputs.

## Step 2: Discover Project Context

Build a compact context block (aim for ~10 lines) to give agents just enough orientation. Read only what you need:

1. Check for `package.json`, `go.mod`, `pyproject.toml`, `Cargo.toml`, `pom.xml`, etc. to identify the stack
2. `ls` the top-level directory and one level of `src/` (or equivalent) to understand structure
3. Note any obvious high-risk modules (payments, auth, queues, DB access)

Write a short `{project_context}` like:
```
Stack: Next.js 15 + NestJS 11, PostgreSQL/Prisma, BullMQ
Structure: Frontend/ (React app) + Backend/ (API server)
Key risk areas: payment module, auth/JWT, subscription billing, background jobs
```

Keep it under 15 lines. Agents don't need a full architecture doc — they need to know the stack and where the dragons are.

## Step 3: Set Up the Workspace

```
/tmp/bug-investigation-{YYYYMMDD-HHMM}/
├── input-summary.md
├── round-1/
│   ├── bug-hunter.md
│   ├── security-auditor.md
│   └── performance-analyst.md
├── round-2/
│   ├── devil-advocate.md
│   └── edge-case-specialist.md
└── round-3/
    └── synthesis-judge.md
```

Write `input-summary.md`: input type, scope, relevant files, context from tickets/issues.

## Step 4: Round 1 — Parallel Discovery

Read:
- All relevant source files (relevant sections only) → `{source_files_content}`
- `agents/bug-hunter.md` → compose Bug Hunter prompt
- `agents/security-auditor.md` → compose Security Auditor prompt
- `agents/performance-analyst.md` → compose Performance Analyst prompt

Dispatch **three agents simultaneously** (`run_in_background: true`). Compose each prompt using the template above: agent instructions + project_context + source files + input material + workspace path.

Wait for all three to complete.

## Step 5: Round 2 — Adversarial Challenge

Read round-1 output files and `agents/devil-advocate.md` + `agents/edge-case-specialist.md`.

Dispatch **two agents simultaneously**:

```
{content of agents/devil-advocate.md OR agents/edge-case-specialist.md}

## ROUND 1 FINDINGS

--- Bug Hunter ---
{r1_bug_hunter}

--- Security Auditor ---
{r1_security}

--- Performance Analyst ---
{r1_performance}

## Workspace
Write output to: {workspace}/round-2/<name>.md
```

Wait for both to complete.

## Step 6: Round 3 — Synthesis

Read all round output files and `references/report-template.md`.

Dispatch the **Synthesis Judge** with:
- `agents/synthesis-judge.md` content
- All 5 sets of findings
- `references/report-template.md` content
- Output path: `{bug_report_output_path}`

**Output path rule:** In a repo → write `bug-report.md` to the current working directory. Otherwise → write to the workspace directory.

## Step 7: Present Results

```
Bug report written to: {path}

{N} issues found:
- 🔴 Critical: {X}
- 🟠 High: {Y}
- 🟡 Medium: {Z}
- 🔵 Low: {W}

Top 3 issues to address immediately:
1. {Critical/High finding title + one-line summary}
2. ...
3. ...

Full report: {path}
```

Ask: "Do you want me to dive deeper into any specific finding, or help draft fixes for the critical issues?"

---

## Notes

- Never give agents paths to skill resources (`agents/`, `references/`). They cannot access files outside the project directory. Always read the files yourself and paste the content.
- For very large PRs (50+ files), focus agents on highest-risk files: payment flows, auth, core business logic.
- Ask the developer "Is there any specific area you're concerned about?" — their intuition is valuable.
- The `/tmp/` workspace is temporary — copy `bug-report.md` somewhere permanent if the user will want to revisit it.
