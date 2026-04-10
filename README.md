# Bürokratt Playwright Test Suite

This repository contains the current Playwright-based automated test suite for the **Bürokratt admin interface, chat widget, and selected API-facing flows**.

Playwright is an end-to-end browser automation framework; in this project it is used to validate UI behavior, smoke coverage, and selected API-facing flows in test and stage environments.

The project is structured around a practical mix of:

- **smoke coverage** for key pages and navigation paths
- **UI validation tests** for the admin-side service builder
- **API smoke checks** for major admin, analytics, and chat views
- **limited end-to-end flows** for real user journeys
- **Page Object Model (POM)** abstractions for reuse and maintainability
- **local, Docker, and GitHub Actions execution**

---

## Quick Start

Use this repository in three ways:

- Local and Docker test execution: [Running tests guide](docs/running_tests.md)
- CI setup and configuration: [CI setup guide](docs/ci_setup.md)
- Current coverage and scope: [Coverage summary](docs/coverage.md)

CI trigger model:

- label-triggered runs via issue label `run-at-tests`
- manual runs via workflow dispatch
- scheduled all-tests run on weekdays at `03:30 UTC` (`06:30` Tallinn during EEST)
- issue runs are marked with `testing...` while execution is in progress

---

## Current project state

At the moment the repository includes:

- coverage split across **smoke**, **UI visibility/functionality**, **API smoke**, and **E2E flow** suites, with limited widget-related coverage through broader flows
- a strong current focus on the **Services** area in the admin application
- environment targeting for both **test** and **stage** deployments
- reusable page objects for admin navigation, chats, services, training, and widget interactions
- two active CI workflows:
  - issue/manual execution: `project-v2-acceptance-testing.yml`
  - weekday scheduled full run: `scheduled-all-tests.yml`

For current counts and detailed suite breakdown, see [`docs/coverage.md`](docs/coverage.md).

---

## Repository structure

```text
.
├── docs/                       # Project notes and coverage documentation
├── page-objects/               # Page Object Model classes
│   ├── chats/
│   ├── login/
│   ├── menu/
│   ├── services/
│   ├── training/
│   └── widget/
├── tests/
│   ├── .setup/                 # Shared test setup helpers
│   ├── admin/                  # Auth, translation, and admin UI tests
│   ├── api/                    # API smoke checks
│   ├── e2e/                    # End-to-end flows
│   └── smoke/                  # Cross-area smoke tests
├── .github/workflows/          # CI workflows
├── docker-compose.yml
├── Dockerfile
├── playwright.config.js
├── playwright.config.api.js
└── package.json
```

---

## Configuration

### Environment selection

The Playwright UI configuration supports two environments:

- `test`
- `stage`

The default environment is resolved from `ENV`, with a fallback to `test` inside the config.

Base URLs are defined centrally in `playwright.config.js`.

### Projects in `playwright.config.js`

The repository currently defines these Playwright projects:

- `setup`
- `smoke`
- `flow`
- `tests`

The API suite also has a separate Playwright configuration in `playwright.config.api.js`.

---

## Tech stack

- **Playwright**
- **Node.js**
- **Docker / Docker Compose**
- **GitHub Actions**
- **Playwright HTML Reporter**

---

## Running tests

- [Running tests guide](docs/running_tests.md)

---

## Implementation

Implementation guidance for new tests:

- [Testing strategy](docs/testing_strategy.md) for scope and workflow
- [Running tests guide](docs/running_tests.md) for execution patterns

How implementation is done in this repository:

- Tests primarily follow the **Page Object Model**
- Shared setup logic lives under `tests/.setup/`
- Admin authentication state is stored under `tests/admin/.auth/`
- Translation-related setup exists under `tests/admin/.translation/`
- Console errors are monitored in shared setup helpers
- Main UI suite runs with **4 workers in CI** and **50% of available workers locally** by default
- API Playwright config runs with **single-worker execution in CI**

Shared test infrastructure includes:

- environment URL resolution in `utils/env/urls.js`
- route-aware page readiness waits in `utils/waits/admin-page-ready.js`
- deterministic service test data in `utils/test-data/service-data.js`
- paginated admin table helpers in `page-objects/common/paginated-data-table.js`
- service-specific helper utilities in `tests/admin/services/service-test-helpers.js`

---

## Current limitations

- There is **no automated line/branch code coverage instrumentation** in the repository yet
- Coverage today is best understood as **functional test coverage by feature area**
- Some areas have only smoke-level coverage
- The service creation E2E flow is present but currently **skipped**
- Training functionality coverage is still relatively light compared to Services

---

## Related documentation

- [Coverage summary](docs/coverage.md)
- [Running tests guide](docs/running_tests.md)
- [CI setup guide](docs/ci_setup.md)
- [Testing strategy](docs/testing_strategy.md)
- [Issue/manual CI workflow](.github/workflows/project-v2-acceptance-testing.yml)
- [Scheduled all-tests CI workflow](.github/workflows/scheduled-all-tests.yml)

---

## Maintainers

Maintained as part of the Bürokratt testing effort.
