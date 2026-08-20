#!/usr/bin/env bash
set -euo pipefail

az acr login -n altinnplatformvalidationtests

# at22
time docker build -t altinnplatformvalidationtests.azurecr.io/custom-playwright-runner:at22 -f Dockerfile.at22 .
docker push altinnplatformvalidationtests.azurecr.io/custom-playwright-runner:at22

NAMESPACE="playwright"

kubectl --context k6tests-cluster delete -f pod-at22.yaml || true
kubectl --context k6tests-cluster apply -f pod-at22.yaml
kubectl --context k6tests-cluster -n "$NAMESPACE" wait --for=condition=Ready pod -l "testrunner=playwright-at22" --timeout=180s
kubectl --context k6tests-cluster -n "$NAMESPACE" logs -f --tail=-1 -l "testrunner=playwright-at22"
kubectl --context k6tests-cluster delete -f pod-at22.yaml


# at23
time docker build -t altinnplatformvalidationtests.azurecr.io/custom-playwright-runner:at23 -f Dockerfile.at23 .
docker push altinnplatformvalidationtests.azurecr.io/custom-playwright-runner:at23

NAMESPACE="playwright"

kubectl --context k6tests-cluster delete -f pod-at23.yaml || true
kubectl --context k6tests-cluster apply -f pod-at23.yaml
kubectl --context k6tests-cluster -n "$NAMESPACE" wait --for=condition=Ready pod -l "testrunner=playwright-at23" --timeout=180s
kubectl --context k6tests-cluster -n "$NAMESPACE" logs -f --tail=-1 -l "testrunner=playwright-at23"
kubectl --context k6tests-cluster delete -f pod-at23.yaml


# tt02
time docker build -t altinnplatformvalidationtests.azurecr.io/custom-playwright-runner:tt02 -f Dockerfile.tt02 .
docker push altinnplatformvalidationtests.azurecr.io/custom-playwright-runner:tt02

NAMESPACE="playwright"

kubectl --context k6tests-cluster delete -f pod-tt02.yaml || true
kubectl --context k6tests-cluster apply -f pod-tt02.yaml
kubectl --context k6tests-cluster -n "$NAMESPACE" wait --for=condition=Ready pod -l "testrunner=playwright-tt02" --timeout=180s
kubectl --context k6tests-cluster -n "$NAMESPACE" logs -f --tail=-1 -l "testrunner=playwright-tt02"
kubectl --context k6tests-cluster delete -f pod-tt02.yaml

# prod
time docker build -t altinnplatformvalidationtests.azurecr.io/custom-playwright-runner:prod -f Dockerfile.prod .
docker push altinnplatformvalidationtests.azurecr.io/custom-playwright-runner:prod

NAMESPACE="playwright"

kubectl --context k6tests-cluster delete -f pod-prod.yaml || true
kubectl --context k6tests-cluster apply -f pod-prod.yaml
kubectl --context k6tests-cluster -n "$NAMESPACE" wait --for=condition=Ready pod -l "testrunner=playwright-prod" --timeout=180s
kubectl --context k6tests-cluster -n "$NAMESPACE" logs -f --tail=-1 -l "testrunner=playwright-prod"
kubectl --context k6tests-cluster delete -f pod-prod.yaml
