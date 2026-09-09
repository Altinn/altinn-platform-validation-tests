#!/usr/bin/env bash
set -euo pipefail

DIST_DIRECTORY=".dist"

rm -rf "$DIST_DIRECTORY"
mkdir -p "$DIST_DIRECTORY"

PLAYWRIGHT_VERSION=$(yq -r '.devDependencies."@playwright/test"' ./playwright/package.json)

if [[ -z "$PLAYWRIGHT_VERSION" ]]; then
  echo "Could not find @playwright/test in playwright/package.json" >&2
  exit 1
fi

jsonnet --ext-str "playwrightVersion=$PLAYWRIGHT_VERSION" \
        -m "$DIST_DIRECTORY" ./hack/playwright-cronjobs.jsonnet

for file in "$DIST_DIRECTORY"/*.json; do
  yq -p json -o yaml '.' "$file" > "${file%.json}.yaml"
  rm "$file"
done
