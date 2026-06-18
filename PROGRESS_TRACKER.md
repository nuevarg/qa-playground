# QA Playground Progress Tracker

Last updated: 2026-06-18

This document tracks the current implementation state of the QA Playground repository and the recommended next work. It is intended to be a living roadmap for frontend, backend, automation, mobile, and future QA tooling.

## Status Legend

| Status | Meaning |
|---|---|
| Done | Implemented and available in the repository |
| Partial | Implemented in part, but missing important coverage or integration |
| Next | Recommended next implementation target |
| Planned | Valuable future work, not started yet |
| Not started | No meaningful implementation exists yet |

## Project Tracker

| Feature Area | Scope | Description | Status |
|---|---|---|---|
| Backend | Express API foundation | Express server, `/api` route mounting, JSON parsing, CORS, static assets, and centralized error handling are in place. | Done |
| Backend | Authentication | Register, login, current user, and update user endpoints exist. Register/login/current-user are already consumed by the frontend. | Partial |
| Backend | Articles | Article list, feed, create, detail, update, delete, favorite, and unfavorite endpoints exist. | Done |
| Backend | Comments | Get comments, add comment, and delete comment endpoints exist for articles. | Done |
| Backend | Profiles | Get profile, follow user, and unfollow user endpoints exist. | Done |
| Backend | Tags | Popular tags endpoint exists. | Done |
| Backend | Database | Prisma schema, migrations, PostgreSQL setup, and demo data seeding are available. | Done |
| Backend | Unit tests | Service-level tests exist for auth, profiles, tags, articles, and profile utilities. | Partial |
| Frontend | App foundation | React, Vite, TypeScript, routing, Axios API client, auth token interceptor, and global styling are in place. | Done |
| Frontend | Authentication screens | Login and register screens call the backend and store JWT tokens. | Done |
| Frontend | Current user dashboard | Dashboard loads the current user from `GET /user`, handles invalid sessions, and supports logout. | Done |
| Frontend | User settings | Backend supports `PUT /user`, but no frontend settings/profile-edit screen exists yet. | Next |
| Frontend | Article feed | Backend supports global articles, feed, tags, filtering, and pagination, but no frontend article feed exists yet. | Next |
| Frontend | Article detail | Backend supports article detail and comments, but no article detail page exists yet. | Planned |
| Frontend | Article editor | Backend supports create/update/delete article, but no article editor UI exists yet. | Planned |
| Frontend | Favorites | Backend supports favorite/unfavorite article, but no frontend controls exist yet. | Planned |
| Frontend | Profiles and following | Backend supports profiles and follow/unfollow, but no frontend profile pages exist yet. | Planned |
| Cypress | Existing external UI practice | Cypress tests exist for Sauce Demo UI flows using page objects and custom commands. | Done |
| Cypress | Existing API practice | Cypress API tests exist for Restful Booker and RealWorld login flows. | Partial |
| Cypress | Local frontend coverage | Cypress is not yet focused on the local QA Playground frontend auth/dashboard flows. | Next |
| Cypress | Local backend API coverage | Cypress can be expanded to cover local backend auth, articles, comments, profiles, tags, and negative API cases. | Planned |
| Reporting | Allure | Allure dependencies and scripts exist in the Cypress project. | Partial |
| Reporting | Mochawesome | Cypress README references Mochawesome reporting patterns. | Partial |
| Docker | Backend/database support | Backend has Docker and Docker Compose files; root scripts include Docker Compose helpers. | Partial |
| CI/CD | Root CI script | Root `ci` script currently delegates to Cypress UI and API test scripts. | Partial |
| CI/CD | GitHub Actions | No current repository-level workflow was confirmed during this pass. | Planned |
| Playwright | Web automation | No Playwright project or test suite is currently implemented. | Not started |
| Mobile | Mobile application | No mobile app exists in the repository yet. | Not started |
| Appium | Mobile automation | No Appium framework exists yet. | Not started |
| Maestro/Detox | Mobile automation alternatives | No Maestro or Detox setup exists yet. | Not started |
| Game testing | Game test experiments | Long-term project context mentions game testing, but no implementation exists yet. | Not started |
| Documentation | Project overview | Root README, project context, backend README, frontend README, Cypress README, and third-party notices exist. | Done |
| Documentation | Progress tracking | This tracker captures current status and next implementation phases. | Done |

## Backend Capability Summary

The backend is significantly ahead of the frontend. It already supports a RealWorld/Conduit-style product surface:

