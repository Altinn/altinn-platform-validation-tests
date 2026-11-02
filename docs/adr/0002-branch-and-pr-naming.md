# ADR 0002: Branch and PR naming

Status: Draft
Date: 2026-11-02

## Context

Branch names in this repo vary a lot, from `test/` and `fix/` prefixes to names with no prefix at all. PRs are squash merged, so the branch name disappears after merge and the PR title is what remains in the history on `main`.

## Decision

Branches and PR titles use one of three prefixes, based on what the change touches:

- `k6/` for anything under `K6/`: tests, clients, building blocks, domain checks, test data and yaml.
- `playwright/` for anything under `playwright/`.
- `chore/` for everything that is not test code: Swagger updates, workflows, infra, operators, helpers and docs.

Branches are named `<prefix>/<short-description>`, for example `k6/activity-log-tests`. PR titles start with the same prefix followed by a colon, for example `k6: add activity log tests`.

We don't add `fix/`, `feat/` or similar on top. In a test repo the line between a new test and a fix to a test is unclear, and the area is what matters when reading the history.

## Consequences

The history on `main` and the PR list can be read and filtered by area. A PR that touches both K6 and Playwright should usually be split; if it can't be, use the prefix for the main change.
