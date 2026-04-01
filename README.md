# emap-dev-plugin

This plugin configures Claude Code to use Atlassian's official MCP server for Jira.

## Auth

Do not commit Jira credentials to this repository.

Each user must set their own local environment variable before launching Claude Code:

```bash
export ATLASSIAN_MCP_AUTH="Basic <base64(email:api_token)>"
```

Generate the header value with:

```bash
printf '%s' 'your-email@example.com:your-atlassian-api-token' | base64
```

Then prefix it with `Basic ` and export it as `ATLASSIAN_MCP_AUTH`.

Example:

```bash
export ATLASSIAN_MCP_AUTH="Basic $(printf '%s' 'you@example.com:token' | base64)"
```

## Plugin MCP config

The plugin's `.mcp.json` uses environment-variable expansion:

```json
{
  "mcpServers": {
    "jira": {
      "url": "https://mcp.atlassian.com/v1/mcp",
      "headers": {
        "Authorization": "${ATLASSIAN_MCP_AUTH}"
      }
    }
  }
}
```

## Usage

1. Export `ATLASSIAN_MCP_AUTH` in your shell.
2. Start Claude Code with the plugin, or reload plugins if it is already running.
3. Verify the Jira MCP server is available from Claude Code.

## Recommended team setup

Use per-user credentials, not a shared API token.

If your Claude Code deployment supports Atlassian OAuth for remote MCP, prefer OAuth over API tokens for team distribution.
