#!/usr/bin/env bash
set -euo pipefail

JSONNETFMT_FLAGS="-i"

if [[ "${1:-}" == "--test" ]]; then
    JSONNETFMT_FLAGS="--test"
fi

for file in $(find ./hack -type f -name "*.jsonnet" -o -name "*.libsonnet"); do
  jsonnetfmt "$JSONNETFMT_FLAGS" "$file"
done