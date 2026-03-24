#!/bin/bash
# Sends a notification to Slack via webhook
# Usage: notify-slack.sh <channel> <message>
# Requires EMAP_SLACK_WEBHOOK_URL environment variable

source "$(dirname "$0")/load-env.sh"

CHANNEL=$1
MESSAGE=$2

if [ -z "$EMAP_SLACK_WEBHOOK_URL" ]; then
    echo "EMAP_SLACK_WEBHOOK_URL not set. Skipping Slack notification." >&2
    exit 0
fi

if [ -z "$CHANNEL" ] || [ -z "$MESSAGE" ]; then
    echo "Usage: notify-slack.sh <channel> <message>" >&2
    exit 1
fi

curl -s -X POST "$EMAP_SLACK_WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "{\"channel\": \"#$CHANNEL\", \"text\": \"$MESSAGE\", \"username\": \"EMAP Workflow Bot\"}"

exit 0
