# Bürokratt Playwright Test Suite

This repository contains the current Playwright-based automated test suite for the **Bürokratt admin interface, chat widget, and selected API-facing flows**.

The project is structured around a practical mix of:

- **smoke coverage** for key pages and navigation paths
- **UI validation tests** for the admin-side service builder
- **API smoke checks** for major admin, analytics, and chat views
- **end-to-end flows** for real user journeys
- **Page Object Model (POM)** abstractions for reuse and maintainability
- **local, Docker, and GitHub Actions execution**

---

## Current project state

At the moment the repository includes:

- **69 active Playwright tests**
- coverage split across **smoke**, **UI visibility/functionality**, **API smoke**, **widget**, and **E2E flow** suites
- a strong current focus on the **Services** area in the admin application
- environment targeting for both **test** and **stage** deployments
- reusable page objects for admin navigation, chats, services, training, and widget interactions
- CI workflow files for manual, scheduled, and dispatch-based execution

A coverage summary for the repository is maintained in [`docs/coverage.md`](docs/coverage.md).

---

## Tech stack

- **Playwright**
- **Node.js**
- **Docker / Docker Compose**
- **GitHub Actions**
- **Playwright HTML Reporter**

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
│   ├── smoke/                  # Cross-area smoke tests
│   └── widget/                 # Widget-specific tests
├── .github/workflows/          # CI workflows
├── docker-compose.yml
├── Dockerfile
├── playwright.config.js
├── playwright.config.api.js
└── package.json
```

---

## Test areas currently covered

### Smoke suite

The smoke suite provides broad checks for the main application areas:

- landing page
- admin pages
- analytics pages
- chats pages
- services pages
- training pages

### Admin services suite

The deepest current test coverage is in the **Services** area. This includes:

- overview page visibility
- service canvas visibility
- node-specific UI visibility
- new service creation
- editing and saving service data
- confirmation-related behavior
- client message behavior
- selected negative-path checks
- OpenAPI creation flow visibility

### API smoke suite

API-oriented smoke tests validate that critical pages load without visible API errors for:

- admin settings-related pages
- analytics pages
- chat management pages

### Widget and E2E coverage

The repository also includes:

- widget visibility validation
- a chat flow E2E test
- a drafted service-creation E2E flow that is currently skipped

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

## Prerequisites

- Node.js 18+ recommended
- npm
- Playwright browser dependencies
- Access to the target Bürokratt environments

---

## Installation

```bash
npm install
npx playwright install --with-deps
```

---

## Running tests locally

### Run the default suite

```bash
npm test
```

### Run by environment

```bash
npm run test:test
npm run test:stage
```

### Run specific Playwright projects

```bash
npm run test:test:smoke
npm run test:test:tests
npm run test:stage:smoke
npm run test:stage:flow
npm run test:stage:tests
npm run test:stage:apismoke
```

### Run a specific path or file

```bash
npx playwright test tests/admin/services
npx playwright test tests/widget/widget.visibility.test.js
```

### Useful debug commands

```bash
npm run test:test:debug
npm run test:stage:debug
npx playwright test --headed
npx playwright test --ui
```

---


### Test tags and focused execution

Tests now include grep-friendly tags in their titles, for example:

- `[smoke]`
- `[api]`
- `[services]`
- `[visibility]`
- `[functional]`
- `[e2e]`
- `[chats]`

That makes it easier to run targeted subsets:

```bash
npx playwright test --grep "\[services\]"
npx playwright test --grep "\[smoke\]"
npx playwright test --grep "\[services\].*\[visibility\]"
```

### Code quality commands

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

### Shared utilities added

The suite now includes reusable helpers for:

- environment URL resolution in `utils/env/urls.js`
- route-aware page readiness waits in `utils/waits/admin-page-ready.js`
- paginated admin tables in `page-objects/common/paginated-data-table.js`
- deterministic service test data in `utils/test-data/service-data.js`

---

## Running with Docker

### Build the image

```bash
docker build -t buerokratt-playwright .
```

### Start with Docker Compose

```bash
docker compose up -d
```

The compose setup exposes the Playwright report port on `9323`.

---

## Reporting

This project currently uses the Playwright HTML report as the main execution report.

Generated artifacts include:

- HTML report
- screenshots on failure
- retained failure videos
- traces on first retry

### Open the report

```bash
npx playwright show-report
```

### Report locations

- `playwright-report/`
- `test-results/`

---

## CI workflows

The repository already includes workflow definitions for:

- manually triggered Playwright runs
- scheduled admin test runs
- scheduled widget test runs
- repository dispatch based runs
- issue creation based on failed test results

Workflow files live under `.github/workflows/`.

---

## Test design conventions

- Tests primarily follow the **Page Object Model**
- Shared setup logic lives under `tests/.setup/`
- Admin authentication state is stored under `tests/admin/.auth/`
- Translation-related setup exists under `tests/admin/.translation/`
- Console errors are monitored in shared setup helpers
- The current suite runs with **single-worker execution** in the main UI config

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
- [Docs overview](docs/README.md)

---

## Maintainers

Maintained as part of the Bürokratt testing effort.
