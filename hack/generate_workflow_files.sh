#!/bin/bash

for i in auth dialogporten core
do
  functional_config_files=$(find K6/api/tests/${i} -type f -name 'functional.yaml')
  jsonnet \
  --ext-str team="${i}" \
  --ext-str config_files="${functional_config_files}" \
  hack/run-functional-tests.jsonnet | yq '
  . as $obj
  | ["name","on", "permissions", "jobs"]
    + (keys - ["name","on", "permissions", "jobs"])
    | map({key: ., value: $obj[.]})
    | from_entries
  ' -y > ".github/workflows/run-${i}-functional-tests.yml"
done

ite=0
for i in auth dialogporten core
do
  smoke_config_files=$(find K6/api/tests/${i} -type f -name 'smoke.yaml')
  if [ -n "$smoke_config_files" ]; then
  minutes=$(((iter*5+20) % 60))
  jsonnet \
  --ext-str team="${i}" \
  --ext-str cron_expression="$minutes * * * *" \
  --ext-str config_files="${smoke_config_files}" \
  hack/run-smoke-tests.jsonnet | yq '
  . as $obj
  | ["name","on", "permissions", "jobs"]
    + (keys - ["name","on", "permissions", "jobs"])
    | map({key: ., value: $obj[.]})
    | from_entries
  ' -y > ".github/workflows/run-${i}-smoke-tests.yml"
  iter=$((iter+1))
  fi
done

ite=0
for i in auth dialogporten core
do
  healthcheck_config_files=$(find K6/api/tests/${i} -type f -name 'healthcheck.yaml')
  if [ -n "$healthcheck_config_files" ]; then
  minutes=$(((iter*5+20) % 60))
  jsonnet \
  --ext-str team="${i}" \
  --ext-str cron_expression="$minutes * * * *" \
  --ext-str config_files="${healthcheck_config_files}" \
  hack/run-healthcheck-tests.jsonnet | yq '
  . as $obj
  | ["name","on", "permissions", "jobs"]
    + (keys - ["name","on", "permissions", "jobs"])
    | map({key: ., value: $obj[.]})
    | from_entries
  ' -y > ".github/workflows/run-${i}-healthcheck-tests.yml"
  iter=$((iter+1))
  fi
done


# This one might be a bit trickier due to scheduling.
jsonnet hack/run-breakpoint-tests.jsonnet | yq '
  . as $obj
  | ["name","on","run-name", "permissions", "jobs"]
    + (keys - ["name","on","run-name", "permissions", "jobs"])
    | map({key: ., value: $obj[.]})
    | from_entries
' -y > .github/workflows/run-auth-breakpoint-tests.yml



config_files=$(find K6/ -type f \( -name "functional.yaml" -o -name "smoke.yaml" -o -name "breakpoint.yaml" -o -name "healthcheck.yaml" \))
jsonnet \
--ext-str config_files="${config_files}" \
hack/linting.jsonnet | yq '
. as $obj
| ["name","on", "permissions", "jobs"]
  + (keys - ["name","on", "permissions", "jobs"])
  | map({key: ., value: $obj[.]})
  | from_entries
' -y > ".github/workflows/linting.yaml"