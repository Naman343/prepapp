"use client"

import { useState, useRef } from "react"
import api from "@/lib/axios"
import { Upload, FileJson, CheckCircle2, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImportPayload {
  test: {
    title: string
    year: number
    date?: string
    duration: number
    totalQuestions: number
    isPublished?: boolean
  }
  questions: {
    text: string
    examYear?: number
    difficulty: string
    topic: string
    explanation?: string
    options: { text: string; isCorrect: boolean }[]
  }[]
}

interface PdfExtractResponse {
  success: boolean
  pages?: number
  provider?: string
  model?: string
  data: unknown
}

function validate(data: unknown): { ok: true; payload: ImportPayload } | { ok: false; error: string } {
  if (typeof data !== "object" || !data) return { ok: false, error: "JSON must be an object" }
  const d = data as Record<string, unknown>
  if (!d.test || typeof d.test !== "object") return { ok: false, error: 'Missing "test" object' }
  if (!Array.isArray(d.questions)) return { ok: false, error: 'Missing "questions" array' }
  const test = d.test as Record<string, unknown>
  if (!test.title) return { ok: false, error: '"test.title" is required' }
  if (!test.year) return { ok: false, error: '"test.year" is required' }
  if (!test.duration) return { ok: false, error: '"test.duration" is required' }
  if (!test.totalQuestions) return { ok: false, error: '"test.totalQuestions" is required' }
  if ((d.questions as unknown[]).length === 0) return { ok: false, error: "Questions array is empty" }
  for (let i = 0; i < (d.questions as unknown[]).length; i++) {
    const q = (d.questions as Record<string, unknown>[])[i]
    if (!q.text) return { ok: false, error: `Question ${i + 1}: "text" is required` }
    if (q.examYear !== undefined && typeof q.examYear !== "number")
      return { ok: false, error: `Question ${i + 1}: "examYear" must be a number` }
    if (!q.topic) return { ok: false, error: `Question ${i + 1}: "topic" is required` }
    if (!q.difficulty) return { ok: false, error: `Question ${i + 1}: "difficulty" is required` }
    if (!Array.isArray(q.options) || (q.options as unknown[]).length < 2)
      return { ok: false, error: `Question ${i + 1}: at least 2 options required` }
    const hasCorrect = (q.options as { isCorrect?: boolean }[]).some((o) => o.isCorrect)
    if (!hasCorrect) return { ok: false, error: `Question ${i + 1}: no correct option marked` }
  }
  return { ok: true, payload: data as ImportPayload }
}

const OPTION_KEYS = ["a", "b", "c", "d", "e"]

function convertPyqFormat(raw: unknown): string {
  if (typeof raw !== "object" || !raw) throw new Error("Not a valid JSON object")
  const d = raw as Record<string, unknown>
  if (!Array.isArray(d.questions) || d.questions.length === 0)
    throw new Error("No 'questions' array found")

  type PYQQuestion = {
    exam_year?: number
    topic?: string
    question?: string
    options?: Record<string, string>
    correct_answer?: string
    explanation?: string
  }
  const pyqQs = d.questions as PYQQuestion[]

  if (!pyqQs[0].question && !pyqQs[0].correct_answer)
    throw new Error("Does not look like PYQ format — missing 'question' or 'correct_answer'")

  // Pick most common exam_year as the test year
  const years = pyqQs.map((q) => q.exam_year).filter(Boolean) as number[]
  const yearCount = years.reduce<Record<number, number>>((acc, y) => { acc[y] = (acc[y] || 0) + 1; return acc }, {})
  const year = years.length > 0
    ? Number(Object.entries(yearCount).sort((a, b) => b[1] - a[1])[0][0])
    : new Date().getFullYear()

  const questions = pyqQs.map((q, i) => {
    const opts = q.options ?? {}
    const correct = q.correct_answer?.toLowerCase() ?? ""
    const options = OPTION_KEYS.filter((k) => k in opts).map((k) => ({
      text: opts[k],
      isCorrect: k === correct,
    }))
    return {
      text: q.question ?? `Question ${i + 1}`,
      ...(typeof q.exam_year === "number" ? { examYear: q.exam_year } : {}),
      difficulty: "MEDIUM",
      topic: q.topic ?? "General Studies",
      ...(q.explanation ? { explanation: q.explanation } : {}),
      options,
    }
  })

  return JSON.stringify(
    {
      test: {
        title: `UPSC Prelims ${year} GS-1`,
        year,
        duration: 120,
        totalQuestions: questions.length,
        isPublished: false,
      },
      questions,
    },
    null,
    2
  )
}

const EXAMPLE_JSON = `{
  "test": {
    "title": "UPSC Prelims 2024 GS-1",
    "year": 2024,
    "date": "2024-05-26",
    "duration": 120,
    "totalQuestions": 100,
    "isPublished": false
  },
  "questions": [
    {
      "text": "Which of the following is the largest planet in the solar system?",
      "difficulty": "EASY",
      "topic": "Science & Technology",
      "explanation": "Jupiter is the largest planet.",
      "options": [
        { "text": "Saturn", "isCorrect": false },
        { "text": "Jupiter", "isCorrect": true },
        { "text": "Uranus", "isCorrect": false },
        { "text": "Neptune", "isCorrect": false }
      ]
    }
  ]
}`

export default function ImportPage() {
  const [jsonText, setJsonText] = useState("")
  const [parsed, setParsed] = useState<ImportPayload | null>(null)
  const [parseError, setParseError] = useState("")
  const [status, setStatus] = useState<"idle" | "importing" | "success" | "error">("idle")
  const [resultMsg, setResultMsg] = useState("")

  const [convertError, setConvertError] = useState("")

  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState("")
  const [extractMeta, setExtractMeta] = useState<{ pages?: number; provider?: string; model?: string } | null>(null)
  const [provider, setProvider] = useState<"groq" | "huggingface">("groq")
  const [focusMode, setFocusMode] = useState<"balanced" | "focused" | "exhaustive">("balanced")
  const [chunkMode, setChunkMode] = useState<"auto" | "page" | "numbered" | "window">("auto")
  const [modelName, setModelName] = useState("")
  const [instructions, setInstructions] = useState(
    "Extract one UPSC test with all MCQs. Return JSON in import schema with test + questions + options."
  )

  const fileRef = useRef<HTMLInputElement>(null)
  const pdfRef = useRef<HTMLInputElement>(null)

  const handleParse = () => {
    setParseError("")
    setParsed(null)
    setStatus("idle")
    if (!jsonText.trim()) {
      setParseError("Paste JSON first")
      return
    }
    try {
      const raw = JSON.parse(jsonText)
      const result = validate(raw)
      if (!result.ok) {
        setParseError(result.error)
      } else {
        setParsed(result.payload)
      }
    } catch {
      setParseError("Invalid JSON — could not parse")
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setJsonText(ev.target?.result as string)
      setParsed(null)
      setParseError("")
      setStatus("idle")
    }
    reader.readAsText(file)
  }

  const handlePdfFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPdfFile(file)
    setExtractError("")
    setExtractMeta(null)
  }

  const handleExtractFromPdf = async () => {
    if (!pdfFile) {
      setExtractError("Select a PDF file first")
      return
    }

    setExtracting(true)
    setExtractError("")
    setExtractMeta(null)
    setStatus("idle")

    try {
      const formData = new FormData()
      formData.append("pdf_file", pdfFile)
      formData.append("provider", provider)
      formData.append("focus_mode", focusMode)
      formData.append("chunk_mode", chunkMode)
      if (modelName.trim()) formData.append("model", modelName.trim())
      if (instructions.trim()) formData.append("instructions", instructions.trim())

      const response = await api.post<PdfExtractResponse>("/admin/import/extract-pdf", formData)
      const extracted = response.data?.data
      const meta = {
        pages: response.data?.pages,
        provider: response.data?.provider,
        model: response.data?.model,
      }

      setExtractMeta(meta)
      setJsonText(JSON.stringify(extracted, null, 2))

      const validationResult = validate(extracted)
      if (!validationResult.ok) {
        setParsed(null)
        setParseError(`Extraction succeeded, but JSON format is not import-ready: ${validationResult.error}`)
      } else {
        setParsed(validationResult.payload)
        setParseError("")
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setExtractError(e.response?.data?.message || "PDF extraction failed")
    } finally {
      setExtracting(false)
    }
  }

  const handleImport = async () => {
    if (!parsed) return
    setStatus("importing")
    setResultMsg("")
    try {
      const r = await api.post("/admin/import", parsed)
      setResultMsg(
        `Imported "${r.data.test.title}" with ${r.data.questionsCreated} questions.`
      )
      setStatus("success")
      setJsonText("")
      setParsed(null)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setResultMsg(e.response?.data?.message || "Import failed")
      setStatus("error")
    }
  }

  const handleConvertPyq = () => {
    setConvertError("")
    setParsed(null)
    setParseError("")
    if (!jsonText.trim()) { setConvertError("Paste PYQ JSON first"); return }
    try {
      const raw = JSON.parse(jsonText)
      const converted = convertPyqFormat(raw)
      setJsonText(converted)
      // auto-validate
      const result = validate(JSON.parse(converted))
      if (!result.ok) setParseError(result.error)
      else setParsed(result.payload)
    } catch (e) {
      setConvertError((e as Error).message)
    }
  }

  const reset = () => {
    setJsonText("")
    setParsed(null)
    setParseError("")
    setStatus("idle")
    setResultMsg("")
    setConvertError("")
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold">Bulk JSON Import</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Paste or upload a JSON file in the format below to insert a test + questions in one go.
        </p>
      </div>

      {/* Result banner */}
      {status === "success" && (
        <div className="flex items-start gap-3 rounded-lg border border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800 p-4">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-green-700 dark:text-green-300">{resultMsg}</div>
          <button onClick={reset} className="text-green-600 hover:text-green-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {status === "error" && (
        <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800 p-4">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-red-700 dark:text-red-300">{resultMsg}</div>
          <button onClick={() => setStatus("idle")} className="text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold flex-1">Extract From PDF</h3>
          <input
            ref={pdfRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handlePdfFile}
          />
          <Button variant="outline" size="sm" onClick={() => pdfRef.current?.click()}>
            <Upload className="w-4 h-4 mr-1" /> Select PDF
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {pdfFile ? `Selected: ${pdfFile.name}` : "No PDF selected"}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Provider</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={provider}
              onChange={(e) => setProvider(e.target.value as "groq" | "huggingface")}
            >
              <option value="groq">Groq</option>
              <option value="huggingface">Hugging Face</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Focus Mode</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={focusMode}
              onChange={(e) => setFocusMode(e.target.value as "balanced" | "focused" | "exhaustive")}
            >
              <option value="balanced">Balanced</option>
              <option value="focused">Focused</option>
              <option value="exhaustive">Exhaustive</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Chunk Mode</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={chunkMode}
              onChange={(e) => setChunkMode(e.target.value as "auto" | "page" | "numbered" | "window")}
            >
              <option value="auto">Auto</option>
              <option value="page">Page</option>
              <option value="numbered">Numbered</option>
              <option value="window">Window</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Model Override (optional)</label>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="e.g. moonshotai/kimi-k2-instruct-0905"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Extraction Instructions</label>
          <textarea
            className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>

        {extractMeta && (
          <p className="text-xs text-muted-foreground">
            Extracted {extractMeta.pages ?? "?"} page(s) via {extractMeta.provider ?? "-"}
            {extractMeta.model ? ` (${extractMeta.model})` : ""}
          </p>
        )}

        {extractError && (
          <p className="text-red-500 text-sm flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> {extractError}
          </p>
        )}

        <div className="flex justify-end">
          <Button onClick={handleExtractFromPdf} disabled={!pdfFile || extracting}>
            {extracting ? "Extracting..." : "Extract JSON From PDF"}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold flex-1">JSON Input</h3>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFile}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-1" /> Upload .json
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setJsonText(EXAMPLE_JSON)}
          >
            <FileJson className="w-4 h-4 mr-1" /> Load Example
          </Button>
        </div>

        <textarea
          className="w-full min-h-72 font-mono text-xs rounded-md border border-input bg-background px-3 py-2.5 resize-y"
          placeholder={`Paste your JSON here...\n\n${EXAMPLE_JSON}`}
          value={jsonText}
          onChange={(e) => { setJsonText(e.target.value); setParsed(null); setParseError("") }}
          spellCheck={false}
        />

        {parseError && (
          <p className="text-red-500 text-sm flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> {parseError}
          </p>
        )}
        {convertError && (
          <p className="text-red-500 text-sm flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> {convertError}
          </p>
        )}

        <div className="flex gap-2 justify-end flex-wrap">
          {jsonText && (
            <Button variant="outline" onClick={reset}>Clear</Button>
          )}
          <Button
            variant="outline"
            onClick={handleConvertPyq}
            disabled={!jsonText.trim()}
            title="Converts PYQ format (exam_year / question / correct_answer) to import schema"
          >
            Convert PYQ Format
          </Button>
          <Button onClick={handleParse} disabled={!jsonText.trim()}>
            Validate JSON
          </Button>
        </div>
      </div>

      {/* Preview */}
      {parsed && (
        <div className="rounded-xl border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950 p-5 space-y-3">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            Validation passed — ready to import
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-green-700 dark:text-green-300">
            <div><span className="font-medium">Test:</span> {parsed.test.title}</div>
            <div><span className="font-medium">Year:</span> {parsed.test.year}</div>
            <div><span className="font-medium">Duration:</span> {parsed.test.duration} min</div>
            <div><span className="font-medium">Questions:</span> {parsed.questions.length}</div>
            <div>
              <span className="font-medium">Topics:</span>{" "}
              {[...new Set(parsed.questions.map((q) => q.topic))].join(", ")}
            </div>
          </div>
          <div className="pt-2">
            <Button
              onClick={handleImport}
              disabled={status === "importing"}
              className="bg-green-700 hover:bg-green-800 text-white"
            >
              {status === "importing" ? "Importing..." : `Import ${parsed.questions.length} Questions`}
            </Button>
          </div>
        </div>
      )}

      {/* Schema reference */}
      <details className="rounded-xl border border-border bg-card p-5">
        <summary className="cursor-pointer font-semibold text-sm select-none">
          JSON Schema Reference
        </summary>
        <pre className="mt-4 text-xs bg-muted rounded-md p-4 overflow-auto leading-relaxed">
{`{
  "test": {
    "title": string,           // required
    "year": number,            // required  e.g. 2024
    "date": string,            // optional  e.g. "2024-05-26"
    "duration": number,        // required  in minutes
    "totalQuestions": number,  // required
    "isPublished": boolean     // optional, default false
  },
  "questions": [
    {
      "text": string,          // required
      "examYear": number,      // optional  e.g. 2021 (per-question year)
      "difficulty": "EASY" | "MEDIUM" | "HARD",  // required
      "topic": string,         // required  e.g. "Modern History"
      "explanation": string,   // optional
      "options": [
        { "text": string, "isCorrect": boolean },
        ...                    // min 2, exactly 1 must be isCorrect: true
      ]
    }
  ]
}`}
        </pre>
      </details>
    </div>
  )
}
