#!/usr/bin/env bash
set -euo pipefail

case "${1:-}" in
    "")
        mode="format"
        ;;
    --test)
        mode="check"
        ;;
    *)
        echo "Usage: $0 [--test]" >&2
        exit 2
        ;;
esac

while IFS= read -r -d '' file; do
    if [[ "$mode" == "format" ]]; then
        jsonnetfmt -i "$file"
        continue
    fi

    if ! jsonnetfmt --test "$file" >/dev/null 2>&1; then
        echo "ERROR: $file is not formatted" >&2
        diff -u "$file" <(jsonnetfmt "$file") || true
        exit 1
    fi
done < <(
    find ./hack ./slos \
        -type f \
        \( -name '*.jsonnet' -o -name '*.libsonnet' \) \
        -print0
)
