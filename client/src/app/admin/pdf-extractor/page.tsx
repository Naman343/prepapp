"use client"

const EXTRACTOR_URL = process.env.NEXT_PUBLIC_PDFTOJSON_UI_URL || "http://127.0.0.1:8000"

export default function PdfExtractorPage() {
  return (
    <div className="space-y-4 h-full min-h-[70vh]">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold">PDF Extractor UI</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Embedded pdftojson frontend. If embedding is blocked by browser headers, use Open in New Tab.
          </p>
        </div>
        <a
          href={EXTRACTOR_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          Open in New Tab
        </a>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card h-[78vh]">
        <iframe
          title="pdftojson-frontend"
          src={EXTRACTOR_URL}
          className="w-full h-full"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  )
}
