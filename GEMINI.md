# Project Context: Better Quizlet

## Overview

**Better Quizlet** is a SaaS-style flashcard and study application built on **Nuxt 4**. It leverages the **Nuxt SaaS Template** foundation, integrating a marketing frontend (Landing, Pricing, Docs) with a robust application backend for creating, managing, and studying flashcard decks.

**Key Technologies:**

- **Framework:** Nuxt 4 (`^4.2.1`)
- **UI Library:** Nuxt UI (`@nuxt/ui`), Tailwind CSS
- **Content Management:** Nuxt Content v3 (`@nuxt/content`) - Used for Marketing/Docs pages.
- **Authentication:** Sidebase Nuxt Auth (`@sidebase/nuxt-auth`) - Local provider strategy.
- **Database:** `better-sqlite3` (Local SQLite database).
- **State Management:** Vue Reactivity (Refs/Reactive) + Nuxt `useState`.
- **Validation:** `valibot`.
- **Package Manager:** pnpm

## Architecture & Structure

### Directory Map

- **`app/`**: The core Vue application.
  - **`components/`**: Reusable UI components.
    - `Flashcard.vue`: Core study component handling card flipping, answering, and state (known/skipped).
    - `Skeleton/`: Loading state components.
  - **`pages/`**: Application routing.
    - `[username]/[slug]/`: Nested routes for deck viewing and studying (`learn.vue`, `flashcards.vue`).
    - `create-deck.vue`: Deck creation interface.
    - `gemini.vue`: Experimental/Test quiz component.
  - **`utils/`**: Logic helpers for card state (`calcCardState.ts`), shuffling, and text processing.
- **`content/`**: Data-driven content for marketing pages (YAML/Markdown).
- **`server/`**: Nitro server-side logic.
  - **`api/`**: API endpoints for user data, deck management, and study progress.
- **`shared/types/`**: Shared TypeScript interfaces (`card.ts`, `deck.ts`, `branded.ts`).
- **`nuxt.config.ts`**: Main configuration (Auth provider, Modules).

### Key Features

1.  **Study Mode:**
    - Implemented in `app/components/Flashcard.vue`.
    - Features spaced repetition logic (saving answers via `/api/study/save-answer`).
    - Text-to-Speech integration.
    - Keyboard shortcuts (Space to flip, Arrows to answer).

2.  **Authentication:**
    - Local email/password strategy.
    - Session management via `useAuth` (Sidebase).
    - Endpoints: `/login`, `/register`, `/api/users/me`.

3.  **Data Models:**
    - **Decks:** Collections of cards.
    - **Cards:** Individual study items (Term/Definition) with status (`new`, `learning`, `known`).

## Building and Running

**Prerequisites:** Node.js, pnpm.

| Action         | Command          | Description                              |
| :------------- | :--------------- | :--------------------------------------- |
| **Install**    | `pnpm install`   | Install dependencies.                    |
| **Dev Server** | `pnpm dev`       | Start server at `http://localhost:3000`. |
| **Build**      | `pnpm build`     | Production build.                        |
| **Lint**       | `pnpm lint`      | Run ESLint.                              |
| **Typecheck**  | `pnpm typecheck` | Run Vue/TS type checking.                |

## Development Conventions

- **Typing:** Strict TypeScript usage. Always use types from `shared/types/` when dealing with business entities (Decks, Cards).
- **UI Components:** Prefer **Nuxt UI** components (`<UButton>`, `<UCard>`, `<UIcon>`) over raw HTML/Tailwind where possible.
- **Icons:** Lucide icons via Nuxt UI (e.g., `i-lucide-home`).
- **Fetching:** Use `useFetch` or `$fetch` for API interactions.
- **Styling:** Utility-first with Tailwind CSS. Avoid global CSS files unless necessary.
- **State:** Local component state for transient UI (like flashcard flipping), `useState` or API for persistent data.
