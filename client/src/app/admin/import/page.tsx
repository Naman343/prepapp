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
    difficulty: string
    topic: string
    explanation?: string
    options: { text: string; isCorrect: boolean }[]
  }[]
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
    if (!q.topic) return { ok: false, error: `Question ${i + 1}: "topic" is required` }
    if (!q.difficulty) return { ok: false, error: `Question ${i + 1}: "difficulty" is required` }
    if (!Array.isArray(q.options) || (q.options as unknown[]).length < 2)
      return { ok: false, error: `Question ${i + 1}: at least 2 options required` }
    const hasCorrect = (q.options as { isCorrect?: boolean }[]).some((o) => o.isCorrect)
    if (!hasCorrect) return { ok: false, error: `Question ${i + 1}: no correct option marked` }
  }
  return { ok: true, payload: data as ImportPayload }
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
  const fileRef = useRef<HTMLInputElement>(null)

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

  const reset = () => {
    setJsonText("")
    setParsed(null)
    setParseError("")
    setStatus("idle")
    setResultMsg("")
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

        <div className="flex gap-2 justify-end">
          {jsonText && (
            <Button variant="outline" onClick={reset}>Clear</Button>
          )}
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
