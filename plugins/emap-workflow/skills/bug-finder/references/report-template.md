# Bug Report Template

Use this exact structure for `bug-report.md`.

---

```markdown
# Bug Report

**Generated:** {DATE}
**Input:** {WHAT WAS ANALYZED — e.g., "PR #42: Add subscription retry logic", "Logs from 2026-03-30", "Bug description: checkout fails on Safari"}
**Scope:** {Frontend / Backend / Full-Stack}
**Total Issues Found:** {N} (Critical: X | High: Y | Medium: Z | Low: W)

---

## Summary

{2-3 sentences describing the overall risk picture. What are the most dangerous findings? What themes emerged?}

---

## Critical Issues

### [C1] {Short title}

| Field | Detail |
|-------|--------|
| **Severity** | Critical |
| **Area** | {Frontend \| Backend \| Both} |
| **Component** | {e.g., `subscription-engine`, `src/domains/auth/`, `payment-processor`} |
| **File(s)** | {file path(s) if known} |
| **Confidence** | {High \| Medium} |

**What's wrong:**
{Clear description of the bug. What happens, when it happens, why it's a problem.}

**Scenario / Reproduction:**
{Step-by-step or a concrete example showing how this bug manifests. Be specific — amounts, states, user actions.}

**Impact:**
{What breaks? Who is affected? How many users/merchants? Data loss? Money lost?}

**Fix Strategy:**
{Concrete recommendation. What code needs to change, what pattern to use, what to add/remove.}

---

{Repeat for each Critical issue}

---

## High Issues

### [H1] {Short title}

| Field | Detail |
|-------|--------|
| **Severity** | High |
| **Area** | ... |
| **Component** | ... |
| **File(s)** | ... |
| **Confidence** | ... |

**What's wrong:**
...

**Scenario / Reproduction:**
...

**Impact:**
...

**Fix Strategy:**
...

---

## Medium Issues

### [M1] {Short title}
{Same table + sections as above}

---

## Low Issues

### [L1] {Short title}
{Same table + sections as above}

---

## Edge Cases to Watch

{Numbered list of scenarios that aren't confirmed bugs but are risky — things the testing team should specifically add test cases for.}

1. {Scenario description}
2. ...

---

## Dismissed Findings

{Things initially flagged but determined to be false positives after adversarial review.}

| Finding | Why Dismissed |
|---------|--------------|
| ... | ... |

---

## Testing Recommendations

{Specific test cases or test scenarios that should be added to prevent regression. Be concrete — what inputs, what state, what expected outcome.}

1. {Test case description}
2. ...
```
