# Repository Guidelines

## Project Structure & Module Organization

This repository is a Nuxt 4 frontend. Main application code lives in `app/`, with file-based routes in `app/pages`, reusable UI in `app/components`, feature modules in `app/features`, shared utilities and enums in `app/shared`, Pinia stores in `app/stores`, and validation schemas in `app/valibot`. Static styling assets are under `app/assets`. Backend requests are funneled through the server proxy in `server/api/[...].ts`.

Prefer adding new business logic inside the relevant feature folder, for example `app/features/deck` or `app/features/study`, instead of growing generic shared directories.

## Build, Test, and Development Commands

- `pnpm dev`: start the Nuxt development server.
- `pnpm build`: create the production build.
- `pnpm preview`: preview the production build locally.
- `pnpm typecheck`: run Nuxt and TypeScript checks.
- `pnpm lint`: run Biome lint rules.
- `pnpm format`: check formatting with Biome.
- `pnpm check`: run Biome’s combined checks.
- `pnpm check:fix`: apply Biome fixes and formatting writes.

Use `pnpm install` to install dependencies. Before opening a PR, at minimum run `pnpm typecheck` and `pnpm check`.

## Coding Style & Naming Conventions

Formatting and linting are enforced with Biome (`biome.json`). Use tabs for indentation, double quotes in JavaScript/TypeScript, and let Biome handle import organization. Vue single-file components use PascalCase filenames such as `VisibilityModal.vue`. Composables follow `useXxx.ts`, stores use concise domain names such as `deck.ts`, and feature folders stay domain-based.

Keep API calls close to the feature that owns them; this codebase favors direct `useFetch` usage over wrapper layers.

## Testing Guidelines

There is currently no dedicated automated test runner configured in `package.json`. Treat `pnpm typecheck` and `pnpm check` as required validation for every change. If you add tests later, place them near the feature they cover and follow the same domain structure.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commit style, for example `feat: ...` and `refactor: ...`. Keep commit messages imperative and scoped to one change. PRs should include a short summary, linked issue when applicable, validation steps, and screenshots or recordings for UI changes.

## Agent-Specific Instructions

Keep responses and changes focused on the request. Do not add extra code or unrelated refactors unless the requester explicitly agrees first.
