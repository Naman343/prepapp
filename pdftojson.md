# pdftojson — Complete Project Summary

> Last updated: March 13, 2026  
> Purpose: Convert any PDF document into structured JSON (or CSV / SQL / TSV) using an AI extraction agent.

---

## Table of Contents

1. [What This Project Does](#1-what-this-project-does)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [How to Install](#4-how-to-install)
5. [How to Run](#5-how-to-run)
6. [Architecture & Data Flow](#6-architecture--data-flow)
7. [File-by-File Breakdown](#7-file-by-file-breakdown)
8. [Schema Format](#8-schema-format)
9. [Output Formats](#9-output-formats)
10. [Chunking Strategies](#10-chunking-strategies)
11. [Focus Modes](#11-focus-modes)
12. [LLM Providers & Models](#12-llm-providers--models)
13. [API Reference (Web)](#13-api-reference-web)
14. [CLI Reference](#14-cli-reference)
15. [Python API Reference](#15-python-api-reference)
16. [Example Schemas](#16-example-schemas)
17. [Environment Variables](#17-environment-variables)
18. [Key Design Decisions](#18-key-design-decisions)

---

## 1. What This Project Does

`pdftojson` takes a PDF file and a user-defined **JSON schema** and asks an LLM (Groq or Hugging Face) to extract only the data that matches the schema, returning clean, validated JSON. It can also output CSV, TSV, SQL (multiple dialects), and MongoDB-ready JSON.

**Real-world use cases:**
- Extracting all multiple-choice questions from UPSC exam PDFs into JSON/CSV
- Parsing company reports into structured company/product/team records
- Converting scanned tables in PDFs to SQL INSERT statements
- Any "PDF → structured data" transformation task

**Key capabilities:**
| Capability | Detail |
|---|---|
| Layout-aware text extraction | pdfplumber's coordinate-based extractor preserves multi-column reading order |
| Table parsing | Extracts tables and renders them as Markdown pipe tables for the LLM |
| Large document support | Auto-chunks documents exceeding the context window; merges results |
| Dual LLM support | Groq (default) or Hugging Face Inference API |
| Multi-format output | JSON, CSV, TSV, SQL (generic/PostgreSQL/MySQL/SQLite/SQL Server/Oracle), MongoDB |
| Schema validation | Validates extracted JSON against user schema; reports mismatches |
| Three interfaces | Web UI, CLI, and importable Python API |

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Language | Python | 3.10+ |
| Web framework | FastAPI | ≥ 0.110.0 |
| ASGI server | Uvicorn | ≥ 0.29.0 |
| PDF extraction (primary) | pdfplumber | ≥ 0.9.0 |
| PDF extraction (fallback) | PyMuPDF (`fitz`) | ≥ 1.23.0 |
| LLM — Groq | `groq` Python SDK | ≥ 0.9.0 |
| LLM — Hugging Face | `huggingface_hub` | ≥ 0.27.0 |
| Schema validation | `jsonschema` | ≥ 4.17.0 |
| Env variable management | `python-dotenv` | ≥ 1.0.0 |
| File upload parsing | `python-multipart` | ≥ 0.0.9 |
| Frontend | Vanilla HTML/CSS/JS | (no framework) |

**Default AI model:** `moonshotai/kimi-k2-instruct-0905` (via Groq)  
**Fallback AI model:** `moonshotai/Kimi-K2-Instruct` (via Hugging Face)

---

## 3. Project Structure

```
pdftojson/
│
├── agent.py              # Core AI extraction agent (LLM calls, chunking, merging)
├── app.py                # FastAPI web server & REST endpoints
├── main.py               # CLI entry point
├── pdf_parser.py         # PDF → text/table extraction (pdfplumber + PyMuPDF)
├── pdftojson.py          # High-level Python API (importable module)
├── schema_validator.py   # Validates extracted JSON against a simple type schema
│
├── requirements.txt      # Python dependencies
├── README.md             # Original quick-start readme
│
├── templates/
│   └── index.html        # Web UI (single page, dark-themed, no framework)
│
├── static/               # Static assets (currently empty; CSS/JS lives inline in index.html)
│
└── examples/
    ├── company_schema.json    # Example: company report schema
    └── upsc_pyq_schema.json   # Example: UPSC exam MCQ schema
```

---

## 4. How to Install

```bash
# 1. Clone / copy this project
cd pdftojson

# 2. Create a virtual environment (recommended)
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
# source .venv/bin/activate

# 3. Install all dependencies
pip install -r requirements.txt

# 4. Set up your API key in a .env file
# Create a file named .env in the project root with one of:
GROQ_API_KEY=your_groq_key_here
# OR
HF_TOKEN=your_huggingface_token_here
```

**Getting API keys:**
- Groq: https://console.groq.com → free tier available
- Hugging Face: https://huggingface.co/settings/tokens → Inference API access needed

---

## 5. How to Run

### Web UI (recommended)

```bash
uvicorn app:app --reload
```

Then open **http://127.0.0.1:8000** in your browser. You'll get a dark-themed single-page app where you can:
- Drag-and-drop or select a PDF
- Paste or use a preset JSON schema
- Choose output format, focus mode, chunking strategy, LLM provider
- Click "Extract" and see/download the result

### CLI

```bash
# Basic — outputs JSON to stdout
python main.py report.pdf schema.json

# Save to file
python main.py report.pdf schema.json -o output.json

# Use Hugging Face
python main.py report.pdf schema.json --provider huggingface

# Override model
python main.py report.pdf schema.json --model llama-3.3-70b-versatile

# Skip validation
python main.py report.pdf schema.json --no-validate
```

### Python API

```python
from pdftojson import PDFToJSON, load_schema

schema = load_schema("examples/company_schema.json")

converter = PDFToJSON(provider="groq")  # reads GROQ_API_KEY from .env
result = converter.convert("report.pdf", schema)
print(result)  # → Python dict

# Write directly to a file
converter.convert_to_file("report.pdf", schema, "output.json")
```

### Running tests (no test suite yet)

```bash
# Manually verify with a sample PDF
python main.py examples/test.pdf examples/company_schema.json
```

---

## 6. Architecture & Data Flow

```
User supplies: PDF file + JSON schema + instructions
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  INTERFACE LAYER                                                │
│  ┌──────────┐   ┌──────────────┐   ┌───────────────────────┐  │
│  │ Web UI   │   │  CLI         │   │  Python API           │  │
│  │ (FastAPI)│   │  (main.py)   │   │  (pdftojson.py)       │  │
│  └────┬─────┘   └──────┬───────┘   └──────────┬────────────┘  │
└───────┼─────────────────┼──────────────────────┼───────────────┘
        │                 │                      │
        └─────────────────┴──────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  PDF PARSING  (pdf_parser.py)                                   │
│                                                                 │
│  pdfplumber (primary)         PyMuPDF/fitz (fallback)          │
│  • coordinate layout          • plain text extraction          │
│  • table extraction           • used when pdfplumber fails     │
│  • Markdown pipe tables       • no table support               │
│  • mojibake repair            • mojibake repair                │
│                                                                 │
│  Output: "=== PAGE N ===\nTABLES:\n...\nTEXT:\n..."           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  AI EXTRACTION AGENT  (agent.py — PDFExtractionAgent)          │
│                                                                 │
│  1. SIZE CHECK                                                  │
│     ≤ 14,000 chars total → single-pass extraction              │
│     > 14,000 chars total → chunked extraction                  │
│                                                                 │
│  2. CHUNKING (if needed)                                        │
│     mode=page      → split by "=== PAGE N ===" markers         │
│     mode=numbered  → split by numbered items (1. 2. 3.)        │
│     mode=auto      → page first, numbered fallback, window last│
│     mode=window    → fixed 20,000-char windows w/ 2,000 overlap│
│                                                                 │
│  3. LLM CALL (per chunk)                                        │
│     Groq API  OR  Hugging Face InferenceClient                 │
│     temp=0.1, max_tokens=16384 (Groq) / 8192 (HF)             │
│                                                                 │
│  4. MERGE (if chunked)                                         │
│     Fast-merge: local array concat when all fields are arrays  │
│     LLM-merge: send all partials back to LLM for merge         │
│                                                                 │
│  5. JSON CLEANUP                                                │
│     Strip accidental ```json fences from model output          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  SCHEMA VALIDATION  (schema_validator.py)                      │
│                                                                 │
│  • Validates extracted dict against type-string schema         │
│  • Returns (True, "") or (False, reason)                       │
│  • null is always valid (missing fields)                       │
│  • Does NOT raise — only warns                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    Result returned to user
         (JSON dict / SQL string / CSV string / TSV string)
```

---

## 7. File-by-File Breakdown

### `agent.py` — Core AI Extraction Agent

**Class:** `PDFExtractionAgent`

**Constants:**
- `_MAX_CHUNK_CHARS = 20_000` — maximum characters per chunk sent to LLM
- `_SINGLE_PASS_LIMIT = 14_000` — documents below this are not chunked
- `_CHUNK_OVERLAP_CHARS = 2_000` — overlap between consecutive chunks to preserve context

**Constructor:** `__init__(provider, api_key, model)` — initializes either a Groq client or a HuggingFace InferenceClient.

**Main method:** `extract(pdf_content, schema, instructions, output_format, focus_mode, chunk_mode)`
- Routes to `_single_extract` or `_chunked_extract` for JSON output
- Routes to `_extract_freeform` for SQL/CSV/TSV/MongoDB output

**Key internal methods:**

| Method | Purpose |
|---|---|
| `_single_extract` | Single LLM call with full PDF + schema |
| `_chunked_extract` | Split → extract each chunk → merge |
| `_merge_chunks` | LLM-merge or fast-merge of partial results |
| `_try_fast_merge` | Local array concatenation (no LLM call) when all fields are arrays |
| `_extract_freeform` | Non-JSON output: SQL, CSV, TSV, MongoDB |
| `_split_into_chunks` | Routes to correct chunking strategy |
| `_split_by_page_markers` | Splits on `=== PAGE N ===` lines |
| `_split_by_numbered_blocks` | Splits on `1.` `2.` `3.` numbered items |
| `_split_by_window` | Fixed-size window with overlap |
| `_pack_segments_into_chunks` | Packs semantic segments into max-size chunks |
| `_merge_tabular_parts` | Merges CSV/TSV parts, deduplicates rows |
| `_merge_sql_parts` | Merges SQL parts, deduplicates statements |
| `_merge_text_parts` | Merges text parts, deduplicates lines |
| `_call_llm` | Unified LLM call for Groq and HuggingFace |
| `_clean_json_text` | Strips ` ```json ` fences from model response |
| `_parse_json` | Parses JSON with helpful error messages |
| `_build_focus_block` | Builds focus-mode prompt prefix |
| `_get_output_format_instruction` | Returns format-specific instructions for SQL/CSV/TSV |

**System prompt highlights (SYSTEM_PROMPT):**
- Extract ONLY data that maps to schema fields
- Ignore page numbers, headers, footers, diagrams, answer keys
- Read multi-column text in correct left-to-right order
- Use `null` for missing fields — never hallucinate
- Output ONLY raw JSON, no markdown fences

---

### `app.py` — FastAPI Web Application

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Serves `templates/index.html` (the web UI) |
| `GET` | `/health` | Health check |
| `POST` | `/extract` | Main extraction endpoint |

**`POST /extract` parameters (multipart form):**

| Field | Type | Default | Description |
|---|---|---|---|
| `pdf_file` | File | required | The PDF to process |
| `schema` | string | `"{}"` | JSON schema string (required for JSON output) |
| `instructions` | string | `""` | Free-text instructions to the LLM |
| `output_format` | string | `"json"` | json / csv / tsv / sql / postgresql / mysql / sqlite / sqlserver / oracle / mongodb |
| `focus_mode` | string | `"balanced"` | balanced / focused / exhaustive |
| `chunk_mode` | string | `"auto"` | auto / page / numbered / window |
| `provider` | string | `"groq"` | groq / huggingface |
| `model` | string | `""` | Model override (empty = provider default) |

**Response (JSON output format):**
```json
{
  "success": true,
  "pages": 12,
  "provider": "groq",
  "model": "moonshotai/kimi-k2-instruct-0905",
  "format": "json",
  "focus_mode": "balanced",
  "chunk_mode": "auto",
  "schema_valid": true,
  "validation_note": null,
  "data": { ... extracted data ... }
}
```

**Response (SQL/CSV/TSV/MongoDB):**
```json
{
  "success": true,
  "pages": 12,
  "provider": "groq",
  "model": "...",
  "format": "csv",
  "focus_mode": "balanced",
  "chunk_mode": "auto",
  "raw_output": "question_no,question_text,option_a,..."
}
```

**Validation:**
- File must be a `.pdf`
- `output_format`, `focus_mode`, `chunk_mode`, `provider` must be in allowed sets
- Schema must be valid JSON object (only for `json` format)
- PDF must not be empty
- PDF must contain extractable text (not image-only scans)
- Temp file is always cleaned up in `finally` block

---

### `main.py` — CLI Entry Point

**3-step pipeline:**
1. `[1/3]` Parse PDF via `PDFParser`
2. `[2/3]` AI extraction via `PDFExtractionAgent`
3. `[3/3]` Validate via `SchemaValidator`

**CLI arguments:**
```
positional:
  pdf           Path to the input PDF file
  schema        Path to the JSON schema file

optional:
  -o FILE       Write output to FILE (default: stdout)
  --provider    groq | huggingface  (default: from LLM_PROVIDER env or groq)
  --model NAME  Override model name
  --api-key KEY Provider API key (overrides env var)
  --no-validate Skip schema validation
```

---

### `pdf_parser.py` — PDF Text Extractor

**Class:** `PDFParser`

**Primary method:** `format_for_llm()` — returns a single structured string.

**Output format per page:**
```
=== PAGE 1 ===
TABLES:

Table 1:
| Col A | Col B |
| ----- | ----- |
| val1  | val2  |

TEXT:
Full page text here...
```

**`_extract_with_pdfplumber()` (primary):**
- Uses `page.extract_text(layout=True)` — preserves column order using coordinates
- Extracts tables with `page.extract_tables()` → formats as Markdown pipe tables
- Calls `_fix_encoding()` on all text

**`_extract_with_pymupdf()` (fallback):**
- Used when pdfplumber raises any exception
- Uses `page.get_text("text")` — simpler plain-text extraction
- No table support; text only

**`_fix_encoding(text)`:**
One of the most important helper methods. Repairs **mojibake** — garbled text caused by UTF-8 bytes being incorrectly decoded as cp1252/latin-1.

Algorithm:
1. Score the text by counting known mojibake markers (`Ã`, `Â`, `â€`, etc.)
2. Try re-encoding with `cp1252 → utf-8` and `latin-1 → utf-8`
3. Keep the candidate with a lower score
4. Apply targeted character replacements for stubborn sequences (`â€˜` → `'`, etc.)

**`_format_table(table, table_num)`:**
Renders a pdfplumber table (list of list of strings) as a Markdown pipe table with padded column widths and a header separator row.

---

### `pdftojson.py` — High-level Python API

**Functions:**
- `load_schema(path)` — reads a JSON schema file and returns a dict

**Class:** `PDFToJSON`

**Constructor:** `PDFToJSON(provider, api_key, model, validate=True)`

**Methods:**
- `convert(pdf_path, schema)` → `dict` — full pipeline: parse → extract → validate → return
- `convert_to_file(pdf_path, schema, output_path)` — same but writes to disk

This is the simplest way to use the project programmatically without dealing with the lower-level agent and parser directly.

---

### `schema_validator.py` — Schema Validator

**Class:** `SchemaValidator`

Uses a **simple type-string schema** (not full JSON Schema spec). Recursively walks the schema tree and checks the extracted data at each path.

**Type mapping:**
| Schema string | Python type |
|---|---|
| `"string"` | `str` |
| `"number"` | `int` or `float` |
| `"integer"` | `int` |
| `"boolean"` | `bool` |
| `[{...}]` | `list` of objects |
| `{...}` | `dict` / nested object |

**Important:** `null` / `None` is **always valid** for any field (represents missing data). Validation only warns; it never blocks extraction.

---

### `templates/index.html` — Web UI

Single-page dark-themed app (no framework, ~700 lines, fully self-contained CSS+JS).

**UI Features:**
- Drag-and-drop PDF upload with visual feedback
- Output format tabs: JSON / CSV / TSV / SQL / PostgreSQL / MySQL / SQLite / SQL Server / Oracle / MongoDB
- Schema textarea with **preset buttons** (company schema, UPSC schema)
- Instructions textarea with preset buttons
- Settings grid (3 cols): Provider selector, Chunk Mode selector, Focus Mode selector
- Model name override text input
- Animated spinner during extraction
- Result panel with:
  - Meta badges: pages, provider, model, format, validation status
  - Syntax-highlighted JSON output (keys in blue, strings in green, numbers in yellow, bools in pink, null in gray)
  - Download button (saves as `.json`, `.csv`, `.sql`, or `.tsv`)
  - Copy to clipboard button
- Error box for failed extractions

**JS logic:**
1. Intercepts form `submit`
2. Builds `FormData` with all fields
3. `POST` to `/extract`
4. On success: renders result with syntax highlighting, shows meta badges
5. On error: shows error box

---

### `examples/company_schema.json`

```json
{
  "company_name": "string",
  "founded_year": "number",
  "headquarters": "string",
  "description": "string",
  "products": [{ "name": "string", "description": "string", "price": "number", "category": "string" }],
  "technical_specs": { "language": "string", "framework": "string", "database": "string" },
  "team": [{ "name": "string", "role": "string", "email": "string" }],
  "contact": { "email": "string", "phone": "string", "website": "string" }
}
```

Use this with any company annual report or product brochure PDF.

---

### `examples/upsc_pyq_schema.json`

```json
{
  "questions": [
    {
      "number": "number",
      "question": "string",
      "options": { "a": "string", "b": "string", "c": "string", "d": "string" }
    }
  ]
}
```

Use this with UPSC previous year question paper PDFs to extract all MCQs.

---

## 8. Schema Format

Schemas use a simple **type-string** notation — not the full JSON Schema spec.

```json
{
  "field_name": "string",
  "another_field": "number",
  "optional_field": "boolean",
  "nested_object": {
    "sub_field": "string"
  },
  "array_of_items": [
    {
      "item_field": "string",
      "item_number": "integer"
    }
  ]
}
```

| Value | Meaning |
|---|---|
| `"string"` | Text |
| `"number"` | Int or float |
| `"integer"` | Integer only |
| `"boolean"` | True / False |
| `[{...}]` | Array of objects |
| `{...}` | Nested object |

Any field not found in the PDF is returned as `null`. The LLM is instructed **never** to invent data.

---

## 9. Output Formats

| Format | Description |
|---|---|
| `json` | Structured JSON following the provided schema |
| `csv` | Comma-separated values; columns: `question_no,question_text,option_a,option_b,option_c,option_d` |
| `tsv` | Tab-separated values; same columns as CSV |
| `sql` | Generic SQL `CREATE TABLE` + `INSERT INTO` |
| `postgresql` | PostgreSQL-compatible DDL + INSERTs |
| `mysql` | MySQL-compatible DDL + INSERTs |
| `sqlite` | SQLite-compatible DDL + INSERTs |
| `sqlserver` | Microsoft T-SQL compatible statements |
| `oracle` | Oracle SQL compatible statements |
| `mongodb` | Newline-delimited JSON documents for `mongoimport` |

For non-JSON formats, a schema is not required — the LLM infers structure from instructions and the PDF content.

---

## 10. Chunking Strategies

Large PDFs (> 14,000 chars) are split into chunks before being sent to the LLM. Results are merged afterward.

| Mode | Behavior |
|---|---|
| `auto` (default) | First tries page markers. If only 1 page, tries numbered blocks. Falls back to window. |
| `page` | Splits on `=== PAGE N ===` markers emitted by the PDF parser. Pages are packed into 20,000-char chunks. |
| `numbered` | Splits on numbered items (`1.` `2.` `3.` or `Question 1.`). Good for Q&A documents. |
| `window` | Fixed 20,000-char windows with 2,000-char overlap between consecutive chunks. |

**Merging after chunking:**
- **Fast merge** (no extra LLM call): used when every key in the schema maps to an array (e.g., `{ "questions": [...] }`). Arrays are simply concatenated and de-duplicated locally.
- **LLM merge**: used for complex schemas with scalar fields. Sends all partial results back to the LLM with merge instructions.

**CSV/TSV deduplication** is smart:
- Rows are normalized (trim, case-fold, smart-quote cleanup)
- A semantic key is built from the first cell(s)
- If the first cell is a pure question number (1-100), it's used as the sole dedup key
- From duplicate rows, the most complete version (most non-empty cells, longest total) is kept

---

## 11. Focus Modes

| Mode | Behavior |
|---|---|
| `balanced` | Balance completeness, precision, and structure |
| `focused` | Prioritize one consistent target record type; avoid mixing unrelated content |
| `exhaustive` | Maximum recall across the whole document; use for large, multi-section PDFs |

---

## 12. LLM Providers & Models

### Groq (default)
- **SDK:** `groq` Python package
- **Default model:** `moonshotai/kimi-k2-instruct-0905`
- **API key env var:** `GROQ_API_KEY`
- **Model override env var:** `GROQ_MODEL`
- **Parameters:** `temperature=0.1`, `max_completion_tokens=16384`, `top_p=1`

### Hugging Face
- **SDK:** `huggingface_hub.InferenceClient`
- **Default model:** `moonshotai/Kimi-K2-Instruct`
- **API key env var:** `HF_TOKEN`
- **Model override env var:** `HF_MODEL`
- **Parameters:** `temperature=0.1`, `max_tokens=8192`

Both providers use a **low temperature (0.1)** to make extraction deterministic and minimize hallucination.

The `LLM_PROVIDER` env var (default: `groq`) controls which provider is used when no explicit `--provider` flag or `provider` form field is given.

---

## 13. API Reference (Web)

### `GET /`
Returns the HTML web UI page.

### `GET /health`
Returns `null` (200 OK). Used to check if the server is running.

### `POST /extract`
Accepts `multipart/form-data`.

**Request fields:**
```
pdf_file      : binary (required)  — the PDF file
schema        : string             — JSON schema (required for JSON output)
instructions  : string             — free-text instructions
output_format : string             — json | csv | tsv | sql | postgresql | mysql | sqlite | sqlserver | oracle | mongodb
focus_mode    : string             — balanced | focused | exhaustive
chunk_mode    : string             — auto | page | numbered | window
provider      : string             — groq | huggingface
model         : string             — model name override (empty = use default)
```

**Success response (JSON format):**
```json
{
  "success": true,
  "pages": <int>,
  "provider": "<string>",
  "model": "<string>",
  "format": "json",
  "focus_mode": "<string>",
  "chunk_mode": "<string>",
  "schema_valid": <bool>,
  "validation_note": <string|null>,
  "data": { ... }
}
```

**Success response (non-JSON format):**
```json
{
  "success": true,
  "pages": <int>,
  "provider": "<string>",
  "model": "<string>",
  "format": "<string>",
  "focus_mode": "<string>",
  "chunk_mode": "<string>",
  "raw_output": "<string>"
}
```

**Error responses:**
- `400` — bad request (invalid file type, invalid format/mode/provider, bad schema JSON)
- `422` — processing error (PDF parse failed, no extractable text)
- `502` — AI extraction failed

---

## 14. CLI Reference

```
python main.py <pdf> <schema> [options]

Positional arguments:
  pdf               Path to input PDF file
  schema            Path to JSON schema file

Optional arguments:
  -o, --output FILE   Write JSON output to FILE (default: stdout)
  --provider          groq | huggingface  (default: from LLM_PROVIDER env or groq)
  --model NAME        Model name override
  --api-key KEY       Provider API key (overrides env var)
  --no-validate       Skip JSON schema validation

Exit codes:
  0   Success
  1   Error (file not found, parse failure, extraction failure)
```

**Progress output** goes to `stderr` so `stdout` stays clean JSON:
```
[1/3] Parsing PDF  →  report.pdf
      12 page(s), 45,231 characters extracted.
[2/3] Running AI extraction  (provider: groq, model: moonshotai/kimi-k2-instruct-0905)
  Document size: 46,231 characters
  Document split into 3 chunk(s).
  Processing chunk 1/3…
  Processing chunk 2/3…
  Processing chunk 3/3…
  Merging chunk results…
  Fast-merged (no extra LLM call needed).
[3/3] Validating output
      ✓ Output matches schema.
      Output written to: output.json
```

---

## 15. Python API Reference

```python
from pdftojson import PDFToJSON, load_schema

# --- load_schema ---
schema = load_schema("path/to/schema.json")  # → dict

# --- PDFToJSON ---
converter = PDFToJSON(
    provider="groq",           # "groq" or "huggingface"
    api_key=None,              # falls back to env var
    model=None,                # falls back to GROQ_MODEL / HF_MODEL env var
    validate=True,             # validate output against schema
)

# Convert to dict
result = converter.convert("report.pdf", schema)
# or pass schema inline:
result = converter.convert("report.pdf", {"company_name": "string", ...})

# Convert and write to file
converter.convert_to_file("report.pdf", schema, "output.json")
```

---

## 16. Example Schemas

### Company Report Schema (`examples/company_schema.json`)
```json
{
  "company_name": "string",
  "founded_year": "number",
  "headquarters": "string",
  "description": "string",
  "products": [
    {
      "name": "string",
      "description": "string",
      "price": "number",
      "category": "string"
    }
  ],
  "technical_specs": {
    "language": "string",
    "framework": "string",
    "database": "string"
  },
  "team": [
    {
      "name": "string",
      "role": "string",
      "email": "string"
    }
  ],
  "contact": {
    "email": "string",
    "phone": "string",
    "website": "string"
  }
}
```

### UPSC MCQ Schema (`examples/upsc_pyq_schema.json`)
```json
{
  "questions": [
    {
      "number": "number",
      "question": "string",
      "options": {
        "a": "string",
        "b": "string",
        "c": "string",
        "d": "string"
      }
    }
  ]
}
```

---

## 17. Environment Variables

Create a `.env` file in the project root:

```env
# Required — choose one:
GROQ_API_KEY=gsk_...               # Groq API key
HF_TOKEN=hf_...                    # Hugging Face token

# Optional overrides:
LLM_PROVIDER=groq                  # groq | huggingface (default: groq)
GROQ_MODEL=moonshotai/kimi-k2-instruct-0905   # Groq model name
HF_MODEL=moonshotai/Kimi-K2-Instruct          # HF model name
```

---

## 18. Key Design Decisions

| Decision | Rationale |
|---|---|
| **pdfplumber as primary** | Coordinate-aware extraction preserves multi-column reading order; critical for exam papers |
| **PyMuPDF as fallback** | More robust on corrupt/unusual PDFs; no table support but rarely needed |
| **Type-string schema** | Simpler than full JSON Schema — easier for users to write and for the LLM to understand |
| **null for missing fields** | Never invent data; null is always valid; extraction is non-destructive |
| **Low temperature (0.1)** | Makes LLM deterministic; reduces hallucination in structured extraction |
| **Page markers in output** | `=== PAGE N ===` markers let the chunker split cleanly on page boundaries |
| **Fast merge for array-only schemas** | Saves one LLM call when all top-level keys are arrays (very common for exam Q&A) |
| **Overlap between chunks** | 2,000-char overlap prevents losing data at chunk boundaries (e.g., a question split across two chunks) |
| **Mojibake repair** | Many PDFs produced on Windows have cp1252-in-utf8 encoding issues; fixing this significantly improves LLM accuracy |
| **Markdown tables for LLM** | LLMs reliably parse Markdown pipe tables; raw CSV/TSV from pdfplumber would be harder for the model to map to schema keys |
| **Temp file cleanup in finally** | Ensures uploaded files are always deleted even if extraction fails, preventing disk accumulation |
| **Static dir auto-creation** | `static_dir.mkdir(exist_ok=True)` in app.py ensures the static mount never fails on first run |
