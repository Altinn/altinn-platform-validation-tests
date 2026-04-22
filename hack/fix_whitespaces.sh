#!/usr/bin/env bash

set -euo pipefail

# Usage:
#   hack/fix_whitespaces.sh [directory]        # report only
#   hack/fix_whitespaces.sh [directory] --fix  # auto-fix

DIR="${1:-.}"
FIX=false

if [[ "${2:-}" == "--fix" ]]; then
    FIX=true
fi

# Directory names to ignore everywhere
IGNORE_DIRS=(
  ".git"
  "node_modules"
  ".venv"
  "dist"
  "build"
)

# Specific paths to ignore (relative to DIR)
IGNORE_PATHS=(
  "K6/testdata"
)

found=0

# Build find command
FIND_CMD=(find "$DIR")

# Add directory name pruning
for d in "${IGNORE_DIRS[@]}"; do
    FIND_CMD+=( -name "$d" -type d -prune -o )
done

# Add specific path pruning
for p in "${IGNORE_PATHS[@]}"; do
    FIND_CMD+=( -path "$DIR/$p" -prune -o )
done

# Add file selection
FIND_CMD+=( -type f -print )

"${FIND_CMD[@]}" | while read -r file; do
    # Skip binary files
    if ! grep -Iq . "$file"; then
        continue
    fi

    if grep -qE '[[:blank:]]+$' "$file"; then
        if [ "$FIX" = true ]; then
            sed -i 's/[[:blank:]]\+$//' "$file"
            echo "Fixed: $file"
        else
            echo "Trailing whitespace in: $file"
            grep -nE '[[:blank:]]+$' "$file"
            echo
        fi
        found=1
    fi
done

if [ "$FIX" = false ] && [ "$found" -eq 1 ]; then
    exit 1
fi
