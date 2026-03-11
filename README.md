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
- **JWT Token Management**: Access token (30 min) + refresh token (14 days)
- Email verification support

### 👥 Social Features
- **Public Profiles**: View other users' shared decks
- **Deck Sharing**: Share decks with the community
- **View & Learner Counts**: Popularity metrics

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Nuxt 4](https://nuxt.com/) (Vue 3) |
| **State Management** | [Pinia](https://pinia.vuejs.org/) with persistence |
| **UI Components** | [@nuxt/ui](https://ui.nuxt.com/) |
| **Authentication** | [@sidebase/nuxt-auth](https://auth.sidebase.io/) |
| **Validation** | [Valibot](https://valibot.dev/) |
| **Real-time** | Socket.IO Client |
| **Utilities** | VueUse, Lodash, date-fns |
| **Icons** | Iconify (Heroicons, Lucide) |
| **Linting** | Biome |
| **Package Manager** | pnpm |

---

## 📁 Project Structure

```
vocabify_fe/
├── app/
│   ├── assets/           # Static assets (CSS)
│   ├── components/       # Reusable Vue components
│   │   ├── AppHeader.vue
│   │   ├── AppFooter.vue
│   │   ├── AppLogo.vue
│   │   ├── KeyboardShortcuts.vue
│   │   └── Skeleton/     # Loading skeleton components
│   ├── composables/      # Vue composables
│   │   ├── useDeckSearch.ts
│   │   └── useFlashcardStudy.ts
│   ├── layouts/          # Page layouts
│   │   ├── auth.vue      # Authentication pages layout
│   │   ├── callback.vue  # OAuth callback layout
│   │   └── default.vue   # Main app layout
│   ├── pages/            # File-based routing
│   │   ├── (auth)/       # Login, Signup pages
│   │   ├── (core)/       # Main app pages
│   │   │   ├── create-deck/
│   │   │   ├── library/
│   │   │   │   └── [slug]/
│   │   │   │       ├── index.vue     # Deck details
│   │   │   │       ├── flashcards.vue
│   │   │   │       ├── learn.vue
│   │   │   │       └── test.vue
│   │   │   └── shared/   # Public shared decks
│   │   ├── [username]/   # Public profile pages
│   │   ├── profile.vue   # User profile
│   │   └── index.vue     # Landing page
│   ├── plugins/          # Nuxt plugins
│   ├── stores/           # Pinia stores
│   │   └── deck.ts       # Deck state management
│   └── utils/            # Utility functions
│       ├── constants.ts
│       ├── enums.ts
│       ├── generateQuestions.ts
│       └── quotes.ts
├── server/
│   └── api/              # Server API routes (proxy)
├── shared/
│   └── types/            # TypeScript types
│       ├── auth.ts       # Login/sign-up schemas
│       ├── card.ts       # Card, FlashcardSession, LearnSession
│       ├── deck.ts       # Deck, DeckStats
│       ├── user.ts       # User types
│       ├── pagination.ts
│       └── error.ts
├── nuxt.config.ts        # Nuxt configuration
├── biome.json            # Linting configuration
└── package.json
```

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
NUXT_API_URL=http://localhost:3000/api
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

---

## 🎨 Theming

The app supports **light** and **dark** modes with automatic theme detection. Colors are managed through the Nuxt UI theming system.

---

## 📄 License

This project is private and proprietary.
