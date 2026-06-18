#!/usr/bin/env sh
set -eu

for test in .dist/*; do
    [ -d "$test" ] || continue

    UNIQ_NAME=$(jq -r '.metadata.labels.uniq_name' "$test/testrun.json")
    NAMESPACE=$(jq -r '.metadata.namespace' "$test/testrun.json")

    kubectl apply --server-side -f "$test"

    kubectl -n "$NAMESPACE" wait \
        --for=jsonpath='{.status.stage}'=started \
        testrun \
        -l "uniq_name=$UNIQ_NAME" \
        --timeout=60s

    kubectl -n "$NAMESPACE" logs \
        -f --tail=-1 \
        -l "uniq_name=$UNIQ_NAME,runner=true"
done