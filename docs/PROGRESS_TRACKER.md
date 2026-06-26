# QA Playground Progress Tracker

Last updated: 2026-06-26

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
| Backend | Authentication | Register, login, current user, and update user endpoints exist. Fully integrated with frontend login, register, settings, and base64 avatar uploads. | Done |
| Backend | Articles | Article list, feed, create, detail, update, delete, favorite, unfavorite, and draft endpoints exist. Supports edited indicators. | Done |
| Backend | Comments | Get comments, add comment, and delete comment endpoints exist for articles. | Done |
| Backend | Profiles | Get profile, follow user, and unfollow user endpoints exist. | Done |
| Backend | Followers & Following | Get followers and get following list query services and route endpoints exist. | Done |
| Backend | Tags | Popular tags endpoint exists. | Done |
| Backend | Database | Prisma schema, migrations, PostgreSQL setup, and demo data seeding are available. | Done |
| Backend | Unit tests | Service-level tests exist for auth, profiles, tags, articles, and profile utilities. | Partial |
| Frontend | App foundation | React, Vite, TypeScript, routing, Axios API client, auth token interceptor, and global styling are in place. | Done |
| Frontend | Authentication screens | Login and register screens call the backend and store JWT tokens. | Done |
| Frontend | Current user dashboard | Integrated into Profile page. Loads current user details, handles sessions, and supports logout. | Done |
| Frontend | User settings | Dedicated page at `/settings` allowing email, username, bio, password updates, and avatar uploads. | Done |
| Frontend | Article feed | Global feed page exists with article list, popular tags sidebar, tag filtering, loading/error/empty states, and pagination. | Done |
| Frontend | Article access limits | Restricts non-logged-in users to a maximum of 3 articles on the Home Feed and Profile pages, showing a login/register prompt and hiding pagination. | Done |
| Frontend | Article detail | Renders article detail, author details, publication date, tags, and comment section. | Done |
| Frontend | Article editor | Create new articles and edit existing articles with full tag list connectivity. | Done |
| Frontend | Favorites | Toggle favorite/unfavorite statuses on the feed cards and article detail banner. | Done |
| Frontend | Profiles and following | Profile page displays user details, stats panel, followers/following tabs (with interactive modals), follow toggle actions, and a Profile Composer for article drafting/editing. | Done |
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
| Documentation | Project overview | Root README, project context, agent rules (.agents/AGENTS.md), backend README, frontend README, Cypress README, and third-party notices exist. | Done |
| Documentation | Progress tracking | This tracker captures current status and next implementation phases. | Done |

## Backend Capability Summary

The backend is significantly ahead of the frontend. It already supports a RealWorld/Conduit-style product surface:

| Domain | Implemented Backend Capabilities | Frontend Usage |
|---|---|---|
| Auth | Register, login, current user, update user | Register, login, current user, logout (integrated in Profile Page) |
| Articles | List, feed, create, detail, update, delete | Fully integrated (Feed, Profile, Editor) |
| Comments | List, create, delete | Fully integrated (Feed Card comments list and input) |
| Favorites | Favorite and unfavorite articles | Fully integrated (Feed Card favorite pills) |
| Profiles | Profile detail, follow, unfollow | Fully integrated (Profile Page follow/unfollow buttons) |
| Tags | Popular tags | Fully integrated (Feed sidebar and tag chips) |

Important API shape note:

- Auth endpoints return the shared wrapper shape: `{ success, message, data }`.
- Article, profile, comment, favorite, and tag endpoints return RealWorld-style payloads such as `{ articles, articlesCount }`, `{ article }`, `{ comments }`, `{ profile }`, and `{ tags }`.

The frontend API layer should model these response families separately.

## Recommended Frontend Implementation Phases

| Phase | Scope | Description | Status |
|---|---|---|---|
| 1 | Frontend API types and services | Shared TypeScript models and API helper functions exist for articles, profiles, and tags. | Done |
| 2 | Home article feed | Global feed page exists with article cards, pagination, tags sidebar, and tag filtering. | Done |
| 3 | Authenticated feed | Add personal feed tab using `GET /articles/feed` for logged-in users. | Done |
| 4 | Article detail | Add article detail route with body, metadata, author profile link, favorite state, and comments. | Done |
| 5 | Comments | Add authenticated comment creation and author-only comment deletion. | Done |
| 6 | Favorites | Add favorite/unfavorite controls on feed cards and article detail. | Done |
| 7 | Article editor | Add create article page and edit article page with title, description, body, and tag list fields. | Done |
| 8 | Article ownership actions | Show edit/delete controls only for the article owner. | Done |
| 9 | Profile pages | Add profile route with user info, authored articles, favorited articles, and follow/unfollow button. | Done |
| 10 | User settings | Add settings page for email, username, password, bio, and image updates using `PUT /user`. | Done |
| 11 | Frontend test IDs | Expand `TEST_ID` constants as new screens are implemented. | Done |
| 12 | Frontend error/loading states | Standardize loading, empty, error, unauthorized, and forbidden UI states across pages. | Done |

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

1. Add Cypress smoke coverage for local auth, profile page, feed, article detail, comments, and article editor flows.

## Open Decisions

| Topic | Decision Needed |
|---|---|
| Frontend architecture | Decide whether to keep API calls inside page components temporarily or introduce a dedicated `src/api` service layer now. |
| State management | Decide whether local component state is enough for the next phase or whether server-state tooling should be introduced later. |
| Automation priority | Decide whether Cypress should first cover local frontend E2E, local backend API, or both in parallel. |
| Playwright | Decide whether Playwright is needed soon or should wait until Cypress coverage matures. |
| Mobile | Decide what mobile target should exist before Appium/Maestro/Detox work begins. |
