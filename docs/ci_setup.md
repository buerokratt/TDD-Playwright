# CI Setup (Step by Step)

This guide describes how to set up CI workflows:
- `.github/workflows/project-v2-acceptance-testing.yml` (label/manual)
- `.github/workflows/scheduled-all-tests.yml` (weekday schedule)

## 1. Make sure workflow source branch is correct

Issue-label triggers run from the repository default branch.

- If your team uses `dev` as main branch, set `dev` as default branch in GitHub repository settings.
- Confirm the workflow file exists on that branch.

## 2. Create required labels

In GitHub repository labels, create:

- `run-at-tests` (trigger label)
- `tests-passed` (result label)
- `tests-failed` (result label)

## 3. Create PAT (classic)

Create a Personal Access Token (classic) for project status updates.

Recommended scopes:

- `repo` (for private repositories; for public-only use, limit accordingly)
- `project`

`workflow` scope is not required for this automation.

## 4. Add repository secret

In GitHub repository settings:

- `Settings -> Secrets and variables -> Actions -> Secrets`
- Add secret `BYK_PAT` with the PAT value

## 5. Add repository variables

In GitHub repository settings:

- `Settings -> Secrets and variables -> Actions -> Variables`

Add:

- `ORG`: project owner login (organization or user), for example `matKlju`
- `PROJECT_NUMBER`: GitHub Project v2 number, for example `3`

Optional (defaults are used if omitted):

- `STATUS_FIELD_NAME` (default: `Status`)
- `IN_PROGRESS_STATUS` (default: `Acceptance testing`)
- `FAIL_STATUS` (default: `AT-rejected`)

## 6. Ensure issues are linked to Project v2

For failure status updates to work:

- the issue must be linked to the configured Project v2
- project must contain the status field and fail option value

## 7. Triggering from an issue

1. Open or create an issue.
2. Add an optional `## AT_TESTS` block in issue body (see `docs/running_tests.md`).
3. Add label `run-at-tests`.

What happens:

- At trigger:
  - removes `run-at-tests`
  - adds `testing...`
  - sets status to `Acceptance testing` (or `IN_PROGRESS_STATUS`)
- On success:
  - removes `testing...`
  - adds `tests-passed`
  - keeps status as `Acceptance testing`
- On failure:
  - updates project status to `AT-rejected` (or `FAIL_STATUS`)
  - removes `testing...`
  - adds `tests-failed`
