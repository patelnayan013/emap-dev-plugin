---
name: security-audit
description: Run OWASP Top 10 security audit on all changed files vs main branch
disable-model-invocation: true
allowed-tools: Read, Edit, Write, Grep, Glob, Bash, Agent
effort: high
---

## Security Audit

Perform a thorough security audit on all files changed compared to main branch.

!`cat ${CLAUDE_PLUGIN_ROOT}/templates/jira-mcp-check.md`

### Step 1: Get Changed Files
```bash
git diff main...HEAD --name-only
```

### Step 2: Scan for Vulnerabilities

**A01 — Broken Access Control:**
- Check all new routes have proper middleware (auth, role-based)
- Verify authorization checks on controller methods (policies/gates)
- Check for IDOR — are resource IDs validated against the authenticated user?
- Look for missing `$this->authorize()` or policy checks

**A02 — Cryptographic Failures:**
- No sensitive data (passwords, tokens, keys) in logs
- Passwords hashed with bcrypt/argon2 (never md5/sha1)
- API tokens/secrets not hardcoded — must use .env
- Check for sensitive data in API responses that shouldn't be there

**A03 — Injection:**
- SQL: No raw queries (`DB::raw`, `whereRaw`) without parameter binding
- Command: No `exec()`, `system()`, `shell_exec()`, `passthru()` with user input
- LDAP: No unescaped LDAP queries
- XSS: No `{!! !!}` in Blade without sanitization, no `v-html` with user data

**A04 — Insecure Design:**
- Rate limiting on authentication endpoints
- Rate limiting on public API endpoints
- Proper input validation with Form Requests

**A05 — Security Misconfiguration:**
- Debug mode not enabled in production code
- No default credentials
- CORS properly configured
- Error messages don't leak stack traces

**A06 — Vulnerable Components:**
- Check if any new packages were added — flag for manual review

**A07 — Authentication Failures:**
- JWT tokens properly validated
- Session handling is secure
- Password reset flow is secure

**A08 — Data Integrity Failures:**
- File uploads validated (type, size, content)
- Deserialization is safe (no `unserialize()` on user input)
- CSRF protection on all state-changing routes

**A09 — Logging & Monitoring:**
- Security events are logged (failed auth, permission denied)
- No sensitive data in log entries
- Logs don't accept user-controlled input unsanitized

**A10 — SSRF:**
- External URL fetching validates/restricts target domains
- No user-controlled URLs passed to `file_get_contents`, `curl`, or HTTP clients without validation

### Step 3: Fix Vulnerabilities
For each vulnerability found:
1. Classify severity: CRITICAL / HIGH / MEDIUM / LOW
2. Show the vulnerable code with file:line
3. Explain the attack vector
4. Apply the fix
5. Verify the fix doesn't break functionality

### Step 4: Report
Output:
| # | Vulnerability | OWASP | File | Line | Severity | Status |
|---|--------------|-------|------|------|----------|--------|

Summary: total found, total fixed, any requiring manual review.
