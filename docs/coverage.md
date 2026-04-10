# Current test coverage

This document reflects the **current repository test coverage** based on the test files present in the project.

## Coverage summary

The repository currently contains:

- **about 60 active Playwright tests**
- **1 skipped end-to-end flow** (`tests/e2e/services/service-creation.flow.js`)
- coverage centered on **functional and page-level validation**, not instrumented code coverage

Counts in this document are intentionally approximate and based on the current repository test files. They may drift slightly as tests are added, removed, or reorganized.

## Important note

This project does **not** currently generate line, statement, branch, or function coverage metrics.

That means the term **coverage** in this repository currently refers to:

- feature-area coverage
- page coverage
- workflow coverage
- smoke coverage
- selected API error coverage

It does **not** yet mean Istanbul/nyc-style source-code coverage percentages.

## Coverage breakdown by suite

| Area | Active tests | Notes |
|---|---:|---|
| Admin services UI tests | about 15 | Deepest coverage area in the repository |
| API smoke tests | about 17 | Verifies critical admin, analytics, and chat pages load without visible API errors |
| General smoke tests | about 28 | Broad page-level coverage across admin, analytics, chats, landing page, services, and training |
| E2E flow tests | about 1 active + 1 skipped | Chat flow is active; service creation flow exists separately but is skipped |
| Widget coverage | no standalone suite currently present | Widget behavior is referenced in some flows, but not as a dedicated test directory in the current tree |
| **Total** | **about 60** | Approximate current active Playwright tests |

## Detailed coverage by folder

### `tests/smoke/` — about 28 tests

Current smoke coverage includes:

- **admin**: 8 tests
- **analytics**: 4 tests
- **chats**: 5 tests
- **landing page**: 1 test
- **services**: 3 tests
- **training**: 7 tests

Purpose of this suite:

- validate that core application pages open successfully
- confirm major menus/pages remain reachable
- catch broad regressions quickly

## `tests/admin/services/` — about 15 tests

This is the most mature and detailed part of the repository.

### Visibility coverage

Covered areas include:

- services overview page
- base service canvas elements
- define node elements
- multichoice node elements
- condition node elements
- client message node
- dynamic choice node
- OpenAPI creation visibility flow

### Functionality coverage

Covered areas include:

- creating a new service
- editing and saving service name/content
- service confirmation behavior
- confirmation-disabled behavior
- title-required validation before save succeeds
- client message configuration behavior
- negative-path validation
- cleanup/delete flows for created services in several tests

## `tests/api/smoke/` — about 17 tests

API smoke coverage currently checks that important pages load without visible API errors.

### Admin API smoke

Covered pages:

- users
- chatbot settings
- welcome message
- appearance
- emergency notices
- feedback settings
- working time
- session length

### Analytics API smoke

Covered pages:

- analytics overview
- chats analytics
- feedback analytics
- advisors analytics

### Chats API smoke

Covered pages:

- home page
- unanswered chats
- active chats
- pending chats
- chat history

## `tests/e2e/` — about 1 active test + 1 skipped flow

### Active

- chat flow end-to-end test

### Skipped

- service creation end-to-end flow

The skipped service flow shows intended future coverage for:

- intents
- model training
- service creation
- service activation flow

## Widget coverage

There is currently **no dedicated standalone widget test directory** in the repository.

Widget-related behavior still appears indirectly in the active chat E2E flow and in some admin-side service scenarios, but not as a standalone widget suite.

## Functional areas covered

### Strongest current coverage

- Services admin UI
- Core smoke coverage across main navigation areas
- API error smoke coverage

### Moderate current coverage

- Chat flow
- Training page reachability via smoke tests
- limited widget-related coverage through broader flows

### Light or incomplete coverage

- training feature behavior beyond basic smoke checks
- richer widget interaction scenarios
- broader end-to-end multi-area flows
- workflow/config validation for GitHub Actions and Docker setup
- non-services admin functional areas

## What is currently not covered by code coverage tooling

The repository does not currently expose percentages for:

- statement coverage
- branch coverage
- function coverage
- line coverage

To add that in the future, the project would need an instrumentation/reporting layer in addition to Playwright execution.

## Recommended interpretation

Today, the safest way to read repository coverage is:

- **broad smoke coverage** across major product areas
- **deep functional coverage** in the admin Services module
- **targeted API smoke validation** for key pages
- **limited but present E2E coverage, with no dedicated widget suite currently present**

## Suggested next coverage improvements

1. Add real source-code coverage instrumentation if percentage-based coverage is needed.
2. Expand training functionality tests beyond smoke validation.
3. Add more widget behavioral and conversation-path tests.
4. Unskip and stabilize the service creation E2E flow.
5. Add broader cross-module flows that combine training, services, chats, and widget behavior.
