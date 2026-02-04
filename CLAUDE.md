# CLAUDE.md - AI Assistant Guidelines for StudySimple App

This file provides comprehensive guidance for AI assistants working with the StudySimple application codebase.

## Project Overview

**StudySimple** is an AI-powered study companion application (mobile + web) designed to help students learn more effectively. Inspired by apps like Astra AI, it transforms study content into active learning tools.

### Core Value Proposition

- Transform passive study materials into interactive learning tools
- Provide an always-available AI tutor for students
- Implement spaced repetition for long-term retention
- Make studying more efficient and engaging

### Key Features

1. **Content Import** - Upload images of notes/books with OCR text extraction
2. **AI Study Tools** - Auto-generate flashcards, summaries, and quizzes
3. **AI Chat Tutor** - Interactive Q&A on uploaded content or general topics
4. **Flashcard System** - Spaced repetition for effective memorization
5. **Progress Tracking** - Monitor learning progress and mastery

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────┬───────────────────────────────────────────┤
│   Mobile App        │              Web App                       │
│   (React Native)    │         (Next.js + React)                  │
└─────────┬───────────┴─────────────────────┬─────────────────────┘
          │                                 │
          └─────────────┬───────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────────┐
│                      API GATEWAY                                 │
│                    (Next.js API Routes)                          │
└───────────────────────┬─────────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────────┐
│                    BACKEND SERVICES                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Auth        │  │ Content     │  │ AI Services             │  │
│  │ Service     │  │ Service     │  │ ├─ OCR (Tesseract/Cloud)│  │
│  │ (NextAuth)  │  │             │  │ ├─ LLM (OpenAI/Claude)  │  │
│  └─────────────┘  └─────────────┘  │ └─ Embeddings           │  │
│                                    └─────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────────┐
│                      DATA LAYER                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ PostgreSQL  │  │ Redis       │  │ Object Storage          │  │
│  │ (Supabase)  │  │ (Cache)     │  │ (S3/Supabase Storage)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Web Frontend** | Next.js 14+ (App Router) | Web application with SSR |
| **Mobile** | React Native + Expo | Cross-platform mobile app |
| **Styling** | Tailwind CSS + shadcn/ui | Modern, consistent UI |
| **State** | Zustand + TanStack Query | Client state & server cache |
| **Auth** | NextAuth.js / Supabase Auth | Authentication & sessions |
| **Database** | PostgreSQL (Supabase) | Primary data store |
| **ORM** | Prisma | Type-safe database access |
| **File Storage** | Supabase Storage / S3 | Image and document storage |
| **AI/LLM** | OpenAI API / Anthropic Claude | Content generation & chat |
| **OCR** | Tesseract.js / Google Vision | Text extraction from images |
| **Caching** | Redis (Upstash) | Session & response caching |

## Repository Structure

```
studysimple-app/
├── CLAUDE.md                    # AI assistant guidelines (this file)
├── README.md                    # Project documentation
├── package.json                 # Root package configuration
├── turbo.json                   # Turborepo configuration
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
│
├── apps/
│   ├── web/                     # Next.js web application
│   │   ├── app/                 # App Router pages
│   │   │   ├── (auth)/          # Auth routes (login, register)
│   │   │   ├── (dashboard)/     # Protected dashboard routes
│   │   │   ├── api/             # API routes
│   │   │   └── layout.tsx       # Root layout
│   │   ├── components/          # Web-specific components
│   │   ├── lib/                 # Utilities and helpers
│   │   └── package.json
│   │
│   └── mobile/                  # React Native + Expo app
│       ├── app/                 # Expo Router screens
│       ├── components/          # Mobile components
│       └── package.json
│
├── packages/
│   ├── ui/                      # Shared UI components
│   │   ├── components/          # Reusable components
│   │   └── package.json
│   │
│   ├── database/                # Prisma schema & client
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # Database schema
│   │   │   └── migrations/      # Database migrations
│   │   └── package.json
│   │
│   ├── ai/                      # AI service integrations
│   │   ├── ocr/                 # OCR processing
│   │   ├── llm/                 # LLM integrations
│   │   └── package.json
│   │
│   └── shared/                  # Shared utilities & types
│       ├── types/               # TypeScript definitions
│       ├── utils/               # Utility functions
│       └── package.json
│
├── docs/                        # Documentation
│   ├── api/                     # API documentation
│   └── architecture/            # Architecture decisions
│
└── scripts/                     # Build & utility scripts
```

## Database Schema

### Core Entities

