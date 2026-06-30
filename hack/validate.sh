#!/usr/bin/env bash
set -euo pipefail

# Initialize a flag to track if any filenames are not in kebab-case
found_non_kebab_case=false

# Loop through all .js files in the current directory and subdirectories
for file in $(find ./K6 -type f -name "*.js"); do
  # Extract the filename from the full path
  filename=$(basename "$file")

  # Check if the filename is not in kebab-case format
  if [[ ! "$filename" =~ ^[a-z0-9]+(-[a-z0-9]+)*\.js$ ]]; then
    echo "Filename not in kebab-case: $file"
    found_non_kebab_case=true
  fi
done

# Exit with error code 1 if any non-kebab-case filenames were found
if [ "$found_non_kebab_case" = true ]; then
  exit 1
fi

for file in $(find ./K6/api -type f -name "functional.yaml" -o -name "healthcheck.yaml" -o -name "breakpoint.yaml" -o -name "smoke.yaml"); do
  echo "Validating $file"
  rm -rf .build/ .conf/ .dist/ && \
  docker run -u $(id -u ${USER}):$(id -g ${USER}) -v .:/workspace --rm \
  -e INPUT_CONFIG_FILE="$file" \
  ghcr.io/altinn/altinn-platform/k6-action-image:v0.0.41
done

for file in $(find ./K6/browser -type f -name "browser.yaml"); do
  echo "Validating $file"
  rm -rf .build/ .conf/ .dist/ && \
  docker run -u $(id -u ${USER}):$(id -g ${USER}) -v .:/workspace --rm \
  -e INPUT_CONFIG_FILE="$file" \
  ghcr.io/altinn/altinn-platform/k6-action-image:v0.0.41
done
