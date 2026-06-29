#!/usr/bin/env bash
set -euo pipefail

TESTS_FOLDER=$(ls .dist/)

for test in ${TESTS_FOLDER[@]}; do
    UNIQ_NAME=$(jq -r '.metadata.labels.uniq_name' .dist/"${test}"/testrun.json)
    NAMESPACE=$(jq -r '.metadata.namespace' .dist/"${test}"/testrun.json)

    kubectl --context k6tests-cluster apply --server-side -f ".dist/$test"

    kubectl --context k6tests-cluster -n "$NAMESPACE" wait --for=jsonpath='{.status.stage}'=started testrun -l "uniq_name=${UNIQ_NAME}" --timeout=600s
    kubectl --context k6tests-cluster -n "$NAMESPACE" logs -f --tail=-1 -l "uniq_name=${UNIQ_NAME},runner=true"
done
