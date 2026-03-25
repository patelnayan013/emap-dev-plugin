### Step 0: Verify MCP Connections (REQUIRED — Do this FIRST)

Before proceeding with ANY step below, you MUST verify that both Linear MCP and Slack MCP are connected and working.

#### Check 1: Linear MCP
Call any Linear MCP tool (e.g., list your Linear teams or fetch the authenticated user profile) to confirm the connection is active.

- **If the Linear MCP call succeeds:** Continue to Check 2.
- **If the Linear MCP call fails, times out, or the tools are not available:**
  STOP immediately. Do NOT proceed with any further steps. Display this message to the user and exit:

  > **⚠️ Linear MCP is not configured or not connected.**
  >
  > This plugin requires Linear MCP to function. Please configure it before using any emap-workflow commands.
  >
  > **Setup steps:**
  > 1. Get your Linear API key from **linear.app → Settings → API → Personal API keys**
  > 2. Set the environment variable:
  >    ```bash
  >    export LINEAR_API_KEY="lin_api_your_key_here"
  >    ```
  >    Or add it to your `~/.zshrc` / `~/.bashrc` and restart your terminal.
  > 3. Verify the `.mcp.json` file in the plugin directory has the Linear server configured.
  > 4. Restart Claude Code so the MCP server reconnects.
  >
  > Once configured, re-run this command.

  **Do NOT continue past this point if Linear MCP is not connected.**

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
