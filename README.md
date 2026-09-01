# PlaywrightFramework

[![Playwright Tests](https://github.com/Abidchauhan/PlaywrightFramework/actions/workflows/playwright.yml/badge.svg)](https://github.com/Abidchauhan/PlaywrightFramework/actions/workflows/playwright.yml)
![Playwright](https://img.shields.io/badge/Playwright-45ba4b?logo=playwright&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Allure](https://img.shields.io/badge/Allure%20Report-FF5A5F?logo=qameta&logoColor=white)

End-to-end UI and API test automation for **[MyPracticeProject](https://github.com/Abidchauhan/MyPracticeProject)**, a full-stack e-commerce application (React/Vite frontend, Node/Express backend, MySQL) I built and now test with this framework. It covers the full customer journey — OTP login, onboarding, product browsing, cart, checkout, order history, addresses, and wishlist — both through the browser and directly against the REST API.

## Tech Stack

| Layer | Tool |
|---|---|
| Test runner | [Playwright Test](https://playwright.dev/) (`@playwright/test`) |
| Language | JavaScript (ESM) with JSDoc + `@ts-check` for type safety, no build step |
| Reporting | [Allure Report](https://allurereport.org/) — severity, feature, and tag metadata per test |
| CI/CD | GitHub Actions, running against a real MySQL 8 service container |

## Highlights

- **Page Object Model** — one class per screen under `Pages/`, keeping locators and page-level actions out of the test files.
- **Worker-scoped auth fixture** (`fixtures/authenticated.js`) — logs in once per Playwright worker via storage state instead of once per test, while every individual test still gets a fresh, fully isolated browser context. Cuts real OTP round-trips from "once per test" to "once per worker" without sacrificing test isolation.
- **26 tests, two layers** — 11 browser-driven UI tests and 15 direct API tests (`tests/api/`) against the same backend, sharing zero test logic but proving the same business rules hold at both layers.
- **Deliberate mix of real-backend and mocked tests** — 24 of the 26 run against the real stack by default, for genuine integration confidence. The other 2 (`tests/ui/mocked-scenarios.spec.js`) use Playwright's `page.route()` to mock specific network responses, reserved for scenarios the real system can't safely or reliably reproduce on demand — a backend `500` during checkout, and a stock-depleted-mid-request race condition. Tagged `mocked` in Allure so they stay clearly distinguished from the rest of the suite in reporting, not blended in as if they carried the same guarantee.
- **CI/CD pipeline that tests the real stack** — GitHub Actions spins up an actual MySQL 8.0.46 container, checks out the application under test as a second repository, runs its migrations and seed script, boots the real backend and frontend, and only then runs the suite against that live stack. The environment itself is never mocked — the two `page.route()` tests are a deliberate, isolated exception, not the default.
- **Allure reporting with real metadata** — every test is tagged with a business-impact severity (`blocker` → `trivial`), grouped by feature area (UI and API tests for the same feature, e.g. "Cart", merge into one view), and tagged (`@smoke`, `@validation`, `@security`, `@api`, `@mocked`) for slicing the report by concern. Generated and uploaded as a build artifact on every CI run.

## Project Structure

```
PlaywrightFramework/
├── .github/workflows/
│   └── playwright.yml        # CI pipeline: MySQL service, app checkout, migrate/seed, run tests
├── Pages/                    # Page Object Model — one class per screen
├── fixtures/
│   └── authenticated.js      # Worker-scoped login + per-test isolated, pre-authenticated page
├── tests/
│   ├── ui/                   # Browser-driven tests (login, onboarding, cart, checkout, ...)
│   │   ├── mocked-scenarios.spec.js  # page.route()-mocked edge cases, kept separate on purpose
│   │   └── utils/authFlow.js # Shared login/onboarding helpers for UI specs
│   └── api/                  # Direct REST API tests (auth, cart, checkout, orders, ...)
│       └── utils/            # Shared token/checkout helpers for API specs
├── playwright.config.js
└── package.json
```

## Running Locally

**Prerequisites:** Node.js 22+, and [MyPracticeProject](https://github.com/Abidchauhan/MyPracticeProject) running locally (backend on `:5000`, frontend on `:5173`, MySQL configured per its own `.env`).

```bash
# Install dependencies and browsers
npm install
npx playwright install --with-deps

# Run everything
npx playwright test

# Run just one layer
npx playwright test tests/ui
npx playwright test tests/api

# Interactive UI mode (great for debugging)
npx playwright test --ui

# Playwright's own HTML report
npx playwright show-report
```

### Viewing the Allure report

```bash
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

## CI/CD Pipeline

Every push to `main` triggers the [Playwright Tests workflow](../../actions/workflows/playwright.yml), which:

1. Starts a MySQL 8.0.46 service container with a health check gate.
2. Checks out this repo **and** `MyPracticeProject` (as a private, separately-authenticated second checkout) side by side.
3. Installs dependencies for this framework, the backend, and the frontend.
4. Runs the backend's real migration and seed scripts against the fresh database.
5. Starts the backend and frontend in the background, then polls their actual endpoints until both are ready (no fixed `sleep`).
6. Runs the full Playwright suite against that live stack.
7. Generates the Allure report and uploads it as a workflow artifact (`if: always()`, so it's produced even when tests fail) — downloadable from the run's Actions summary page without needing to reproduce the failure locally.

Because the database is a disposable container recreated on every run, every CI run starts from clean, correctly-seeded data — a stronger guarantee than the local dev database gets after repeated manual runs.

## Interesting Problems Solved

A few things that came up building this out and are worth calling out:

- **A parallel-worker race condition on shared product stock.** Checkout tests running in different workers kept converging on the *same* product — traced it to the API returning products ordered by "most recently updated," so every checkout bumped its target product back to the front of the list for the next test to pick. Confirmed with real network instrumentation (not guesswork) and fixed by having checkout flows pick a product at random instead of always the first one.
- **A shared-cart pollution bug that looked fixed but wasn't, until verified.** Worker-scoped test users share one cart across tests reused on that worker; a naive "wait for the row to disappear" cleanup step looked safe but doesn't actually prove the backend persisted the removal unless the frontend's DOM state is driven by confirmed server data rather than an optimistic update — verified that assumption by tracing the actual network calls before trusting the fix.
- **Fragile TypeScript inference for custom Playwright fixtures in plain JavaScript.** `test.extend()` is generic, and JS has no generic call syntax to pin its type parameters — reverse-inferring them from fixture callback bodies broke down as soon as one fixture depended on another across the test-scoped/worker-scoped boundary. Fixed by casting the fixtures object directly to Playwright's exported `Fixtures<T, W, ...>` type rather than relying on inference.
