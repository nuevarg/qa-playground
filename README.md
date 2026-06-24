# QA Playground

A full-stack QA automation playground project built to practice real-world testing workflows.

## Project Purpose

This repository was created to practice and demonstrate real-world QA engineering workflows across frontend, backend, and automation testing environments.

The project focuses on:

- UI testing
- API testing
- test reporting
- realistic application flows
- maintainable test architecture

## Tech Stack

### Frontend

- React
- Vite
- TypeScript

### Backend

- Express
- Prisma
- NX

### Automation

- Cypress
- Allure Report

## Repository Structure

```text
qa-playground/
├── apps/
│   ├── backend/
│   └── frontend/
│
├── automation/
│   └── cypress/
│
├── .env.example
├── package.json
└── README.md
```

---

## Requirements

- Node.js >= 22
- npm >= 11
- Docker Desktop (optional)

## Installation

```bash
npm run install:all
```

## Run Application

Start frontend and backend together:

```bash
npm run dev
```

Stop frontend and backend dev servers (Windows / PowerShell helper):

```bash
npm run stop
```

---

## Run Automation Tests

Open Cypress:

```bash
npm run test:open
```

Run UI tests:

```bash
npm run test:ui
```

Run API tests:

```bash
npm run test:api
```

Generate Allure report:

```bash
npm run allure
```

## Acknowledgements

This project is built for educational and portfolio purposes.

The backend API domain, route shape, and Conduit-style article/profile/auth
workflow are adapted from the open-source RealWorld example application
ecosystem:

- RealWorld project: https://github.com/realworld-apps/realworld
- Node/Express/Prisma example app: https://github.com/gothinkster/node-express-realworld-example-app
- RealWorld API specification: https://github.com/realworld-apps/realworld

Some automation patterns, ideas, and testing approaches are inspired by:

- Cypress documentation
- Open-source QA automation repositories
- QA practice playground websites
- Community examples

Special thanks to the creators and maintainers of those resources.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for attribution and
third-party licensing notes.

## Disclaimer

This repository is intended for educational, practice, and portfolio purposes only.

All trademarks, product names, and website names belong to their respective owners.

This project is not affiliated with or endorsed by RealWorld, Thinkster,
Gothinkster, Cypress, or any referenced company, project, or platform.
