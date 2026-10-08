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
npm run test:test:chromium
npm run test:test:firefox
npm run test:test:webkit
```

### Stand preconditions

The `setup` project writes these before any test starts, so a local run needs nothing set by hand:

- Administration -> Office opening hours, for the widget served at the environment's customer URL: **Working hours are 24/7 = Yes**, **Use customer service = Yes**.

Nothing else on that page is touched: the notices keep whatever the back office holds, because the tests read their wording from there rather than assuming it. One test in `tests/e2e/chats/chat.flow.ts` switches **Use customer service** off on purpose and puts the configuration back when it ends; if it is killed mid-run, the next run's `setup` switches it on again.

Both switches matter because the bot offers an operator only when **the office is open AND an operator is online**:

| Opening hours | Operator | What the bot does |
|---|---|---|
| 24/7 | Present | offers an operator, the chat reaches the queue |
| 24/7 | Away | shows the "no operator available" notice and a contact form |
| closed | Present or Away | shows the "outside working hours" notice |
| any | any, with **Use customer service = No** | never offers one: shows the "bot cannot answer" notice |

The two 24/7 rows were measured on the `test` stand on 21.08.2026, the last one by the test that switches **Use customer service** off. The closed rows are what the back office is specified to do: nothing here ever shuts the hours, so no test covers them.

`tests/e2e/chats/chat.flow.ts` switches **Use customer service** off and matches on the "bot cannot answer" notice, leaving the hours at 24/7; the routing test needs the hours open *and* the operator Present, because at 24/7 with the operator Away the chat never reaches the queue.

Not covered by these tests, in case a later one needs it: the time zone the server reads the daily windows in (they are stored as bare `"11:00"`), which branch shows `organizationOutsideWorkingHoursMessage`, and whether national holidays and weekend switches change the bot's answer.

### Examples

```bash
npm run test:test -- --project=smoke-chromium
npm run test:test -- --project=tests-chromium tests/admin/services
npm run test:test -- --debug
npx playwright test tests/admin/services/functionality
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
docker compose exec playwright npx playwright test --project smoke-chromium
docker compose exec playwright npx playwright test tests/smoke
docker compose exec playwright npx playwright test tests/admin/services
docker compose exec playwright npx playwright test -g "Create service"
docker compose exec -e ENV=stage playwright npx playwright test --project tests-chromium
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
- `PROJECT`: `setup | smoke | flow | tests | all` (default: `smoke`)
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
PROJECT: smoke
TEST_FILE: tests/smoke/landing-page.smoke.ts
```

```yaml
## AT_TESTS
PROJECT: smoke
```

```yaml
## AT_TESTS
PROJECT: tests
TEST_PATH: tests/admin/services/functionality
```

```yaml
## AT_TESTS
PROJECT: tests
TEST_FILE: tests/admin/services/functionality/new-service.functionality.test.ts
```

```yaml
## AT_TESTS
PROJECT: tests
TEST_PATH: tests/admin/services/functionality
TEST_GREP: "Create service"
```

```yaml
## AT_TESTS
TARGETS: path:tests/smoke@smoke;path:tests/admin/services/functionality@tests;file:tests/admin/services/functionality/new-service.functionality.test.ts@tests
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
