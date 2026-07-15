# Product Requirement Document (PRD) — PrepApp

## 1. Document Overview
*   **Product Name:** PrepApp
*   **Document Version:** 1.0.0
*   **Target Release:** Phase 1 (Core MCQ Engine + AI Admin Importer)
*   **Document Status:** Approved

---

## 2. Executive Summary
**PrepApp** is a full-stack, multi-user exam preparation platform optimized specifically for UPSC (Union Public Service Commission) Civil Services MCQ-style examinations. It combines a distraction-free exam simulator for aspirants with a powerful, AI-driven PDF-to-JSON question bank importer for administrators.

---

## 3. What We Are Building
We are building a responsive web-based monorepo consisting of:
1.  **Student Portal (Next.js):** 
    *   **User Dashboard:** At-a-glance performance tracking showing tests taken, average score, and accuracy percentage.
    *   **Interactive Exam Simulator:** A full-screen interface mimicking the real UPSC exam experience. It includes a server-synchronized countdown timer (preventing page-reload resets) and a color-coded question palette indicating visited, answered, and flagged questions.
    *   **Comprehensive Analytics:** Automatically rates user accuracy per subject/topic into three tiers: **STRONG** ($\ge$ 70%), **MODERATE** (40-69%), and **WEAK** ($<$ 40%) to guide studying strategy.
2.  **Admin Control Panel:**
    *   **Subjects & Topics CRUD:** Interface to manage hierarchical subjects and nested sub-topics.
    *   **AI-Powered PDF Importer:** Uploads exam PDFs, processes layout-aware text/tables via a coordinate parser, sends prompts to an LLM provider (Groq or Hugging Face), validates the extracted JSON, and seeds the questions in a single transaction.
3.  **Backend REST API Service (NestJS):**
    *   Handles authentication, authorization (JWT roles), UPSC scoring mechanics (+2.0 marks for correct answers, -0.66 marks for wrong answers), deterministic question shuffling, and database transactions.

---

## 4. Who We Are Building For (Target Audience)
1.  **UPSC CSE Aspirants:** Serious candidates looking to test their knowledge, practice past year papers, and identify specific weaknesses in history, polity, geography, economy, etc.
2.  **Educators & Content Administrators:** Platform owners who need to quickly upload and digitize past year questions (PYQs) and monthly mock tests from PDF formats without manual transcription.

---

## 5. Why We Are Building It (Value Proposition)
The UPSC Civil Services Examination is one of the toughest tests in the world, with over 1 million applicants competing for under 1,000 slots (a success rate of less than 0.1%). Aspirants fail not due to a lack of reading materials, but due to a lack of targeted practice and objective feedback. 

Existing test platforms are either too generic or make content curation extremely slow. PrepApp fills this gap by offering:
*   **For Aspirants:** Highly granular topic-level feedback so they can spend their precious study hours fixing weak points rather than repeating strong ones.
*   **For Admins:** A transition from manual, error-prone database entry to a 1-click AI PDF parser.

---

## 6. What Specifically Is the Problem We Are Solving?

### Problem A: The "Coarse Analytics" Trap
*   **The Issue:** Typical mock tests only give students their final score (e.g., 90/200). They don't tell the student *where* they went wrong.
*   **Our Solution:** PrepApp logs responses down to nested sub-topics. It aggregates analytics automatically, classifying topics into STRONG, MODERATE, or WEAK. An aspirant immediately knows if they need to study the "Non-Cooperation Movement" instead of generally reading "History."

### Problem B: Exam Room Panic (Simulator Resets)
*   **The Issue:** Many online mock tests reset the timer if a user accidentally refreshes the page or experiences network drops. This destroys exam discipline.
*   **Our Solution:** PrepApp calculates remaining time relative to the server-side start timestamp. Refreshing the browser does not reset the clock.

### Problem C: The "Digitization Bottleneck" for Administrators
*   **The Issue:** UPSC question papers and mock tests are typically distributed as PDFs. Digitizing a 100-question PDF (copying text, structuring four options, marking the correct option, and writing explanations) takes an admin 3 to 4 hours per paper.
*   **Our Solution:** Our custom **AI PDF Parser (`pdftojson`)** extracts tables and coordinate-based text, uses LLM chunking/merging to construct a validated schema, and seeds a 100-question exam in under 2 minutes.

---

## 7. Key Product Features

### Module 1: Auth & User Management
*   Secure Login & Signup (JWT + local password hashing via bcrypt).
*   User Profile profiles (date of birth, category, membership tiering: FREE, PRO, MAX).

### Module 2: Exam Simulation Engine
*   UPSC scoring scheme (+2.0 marks for correct, -0.66 marks for incorrect, 0 for unattempted).
*   Deterministic shuffling of questions per attempt.
*   Auto-submission of attempts when the server countdown timer hits zero.

### Module 3: Dynamic Combobox Form Fields
*   Double-purpose text datalist inputs allowing admins to search existing topics or dynamically create new ones on the fly inside the same question editor.

### Module 4: PDF Extraction & Parser Settings
*   Supports Groq & Hugging Face.
*   Configurable focus modes: Balanced (completeness), Focused (record-level constraint), and Exhaustive (maximum recall).
*   Mojibake heuristic checker to automatically clean encoding errors (like CP1252 to UTF-8 errors) during PDF reading.
