# Technical Requirement Document (TRD) — PrepApp

## 1. Document Overview
*   **Product Name:** PrepApp
*   **Document Version:** 1.0.0
*   **Release Target:** Phase 1 (Core MCQ Engine + AI Admin Importer)
*   **Document Status:** Approved

---

## 2. Technical Stack Matrix

| Tier | Component | Selection | Version |
|---|---|---|---|
| **Frontend** | Framework | Next.js (App Router) | 16.x |
| | Library | React | 19.x |
| | Typing | TypeScript | 5.x |
| | Styling | Tailwind CSS | 4.x |
| | Network | Axios | 1.x |
| | Theme Management | next-themes | 0.x |
| **Backend** | Framework | NestJS | 11.x |
| | Language | TypeScript / Node.js | 22.x |
| | Database Engine | PostgreSQL | 15+ |
| | ORM | Prisma Client & CLI | 5.x |
| | Auth Middleware | Passport.js (Local & JWT) | 10.x |
| | Tokenization | jsonwebtoken | 9.x |
| **AI Parser** | Framework | FastAPI (Python) | 0.110.0+ |
| | PDF Parsers | pdfplumber (primary), PyMuPDF (fallback) | - |
| | SDKs | Groq & HuggingFace Hub | - |

---

## 3. System Architecture & Data Flow

PrepApp utilizes a monorepo setup consisting of two separate application trees communicating over standard JSON REST routes.

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Client                         │
│                    (localhost:3000)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP REST / JSON
                         │ Authorization: Bearer <JWT>
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      NestJS Server                          │
│                    (localhost:5000/api)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼ (Prisma Client)                 ▼ (Multipart Form)
┌────────────────────────┐       ┌────────────────────────┐
│      PostgreSQL        │       │    pdftojson Service   │
│   (localhost:5432)     │       │    (localhost:8000)    │
└────────────────────────┘       └────────────────────────┘
```

---

## 4. Database Schema Design (Prisma)

The schema is declared in [schema.prisma](file:///C:/Users/siddh/Desktop/prepapp/server/prisma/schema.prisma) and maps the following relationships:

1.  **User (`User`):** Represents students and administrators. Stores tier parameters (`FREE`, `PRO`, `MAX`) and demographic info.
2.  **Subject & Topic (`Subject`, `Topic`):**
    *   One `Subject` has many `Topics`.
    *   `Topic` features a self-relation (`parentTopicId` $\rightarrow$ `Topic`) to represent hierarchical sub-topics (e.g. History $\rightarrow$ Modern India $\rightarrow$ Satyagraha).
3.  **Test & Question (`Test`, `Question`):**
    *   Implicit many-to-many relationship (`_TestQuestions` join table) allowing question reuse across mock tests.
    *   `Question` has many `Options`, exactly one of which must have `isCorrect: true`.
4.  **TestAttempt & Response (`TestAttempt`, `Response`):**
    *   Tracks live exam sessions. A `TestAttempt` logs the user's running `score` (Float, accommodating Negative UPSC marks).
    *   `Response` links a specific question attempt to the user's selected option.

---

## 5. Core API Endpoints

### 5.1 Authentication Module (`/api/auth`)
*   `POST /auth/signup` - Registers new accounts; hashes passwords via bcrypt.
*   `POST /auth/login` - Validates credentials; returns JWT token + user metadata payload (role, tier).
*   `GET /auth/me` - Validates bearer JWT and returns active session data.

### 5.2 Exam Module (`/api/exam`)
*   `POST /exam/start` - Starts a `TestAttempt` entry (`status: "ONGOING"`). If an attempt for this test is already ongoing, it resumes it.
*   `GET /exam/:attemptId/questions` - Returns sharded questions. Shuts down correctness leaks by stripping `isCorrect` parameters from options.
*   `POST /exam/submit-answer` - Records or updates a `Response` row. Determines correctness server-side.
*   `POST /exam/clear-answer` - Deletes a user's selection for a question.
*   `POST /exam/finish` - Marks the attempt `COMPLETED`, computes marks, and locks the score.

### 5.3 Admin Module (`/api/admin`)
*   `GET /admin/stats` - Returns count stats for dashboards.
*   `POST /admin/import` - Expects standard JSON; executes database seeding inside a single Prisma Transaction block.
*   `POST /admin/import/extract-pdf` - Proxies multipart PDF file upload to `pdftojson` and returns structured JSON payload.

---

## 6. Technical Constraints & Design Solutions

### Constraint 1: Preventing Timer Resets on Refresh
*   **Problem:** If the timer runs solely on client-side JS state, reloading the browser page resets the exam clock.
*   **Solution:** When an attempt starts, the database records `startTime` (DateTime). The client fetches this value. The remaining time is calculated dynamically:
    $$\text{Remaining Time} = \text{Duration} - (\text{Current Time} - \text{Start Time})$$
    If remaining time $\le$ 0, the backend immediately triggers `finishTest`.

### Constraint 2: Deterministic Question Shuffling
*   **Problem:** To prevent cheating, questions should be shuffled. However, simple random shuffling will change question order every time the user refreshes, confusing them.
*   **Solution:** Seed the random number generator or sorting function using a hash combining the `attemptId` and the `questionId`. This guarantees that question order remains identical across page refreshes for the same attempt.

### Constraint 3: Correctness Leaks
*   **Problem:** Options sent from `/api/exam/:attemptId/questions` could be inspected in browser developer tools if they contain `isCorrect: true`.
*   **Solution:** The controller specifically maps options, omitting the `isCorrect` boolean property when fetching question banks for active tests. Correctness is evaluated only during answer submissions on the server.

### Constraint 4: PDF Encoding Garbling (Mojibake)
*   **Problem:** PDFs parsed via layout extraction often convert Unicode text characters into garbled Windows-1252 strings.
*   **Solution:** The PDF parser employs cp1252/latin-1 decoding heuristics, checking byte mappings against high-frequency markers and rebuilding character encodings automatically.

### Constraint 5: Transactional Database Integrity
*   **Problem:** If an admin imports a test, but the server crashes midway, the database is left in a corrupted state (test exists but with missing questions).
*   **Solution:** The bulk importer wraps all operations inside a Prisma Transaction (`prisma.$transaction(...)`). If any question, option, or topic insertion fails, the entire import rolls back.
