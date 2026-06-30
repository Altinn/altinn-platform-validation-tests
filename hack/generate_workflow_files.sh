#!/usr/bin/env bash
set -euo pipefail

TEAMS=(authentication dialogporten core portaler platform register)
WORKFLOWS_DIR=".github/workflows"



generate() {
  temp_dir=$(mktemp -d)
  temp_file1="${temp_dir}/temp1.yaml"
  temp_file2="${temp_dir}/temp2.yaml"

  local output=$1
  shift


  jsonnet "$@" > "$temp_file1"
  yq --prettyPrint -o yaml eval '{"name": .name, "on": .on, "run-name": ."run-name", "permissions": .permissions, "jobs": .jobs}' "$temp_file1" > "$temp_file2"
  yq '.. style="double"' "$temp_file2" > "$output"
}


for team in "${TEAMS[@]}"; do
  base="K6/api/tests/$team"

  breakpoint=$(find "$base" -type f -name breakpoint.yaml)

  for conf in $breakpoint; do
    scope=$(basename "$(dirname "$conf")")
    generate "$WORKFLOWS_DIR/run-$team-$scope-breakpoint-tests.yml" \
      --ext-str team="$team" \
      --ext-str config_file="$conf" \
      --ext-str test_scope="$scope" \
      hack/run-breakpoint-tests.jsonnet
  done
done

all_configs=$(find K6/ -type f \( \
  -name functional.yaml \
  -o -name smoke.yaml \
  -o -name healthcheck.yaml \
  -o -name breakpoint.yaml \
\))

generate "$WORKFLOWS_DIR/linting.yaml" \
  --ext-str config_files="$all_configs" \
  hack/linting.jsonnet