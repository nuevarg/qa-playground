# Frontend Architecture Overview

This document details the architecture, routing context, layout structures, and modal mechanics implemented in the React SPA frontend of the QA Playground.

---

## 1. Core Structure and Framework

The frontend is built as a single-page application (SPA) using React, Vite, and TypeScript.

### Request & API Client
- **Axios Instance**: Encapsulated in `src/api/` services with standard interceptors.
- **Token Auth Interceptor**: Automatically scans `localStorage` for a stored JWT token and mounts it in requests under `Authorization: Token <JWT_TOKEN>` headers.
- **Service Layer**: Decoupled helpers like `api/articles.ts` and `api/profiles.ts` map remote server payloads to typed TypeScript interfaces.

---

## 2. Pop-up Modal System & Scroll Lock

To enhance visual clarity and prevent cluttered page-state changes, article creation and editing are handled using floating overlays rather than inline expanding forms.

### Scroll Lock Mechanism
Modals register a mounting lifecycle `useEffect` hook to prevent the background body content from scrolling behind the overlay.
- **On Mount**: Sets `document.body.style.overflow = "hidden"` to trap scroll interactions within the modal.
- **On Unmount**: Restores the style to `""` or `"unset"` to return scroll capability to the main page.

---

## 3. Multi-Tier Confirmation Overlays

To prevent accidental data loss (such as closing a half-filled post or immediately deleting an article), the application implements a custom reusable confirmation system via the `ConfirmationModal` component.

### Stack Hierarchy & z-index Management
- **Base Modals (z-index: 1000)**: Standard forms like `ArticleCreateModal` or `ArticleEditorModal` sit in the mid-tier layer.
- **Confirmation Modals (z-index: 2000)**: Alert dialogs (e.g., Discard Changes, Delete Confirmation) sit on the highest tier, ensuring they sit visually above all other elements and mask secondary clicks.

```
+--------------------------------------------------------+
| 3. Confirmation Dialog (Delete/Cancel) [z-index: 2000] |
+--------------------------------------------------------+
| 2. Base Editor Modals (Create/Edit Form) [z-index: 1000] |
+--------------------------------------------------------+
| 1. Sticky Feed / Page Layout [z-index: 10 / Static]   |
+--------------------------------------------------------+
```

### Intelligent Discard Check (Dirty Check)
Before displaying a "Discard Changes" warning when cancelling, the editor compares the current input values against the starting state values:
- If there are no changes, the modal closes immediately.
- If the title, body, or tags have been modified, it prompts the confirmation modal.

---

## 4. Sticky Column Headers & Layouts

To keep the page interactive when scrolling deep articles lists, header sections are set to stick underneath the top navigation bar.

### Calculations and Offsets
- **Fixed Top Navbar height**: `64px`
- **Sticky Offset**: Elements are offset by `top: 64px` or `top: 88px` (adding a standard `24px` grid spacing) to prevent them from sliding behind the blue navbar.
- **Masking Backgrounds**: Sticky headers feature solid backgrounds matching the page background (`#eef1f5`) to neatly hide article cards scrolling upward underneath.
