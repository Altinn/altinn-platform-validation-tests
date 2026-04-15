#!/usr/bin/env bash
set -euo pipefail

DIST_DIRECTORY=".dist"

if [ ! -d "$DIST_DIRECTORY" ]; then
  mkdir "$DIST_DIRECTORY"
fi

jsonnet -m "$DIST_DIRECTORY" ./slos/main.jsonnet
cat "$DIST_DIRECTORY/slos.json" | yq  -p json '.[]  | splitDoc' > "$DIST_DIRECTORY/slos.yaml"
rm "$DIST_DIRECTORY/slos.json"
