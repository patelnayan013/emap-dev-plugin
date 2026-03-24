#!/bin/bash
# Generates a brief session summary when Claude Code session ends
# Logs what was done for audit trail

LOG_DIR=".claude/logs"
mkdir -p "$LOG_DIR"

LOG_FILE="$LOG_DIR/session-$(date +%Y%m%d-%H%M%S).log"

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
CHANGES=$(git diff --stat HEAD 2>/dev/null || echo "no changes")
UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null | head -10)

cat > "$LOG_FILE" << EOF
Session Summary — $(date)
Branch: $BRANCH

Changes since last commit:
$CHANGES

Untracked files:
$UNTRACKED

Review status: $(cat .claude/tracking/review-status.txt 2>/dev/null || echo "N/A")
Modified files tracked: $(wc -l < .claude/tracking/modified-files.txt 2>/dev/null || echo "0")
EOF

exit 0
