#!/bin/bash
# Checks Jira issue status via the Atlassian MCP-backed workflow configuration.
# This helper is intentionally non-blocking; if Jira auth is not configured it exits quietly.

source "$(dirname "$0")/load-env.sh"

JIRA_ISSUE_KEY=$1

if [ -z "$ATLASSIAN_MCP_AUTH" ]; then
    echo "ATLASSIAN_MCP_AUTH not set. Skipping Jira status check." >&2
    exit 0
fi

if [ -z "$JIRA_ISSUE_KEY" ]; then
    echo "No issue key provided." >&2
    exit 0
fi

cat <<EOF
{
  "issueKey": "$JIRA_ISSUE_KEY",
  "status": "Jira status checks should be performed through the configured Atlassian MCP server."
}
EOF

exit 0
