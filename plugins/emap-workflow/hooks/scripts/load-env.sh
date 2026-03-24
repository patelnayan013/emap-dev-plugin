#!/bin/bash
# Loads environment variables from plugin .env file if they're not already set
# This allows devs to use either ~/.zshrc OR .env file
# Compatible with both bash and zsh

PLUGIN_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
ENV_FILE="$PLUGIN_DIR/.env"

if [ -f "$ENV_FILE" ]; then
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ "$key" =~ ^#.*$ ]] && continue
        [[ -z "$key" ]] && continue
        # Only set if not already in environment and value is not empty
        current_val=$(eval echo "\$$key" 2>/dev/null)
        if [ -z "$current_val" ] && [ -n "$value" ]; then
            export "$key"="$value"
        fi
    done < "$ENV_FILE"
fi
