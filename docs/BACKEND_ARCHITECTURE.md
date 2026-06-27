# Backend Architecture Overview

This document details the architecture, request flow, security design patterns, and database connectivity implemented in the Express backend of the QA Playground.

---

## 1. Architectural Pattern

The backend utilizes a clean MVC-adjacent layered architecture for Express:

```
Request -> Router (routes.ts) -> Validators/Middlewares -> Controller -> Service Layer -> Prisma Database Client
```

- **Router**: Registers endpoints and attaches validation/authentication middlewares.
- **Validators/Middlewares**: Inspects incoming bodies/headers using custom validation functions and extracts JWT tokens to authenticate users.
- **Controllers**: Express route handlers that extract parameters, call appropriate services, catch errors, and formulate HTTP responses.
- **Service Layer**: Pure business logic that manages DB operations (Prisma), user permissions, and external helper utilities.
- **Database Client**: Instantiated Prisma Client connected to the database.

---

## 2. Directory Structure

Inside `apps/backend/src/app/routes/`, the application is structured by route domains:

- **auth/**: Registration, login, JWT token generation, and current user profile management.
- **article/**: Article publication, drafts, listing, tag association, deletions, and article comments.
- **profile/**: Profiles viewing, follower lists, following lists, and follow/unfollow services.
- **tag/**: Static or database-driven listing of popular tags.

Each folder typically contains:
- `*.controller.ts`: Route orchestrator managing HTTP status codes and responses.
- `*.service.ts`: Business logic and database mutations.
- `*.ts`: Express router setup registering paths and mapping controller handlers.
- `*.validator.ts`: Request payload rules checking schema inputs.

---

## 3. Authentication & Middleware Flow

Authentication is built around JSON Web Tokens (JWT) and request context augmentation.

### JWT Middleware Flow
1. The client transmits a request containing `Authorization: Token <JWT_TOKEN>` in the headers.
2. The authentication router decodes and verifies the token using the private signing key.
3. Upon successful decoding, the user's details (`id`, `username`, `email`) are bound to the Express request context object (augmented as `req.user`).
4. Subsequent controllers access `req.user` directly to identify the session actor.

### Hashing & Security
- Passwords are encrypted before database insertion using a secure hashing algorithm inside `auth.service.ts`.
- Database configurations and secrets are fetched from environment variables.

---

## 4. Response Schemes

The API uses two distinct formatting strategies for response payloads:

### Standard Response Shape
Auth and User operations return a structured layout:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Conduit Payload Structure
Article, Tag, Profile, and Comment operations follow RealWorld Conduit specifications directly:
```json
{
  "articles": [...],
  "articlesCount": 15
}
```
This dual design accommodates legacy client-side integrations while ensuring strict structure for core management endpoints.
