# PrepApp Project Memory

This file serves as a memory log of the context, credentials, architecture, and current state of the **PrepApp** workspace.

---

## 1. Credentials & Accounts

### Admin User
*   **Email:** `admin@prepapp.com`
*   **Password:** `Admin@1234`

### Test User
*   **Email:** `test@example.com`
*   **Password:** `Password123`

---

## 2. Ports & Local Servers

*   **Frontend (Next.js):** [http://localhost:3000](http://localhost:3000)
*   **Backend (NestJS API):** [http://localhost:5000/api](http://localhost:5000/api)
*   **Database (PostgreSQL):** `postgresql://postgres:Missionpostgres@localhost:5432/prepapp`

---

## 3. Key Pages & Routes

*   `/` : User Dashboard (stats and topics)
*   `/tests` : Browse and filter tests/PYQs
*   `/exam/[attemptId]` : Full-screen live exam taking (features anti-cheat timer and question palette)
*   `/results/[attemptId]` : Results summary with explanation sheets
*   `/admin` : Admin portal homepage
*   `/admin/import` : Bulk import portal using local JSON uploads, PYQ schema converter, or AI PDF parsing (`pdftojson` microservice)

---

## 4. DB Sync Automation

*   `sync-db.ps1`: Restores the master laptop database locally.
*   `sync-local-to-master.ps1`: Puts local changes back onto the master host.

---

## 5. Development Status

*   **NestJS Backend Dev Server:** Stopped.
*   **Next.js Frontend Dev Server:** Stopped.

---

## 6. Document Updates (July 15, 2026)

Created and updated documentation files detailing application design and logic:
*   [prd.md](file:///C:/Users/siddh/Desktop/prepapp/prd.md) — Product Requirement Document (App overview, target audience, specific problems solved).
*   [trd.md](file:///C:/Users/siddh/Desktop/prepapp/trd.md) — Technical Requirement Document (Tech stack table, endpoints, constraints and solutions).
*   [app-flow.md](file:///C:/Users/siddh/Desktop/prepapp/app-flow.md) — App flow diagram (Candidate and Admin journeys) and screen navigation details.
*   [backend-schema.md](file:///C:/Users/siddh/Desktop/prepapp/backend-schema.md) — Backend schema description, user database attributes, lifecycle, and API methods.
*   [architecture.md](file:///C:/Users/siddh/Desktop/prepapp/ARCHITECTURE.md) — Updated database model structures, admin app routes, and admin API endpoints to match the current implementation.

---

## 7. Feature Updates: Bulk Delete Questions & Main Sync (September 1, 2026)

### A. Bulk Delete Questions Functionality
Added multi-selection and bulk deletion capability on the Admin Questions management page:
*   **Frontend ([`client/src/app/admin/questions/page.tsx`](file:///C:/Users/siddh/desktop/prepapp/client/src/app/admin/questions/page.tsx)):**
    *   **Select-All Header Bar:** Supports "Select all on this page", indeterminate checkbox state, selected count display, "Deselect all", and "Delete Selected (X)" button.
    *   **Row-Level Checkboxes:** Checkbox next to question serial numbers to toggle selection for individual questions.
    *   **Row Highlight:** Visual highlight for selected questions.
    *   **Confirmation & Feedback:** Deletion confirmation dialog and spinner feedback during deletion.
*   **Backend ([`server/src/admin/admin.controller.ts`](file:///C:/Users/siddh/desktop/prepapp/server/src/admin/admin.controller.ts) & [`server/src/admin/admin.service.ts`](file:///C:/Users/siddh/desktop/prepapp/server/src/admin/admin.service.ts)):**
    *   **Endpoint:** `POST /api/admin/questions/bulk-delete` accepting an array of question IDs (`{ ids: string[] }`).
    *   **Cascading Clean-up:** Automatically cleans linked `Response` and `Option` records before deleting questions to avoid foreign-key constraint violations.

### B. Git Branch & Remote Sync
*   **Feature Branch:** Created and pushed `feature/bulk-delete-questions`.
*   **Main Branch Sync:** Pulled and merged latest commits from `origin/main` (auth/login/signup updates & navbar enhancements) into `feature/bulk-delete-questions` and updated local `main`.
