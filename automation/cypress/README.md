# Cypress Practice

[![Cypress Tests](https://github.com/nuevarg/cypress-practice/actions/workflows/cypress.yml/badge.svg)](https://github.com/nuevarg/cypress-practice/actions/workflows/cypress.yml)

A Cypress end-to-end automation practice project for testing [Sauce Demo](https://www.saucedemo.com/).

This repo is built as a QA automation portfolio project using Cypress, Docker, Mochawesome reporting, Page Object-style selectors, custom Cypress commands, environment-based credentials, and Faker test data.

> Main branch: `master`

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Cypress | UI end-to-end testing |
| Docker / Docker Compose | Containerized test execution |
| cypress-mochawesome-reporter | HTML/JSON reports |
| @faker-js/faker | Random test data generation |

---

## Test Target

```text
https://www.saucedemo.com/
```

Current coverage includes:

- Login page validation
- Successful login
- Logout flow
- Negative login validation
- Purchase/checkout flow

---

## Project Structure

```text
cypress-practice/
├── cypress/
│   ├── e2e/          # Test specs
│   ├── page/         # Page selectors
│   └── support/      # Custom commands and support setup
├── cypress.env.example.json
├── cypress.config.js
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

---

## Setup

Clone the repo:

```bash
git clone https://github.com/nuevarg/cypress-practice.git
cd cypress-practice
```

Install dependencies:

```bash
npm install
```

Create local Cypress env file:

```bash
cp cypress.env.example.json cypress.env.json
```

Windows PowerShell:

```powershell
Copy-Item cypress.env.example.json cypress.env.json
```

Example `cypress.env.json`:

```json
{
  "username": "standard_user",
  "password": "secret_sauce"
}
```

`cypress.env.json` is ignored by Git and should not be committed.

---

## Available Commands

| Command | Description |
|---|---|
| `npm run test` | Open Cypress UI |
| `npm run test-run` | Run Cypress headless |
| `npm run test-all` | Run all specs in Electron |
| `npm run docker:build` | Build Docker image |
| `npm run docker:up` | Run Cypress in Docker |
| `npm run setup` | Install dependencies and build Docker image |

---

## Running Tests

Open Cypress UI:

```bash
npm run test
```

Run locally in headless mode:

```bash
npm run test-run
```

Run with Docker:

```bash
npm run docker:build
npm run docker:up
```

---

## Reports

Mochawesome reports are generated in:

```text
cypress/reports/
```

Reports use timestamped filenames, for example:

```text
automation-report-2026-05-12T09-56-28-189Z.html
```

Generated reports, screenshots, videos, downloads, and local env files are ignored by Git.

---

## Notes

- `baseUrl` is configured in `cypress.config.js`, so tests can use `cy.visit("/")`.
- Reusable flows such as `cy.login()` and `cy.logout()` live in `cypress/support/commands.js`.
- Page selectors are separated under `cypress/page/`.
- Faker is available for generating random checkout/test data.
- This repo currently uses `master` as the main branch.

---

## Planned Improvements

- Add GitHub Actions CI
- Upload Mochawesome report artifacts from CI
- Add more negative checkout/login cases
- Add ESLint + Prettier
- Add Allure Report later for richer reporting