```prisma
// User Management
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatar        String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  decks         Deck[]
  documents     Document[]
  chatSessions  ChatSession[]
  studyProgress StudyProgress[]
}

// Content Import
model Document {
  id            String    @id @default(cuid())
  userId        String
  title         String
  type          DocumentType // IMAGE, PDF, TEXT
  originalUrl   String    // Storage URL
  extractedText String?   // OCR result
  status        ProcessingStatus
  createdAt     DateTime  @default(now())

  user          User      @relation(fields: [userId], references: [id])
  flashcards    Flashcard[]
  summaries     Summary[]
}

// Flashcard System
model Deck {
  id          String      @id @default(cuid())
  userId      String
  title       String
  description String?
  isPublic    Boolean     @default(false)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  user        User        @relation(fields: [userId], references: [id])
  flashcards  Flashcard[]
}

model Flashcard {
  id            String    @id @default(cuid())
  deckId        String
  documentId    String?
  front         String    // Question
  back          String    // Answer
  difficulty    Int       @default(0) // 0-5 scale
  aiGenerated   Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  deck          Deck      @relation(fields: [deckId], references: [id])
  document      Document? @relation(fields: [documentId], references: [id])
  reviews       CardReview[]
}

// Spaced Repetition
model CardReview {
  id          String    @id @default(cuid())
  flashcardId String
  userId      String
  rating      Int       // 0-5 (Again, Hard, Good, Easy)
  interval    Int       // Days until next review
  easeFactor  Float     // SM-2 ease factor
  nextReview  DateTime
  reviewedAt  DateTime  @default(now())

  flashcard   Flashcard @relation(fields: [flashcardId], references: [id])
}

// AI Chat
model ChatSession {
  id          String    @id @default(cuid())
  userId      String
  title       String?
  documentId  String?   // Optional linked document
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user        User      @relation(fields: [userId], references: [id])
  messages    ChatMessage[]
}

model ChatMessage {
  id          String    @id @default(cuid())
  sessionId   String
  role        Role      // USER, ASSISTANT
  content     String
  createdAt   DateTime  @default(now())

  session     ChatSession @relation(fields: [sessionId], references: [id])
}

// Generated Content
model Summary {
  id          String    @id @default(cuid())
  documentId  String
  content     String
  type        SummaryType // BRIEF, DETAILED, BULLET_POINTS
  createdAt   DateTime  @default(now())

  document    Document  @relation(fields: [documentId], references: [id])
}

// Enums
enum DocumentType {
  IMAGE
  PDF
  TEXT
}

enum ProcessingStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum Role {
  USER
  ASSISTANT
}

enum SummaryType {
  BRIEF
  DETAILED
  BULLET_POINTS
}
```

## Main Screens & User Flow

### Screen Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        APP SCREENS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ONBOARDING                    AUTH                             │
│  ├─ Welcome                    ├─ Login                         │
│  ├─ Features Tour              ├─ Register                      │
│  └─ Get Started                └─ Forgot Password               │
│                                                                  │
│  DASHBOARD (Home)              STUDY                            │
│  ├─ Quick Actions              ├─ Flashcard Review              │
│  ├─ Recent Activity            ├─ Quiz Mode                     │
│  ├─ Study Streak               └─ Progress Stats                │
│  └─ Upcoming Reviews                                            │
│                                                                  │
│  LIBRARY                       CONTENT                          │
│  ├─ My Decks                   ├─ Document View                 │
│  ├─ My Documents               ├─ Import (Camera/Upload)        │
│  └─ Search & Filter            └─ Processing Status             │
│                                                                  │
│  AI TUTOR                      SETTINGS                         │
│  ├─ Chat Interface             ├─ Profile                       │
│  ├─ Conversation History       ├─ Notifications                 │
│  └─ Context Selection          ├─ Appearance                    │
│                                └─ Subscription                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key User Flows

1. **Content Import Flow**
   ```
   Upload Image → OCR Processing → Review Text → Generate Study Materials
   ```

2. **Study Session Flow**
   ```
   Select Deck → Review Cards (Spaced Repetition) → Rate Difficulty → Complete Session
   ```

3. **AI Tutor Flow**
   ```
   Open Chat → (Optional) Select Context → Ask Question → Receive Explanation
   ```

## Development Roadmap

### Phase 1: MVP (Weeks 1-4)

**Goal:** Basic functionality with core features

- [ ] Project setup (monorepo, CI/CD)
- [ ] Authentication (email/password, OAuth)
- [ ] Basic dashboard UI
- [ ] Manual flashcard creation
- [ ] Simple flashcard review (no spaced repetition)
- [ ] Basic AI chat integration

**Deliverables:**
- Working web app
- User can create/review flashcards
- Basic AI chat functionality

### Phase 2: Core Features (Weeks 5-8)

**Goal:** AI-powered content generation

- [ ] Image upload with OCR
- [ ] AI flashcard generation from text
- [ ] AI summary generation
- [ ] Spaced repetition algorithm (SM-2)
- [ ] Study progress tracking
- [ ] Mobile app (basic version)

**Deliverables:**
- OCR working
- AI generates flashcards from content
- Spaced repetition scheduling

### Phase 3: Enhanced Learning (Weeks 9-12)

**Goal:** Advanced study features

- [ ] Quiz generation
- [ ] Adaptive difficulty
- [ ] Document management
- [ ] Chat context awareness
- [ ] Study streaks & gamification
- [ ] Performance analytics

**Deliverables:**
- Complete study toolkit
- Mobile app feature parity

