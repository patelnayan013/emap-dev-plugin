#!/bin/bash
# Checks Linear task status via API
# Requires LINEAR_API_KEY environment variable

source "$(dirname "$0")/load-env.sh"

LINEAR_TASK_ID=$1

if [ -z "$LINEAR_API_KEY" ]; then
    echo "LINEAR_API_KEY not set. Skipping Linear status check." >&2
    exit 0
fi

if [ -z "$LINEAR_TASK_ID" ]; then
    echo "No task ID provided." >&2
    exit 0
fi

RESPONSE=$(curl -s -X POST https://api.linear.app/graphql \
    -H "Content-Type: application/json" \
    -H "Authorization: $LINEAR_API_KEY" \
    -d "{\"query\": \"{ issue(id: \\\"$LINEAR_TASK_ID\\\") { title state { name } assignee { name } priority } }\"}")

echo "$RESPONSE" | jq '.data.issue'
exit 0
