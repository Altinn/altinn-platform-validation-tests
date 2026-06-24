#!/usr/bin/env bash
set -euo pipefail

DIST_DIRECTORY=".dist"

if [ ! -d "$DIST_DIRECTORY" ]; then
  mkdir "$DIST_DIRECTORY"
fi

for file in $(find ./K6/api -type f -name "functional.yaml" -o -name "healthcheck.yaml"); do
  jsonnet --ext-str team=$(echo $file | cut -d '/' -f4) \
          --ext-str namespace=$(yq '.namespace' $file) \
          --ext-str config_file="$file" \
          --ext-str cron_schedule="*/$((10 + $RANDOM % 11)) * * * *" \
          -m .dist/ hack/cronjob.jsonnet
done

for file in $(find ./K6/browser -type f -name "browser.yaml"); do
  jsonnet --ext-str team=$(echo $file | cut -d '/' -f4) \
          --ext-str namespace=$(yq '.namespace' $file) \
          --ext-str config_file="$file" \
          --ext-str cron_schedule="*/$((10 + $RANDOM % 11)) * * * *" \
          -m .dist/ hack/cronjob.jsonnet
done

for file in $(find ./K6/api -type f -name "smoke.yaml"); do
  jsonnet --ext-str team=$(echo $file | cut -d '/' -f4) \
          --ext-str namespace=$(yq '.namespace' $file) \
          --ext-str config_file="$file" \
          --ext-str cron_schedule="$((0 + $RANDOM % 59)) * * * *" \
          -m .dist/ hack/cronjob.jsonnet
done
