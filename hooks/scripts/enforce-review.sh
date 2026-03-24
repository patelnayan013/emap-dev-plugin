#!/bin/bash
# Tracks file modifications to ensure review is run before PR
# Appends modified files to a tracking file

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Only track source files (not config, not generated)
if echo "$FILE_PATH" | grep -qE "\.(php|js|vue|blade\.php)$"; then
    TRACKING_DIR=".claude/tracking"
    mkdir -p "$TRACKING_DIR"
    TRACKING_FILE="$TRACKING_DIR/modified-files.txt"

    # Add file if not already tracked
    if ! grep -qF "$FILE_PATH" "$TRACKING_FILE" 2>/dev/null; then
        echo "$FILE_PATH" >> "$TRACKING_FILE"
    fi

    # Update review status
    echo "pending" > "$TRACKING_DIR/review-status.txt"
fi

exit 0
