# Testing Strategy

This document explains how to choose test scope and how tasks should move from definition to CI validation.

## Test layers in this repository

- `smoke` (`*.smoke.js`)
  - Broad health checks for key areas.
  - Fast confidence that core pages and flows are reachable.

- `tests` (`*.test.js`)
  - Deeper UI functionality and visibility checks.
  - Main layer for admin/services behavior validation.

- `api/smoke`
  - API-error focused smoke checks on key views.
  - Useful for catching backend/UI integration regressions early.

- `e2e` (`*.flow.js`)
  - Cross-step user journeys.
  - Limited scope today; use for high-value critical paths.

## What to run for a task

- Small UI copy/layout change:
  - related `tests` path + relevant `smoke`

- Admin services logic/behavior change:
  - related `tests/admin/services/...` + `smoke` + optional API smoke

- Integration-sensitive change:
  - `smoke` + `api/smoke` + targeted `tests`

- Release confidence pass:
  - smoke-focused broad run (and additional targeted suites as needed)

## Task workflow (recommended)

1. Define task and acceptance criteria in issue/task.
2. Decide validation scope (`PROJECT`, `TEST_PATH`, `TEST_FILE`, `TEST_GREP`, `TARGETS`).
3. Run targeted tests locally (or in Docker) first.
4. Add label `run-at-tests` to trigger CI.
5. Check CI artifact/report and outcome labels.
6. If failed, fix and retrigger; if passed, proceed to review/merge flow.

## Definition of Done (testing)

- Relevant targeted tests pass locally (or equivalent Docker run).
- CI run passes for agreed scope.
- No unexpected regressions in smoke checks for touched area.
- Task has clear evidence of run scope (AT_TESTS block or manual inputs).

## CI outcome model (current)

Trigger:

- Issue label `run-at-tests`
- or manual workflow dispatch

On success:

- removes `testing...`
- adds `tests-passed`
- keeps status at `Acceptance testing`

On failure:

- removes `testing...`
- sets project status to `AT-rejected`
- adds `tests-failed`

## Failure triage order

1. Check selector/path/project mismatch (`No tests found` type issues).
2. Verify environment (`ENV=test|stage`) and data assumptions.
3. Verify auth/setup state for UI projects.
4. Check if failure is product bug vs flaky selector/timing.
5. Rerun with narrowed scope to isolate root cause.

## Related docs

- Running commands and AT_TESTS keys: `docs/running_tests.md`
- CI setup (labels, PAT, vars): `docs/ci_setup.md`
- Coverage scope and current depth: `docs/coverage.md`

## General workflow (subject to change)
<img width="1793" height="709" alt="image" src="https://github.com/user-attachments/assets/210fae6d-5dd3-4cf1-a0d0-df5bd070d184" />
