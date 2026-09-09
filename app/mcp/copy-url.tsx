"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"

/**
 * The server URL exists to be pasted into a connector dialog, so the copy
 * action lives on it rather than leaving the reader to select 30 characters
 * of monospace by hand. Falls back to selecting the text when the clipboard
 * API is unavailable (non-secure origins, older Safari), which leaves the
 * reader exactly one keystroke from the same result.
 */
export function CopyServerUrl({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  const codeRef = useRef<HTMLElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      const node = codeRef.current
      if (!node) return
      const range = document.createRange()
      range.selectNodeContents(node)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }

  const [origin, path] = [url.replace(/\/mcp$/, ""), "/mcp"]

  return (
    <div className="mt-8 max-w-[660px] rounded-xl border border-border/70 bg-surface-sunken overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 pt-4">
        <span className="font-mono text-[10.5px] font-bold tracking-[0.16em] uppercase text-muted-foreground">
          Server URL
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy ${url} to clipboard`}
          className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-surface px-2.5 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-text-secondary transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-sunken"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <code
        ref={codeRef}
        onClick={copy}
        className="block cursor-pointer select-all break-all px-4 sm:px-5 pb-4 pt-2 font-mono text-[clamp(12px,3.9vw,23px)] font-bold leading-tight tracking-[-0.01em] text-foreground"
      >
        {origin}
        <span className="text-primary">{path}</span>
      </code>
      <p aria-live="polite" className="sr-only">
        {copied ? "Server URL copied to clipboard" : ""}
      </p>
    </div>
  )
}
