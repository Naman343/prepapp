# PrepApp — Backend Schema & User Data Flow

This document details the user database model, table relationships, authentication lifecycles, and user-centric REST API calls in the **PrepApp** backend.

---

## 1. User Database Model (`schema.prisma`)

User profiles are stored in the PostgreSQL database and managed via Prisma. Below is the schema definition for the `User` table and related enums.

```prisma
enum Role {
  USER
  ADMIN
}

enum Category {
  GEN   // General
  EWS   // Economically Weaker Sections
  OBC   // Other Backward Classes
  SC    // Scheduled Castes
  ST    // Scheduled Tribes
}

enum MemberTier {
  FREE
  PRO
  MAX
}

model User {
  id            String      @id @default(uuid())
  email         String      @unique
  passwordHash  String
  role          Role        @default(USER)
  name          String?
  mobileNumber  String?
  dob           DateTime?
  location      String?
  category      Category?
  pwd           Boolean?    // Person with Benchmark Disability (affects exam time limits)
  memberTier    MemberTier  @default(FREE)
  memberId      String      @unique                  // Random 12-char hex string for billing
  createdAt     DateTime    @default(now())

  testAttempts  TestAttempt[]                        // Relational link to attempts taken
}
```

---

## 2. Table Relationships (User Data Context)

The diagram below outlines how the user record propagates throughout the test-taking and analytics components of the database:

```
┌──────────────┐
│     User     │
└──────┬───────┘
       │ 1
       │
       │ has many
       ▼ 0..*
┌──────────────┐
│ TestAttempt  │ ◄─────── 1 [Test] (Test information)
└──────┬───────┘
       │ 1
       │
       │ logs many
       ▼ 0..*
┌──────────────┐
│   Response   │ ◄─────── 1 [Question] (Question information)
└──────────────┘ ◄─────── 1 [Option] (Option selected by user)
```

### Relationship Details
*   **User $\rightarrow$ TestAttempt (One-to-Many):** A single user can take multiple mock exams. Each row in `TestAttempt` contains `userId` as a foreign key pointing back to `User.id`.
*   **TestAttempt $\rightarrow$ Response (One-to-Many):** Each exam attempt has multiple question responses. Each row in `Response` contains `attemptId` pointing back to `TestAttempt.id`. The backend queries these relations to calculate user performance.

---

## 3. User Data Lifecycle

### 3.1 Account Creation (Registration)
1.  **Endpoint:** `POST /api/auth/signup`
2.  **Input:** `{ email, password, name }`
3.  **Process:**
    *   Verify if the email is already registered.
    *   Hash the password cryptographically using `bcrypt` with **10 salt rounds** to generate `passwordHash`.
    *   Generate a unique 12-character hex token via Node.js `crypto` for the `memberId`.
    *   Create a database record in the `User` table (defaults `role: USER` and `memberTier: FREE`).
    *   Signs and returns a JWT token.

### 3.2 Authentication & Session Issuance (Login)
1.  **Endpoint:** `POST /api/auth/login`
2.  **Input:** `{ email, password }`
3.  **Process:**
    *   Passport.js `LocalStrategy` intercepts the request.
    *   Fetches the user from PostgreSQL using `PrismaService`.
    *   Compares the typed password with `User.passwordHash` using `bcrypt.compare()`.
    *   If correct, generates a JWT token signed with `JWT_SECRET`.
    *   **JWT Payload:** Contains `{ email, sub: userId, role }` with a **7-day expiration**.

### 3.3 Authorization Guard Filters (Usage)
For JWT-guarded routes, incoming headers must provide `Authorization: Bearer <token>`.
*   **`JwtAuthGuard`:** Decodes the token, verifies the signature, and attaches the payload back to the request object as `req.user`.
*   **`RolesGuard`:** Reads `req.user.role` to ensure only users with `ADMIN` privileges can access routes starting with `/api/admin/...`.

---

## 4. User-Centric API Reference

Below are the backend controllers handling user session and performance data.

### 4.1 Authentication (`auth.controller.ts`)

| Route | Method | Access | Payload / Params | Return | Description |
|---|---|---|---|---|---|
| `/api/auth/signup` | `POST` | Public | `{ email, password, name }` | `{ access_token, user }` | Registers account |
| `/api/auth/login` | `POST` | Public | `{ email, password }` | `{ access_token, user }` | Log in, returns token |
| `/api/auth/me` | `GET` | JWT | None | `{ id, email, role, name, ... }` | Returns active user profile |
| `/api/auth/profile` | `PATCH` | JWT | `{ name, mobileNumber, dob, location, category, pwd }` | `{ id, name, ... }` | Updates profile details |

### 4.2 Analytics (`analytics.controller.ts`)

These endpoints read test-attempt relations to evaluate user strength areas.

| Route | Method | Access | Return | Description |
|---|---|---|---|---|
| `/api/analytics` | `GET` | JWT | `UserStatsPayload` (detailed below) | Returns completed performance aggregates |

#### UserStatsPayload Output Structure:
```json
{
  "totalTests": 14,
  "averageScore": 92.4,
  "overallAccuracy": 68.2,
  "topicPerformance": [
    { "topicName": "Modern Indian History", "accuracy": 82.5, "status": "STRONG" },
    { "topicName": "Macroeconomics", "accuracy": 54.0, "status": "MODERATE" },
    { "topicName": "Climatology", "accuracy": 31.2, "status": "WEAK" }
  ]
}
```
*   **Calculations:**
    *   `STRONG`: Accuracy $\ge 70\%$
    *   `MODERATE`: Accuracy between $40\%$ and $69\%$
    *   `WEAK`: Accuracy $< 40\%$
