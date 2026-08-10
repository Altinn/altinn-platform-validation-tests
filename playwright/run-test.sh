#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="platform"

kubectl --context k6tests-cluster delete -f pod.yaml || true
kubectl --context k6tests-cluster apply -f pod.yaml
kubectl --context k6tests-cluster -n "$NAMESPACE" wait --for=condition=Ready pod -l "testrunner=playwright" --timeout=180s
kubectl --context k6tests-cluster -n "$NAMESPACE" logs -f --tail=-1 -l "testrunner=playwright"
kubectl --context k6tests-cluster delete -f pod.yaml
