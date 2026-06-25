# PrepApp Git Commits Analysis Log

This document maps out and analyzes the historical progression of the PrepApp project based on its git commit history. It groups the evolution into logical development phases and details the contribution of individual commits.

---

## ── Development Timeline & Evolution Phases ──

The project's evolution can be broken down into **10 major milestones**:

```
[Phase 1] Setup & DB Fixes ──────► [Phase 2] Type Safety Cleanup ──► [Phase 3] Architecture & Sync
                                                                               │
[Phase 6] Analytics & Schema ◄──── [Phase 5] UI Details & Search  ◄─ [Phase 4] Timer & Responsive
       │
[Phase 7] UPSC Simulator ────────► [Phase 8] Admin Panel & AI ────► [Phase 9] Core Bug Squashing
                                                                               │
                                                                   [Phase 10] Dynamic Inputs Refactor
```

### Phase 1: Setup and Database Connection Fixes
*   Converts client from a submodule to a standard directory to simplify monorepo file tracking.
*   Fixes database connection ports (changing host configs to target the correct local Postgres ports) and updates submit button behaviors.
*   Introduces environment template configuration files (`.env.example`) and builds the `.gitignore` setup to keep secrets out of version control.

### Phase 2: Type Safety and Code Cleanups
*   Fixes TypeScript compiler warnings and type errors across client and server.
*   Enforces code cleanliness by removing unused imports, dead variables, and code anti-patterns.

### Phase 3: Infrastructure, Architecture, and Sync Utilities
*   Creates `sync-db.ps1` and `sync-local-to-master.ps1` scripts, moving from hardcoded IPs to network hostnames to make team syncing robust.
*   Adds architectural specifications, bootstrap procedures, and directories (`db-backups`).

### Phase 4: Exam Simulator Timer & Layout Polish
*   Solves the critical bug where reloading the web page during an exam reset the timer. Time elapsed is now calculated relative to the start time on the server.
*   Refines mobile and tablet responsive layouts for taking tests and polishes CSS for the timer widget.

### Phase 5: Search Enhancements, Theme Engine, and Profile Section
*   Consolidates the global header navbar: moves the theme toggler and logout actions inside the My Profile dropdown to free up screen real estate.
*   Integrates a search bar on `/tests` and adds debouncing logic to prevent API flooding when typing.
*   Integrates initial sets of Previous Year Question (PYQ) tests.

### Phase 6: Analytics Debugging & Database Migration
*   Resolves a crash in the analytics dashboard where a user with zero attempts triggered a division-by-zero database calculation error.
*   Migrates database tables to accommodate new user information fields (dob, tiering, mobileNumber, location, etc.).
*   Fixes dashboard padding constraints.

### Phase 7: UPSC Exam Interface Simulator
*   Implements a custom fullscreen mock-exam page with general instructions and warning alerts before launching a test.
*   Integrates year-based PYQ tests and updates redirection filters (`/pyq` -> `/tests?tab=pyq`).