### Phase 4: Polish & Scale (Weeks 13-16)

**Goal:** Production readiness

- [ ] Performance optimization
- [ ] Offline support
- [ ] Push notifications
- [ ] PDF support
- [ ] Deck sharing
- [ ] Premium features

**Deliverables:**
- Production-ready application
- App store submissions

## Development Workflow

### Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd studysimple-app

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Setup database
npx prisma generate
npx prisma db push

# Start development
npm run dev
```

### Common Commands

```bash
# Development
npm run dev              # Start all apps in dev mode
npm run dev:web          # Start web app only
npm run dev:mobile       # Start mobile app only

# Building
npm run build            # Build all packages
npm run build:web        # Build web app

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database

# Testing
npm run test             # Run all tests
npm run test:web         # Run web tests
npm run test:e2e         # Run E2E tests

# Code Quality
npm run lint             # Lint all packages
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
npm run typecheck        # TypeScript type checking
```

### Branch Naming

- `main` - Production code
- `develop` - Integration branch
- `feature/<name>` - New features
- `fix/<name>` - Bug fixes
- `claude/<session-id>` - AI assistant branches

### Commit Messages

Use conventional commits:

```
feat(flashcards): add spaced repetition algorithm
fix(ocr): handle rotated images correctly
docs(readme): add setup instructions
```

## Code Conventions

### TypeScript

- Use strict mode
- Prefer `interface` for object shapes
- Explicit return types on exported functions
- No `any` - use `unknown` when needed

### React Components

```typescript
// Component structure
interface CardProps {
  question: string;
  answer: string;
  onFlip: () => void;
}

export function FlashCard({ question, answer, onFlip }: CardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Event handlers
  const handleClick = () => {
    setIsFlipped(!isFlipped);
    onFlip();
  };

  return (
    // JSX
  );
}
```

### File Naming

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Types: `types.ts` or `*.types.ts`
- Tests: `*.test.ts(x)`

### Import Order

```typescript
// 1. React/external packages
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal packages (@studysimple/*)
import { Button } from '@studysimple/ui';
import { db } from '@studysimple/database';

// 3. Relative imports
import { CardContent } from './CardContent';

// 4. Types
import type { Flashcard } from '@studysimple/shared';
```

## AI Assistant Guidelines

### Before Making Changes

1. **Read the code** - Understand existing patterns before editing
2. **Check architecture** - Ensure changes align with the structure
3. **Review related files** - Understand dependencies
4. **Clarify requirements** - Ask if something is unclear

### When Implementing Features

1. **Follow the architecture** - Use the defined project structure
2. **Keep it simple** - Avoid over-engineering
3. **Match existing style** - Be consistent with the codebase
4. **Write testable code** - Keep functions pure when possible

### After Making Changes

1. **Run tests** - Ensure nothing breaks
2. **Run linting** - Fix any style issues
3. **Verify build** - Ensure it compiles
4. **Commit properly** - Use conventional commits

### Things to Avoid

- Adding features beyond what's requested
- Creating unnecessary abstractions
- Adding extensive comments
- Over-engineering error handling
- Committing sensitive data

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# AI Services
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""

# Storage
SUPABASE_URL=""
SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_KEY=""

# OCR (if using Google Vision)
GOOGLE_CLOUD_API_KEY=""
```

## API Routes Structure

```
/api
├── /auth
│   ├── [...nextauth]     # NextAuth handlers
│   └── /register         # User registration
│
├── /documents
│   ├── GET /             # List user documents
│   ├── POST /            # Upload new document
│   ├── GET /:id          # Get document
│   └── DELETE /:id       # Delete document
│
├── /decks
│   ├── GET /             # List user decks
│   ├── POST /            # Create deck
│   ├── GET /:id          # Get deck with cards
│   ├── PUT /:id          # Update deck
│   └── DELETE /:id       # Delete deck
│
├── /flashcards
│   ├── POST /            # Create flashcard
│   ├── PUT /:id          # Update flashcard
│   ├── DELETE /:id       # Delete flashcard
│   └── POST /:id/review  # Submit review
│
├── /ai
│   ├── POST /generate-flashcards  # Generate from text
│   ├── POST /generate-summary     # Generate summary
│   ├── POST /generate-quiz        # Generate quiz
│   └── POST /chat                 # Chat completion
│
└── /study
    ├── GET /due           # Get due cards
    ├── GET /progress      # Get study stats
    └── GET /streak        # Get streak info
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| DB connection fails | Check DATABASE_URL, ensure DB is running |
| Prisma errors | Run `npx prisma generate` |
| Type errors | Run `npm run typecheck` |
| Build fails | Check env vars, run `npm run lint` |
| OCR not working | Verify API keys, check image format |
| AI responses slow | Check rate limits, implement caching |

### Getting Help

- Check existing documentation in `/docs`
- Review similar implementations in codebase
- Ask for clarification if requirements are unclear

---

*Last updated: 2026-02-04*
*Update this file as the project evolves.*
