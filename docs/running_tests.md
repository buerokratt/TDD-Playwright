# Running Tests

Minimal guide for local, Docker, and CI runs.

Quick links: [Local](#local) | [Docker](#docker) | [CI](#ci-github-actions)

## Local

### Setup

```bash
npm install
npx playwright install --with-deps
```

### Run

```bash
npm test
npm run test:test
npm run test:stage
```

### Examples

```bash
npm run test:test:smoke
npm run test:test:tests
npm run test:services
npm run test:services:fast
npm run test:tests:fast
npm run test:smoke:admin
npx playwright test tests/admin/services/visibility
npx playwright test tests/admin/services/functionality/new-service.test.js
npx playwright test -g "Create service"
```

### Code quality

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

### Report

- Raw results in `test-results/`
- HTML report in `playwright-report/`
- Open with `npx playwright show-report`

## Docker

### Build & Start

```bash
docker compose up -d --build
```

### Run

```bash
docker compose exec playwright npx playwright test
```

### Examples

```bash
docker compose exec playwright npx playwright test --project smoke
docker compose exec playwright npx playwright test tests/smoke
docker compose exec playwright npx playwright test tests/admin/services
docker compose exec playwright npx playwright test -g "Create service"
docker compose exec -e ENV=stage playwright npx playwright test --project tests
```

### Stop

```bash
docker compose down
```

### Report

- Raw results in container path `test-results/`
- HTML report served from container on `http://localhost:9323`
- If needed locally, copy artifacts from container or run the same tests locally

## CI (GitHub Actions)

Workflow files:
- `.github/workflows/project-v2-acceptance-testing.yml` (label + manual)
- `.github/workflows/scheduled-all-tests.yml` (weekdays at `03:30 UTC`)
Setup guide: `docs/ci_setup.md`

### AT_TESTS keys

Use in issue/task description under `## AT_TESTS`.

- `ENV`: `test | stage` (default: `test`)
- `PROJECT`: `mock | setup | smoke | flow | tests | all` (default: `smoke`)
- `RUN_ALL`: `true | false` (default: `false`)
- `TEST_PATH`: folder path (default: `tests/smoke`)
- `TEST_FILE`: single file path
- `TEST_GREP`: test title filter (`--grep`)
- `TARGETS`: semicolon list of explicit targets
  - `project:<name>`
  - `path:<dir>@<project>`
  - `file:<file>@<project>`

### How to use keys

Use one selector method per run:

- Simple by project: set `PROJECT`
- Simple by folder: set `TEST_PATH` (+ usually `PROJECT: tests` or `smoke`)
- Simple by file: set `TEST_FILE`
- Filter by title: set `TEST_GREP` with any of the above
- Multi-target run: use `TARGETS` (overrides simple selector fields)
- Full run: set `RUN_ALL: true` or `PROJECT: all`

### AT_TESTS examples

```yaml
## AT_TESTS
PROJECT: mock
TEST_FILE: tests/mocks/ci/always-pass.mock.js
```

```yaml
## AT_TESTS
PROJECT: smoke
```

```yaml
## AT_TESTS
PROJECT: tests
TEST_PATH: tests/admin/services/visibility
```

```yaml
## AT_TESTS
PROJECT: tests
TEST_FILE: tests/admin/services/functionality/new-service.test.js
```

```yaml
## AT_TESTS
PROJECT: tests
TEST_PATH: tests/admin/services/functionality
TEST_GREP: "Create service"
```

```yaml
## AT_TESTS
TARGETS: path:tests/smoke@smoke;path:tests/admin/services/visibility@tests;file:tests/admin/services/functionality/new-service.test.js@tests
```

### Label-trigger behavior

Trigger label: `run-at-tests`

- Start: remove `run-at-tests`, add `testing...`, set status to `Acceptance testing`
- Success: remove `testing...`, add `tests-passed`, keep status as `Acceptance testing`
- Failure: remove `testing...`, add `tests-failed`, set status to `AT-rejected`

### Manual trigger (optional)

From `Actions` tab, run workflow manually with `workflow_dispatch` inputs:

- `env`, `project`, `run_all`, `test_path`, `test_file`, `test_grep`, `targets`

### Report

- Downloadable artifact: `playwright-report-<run_id>-<job_index>`
- Contains Playwright HTML report files (`playwright-report/`)
- Includes traces/screenshots/videos on failures/retries when produced by Playwright
