# Aggroso — Grant Application Completeness Assistant

Aggroso is an AI-powered enterprise platform designed to review draft funding and grant applications against official grant guideline documents prior to submission.

It performs an **evidence-based completeness assessment** using **Google Gemini 2.5 Flash** and **InsForge BaaS**. The system extracts eligibility and submission requirements from guidelines, matches exact evidence quotes from draft applications, flags unverified/unsupported claims, generates clarification questions, and provides an interactive 5-tab review dashboard with human-in-the-loop status overrides.

> [!IMPORTANT]
> **Disclaimer:** This tool provides an evidence-based completeness review. It does NOT make authoritative legal or funding-eligibility decisions. The final submission decision remains with the user and the grant organization.

---

## Key Features

- 📂 **Workspace Dashboard:**
  - Responsive workspace grid displaying all your grant reviews.
  - Interactive **Rename** and **Delete** modals with instant UI updates.
  - **Storage Automatic Cleanup:** Deleting a review automatically purges all associated PDF files (`Guideline`, `Draft Application`, `Supporting Documents`) from InsForge Cloud Storage.

- 📤 **2-Step Upload & Dynamic Preview:**
  - **Step 1 (Upload Modal):** Select required Grant Guideline, required Draft Application, and optional Supporting PDFs.
  - **Step 2 (Fixed Preview Grid):** Dynamic side-by-side PDF preview grid that automatically optimizes layout space depending on whether 1, 2, 3, or more PDFs are selected.

- 🤖 **Real AI Analysis Pipeline:**
  - Powered by **Google Gemini 2.5 Flash** with native PDF multimodal parsing.
  - Programmatic deterministic completion calculation (`%` of mandatory requirements satisfied).
  - Strict JSON schema validation with fallback error boundaries.

- 📊 **5-Tab Reviewer Dashboard (`/reviews/[projectId]`):**
  1. **Requirements:** Detailed requirement cards with importance badges (`Mandatory`, `Recommended`, `Informational`), AI explanations, page numbers, exact quote citations, and **Human Review Action Buttons** (`Mark Complete`, `Needs Review`, `Mark Missing`).
  2. **Supporting Documents:** Tracks all project documents with upload timestamps and type badges (`GUIDELINE`, `DRAFT_APPLICATION`, `SUPPORTING`).
  3. **Unsupported Claims:** Identifies statements in the draft application that lack supporting evidence, citing quotes and gap analysis.
  4. **Questions:** Renders AI-generated clarification questions based on missing requirements.
  5. **History:** Real-time audit log of reviewer actions, status transitions, and timestamped reviewer notes.

- 🔐 **Authentication & Security:**
  - InsForge SSR Authentication (Email/Password & Google OAuth).
  - Row Level Security (RLS) enforcement across Postgres database tables.
  - Server-side file validation (PDF MIME type enforcement and 25 MB max file size limit).
  - Untrusted data isolation in AI prompts to prevent prompt injection.

---

## Scope Overview

### Completed Scope
- Full multi-document upload and side-by-side preview system.
- Complete AI analysis workflow using Gemini 2.5 Flash.
- Automated extraction of requirements, citations, gap analysis, and clarification questions.
- Interactive human reviewer override system storing reviewer actions.
- Workspace document management (renaming, deleting, InsForge Cloud Storage purging).
- Full InsForge database persistence and SSR session authentication.

### Intentionally Excluded Scope
- Automated OCR processing for scanned image-only PDFs (currently native text/PDF format is supported).
- Real-time collaborative multi-user editing sockets (handled via SSR request refreshes).

