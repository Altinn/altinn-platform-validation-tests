#!/usr/bin/env bash
set -euo pipefail

DIST_DIRECTORY=".dist"

if [ ! -d "$DIST_DIRECTORY" ]; then
  mkdir "$DIST_DIRECTORY"
fi

jsonnet -m "$DIST_DIRECTORY" ./slos/main.jsonnet

for json_file in "$DIST_DIRECTORY"/slos-*.json; do
    yaml_file="${json_file%.json}.yaml"

    yq -p=json -oy '.[] | splitDoc' "$json_file" > "$yaml_file"
    rm "$json_file"
done
