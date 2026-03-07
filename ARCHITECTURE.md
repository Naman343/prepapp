# PrepApp — Architecture Overview

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Tech Stack](#2-tech-stack)
3. [Repository Structure](#3-repository-structure)
4. [Database Schema](#4-database-schema)
5. [Backend Architecture](#5-backend-architecture)
6. [Frontend Architecture](#6-frontend-architecture)
7. [API Reference](#7-api-reference)
8. [Authentication Flow](#8-authentication-flow)
9. [Exam Taking Flow](#9-exam-taking-flow)
10. [Analytics Flow](#10-analytics-flow)
11. [Environment Configuration](#11-environment-configuration)

---

## 1. System Overview

PrepApp is a full-stack exam preparation platform with a **monorepo** layout containing two independent applications:

```
prepapp/
├── client/    ← Next.js 16 frontend (React 19 + Tailwind CSS)
└── server/    ← NestJS 11 backend (Prisma + PostgreSQL)
```

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                             │
│                    Next.js App Router                       │
│              (localhost:3000 by default)                    │
└────────────────────────┬────────────────────────────────────┘
                         │  REST + JSON
                         │  Authorization: Bearer <JWT>
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    NestJS REST API                          │
│                  (localhost:5000/api)                       │
│   AuthModule │ ExamModule │ TestsModule │ AnalyticsModule   │
└────────────────────────┬────────────────────────────────────┘
                         │  Prisma ORM
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     PostgreSQL                              │
│  Users │ Tests │ Questions │ TestAttempts │ Responses       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

| Layer        | Technology                                     |
|--------------|------------------------------------------------|
| Frontend     | Next.js 16, React 19, TypeScript               |
| Styling      | Tailwind CSS 4, PostCSS                        |
| Icons/UI     | Lucide React, Shadcn-style components          |
| Theme        | next-themes (dark / light mode)                |
| HTTP Client  | Axios (with JWT interceptor)                   |
| Backend      | NestJS 11, TypeScript, Node.js                 |
| Database     | PostgreSQL                                     |
| ORM          | Prisma v5                                      |
| Auth         | Passport.js — Local + JWT strategies, bcrypt   |
| Validation   | class-validator, class-transformer             |
| Testing      | Jest, @nestjs/testing, Supertest               |

---

## 3. Repository Structure

```
prepapp/
│
├── client/                            # Next.js frontend
│   ├── src/
│   │   ├── app/                       # App Router pages
│   │   │   ├── layout.tsx             # Root layout + theme provider
│   │   │   ├── page.tsx               # Landing / dashboard (/)
│   │   │   ├── globals.css            # Global styles
│   │   │   ├── auth/
│   │   │   │   ├── login/page.tsx     # /auth/login
│   │   │   │   └── signup/page.tsx    # /auth/signup
│   │   │   ├── tests/page.tsx         # /tests — browse & start tests
│   │   │   ├── exam/
│   │   │   │   └── [attemptId]/page.tsx  # /exam/:attemptId — live exam
│   │   │   ├── results/
│   │   │   │   └── [attemptId]/...    # /results/:attemptId
│   │   │   ├── analytics/page.tsx     # /analytics — performance stats
│   │   │   └── profile/page.tsx       # /profile
│   │   ├── components/
│   │   │   ├── layout/Navbar.tsx      # Auth-aware top navigation
│   │   │   ├── exam/
│   │   │   │   ├── QuestionCard.tsx   # MCQ question renderer
│   │   │   │   ├── QuestionPalette.tsx       # Sidebar navigator
│   │   │   │   ├── QuestionPaletteHeader.tsx # Palette header
│   │   │   │   └── Timer.tsx          # Countdown → auto-submit
│   │   │   ├── theme-provider.tsx     # next-themes wrapper
│   │   │   └── ui/
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── input.tsx
│   │   │       ├── label.tsx
│   │   │       └── theme-toggle.tsx
│   │   └── lib/
│   │       ├── axios.ts               # Axios instance + JWT interceptor
│   │       └── utils.ts               # Shared helpers
│   ├── public/                        # Static assets
│   ├── next.config.ts
│   ├── tailwind.config / postcss.config.mjs
│   └── package.json
│
└── server/                            # NestJS backend
    ├── src/
    │   ├── main.ts                    # Bootstrap (port 5000, /api prefix, CORS)
    │   ├── app.module.ts              # Root module — imports all feature modules
    │   ├── auth/                      # Authentication module
    │   │   ├── auth.module.ts
    │   │   ├── auth.controller.ts     # POST /auth/login, /auth/signup
    │   │   ├── auth.service.ts        # validateUser, login, register
    │   │   ├── local.strategy.ts      # Passport Local (username+password)
    │   │   └── jwt.strategy.ts        # Passport JWT (Bearer token)
    │   ├── exam/                      # Exam engine module
    │   │   ├── exam.module.ts
    │   │   ├── exam.controller.ts     # Exam CRUD endpoints (JWT guarded)
    │   │   ├── exam.service.ts        # startTest, submitAnswer, finishTest…
    │   │   ├── dto/                   # Request DTOs (create-exam, exam, update-exam)
    │   │   └── entities/exam.entity.ts
    │   ├── tests/                     # Test management module
    │   │   ├── tests.module.ts
    │   │   ├── tests.controller.ts    # CRUD /tests
    │   │   ├── tests.service.ts
    │   │   ├── dto/
    │   │   └── entities/test.entity.ts
    │   ├── questions/                 # Question bank module
    │   │   ├── questions.module.ts
    │   │   ├── questions.controller.ts # CRUD /questions
    │   │   ├── questions.service.ts
    │   │   ├── dto/
    │   │   └── entities/question.entity.ts
    │   ├── analytics/                 # Analytics module
    │   │   ├── analytics.module.ts
    │   │   ├── analytics.controller.ts # GET /analytics (JWT guarded)
    │   │   ├── analytics.service.ts   # Aggregates stats & topic breakdown
    │   │   ├── dto/
    │   │   └── entities/analytics.entity.ts
    │   └── prisma/                    # shared Prisma service
    │       ├── prisma.module.ts
    │       └── prisma.service.ts
    ├── prisma/
    │   ├── schema.prisma              # DB schema (models, enums, relations)
    │   ├── seed.ts                    # Seeder script
    │   └── migrations/               # SQL migration history
    └── package.json
```

---

## 4. Database Schema

```
Subject ──< Topic ──< Question ──< Option
                           │
                           └──< Response
                                    │
                              TestAttempt ──< Response
                                    │
                                   User
                                    │
                              TestAttempt ──> Test
                                              │
                                         Question (via Test)
```

### Models

```
User
  id           String        PK
  email        String        unique
  passwordHash String
  role         Role          USER | ADMIN
  createdAt    DateTime
  attempts     TestAttempt[]

Test
  id              String    PK
  title           String
  duration        Int       (minutes)
  totalQuestions  Int
  isPublished     Boolean
  createdAt       DateTime
  attempts        TestAttempt[]
  questions       Question[]

TestAttempt
  id          String          PK
  userId      String          FK → User
  testId      String          FK → Test
  startTime   DateTime
  submitTime  DateTime?
  score       Int?
  status      AttemptStatus   ONGOING | COMPLETED
  responses   Response[]

Question
  id          String      PK
  text        String
  imageUrl    String?
  difficulty  Difficulty  EASY | MEDIUM | HARD
  explanation String?
  topicId     String      FK → Topic
  options     Option[]
  responses   Response[]

Option
  id         String    PK
  text       String
  isCorrect  Boolean
  questionId String    FK → Question

Response
  id               String    PK
  attemptId        String    FK → TestAttempt
  questionId       String    FK → Question
  selectedOptionId String?   FK → Option
  isCorrect        Boolean
  timeTaken        Int?      (seconds)
  markedForReview  Boolean

Topic
  id        String     PK
  name      String
  subjectId String     FK → Subject
  questions Question[]

Subject
  id     String  PK
  name   String
  topics Topic[]
```

---

## 5. Backend Architecture

### Module Dependency Graph

```
AppModule
├── PrismaModule        (global singleton — injected into all modules)
├── AuthModule
│     └── uses PrismaService, JwtModule, PassportModule
├── TestsModule
│     └── uses PrismaService
├── QuestionsModule
│     └── uses PrismaService
├── ExamModule
│     └── uses PrismaService
└── AnalyticsModule
      └── uses PrismaService
```

### Request Lifecycle

```
HTTP Request
    │
    ▼
NestJS Router
    │
    ▼
Guards (JwtAuthGuard / LocalAuthGuard)
    │
    ▼
Pipes (GlobalValidationPipe → class-validator)
    │
    ▼
Controller (extracts params, calls service)
    │
    ▼
Service (business logic + Prisma queries)
    │
    ▼
PrismaService → PostgreSQL
    │
    ▼
JSON Response
```

### Core Service Responsibilities

| Service            | Key Methods                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| `AuthService`      | `register`, `validateUser` (bcrypt compare), `login` (issue JWT 7d)        |
| `ExamService`      | `startTest`, `submitAnswer` (upsert), `clearAnswer`, `finishTest`, `getExamQuestions`, `getAttemptResult` |
| `TestsService`     | Full CRUD; returns only published tests to normal users                     |
| `QuestionsService` | CRUD with nested `Option` creation                                          |
| `AnalyticsService` | Aggregates completed attempts; computes accuracy + topic-wise STRONG/MODERATE/WEAK breakdown |

---

## 6. Frontend Architecture

### Page Map

```
/                    → Landing / authenticated home dashboard
/auth/login          → Email + password login form
/auth/signup         → Registration form
/tests               → Browse and start available tests
/exam/[attemptId]    → Full-screen live exam interface
/results/[attemptId] → Post-exam results review
/analytics           → Personal performance dashboard
/profile             → User profile page
```

### Component Hierarchy (Exam Page)

```
ExamPage (/exam/[attemptId])
├── Timer              — Countdown, triggers finishTest on expiry
├── QuestionPaletteHeader — Summary counts (answered, flagged, etc.)
├── QuestionPalette    — Grid navigator; color-coded per answer state
└── QuestionCard       — Question text + MCQ options (radio buttons)
```

### HTTP Client (Axios)

```typescript
// client/src/lib/axios.ts
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

// Request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

Every page that needs auth reads `localStorage.token` and `localStorage.user` directly.

---

## 7. API Reference

### Auth
| Method | Path               | Guard  | Description              |
|--------|--------------------|--------|--------------------------|
| POST   | `/api/auth/login`  | Local  | Returns JWT + user info  |
| POST   | `/api/auth/signup` | None   | Registers new user       |

### Tests
| Method | Path             | Guard | Description           |
|--------|------------------|-------|-----------------------|
| GET    | `/api/tests`     | None  | List published tests  |
| POST   | `/api/tests`     | None  | Create test           |
| GET    | `/api/tests/:id` | None  | Get one test          |
| PATCH  | `/api/tests/:id` | None  | Update test           |
| DELETE | `/api/tests/:id` | None  | Delete test           |

### Questions
| Method | Path                 | Guard | Description                  |
|--------|----------------------|-------|------------------------------|
| GET    | `/api/questions`     | None  | List all questions + options |
| POST   | `/api/questions`     | None  | Create question with options |
| GET    | `/api/questions/:id` | None  | Get one question             |
| PATCH  | `/api/questions/:id` | None  | Update question              |
| DELETE | `/api/questions/:id` | None  | Delete question              |

### Exam Engine
| Method | Path                           | Guard | Description                    |
|--------|--------------------------------|-------|--------------------------------|
| POST   | `/api/exam/start`              | JWT   | Create TestAttempt (ONGOING)   |
| GET    | `/api/exam/:attemptId/questions` | JWT | Fetch test questions           |
| POST   | `/api/exam/submit-answer`      | JWT   | Upsert Response                |
| POST   | `/api/exam/clear-answer`       | JWT   | Delete Response                |
| POST   | `/api/exam/finish`             | JWT   | Score + mark COMPLETED         |
| GET    | `/api/exam/result/:attemptId`  | JWT   | Fetch result                   |

### Analytics
| Method | Path             | Guard | Description                    |
|--------|------------------|-------|--------------------------------|
| GET    | `/api/analytics` | JWT   | User stats + topic breakdown   |

---

## 8. Authentication Flow

```
┌──────────┐         ┌───────────┐          ┌────────────────┐
│  Browser │         │  NestJS   │          │   PostgreSQL   │
└────┬─────┘         └─────┬─────┘          └───────┬────────┘
     │                     │                         │
     │  POST /auth/signup  │                         │
     │─────────────────────▶                         │
     │  { email, password } │                         │
     │                     │  bcrypt.hash(password)  │
     │                     │  prisma.user.create()   │
     │                     │─────────────────────────▶
     │                     │                         │
     │  { access_token,    │                         │
     │    user: {...} }     │                         │
     ◀─────────────────────│                         │
     │                     │                         │
     │  localStorage.setItem('token', access_token)  │
     │  localStorage.setItem('user',  user)          │
     │                     │                         │
     │  Subsequent requests│                         │
     │  Authorization: Bearer <token>                │
     │─────────────────────▶                         │
     │                     │  JwtStrategy.validate() │
     │                     │  → req.user = payload   │
     │                     │                         │
```

JWT payload: `{ email, sub: userId, role }` — expires in **7 days**.

---

## 9. Exam Taking Flow

```
┌──────────────────────────────────────────────────────────────┐
│  1. /tests  →  GET /api/tests                                │
│     User clicks "Start Test"                                 │
│                                                              │
│  2. POST /api/exam/start  { testId }                         │
│     → Creates TestAttempt { status: ONGOING }                │
│     → Redirect to /exam/:attemptId                           │
│                                                              │
│  3. GET /api/exam/:attemptId/questions                       │
│     → Loads all questions + options                          │
│                                                              │
│  4. For every selected answer:                               │
│     POST /api/exam/submit-answer                             │
│     { attemptId, questionId, selectedOptionId,               │
│       markedForReview }                                      │
│     → Upserts Response; sets isCorrect server-side           │
│                                                              │
│  5. (optional) POST /api/exam/clear-answer                   │
│     → Deletes the Response row                               │
│                                                              │
│  6. User clicks "Submit" OR Timer reaches 0                  │
│     POST /api/exam/finish  { attemptId }                     │
│     → score = COUNT(isCorrect=true responses)                │
│     → TestAttempt.status = COMPLETED                         │
│                                                              │
│  7. Redirect to /results/:attemptId                          │
│     GET /api/exam/result/:attemptId                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. Analytics Flow

```
GET /api/analytics  (JWT)
         │
         ▼
  Fetch all COMPLETED TestAttempts for userId
  (with responses → question → topic)
         │
         ├── totalTests         = attempts.length
         ├── averageScore       = Σ scores / totalTests
         ├── totalQuestionsAttempted = responses.length
         ├── overallAccuracy    = (Σ isCorrect) / asked × 100
         │
         └── Per Topic:
               accuracy = correct / total × 100
               status:
                 ≥ 70% → STRONG
                 40–69% → MODERATE
                 < 40%  → WEAK
         │
         ▼
  Return {
    totalTests, averageScore, overallAccuracy,
    topicPerformance: [ { topicName, accuracy, status } ]
  }
```

The `/analytics` page renders:
- Summary stat cards (total tests, avg score, accuracy)
- Topic breakdown table with colored status badges
- Per-topic accuracy progress bars

---

## 11. Environment Configuration

### Backend (`server/.env`)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/prepapp
JWT_SECRET=your_secret_key
PORT=5000
```

### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Running Locally

```bash
# Database
npx prisma migrate dev        # run from server/
npx prisma db seed            # seed initial data

# Backend
cd server
npm install
npm run start:dev             # → localhost:5000

# Frontend
cd client
npm install
npm run dev                   # → localhost:3000
```
