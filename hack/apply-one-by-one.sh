#!/usr/bin/env bash
set -euo pipefail

TESTS_FOLDER=$(ls .dist/)

for test in ${TESTS_FOLDER[@]}; do
    UNIQ_NAME=$(jq -r '.metadata.labels.uniq_name' .dist/"${test}"/testrun.json)
    NAMESPACE=$(jq -r '.metadata.namespace' .dist/"${test}"/testrun.json)

    kubectl apply --server-side -f ".dist/$test"

    kubectl -n "$NAMESPACE" wait --for=jsonpath='{.status.stage}'=started testrun -l "uniq_name=${UNIQ_NAME}" --timeout=60s
    kubectl -n "$NAMESPACE" logs -f --tail=-1 -l "uniq_name=${UNIQ_NAME},runner=true"
done