### Phase 8: Database Administration Dashboard & AI PDF Parser
*   Introduces a secure admin dashboard `/admin` to handle Subjects, Topics, Tests, and Questions.
*   Integrates the external `pdftojson` AI layout extractor proxy inside [admin.service.ts](file:///C:/Users/siddh/desktop/prepapp/server/src/admin/admin.service.ts) to upload question banks directly from official PDF files.

### Phase 9: Debugging & System Integration
*   Fixes login/signup callback routing.
*   Corrects options editing logic inside the Admin console.
*   Fixes critical bugs in `exam.service.ts` scoring and completion updates.
*   Adds a global layout footer to the landing pages.

### Phase 10: Dynamic Combobox Inputs Refactoring
*   Refactors question creator forms to use dual-purpose search/insert `<datalist>` comboboxes so that topics and sub-topics can be searched and added inside the same input text fields.
*   Redesigns the [import-pyq.ts](file:///C:/Users/siddh/desktop/prepapp/server/prisma/import-pyq.ts) database seeder to match nested parent-topic/sub-topic models.

---

## ── Detailed Commit Registry ──

Below is a complete record of every commit, sorted from newest to oldest.

| Commit Hash | Commit Message | Key Changes & Structural Contributions |
| :--- | :--- | :--- |
| **`2a1858e`** | fixed schema of question adding to database in admin | Modified [import-pyq.ts](file:///C:/Users/siddh/desktop/prepapp/server/prisma/import-pyq.ts) to match the new nested parent topic/subtopic structure and map CSV question grids correctly. |
| **`8da2768`** | fixed edit options for creating questions | Replaced separate admin topic/subtopic buttons with dynamic input datalists in [questions/page.tsx](file:///C:/Users/siddh/desktop/prepapp/client/src/app/admin/questions/page.tsx). |
| **`8fb028d`** | fixed test | Addressed minor bugs or edge cases in backend tests/endpoints. |
| **`7fec3af`** | debug exam.service.ts | Resolved score checking and answer submission edge cases. |
| **`eaf6afa`** | Merge pull request #11 from Naman343/feature/debugEditOption | Merges option editing optimizations. |
| **`7e5ae58`** | Merge origin/main into feature/debugEditOption and resolve conflicts | Synced branches and resolved structural conflicts. |
| **`0d066f2`** | Merge pull request #10 from Naman343/feature/new-footer | Integrates a new footer layout across the client interface. |
| **`6d50981`** | new footer added | Implemented landing page footer. |
| **`9d1eeb3`** | fix exam-service-bugs | Debugged ongoing mock-test response saving anomalies. |
| **`c71bb3c`** | fix login-bugs | Debugged user auth/redirection state delays on local page transitions. |
| **`7fbb353`** | fixed edit option | Handled state refresh constraints when modifying question options. |
| **`97cca17`** | added edit question option in admin pannel | Added GUI editing fields for changing existing questions/options. |
| **`8c5120e`** | integrated pdftojson project to this project | Added PDF-to-JSON AI extraction route and service mapping. |
| **`0c4e647`** | created admin pannel for database | Created admin pages under `/admin` for subjects, topics, and tests. |
| **`a6d14d7`** | fix pyq-test-page-correction | Standardized path routing from `/pyq` to tests filtering. |
| **`7ea3021`** | fix home-page-slider | Fixed scrolling image sliders on the home page dashboard. |
| **`d8b8a36`** | Merge pull request #9 from Naman343/feature/test | Integrates mock simulation upgrades. |
| **`c3d3e0b`** | updated test full screen,general instruction and warning | Added instructions before beginning tests and created a dedicated full-screen layout. |
| **`9bbcc7c`** | updated pyq tests | Included more sample tests in the seeder. |
| **`3dade1d`** | Merge pull request #8 from Naman343/feature/dashboardmargin | Layout spacing optimization. |
| **`b55d43e`** | fix navbardashboard margin | Refined padding on main dashboard wrapper elements. |
| **`ee0c7d3`** | fix myaccount changes | Fixed state update logic in user profile dashboard. |
| **`9aeb5bf`** | fix saved changes | Corrected persistence issues in local profile form. |
| **`9885e72`** | Merge pull request #7 from Naman343/feature/analyticsbug | Analytics resolution. |
| **`8860738`** | bug service unavailable in my performance | Fixed mathematical dividing-by-zero crashes on analytics computation logic. |
| **`145d4bd`** | Merge pull request #6 from Naman343/feature/schema | Database layout evolution. |
| **`7b0bbf2`** | updated schema | Modified database scheme properties to host extra user configuration elements. |
| **`c1b4c0e`** | Merge pull request #5 from Naman343/feature/myprofile | Profile dashboard feature enhancements. |
| **`f405d47`** | enhanced myprofile section | Integrated updated styles and detail inputs for profile configuration. |
| **`bd49370`** | added debouncing logic in search bar | Added 300ms input debouncing logic on search bars to limit server request volume. |
| **`eaa989f`** | search bar enhanced | Styled and connected search functionality to the backend tests list. |
| **`3f88196`** | added pyq tests, search icon and moved theme toggle and logout inside my profile | Refined layout, consolidated theme buttons, and set up logout redirects. |
| **`a0c5562`** | Merge pull request #4 from Naman343/feature/hoverButtonHomepage | Interactive animation features. |
| **`39b0817`** | Merge pull request #3 from Naman343/siddh/setup-and-docs | Repository layout documentation. |
| **`6e6e18d`** | hover added and card button arrow hover | Added hover visual animations to primary landing elements. |
| **`a92884b`** | toggle-theme button work | Integrated dark/light mode toggles with standard next-themes wrapper. |
| **`09d8f7d`** | timer css updated | Styled timer component to float dynamically on exam screens. |
| **`eebc216`** | timer fixed in refresh | Fixed timer state resets by linking clock relative to start timestamps. |
| **`c3522ab`** | time remaining css fixed | Aligned visual positions of exam timing labels. |
| **`edf5127`** | added responsive to test | Adjusted exam palette and card layout wrappers to wrap correctly on small devices. |
| **`660d66f`** | chore: use hostname instead of IP in sync script | Replaced local IP strings with target hostname pointers inside Postgres sync. |
| **`41c3bd8`** | chore: add architecture docs, setup guide, DB sync script, and gitignore | Configured repository synchronization tools, setups, and git tracking files. |
| **`5f11acd`** | chore: use hostname instead of IP in sync script | Replaced IP values with static system names. |
| **`05bfa56`** | chore: add architecture docs, setup guide, DB sync script, and gitignore | Standard structural updates. |
| **`6a7cb86`** | Merge pull request #2 from Naman343/fix/type-safety-and-unused-vars | Integrates codebase type stability. |
| **`0044bee`** | Fix frontend and backend typing issues, warnings, and anti-patterns | Cleared compilation barriers and cleaned compiler warnings. |
| **`af4c66c`** | chore: remove tracked build artifacts and update gitignore | Stopped tracking compiler artifact directories (`.next`, `dist`, etc.). |
| **`e1939b9`** | Merge pull request #1 from Naman343/fix/db-and-submit-button | Pull request merging db modifications. |
| **`ea722b6`** | docs: add .env templates and update gitignore | Configured `.env.example` configurations. |
| **`e8382a9`** | fix: resolve db connection port and enhance submit button reliability | Solved backend DB client initialization failures. |
| **`b588a21`** | Convert client submodule to normal directory | Unlinked Git submodules inside the monorepo. |
| **`b731847`** | commit | Initial developer snapshot. |
| **`59e92a2`** | commit | Initial commit representing core files baseline. |
