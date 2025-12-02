# TODO List for Better Quizlet

## 1. Core Features & Functionality
- [ ] **Landing Page (`app/pages/index.vue`):** Currently just displays "Hero Page". Needs a proper marketing landing page design.
- [ ] **Social Authentication:** Google and GitHub login buttons in `login.vue` and `signup.vue` are placeholders (showing toast messages). Implement actual OAuth providers via `sidebase/nuxt-auth`.
- [ ] **User Profile Editing:** The "Edit" button in `app/pages/profile.vue` is non-functional. Needs a settings/edit profile page.
- [ ] **Public Profile Page:** `app/pages/[username]/index.vue` only displays the username. Needs to show the user's public decks and stats.
- [ ] **Forgot Password:** "Forgot password?" link in `login.vue` goes to `/` (homepage). Needs a dedicated recovery page.
- [ ] **Terms of Service:** Links in auth pages go to `/`. Needs a static content page.
- [ ] **Deck Statistics (Backend):** `community.vue` displays hardcoded values for "Views" (364) and "Cloned times" (318). Connect to real backend data.
- [ ] **"Coming Soon" Study Mode:** In `app/pages/[username]/[slug]/index.vue`, the 4th study option is "Coming soon". Determine the next feature (e.g., Match game) and implement it.

## 2. Refactoring & Code Quality
- [ ] **Extract `DeckListItem` Component:** Refactor `app/pages/home.vue` and `app/pages/community.vue` to use a shared `DeckListItem.vue` component for displaying deck cards.
- [ ] **Extract `DeckFilterToolbar` Component:** Refactor `app/pages/home.vue` and `app/pages/community.vue` to use a shared `DeckFilterToolbar.vue` for the search/filter UI.
- [ ] **Refactor `DeckCardInput`:** Extract the card input row logic in `create-deck.vue` and `[username]/[slug]/index.vue` (edit mode) into a reusable component.
- [ ] **Standardize Study Page Layout:** Create a `StudyPageLayout.vue` to unify the header/back-button structure across Flashcards, Learn, and Test pages.

## 3. Navigation & Routing
- [ ] **Forum Page:** "Forum" link in `AppHeader.vue` goes to `#`.
- [ ] **About Me Page:** "About me" link in `AppHeader.vue` goes to `#`.
- [ ] **Settings Page:** "Settings" in the user dropdown (`AppHeader.vue`) goes to `/settings`, which does not exist.

## 4. UI/UX Polish
- [ ] **Empty States:** `app/pages/home.vue` has a basic empty state. Improve visual feedback when a user has no decks.
- [ ] **Loading Skeletons:** Ensure all major pages have skeleton loaders (currently seemingly well-covered, but verify `profile.vue` and `index.vue`).
