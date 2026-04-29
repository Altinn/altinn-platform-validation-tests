#!/usr/bin/env bash
set -euo pipefail

for file in $(find ./K6 -type f -name "smoke.yaml" -o -name "functional.yaml" -o -name "healthcheck.yaml" -o -name "browser.yaml" | sort); do
    rm -rf .build/ .conf/ .dist/ && \
        docker run \
            -u $(id -u ${USER}):$(id -g ${USER}) \
            -v .:/workspace \
            --rm \
            -e INPUT_CONFIG_FILE="$file" \
            ghcr.io/altinn/altinn-platform/k6-action-image:v0.0.34

    TESTS_FOLDER=$(ls .dist/ | sort)

    for test in ${TESTS_FOLDER[@]}; do
        UNIQ_NAME=$(jq -r '.metadata.labels.uniq_name' .dist/"${test}"/testrun.json)
        NAMESPACE=$(jq -r '.metadata.namespace' .dist/"${test}"/testrun.json)

        kubectl --context k6tests-cluster apply --server-side -f ".dist/$test"

        kubectl --context k6tests-cluster -n "$NAMESPACE" wait --for=jsonpath='{.status.stage}'=started testrun -l "uniq_name=${UNIQ_NAME}" --timeout=600s
        kubectl --context k6tests-cluster -n "$NAMESPACE" logs -f --tail=-1 -l "uniq_name=${UNIQ_NAME},runner=true"
    done
done