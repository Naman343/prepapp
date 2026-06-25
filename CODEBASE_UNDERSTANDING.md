# PrepApp Codebase Understanding Document

This document provides a comprehensive breakdown of the **PrepApp** codebase. PrepApp is a full-stack, multi-user exam preparation platform optimized for UPSC-style Multiple Choice Question (MCQ) examinations.

---

## 1. System Architecture

PrepApp is organized as a monorepo consisting of:
1. **Frontend (`client/`)**: A [Next.js](file:///C:/Users/siddh/desktop/prepapp/client) web application utilizing React 19, TypeScript, Tailwind CSS, Lucide Icons, and Axios for API requests.
2. **Backend (`server/`)**: A [NestJS](file:///C:/Users/siddh/desktop/prepapp/server) REST API application utilizing PostgreSQL as the database and Prisma ORM for database schema management, querying, and migrations.

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

## 2. Database Schema (Prisma)

The database schema is defined in [schema.prisma](file:///C:/Users/siddh/desktop/prepapp/server/prisma/schema.prisma) and consists of the following key models:

### Entities & Relations
*   **User**: Represents registration info (email, encrypted password, role (`USER` or `ADMIN`), membership details (`FREE`/`PRO`/`MAX`), contact info, category/demographics, and test attempts).
*   **Subject**: High-level subjects (e.g., "General Studies", "History"). Has a one-to-many relationship with `Topic`.
*   **Topic**: Belongs to a `Subject`. Supports self-relation via `parentTopicId` to model sub-topics (e.g., `History` → `Indian National Movement` → `Non-Cooperation Movement`).
*   **Question**: Contains text, optional imageUrl, difficulty (`EASY`, `MEDIUM`, `HARD`), exam year, and explanation. Associated with a `Topic`. Questions have an implicit many-to-many relationship with `Test` (a question can belong to multiple tests).
*   **Option**: Multiple choice options belonging to a `Question`. One of them is marked correct (`isCorrect: true`).
*   **Test**: A published or unpublished exam with a title, duration (in minutes), total number of questions, year, and a collection of associated `Question` entities.
*   **TestAttempt**: Created when a user starts a `Test`. Has status (`ONGOING` or `COMPLETED`), start and submit timestamps, user score, and individual responses.
*   **Response**: Connects `TestAttempt` with a `Question`. Records the `selectedOptionId`, correctness (`isCorrect`), time taken, and flag status for review (`markedForReview`).

---

## 3. Backend Implementation Detail (`server/src`)

The backend is modularized with NestJS modules. All API endpoints are prefixed with `/api`.

### Module Breakdown:
1.  **Auth Module (`auth/`)**:
    *   Implements registration (`POST /auth/signup`) and session login (`POST /auth/login`).
    *   Uses **Passport.js** with `LocalStrategy` (email/password check via `bcrypt`) and `JwtStrategy` (token validation).
    *   JWTs contain `{ email, sub: userId, role }` and have a duration of 7 days.
2.  **Exam Module (`exam/`)**:
    *   Manages the active lifecycle of taking exams.
    *   `startTest`: Initiates a new `TestAttempt` or resumes an existing `ONGOING` one.
    *   `submitAnswer`: Receives an option selection, computes correctness on the server side, and upserts a `Response`.
    *   `clearAnswer`: Removes a user's answer for a question by deleting the corresponding `Response` row.
    *   `finishTest`: Computes final scores using UPSC scoring mechanics (Correct: `+2` marks, Incorrect: `-0.66` marks). Sets status to `COMPLETED`.
    *   `getExamQuestions`: Shuffles questions deterministically using a hash of `attemptId + questionId` so that refresh does not alter question order for a specific attempt. Shuts down correctness leaks by stripping `isCorrect` keys from options sent to the user.
3.  **Analytics Module (`analytics/`)**:
    *   Computes performance stats for completed `TestAttempt` entries.
    *   Calculates total tests taken, average test score, and overall accuracy.
    *   Groups response correctness by `Topic` and rates accuracy:
        *   **STRONG**: $\ge 70\%$ accuracy.
        *   **MODERATE**: $40\% - 69\%$ accuracy.
        *   **WEAK**: $< 40\%$ accuracy.
4.  **Admin Module (`admin/`)**:
    *   Restricted to `ADMIN` users via `RolesGuard`.
    *   Supports full CRUD for subjects, topics, tests, and questions.
    *   Provides image uploading (saved to `/uploads` on the server).
    *   Integrates a PDF extraction endpoint `/admin/import/extract-pdf` that forwards files to a separate service running `pdftojson` (a layout-aware PDF parser with LLM support) to return structured JSON.
    *   Implements a bulk importer `bulkImport` (`POST /admin/import`) to populate tests, topics, questions, and options in a single transaction.

---

## 4. Frontend Implementation Detail (`client/src`)

The frontend is built using **Next.js App Router**. Axios is configured globally with a request interceptor in [axios.ts](file:///C:/Users/siddh/desktop/prepapp/client/src/lib/axios.ts) to inject the `Bearer <token>` authorization header from `localStorage`.

### Page Navigation Map:
*   `/` : Main dashboard showing overall statistics (tests attempted, average score, topic analysis) and a sidebar for navigation.
*   `/auth/login` & `/auth/signup` : Auth forms.
*   `/tests` : Allows users to browse published tests, filter by subjects/status, and launch an exam.
*   `/exam/[attemptId]` : Full-screen test interface featuring a timer (triggers auto-submit upon expiration), a question palette sidebar (color-coded for answered/unanswered/review status), and the question rendering panel.
*   `/results/[attemptId]` : Shows test score, correct/incorrect statistics, and a detailed review of questions, selected answers, correct answers, and explanations.
*   `/analytics` : Renders topic accuracy metrics with progress bars and badges (STRONG, MODERATE, WEAK).
*   `/profile` : Shows and updates profile configurations.
*   `/admin` : Administrative dashboard with sub-routes to manage Subjects, Tests, Questions, and the Bulk JSON Import tool.

### Bulk Import Page Features (`/admin/import`):
*   **PDF Extraction UI**: Admin can upload a PDF containing multiple questions, configure LLM provider settings (Groq/Hugging Face, focus modes, chunking strategies), specify prompts, and click to automatically extract structure.
*   **Conversion / Mapping**: Contains a helper function `convertPyqFormat` that converts alternate UPSC past year paper outputs (containing `exam_year`, `question`, `options`, `correct_answer`, `explanation`) into the standard import schema format.
*   **Validation**: Validates pasted or extracted JSON text on the client-side to ensure compliance with the import schema (valid properties, option correctness validation, required inputs) before triggering the database insert.

---

## 5. System Utilities and Automation

The codebase includes two PowerShell utility scripts in the project root to synchronize database contents between the primary master database and local workstations:

*   **`sync-db.ps1`**: A script that dumps the production database from a master host (laptop `LAPTOP-I6GVMCAT` on port `5434`) using `pg_dump`, drops/recreates the local target database `prepapp` on port `5432`, restores the dump using `psql`, and retains only the last 5 backup dumps.
*   **`sync-local-to-master.ps1`**: A safety-first script to perform a reverse synchronization, replacing the master database with local data. It creates a master safety backup file first, dumps local database contents, drops/recreates the master database, and restores the local snapshot. Requires the `-Force` flag to execute.
