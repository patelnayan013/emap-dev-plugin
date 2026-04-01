### Step 0: Verify MCP Connections (REQUIRED — Do this FIRST)

Before proceeding with ANY step below, you MUST verify that both the Jira MCP and Slack MCP are connected and working.

#### Check 1: Jira MCP
Call any Jira MCP tool to confirm the connection is active.
Use the official Atlassian MCP server configured as `jira` in `.mcp.json`.
Confirm you can read Jira data before proceeding, for example by fetching the authenticated user, listing accessible projects, or retrieving the target issue.

- **If the Jira MCP call succeeds:** Continue to Check 2.
- **If the Jira MCP call fails, times out, or the tools are not available:**
  STOP immediately. Do NOT proceed with any further steps. Display this message to the user and exit:

  > **⚠️ Jira MCP is not configured or not connected.**
  >
  > This plugin requires the Atlassian Jira MCP server to function. Please configure it before using any emap-workflow commands.
  >
  > **Setup steps:**
  > 1. Verify the `.mcp.json` file in the plugin directory has the official Atlassian `jira` MCP server configured.
  > 2. Set the environment variable used by that config:
  >    ```bash
  >    export ATLASSIAN_MCP_AUTH="your_authorization_header_value"
  >    ```
  > 3. Restart Claude Code so the MCP server reconnects.
  > 4. Re-run the command after confirming the Jira MCP tools are available.
  >
  > Once configured, re-run this command.

  **Do NOT continue past this point if Jira MCP is not connected.**

#### Check 2: Slack MCP
Call any Slack MCP tool (e.g., `mcp__claude_ai_Slack__slack_search_channels` or `mcp__claude_ai_Slack__slack_read_user_profile`) to confirm the connection is active.

- **If the Slack MCP call succeeds:** Proceed to Step 1.
- **If the Slack MCP call fails, times out, or the tools are not available:**
  STOP immediately. Do NOT proceed with any further steps. Display this message to the user and exit:

  > **⚠️ Slack MCP is not configured or not connected.**
  >
  > This plugin requires Slack MCP to function. Please configure it before using any emap-workflow commands.
  >
  > **Setup steps:**
  > 1. Open Claude Code settings and add the Slack MCP integration.
  > 2. Authenticate with your Slack workspace when prompted.
  > 3. Ensure the Slack MCP server appears as connected in Claude Code.
  > 4. Restart Claude Code if the connection doesn't appear.
  >
  > Once configured, re-run this command.

  **Do NOT continue past this point if Slack MCP is not connected.**

---
