#!/bin/bash
# Validates that the current git branch follows naming conventions
# Expected format: EMAP-XXXX-description or feature/EMAP-XXXX-description

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)

# Only validate on git push commands
if echo "$COMMAND" | grep -q "git push"; then
    BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

    if [ -z "$BRANCH" ]; then
        exit 0  # Not in a git repo, skip
    fi

    # Allow main, master, develop branches
    if echo "$BRANCH" | grep -qE "^(main|master|develop|staging)$"; then
        exit 0
    fi

    # Validate branch naming: EMAP-XXXX-* or feature/EMAP-XXXX-*
    if ! echo "$BRANCH" | grep -qE "^(feature/|fix/|hotfix/)?EMAP-[0-9]+-"; then
        echo "Branch name '$BRANCH' doesn't follow convention: EMAP-XXXX-description" >&2
        echo "Examples: EMAP-3106-add-partner-rates, feature/EMAP-3106-add-partner-rates" >&2
        exit 2  # Block the push
    fi
fi

exit 0
