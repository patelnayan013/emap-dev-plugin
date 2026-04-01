# EMAP Workflow Plugin — Developer Setup

## 1. Install Claude Code
```bash
npm install -g @anthropic-ai/claude-code
```

## 2. Set Up Keys

### Atlassian Jira
Use Claude Code's official Atlassian MCP integration — no plugin-level config needed.
Set it up via: `claude mcp add --transport http atlassian https://mcp.atlassian.com/v1/mcp`
Then authenticate when prompted.


### Slack Webhook (optional)
1. Go to api.slack.com/apps → Select "EMAP Workflow Bot"
2. Incoming Webhooks → "Add New Webhook to Workspace"
3. Select your channel → Copy the URL

## 3. Configure Environment

### Option A: Shell profile (recommended)
Add to your `~/.zshrc`:
```bash
# EMAP Workflow Plugin
export EMAP_SLACK_WEBHOOK_URL="your_webhook_url_here"
```
Then: `source ~/.zshrc`

### Option B: Plugin .env file
```bash
cd emap-workflow
cp .env.example .env
# Edit .env and fill in your values
```

## 4. Run the Plugin
```bash
cd /path/to/emap
claude --plugin-dir ./emap-workflow
```

## 5. Available Commands

| Order | Command | When to Use |
|-------|---------|-------------|
| 1st | `/emap-workflow:analyze EMAP-1234` | Before writing code — generates dev plan from Jira |
| 2nd | `/emap-workflow:develop EMAP-1234` | After plan approved — implements the feature |
| 3rd | `/emap-workflow:full-review` | After development — reviews code in a loop |
| 4th | `/emap-workflow:qa-prep EMAP-ID` | Before QA — generates test scenarios |
| 5th | `/emap-workflow:ready-for-review` | After QA passes — creates PR, notifies managers |

### Standalone commands (also included in full-review):
- `/emap-workflow:review` — Code review only
- `/emap-workflow:security-audit` — Security scan only
- `/emap-workflow:quality-check` — Linting & quality only

## 6. Workflow

```
Get Jira issue → analyze → develop → full-review → qa-prep → ready-for-review
```

Never skip a step. The plugin tracks progress and will warn you if something is missing.
