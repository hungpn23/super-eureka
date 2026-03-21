# Vocabify Frontend

A modern vocabulary learning application built with **Nuxt 4** and **Vue 3**, featuring a spaced repetition system for effective memorization.

---

## 🎯 Features

### 📚 Deck Management

- **Create Decks**: Build vocabulary decks with custom cards (term, definition, pronunciation, part of speech, examples)
- **Edit Decks**: Modify deck content with live validation
- **Visibility Control**: Set decks as PUBLIC/PROTECTED/PRIVATE
- **Clone Decks**: Clone shared decks to personal library
- **Statistics**: Track progress with deck stats (known, learning, new cards)

### 🎴 Three Study Modes

#### 1. Flashcards

- Classic flip-card review
- **Know / Don't Know** tracking
- Auto-save progress with debounced API calls
- Retry queue for missed cards
- Shuffle functionality

#### 2. Learn Mode

- **Multiple choice** and **written answer** questions
- Bi-directional practice (term → definition, definition → term)
- Hint system with streak penalty
- Progress tracking with spaced repetition

#### 3. Test Mode

- Quiz-style assessment
- Configurable question amount
- Multiple question types
- Results summary with correct/incorrect breakdown

### 🔐 Authentication

- **Local Authentication**: Username/password signup & login
- **Google OAuth**: One-click Google sign-in
- **Magic Link**: Passwordless email sign-in
- **JWT Token Management**: Access token (30 min) + refresh token (14 days)
- Email verification with OTP

### 👥 Social Features

- **Public Profiles**: View other users' shared decks
- **Deck Sharing**: Share decks with the community
- **View & Learner Counts**: Popularity metrics

---

## 🛠️ Tech Stack

| Category             | Technology                                                        |
| -------------------- | ----------------------------------------------------------------- |
| **Framework**        | [Nuxt 4](https://nuxt.com/) (Vue 3)                               |
| **State Management** | [Pinia](https://pinia.vuejs.org/) with persistence                |
| **UI Components**    | [@nuxt/ui v4](https://ui.nuxt.com/)                               |
| **Authentication**   | [@sidebase/nuxt-auth](https://auth.sidebase.io/) (local provider) |
| **Validation**       | [Valibot](https://valibot.dev/)                                   |
| **Utilities**        | [VueUse](https://vueuse.org/), [date-fns](https://date-fns.org/)  |
| **Icons**            | Iconify (Heroicons, Lucide)                                       |
| **Linting**          | [Biome](https://biomejs.dev/)                                     |
| **Package Manager**  | pnpm                                                              |

---

## 📁 Project Structure

```
vocabify_fe/
├── app/
│   ├── assets/               # Global CSS
│   ├── components/           # Shared Vue components
│   │   ├── AppHeader.vue
│   │   ├── AppFooter.vue
│   │   ├── AppEmpty.vue
│   │   ├── CardStatusBadge.vue
│   │   ├── KeyboardShortcuts.vue
│   │   └── StudyAnswerDiff.vue
│   ├── features/             # Feature-based modules
│   │   ├── auth/             # Authentication (types, composables, utils)
│   │   ├── card/             # Card types & utilities
│   │   ├── create-deck/      # Deck creation logic
│   │   ├── deck/             # Deck management (composables, types, utils)
│   │   ├── study/            # Study modes (flashcard, learn, test)
│   │   └── user/             # User types & constants
│   ├── layouts/              # Page layouts
│   │   ├── auth.vue          # Authentication pages layout
│   │   └── default.vue       # Main app layout
│   ├── pages/                # File-based routing
│   │   ├── (auth)/           # Login, Sign-up, Magic Link, Redirect
│   │   ├── (core)/           # Main app pages
│   │   │   ├── create-deck.vue
│   │   │   ├── library/
│   │   │   │   └── [slug]/
│   │   │   │       ├── index.vue       # Deck details + flashcard
│   │   │   │       ├── flashcards.vue
│   │   │   │       ├── learn.vue
│   │   │   │       └── test.vue
│   │   │   └── shared/       # Public shared decks
│   │   ├── [username]/       # Public user profiles
│   │   ├── profile.vue       # User profile
│   │   └── index.vue         # Landing page
│   ├── plugins/              # Nuxt plugins (Socket.IO)
│   ├── shared/               # Shared types, constants, enums, utils
│   ├── stores/               # Pinia stores
│   │   └── deck.ts           # Deck state management
│   └── valibot/              # Validation schemas
│       └── schemas.ts
├── server/
│   └── api/
│       └── [...].ts          # Catch-all API proxy to backend
├── nuxt.config.ts
├── biome.json
├── tsconfig.json
└── package.json
```

### Architecture Highlights

- **Feature-based modules**: Each feature (`auth`, `deck`, `study`, etc.) is self-contained with its own types, composables, constants, and utilities, exported through barrel `index.ts` files
- **Server proxy**: A single catch-all route (`server/api/[...].ts`) proxies all `/api/*` requests to the backend
- **Pinia store**: Centralized deck state management with HMR support

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.0.0
- **pnpm** (recommended)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vocabify_fe

# Install dependencies
pnpm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
NUXT_API_URL=http://localhost:3001
NUXT_PUBLIC_APP_URL=http://localhost:3000
NUXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NUXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/redirect
```

### Development

```bash
# Start development server
pnpm dev
```

### Production

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

---

## 📜 Available Scripts

| Script            | Description                    |
| ----------------- | ------------------------------ |
| `pnpm dev`        | Start development server       |
| `pnpm build`      | Build for production           |
| `pnpm preview`    | Preview production build       |
| `pnpm typecheck`  | Run TypeScript type checking   |
| `pnpm lint`       | Run Biome linter               |
| `pnpm lint:fix`   | Fix linting issues             |
| `pnpm format`     | Check code formatting          |
| `pnpm format:fix` | Fix formatting issues          |
| `pnpm check`      | Run all checks (lint + format) |
| `pnpm check:fix`  | Fix all issues                 |

---

## 🧠 Spaced Repetition System

Vocabify uses a spaced repetition algorithm to optimize learning:

| Field        | Description                        |
| ------------ | ---------------------------------- |
| `streak`     | Consecutive correct answers (0-5+) |
| `reviewDate` | Scheduled next review date         |
| `status`     | `new` → `learning` → `known`       |

**Study Priority**: Cards due for review (`reviewDate ≤ today`) appear first, followed by new cards.

---

## 🎨 Theming

The app supports **light** and **dark** modes with automatic theme detection. Colors are managed through the Nuxt UI theming system.

---

## 📄 License

This project is private and proprietary.
