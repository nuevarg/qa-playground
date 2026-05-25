# QA Playground Backend

Express + Prisma API used by the QA Playground project.

This backend follows the RealWorld / Conduit API style for auth, profiles,
articles, comments, favorites, and tags. It has been adapted for educational QA
automation practice.

Original references:

- RealWorld project: https://github.com/realworld-apps/realworld
- Node/Express/Prisma example app: https://github.com/gothinkster/node-express-realworld-example-app

See the root `THIRD_PARTY_NOTICES.md` for attribution details.

## Requirements

- Node.js >= 22
- npm >= 11
- PostgreSQL, or Docker Desktop for the local database

## Environment

Create a local `.env` file from `.env.example`.

```env
DATABASE_URL="postgresql://admin:admin@localhost:5432/qa_playground"
JWT_SECRET="your-secret"
```

## Install

```bash
npm install
```

## Database

Generate Prisma client:

```bash
npx prisma generate
```

Apply migrations:

```bash
npx prisma migrate deploy
```

Seed demo data:

```bash
npx prisma db seed
```

## Run

```bash
npm run start
```

The API runs on `http://localhost:3000/api` by default.
