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
