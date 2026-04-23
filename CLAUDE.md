# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm**.

- `pnpm dev` — start Nuxt dev server
- `pnpm build` — production build
- `pnpm preview` — preview production build
- `pnpm typecheck` — Nuxt + TypeScript checks (via vue-tsc)
- `pnpm lint` / `pnpm lint:fix` — Biome lint
- `pnpm format` / `pnpm format:fix` — Biome format
- `pnpm check` / `pnpm check:fix` — Biome combined lint + format

Before opening a PR, at minimum run `pnpm typecheck` and `pnpm check`. There is no configured test runner.

## Required env vars

`.env` must define: `NUXT_API_URL`, `NUXT_PUBLIC_APP_URL`, `NUXT_PUBLIC_GOOGLE_CLIENT_ID`, `NUXT_PUBLIC_GOOGLE_REDIRECT_URI`.

## Architecture

**Frontend for Vocabify** — a vocabulary-learning app using spaced repetition. Backend is a separate NestJS service; this repo only contains the Nuxt 4 / Vue 3 frontend.

### Feature-based modules

Business logic lives under `app/features/<domain>/` (`auth`, `card`, `create-deck`, `deck`, `study`, `user`). Each feature is self-contained with its own `types`, `composables`, `constants`, and `utils`, exposed via barrel `index.ts` files. **Prefer adding new logic inside the relevant feature folder over growing generic shared directories.**

Cross-feature shared code lives in `app/shared/` (types, enums, utils) and `app/valibot/schemas.ts` (validation).

### API layer

- No wrapper/service classes — call Nuxt's `useFetch` **directly at call sites**, close to the feature that owns the call.
- All `/api/*` requests are funneled through a single catch-all server route `server/api/[...].ts`, which proxies to `runtimeConfig.public.apiUrl` (the NestJS backend) via `h3`'s `proxyRequest`.

### Auth

Uses `@sidebase/nuxt-auth` with the **local** provider (configured in `nuxt.config.ts`):
- Sign-up endpoint overridden to `/register`; login page at `/login`.
- `signInResponseTokenPointer: /accessToken`; access token TTL 30 min, refresh token TTL 14 days, refresh enabled with `refreshOnlyToken: false`.
- `globalAppMiddleware: true` — routes are protected by default.
- Session `dataType` includes `id`, `username`, `email`, `emailVerified`, `avatar` (nullable object with `url`/`fileId`/`folder`), `role` (number), timestamps.
- Additional flows on top of this: Google OAuth (Authorization Code Flow), Magic Link, OTP-based email verification and password reset.

### State

Pinia v3 with `pinia-plugin-persistedstate`. Main store is `app/stores/deck.ts`. Persistence and HMR supported.

### Routing

File-based under `app/pages/`:
- `(auth)/` group — login, sign-up, magic link, `/redirect` (Google OAuth callback)
- `(core)/` group — main app; key dynamic routes:
  - `library/[slug]/{index,flashcards,learn,test}.vue` — deck details + three study modes
  - `shared/` — community / public decks
- `[username].vue` — public user profiles

### Spaced repetition model

Each card has `streak` (consecutive correct answers), `reviewDate` (next review), and derived `status`:
- `new` — no `reviewDate`
- `learning` — `reviewDate ≤ today` (due)
- `known` — `reviewDate > today`

Study priority: due cards first, then new cards.

### Real-time

Socket.IO client is registered via a Nuxt plugin in `app/plugins/` for notifications (e.g. deck clone events).

## Conventions

Enforced by Biome (`biome.json`):
- **Tabs** for indentation, **double quotes** in JS/TS
- Let Biome handle import organization

Naming:
- Vue SFCs — PascalCase (`VisibilityModal.vue`)
- Composables — `useXxx.ts`
- Stores — concise domain names (`deck.ts`)
- Feature folders — domain-based

Commits follow Conventional Commits (`feat:`, `refactor:`, `fix:`, ...), imperative, scoped to one change.

## Agent guidance

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