---

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, TypeScript, React 19)
- **Backend as a Service (BaaS):** [InsForge](https://insforge.dev) (Postgres Database, RLS, File Storage, Auth)
- **AI Model:** [Google Gemini 2.5 Flash](https://ai.google.dev/) via `@google/genai`
- **Styling & UI:** Tailwind CSS v4, `@shadcn/ui`, Lucide Icons, Google Fonts (`Inter` & `Plus Jakarta Sans`)
- **SDKs:** `@insforge/sdk`, `@insforge/sdk/ssr`

---

## Architecture & Project Structure

```text
aggroso/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/            # Auth callbacks & refresh handlers
│   │   │   ├── projects/        # POST (upload & analyze), DELETE, PATCH (rename)
│   │   │   └── reviews/action/  # POST (human reviewer status overrides)
│   │   ├── dashboard/           # Workspace dashboard & ProjectCard components
│   │   ├── login/               # Authentication page & server actions
│   │   ├── reviews/
│   │   │   ├── [projectId]/     # 5-tab review assessment dashboard & RequirementCard
│   │   │   └── new/             # Upload modal & dynamic PDF preview grid
│   │   ├── globals.css          # Core design tokens & typography
│   │   ├── layout.tsx           # Root layout with Inter & Plus Jakarta Sans fonts
│   │   └── page.tsx             # Landing hero & workflow overview
│   ├── components/
│   │   └── ui/                  # Primitive UI components (Button, Card, Badge, Modal, etc.)
│   ├── lib/
│   │   ├── ai/prompts/          # Structured AI prompts & schemas
│   │   ├── insforge.ts          # InsForge client instantiation
│   │   └── utils.ts             # Tailwind class merging helper
│   └── proxy.ts                 # Next.js authentication middleware handler
├── .env.example                 # Example environment variables template
├── AGENT_USAGE.md               # Agentic tool usage report
├── AGENTS.md                    # InsForge agent specifications
├── package.json                 # Node dependencies
└── README.md                    # Project documentation
```

---

## Environment Configuration

Copy `.env.example` to `.env.local`:

Run this command

```bash
cp .env.example .env.local
```
OR

Populate the required keys in `.env.local`:

```env
NEXT_PUBLIC_INSFORGE_URL=your_insforge_url_here
NEXT_PUBLIC_INSFORGE_ANON_KEY=your_insforge_anon_key_here
GEMINI_API_KEY=your_google_gemini_api_key_here
NEXT_PUBLIC_APP_URL=https://your_app_domain.site
```

---

## Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/prakharsingh-74/Aggroso-Assg.git
   cd aggroso
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Database Migration Setup:**
   After setting up your project on InsForge, open the **SQL Editor** in the InsForge dashboard, copy the contents of [`migrations/0001.sql`](migrations/0001.sql), and run the SQL query to create all required database tables (`projects`, `documents`, `assessments`, `requirements`, `evidence_mappings`, `evidences`, `unsupported_claims`, `clarification_questions`, `review_actions`).

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

5. **Access Application:**
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## AI & Data Workflow

1. **Document Ingestion:** PDFs are validated on the server for size/type, hashed (SHA-256), uploaded to InsForge Storage (`documents` bucket), and recorded in the database.
2. **Multimodal Analysis:** Guideline and Draft Application PDFs are sent directly to **Gemini 2.5 Flash** as inline multimodal buffers.
3. **Structured Extraction:** Gemini extracts requirements, maps citations with exact page quotes, flags unsupported claims, and outputs clarification questions.
4. **Deterministic Completion:** The completion score is calculated programmatically (`complete / total_mandatory`), guaranteeing consistent metrics without LLM hallucinations.
5. **Human Review Overrides:** Reviewers can manually override any AI status (`Mark Complete`, `Needs Review`, `Mark Missing`). Each override is recorded in the `review_actions` table and updated in real-time.

---

## Testing & Quality Assurance

- **Type Checking:** Strict static type safety enforced with TypeScript (`npx tsc --noEmit`).
- **Server Handler Tests:** Verified API endpoints (`/api/projects`, `/api/projects/[id]`, `/api/reviews/action`) for authorization checks, 25MB file limits, and error handling.
- **Workflow Verification:** Verified multi-file PDF preview grid, InsForge storage object purging, and reviewer status overrides.

---

## Limitations

1. **Scanned Documents:** Image-only scanned PDFs without embedded text layers require OCR pre-processing before ingestion.
2. **File Size Limit:** Server upload validator enforces a 25MB limit per PDF file to ensure optimal API payload handling.

---

## Deployment & Hosting Details

- **Live Application URL:** [https://3q7gyfhb.insforge.site](https://3q7gyfhb.insforge.site)
- **Deployment Platform:** InsForge Cloud Deployments
- **Backend Service:** InsForge Cloud (Postgres Database & Storage)
- **Environment Setup:** `NEXT_PUBLIC_INSFORGE_URL`, `NEXT_PUBLIC_INSFORGE_ANON_KEY`, and `GEMINI_API_KEY` are configured.
