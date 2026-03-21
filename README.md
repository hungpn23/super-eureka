# Vocabify Frontend

A modern vocabulary learning application built with **Nuxt 4** and **Vue 3**, featuring a spaced repetition system for effective memorization.

---

## 🎯 Features

### 📚 Deck Management
- **Create Decks**: Build vocabulary decks with custom cards (term, definition, pronunciation, part of speech, usage/grammar, examples)
- **Edit Decks**: Modify deck content with live validation
- **Visibility Control**: Set decks as PUBLIC / PROTECTED (passcode) / PRIVATE
- **Clone Decks**: Clone shared decks to personal library
- **Restart Progress**: Reset all card streaks and review dates
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
- Answer diff highlighting for incorrect/typo written answers
- Progress tracking with spaced repetition

#### 3. Test Mode
- Quiz-style assessment
- Configurable question amount
- Multiple question types
- Results summary with correct/incorrect breakdown

### 🔐 Authentication
- **Local Authentication**: Username/password sign-up & login (with OTP email verification)
- **Google OAuth**: One-click Google sign-in (Authorization Code Flow)
- **Magic Link**: Passwordless email sign-in
- **Password Reset**: OTP-based password recovery flow
- **JWT Token Management**: Access token (30 min) + refresh token (14 days) with automatic rotation

### 👥 Social Features
- **Public Profiles**: View other users' shared decks
- **Deck Sharing**: Share decks with the community
- **Protected Decks**: Share with passcode protection
- **View & Learner Counts**: Popularity metrics
- **Real-time Notifications**: WebSocket-based notification system (Socket.IO)

### 📊 User Statistics
- Study streaks (current & longest)
- Total cards learned
- Mastery rate tracking
- Last study date

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Nuxt 4](https://nuxt.com/) (Vue 3) |
| **State Management** | [Pinia](https://pinia.vuejs.org/) v3 with persistence |
| **UI Components** | [@nuxt/ui v4](https://ui.nuxt.com/) |
| **Authentication** | [@sidebase/nuxt-auth](https://auth.sidebase.io/) (local provider) |
| **Validation** | [Valibot](https://valibot.dev/) |
| **Utilities** | [VueUse](https://vueuse.org/), [date-fns](https://date-fns.org/), [lodash](https://lodash.com/) |
| **Real-time** | [Socket.IO Client](https://socket.io/) |
| **Text Diffing** | [diff](https://github.com/kpdecker/jsdiff) |
| **Icons** | Iconify (Heroicons, Lucide, Simple Icons) |
| **Linting & Formatting** | [Biome](https://biomejs.dev/) |
| **Image Optimization** | [@nuxt/image](https://image.nuxt.com/) |
| **Package Manager** | pnpm |

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
│   │   ├── study/            # Study modes (types, utils, constants)
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
│   │   │   │       ├── index.vue       # Deck details
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
- **Direct `useFetch` calls**: API calls use Nuxt's `useFetch` composable directly at call sites — no wrapper classes
- **Server proxy**: A single catch-all route (`server/api/[...].ts`) proxies all `/api/*` requests to the backend
- **Pinia store**: Centralized deck state management with persistence and HMR support

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

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm lint` | Run Biome linter |
| `pnpm lint:fix` | Fix linting issues |
| `pnpm format` | Check code formatting |
| `pnpm format:fix` | Fix formatting issues |
| `pnpm check` | Run all checks (lint + format) |
| `pnpm check:fix` | Fix all issues |

---

## 🧠 Spaced Repetition System

Vocabify uses a spaced repetition algorithm to optimize learning:

| Field | Description |
|-------|-------------|
| `streak` | Consecutive correct answers (0-5+) |
| `reviewDate` | Scheduled next review date |
| `status` | `new` → `learning` → `known` |

**Study Priority**: Cards due for review (`reviewDate ≤ today`) appear first, followed by new cards.

**Status Transitions**:
- `new`: Card has no `reviewDate` set
- `learning`: Card has `reviewDate ≤ today` (due for review)
- `known`: Card has `reviewDate > today` (mastered, will be reviewed later)

---

## 🎨 Theming

The app supports **light** and **dark** modes with automatic theme detection. Colors are managed through the Nuxt UI theming system.

---

## 📄 License

This project is private and proprietary.
