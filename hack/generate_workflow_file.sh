#!/bin/bash
jsonnet hack/run-auth-breakpoint-tests.jsonnet | yq '
  . as $obj
  | ["name","on","run-name", "permissions", "jobs"]
    + (keys - ["name","on","run-name", "permissions", "jobs"])
    | map({key: ., value: $obj[.]})
    | from_entries
' -y > .github/workflows/run-auth-breakpoint-tests.yml