| Domain | Implemented Backend Capabilities | Frontend Usage |
|---|---|---|
| Auth | Register, login, current user, update user | Register, login, current user only |
| Articles | List, feed, create, detail, update, delete | Not used yet |
| Comments | List, create, delete | Not used yet |
| Favorites | Favorite and unfavorite articles | Not used yet |
| Profiles | Profile detail, follow, unfollow | Not used yet |
| Tags | Popular tags | Not used yet |

Important API shape note:

- Auth endpoints return the shared wrapper shape: `{ success, message, data }`.
- Article, profile, comment, favorite, and tag endpoints return RealWorld-style payloads such as `{ articles, articlesCount }`, `{ article }`, `{ comments }`, `{ profile }`, and `{ tags }`.

The frontend API layer should model these response families separately.

## Recommended Frontend Implementation Phases

| Phase | Scope | Description | Status |
|---|---|---|---|
| 1 | Frontend API types and services | Create shared TypeScript models and API helper functions for users, articles, profiles, comments, and tags. | Next |
| 2 | Home article feed | Build global feed page with article cards, pagination, tags sidebar, and tag/author/favorited filters where useful. | Next |
| 3 | Authenticated feed | Add personal feed tab using `GET /articles/feed` for logged-in users. | Planned |
| 4 | Article detail | Add article detail route with body, metadata, author profile link, favorite state, and comments. | Planned |
| 5 | Comments | Add authenticated comment creation and author-only comment deletion. | Planned |
| 6 | Favorites | Add favorite/unfavorite controls on feed cards and article detail. | Planned |
| 7 | Article editor | Add create article page and edit article page with title, description, body, and tag list fields. | Planned |
| 8 | Article ownership actions | Show edit/delete controls only for the article owner. | Planned |
| 9 | Profile pages | Add profile route with user info, authored articles, favorited articles, and follow/unfollow button. | Planned |
| 10 | User settings | Add settings page for email, username, password, bio, and image updates using `PUT /user`. | Planned |
| 11 | Frontend test IDs | Expand `TEST_ID` constants as new screens are implemented. | Planned |
| 12 | Frontend error/loading states | Standardize loading, empty, error, unauthorized, and forbidden UI states across pages. | Planned |

## Recommended Automation Phases

| Phase | Tool | Scope | Description | Status |
|---|---|---|---|---|
| 1 | Cypress | Local auth smoke tests | Cover register, login, current user dashboard, invalid login, and logout against the local app. | Next |
| 2 | Cypress | Backend API smoke tests | Cover local backend auth, current user, articles, tags, comments, favorites, and profiles. | Planned |
| 3 | Cypress | Frontend article flows | Cover feed browsing, article detail, create article, edit article, delete article, comments, and favorites. | Planned |
| 4 | Cypress | Test data strategy | Add deterministic local test data setup and cleanup for reliable E2E runs. | Planned |
| 5 | Cypress | Reporting | Standardize Allure or Mochawesome output and document how reports are generated locally and in CI. | Planned |
| 6 | Playwright | Evaluation spike | Decide whether Playwright should complement Cypress for cross-browser, tracing, visual checks, or parallel E2E. | Planned |
| 7 | Playwright | Initial framework | Add config, fixtures, auth setup, trace/video/screenshot policy, and first smoke specs if adopted. | Not started |
| 8 | Appium | Evaluation spike | Define target mobile app strategy before adding Appium. | Planned |
| 9 | Mobile automation | Framework setup | Add Appium, Maestro, or Detox only after a mobile app target exists. | Not started |

## Suggested Immediate Next Steps

1. Implement frontend API models/services for RealWorld-style responses.
2. Build the frontend home article feed using `GET /articles` and `GET /tags`.
3. Add Cypress smoke coverage for the current local auth/dashboard flow.
4. Add article detail and comments after the feed is stable.
5. Add article editor and profile/follow flows once the core reading experience works.

## Open Decisions

| Topic | Decision Needed |
|---|---|
| Frontend architecture | Decide whether to keep API calls inside page components temporarily or introduce a dedicated `src/api` service layer now. |
| State management | Decide whether local component state is enough for the next phase or whether server-state tooling should be introduced later. |
| Automation priority | Decide whether Cypress should first cover local frontend E2E, local backend API, or both in parallel. |
| Playwright | Decide whether Playwright is needed soon or should wait until Cypress coverage matures. |
| Mobile | Decide what mobile target should exist before Appium/Maestro/Detox work begins. |

