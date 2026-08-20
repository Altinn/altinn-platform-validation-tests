#!/usr/bin/env bash
set -euo pipefail


# at22
time docker build -t altinnplatformvalidationtests.azurecr.io/custom-playwright-runner:at22 .
docker push altinnplatformvalidationtests.azurecr.io/custom-playwright-runner:at22

NAMESPACE="playwright"

kubectl --context k6tests-cluster delete -f pod-at22.yaml || true
kubectl --context k6tests-cluster apply -f pod-at22.yaml
kubectl --context k6tests-cluster -n "$NAMESPACE" wait --for=condition=Ready pod -l "testrunner=playwright" --timeout=180s
kubectl --context k6tests-cluster -n "$NAMESPACE" logs -f --tail=-1 -l "testrunner=playwright"
kubectl --context k6tests-cluster delete -f pod-at22.yaml


# at23
time docker build -t altinnplatformvalidationtests.azurecr.io/custom-playwright-runner:at23 .
docker push altinnplatformvalidationtests.azurecr.io/custom-playwright-runner:at23

NAMESPACE="playwright"

kubectl --context k6tests-cluster delete -f pod-at23.yaml || true
kubectl --context k6tests-cluster apply -f pod-at23.yaml
kubectl --context k6tests-cluster -n "$NAMESPACE" wait --for=condition=Ready pod -l "testrunner=playwright" --timeout=180s
kubectl --context k6tests-cluster -n "$NAMESPACE" logs -f --tail=-1 -l "testrunner=playwright"
kubectl --context k6tests-cluster delete -f pod-at23.yaml


# tt02
time docker build -t altinnplatformvalidationtests.azurecr.io/custom-playwright-runner:tt02 .
docker push altinnplatformvalidationtests.azurecr.io/custom-playwright-runner:tt02

NAMESPACE="playwright"

kubectl --context k6tests-cluster delete -f pod-tt02.yaml || true
kubectl --context k6tests-cluster apply -f pod-tt02.yaml
kubectl --context k6tests-cluster -n "$NAMESPACE" wait --for=condition=Ready pod -l "testrunner=playwright" --timeout=180s
kubectl --context k6tests-cluster -n "$NAMESPACE" logs -f --tail=-1 -l "testrunner=playwright"
kubectl --context k6tests-cluster delete -f pod-tt02.yaml

# prod
time docker build -t altinnplatformvalidationtests.azurecr.io/custom-playwright-runner:prod .
docker push altinnplatformvalidationtests.azurecr.io/custom-playwright-runner:prod

NAMESPACE="playwright"

kubectl --context k6tests-cluster delete -f pod-prod.yaml || true
kubectl --context k6tests-cluster apply -f pod-prod.yaml
kubectl --context k6tests-cluster -n "$NAMESPACE" wait --for=condition=Ready pod -l "testrunner=playwright" --timeout=180s
kubectl --context k6tests-cluster -n "$NAMESPACE" logs -f --tail=-1 -l "testrunner=playwright"
kubectl --context k6tests-cluster delete -f pod-prod.yaml
