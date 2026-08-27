"use client"

import { useId, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { useSearchSuggestions, type Suggestion } from "@/hooks/use-search-suggestions"
import { cn } from "@/lib/utils"

export interface SearchAutocompleteProps {
  value: string
  onValueChange: (value: string) => void
  /** Runs the full filtered query. Called on selection and on bare Enter. */
  onSearch: () => void
  id?: string
  placeholder?: string
}

/**
 * Highlights the matched substring so it is visible why a fuzzy result
 * matched. Falls back to plain text when the query is not a literal
 * substring, which is exactly the typo case.
 */
function highlightMatch(text: string, query: string) {
  const index = text.toLowerCase().indexOf(query.toLowerCase().trim())
  if (index === -1 || !query.trim()) return text
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-transparent font-semibold text-primary">
        {text.slice(index, index + query.trim().length)}
      </mark>
      {text.slice(index + query.trim().length)}
    </>
  )
}

/**
 * Search input with a server-ranked suggestion dropdown.
 *
 * Hand-rolled listbox rather than cmdk: cmdk filters client-side over a
 * static list, while these suggestions arrive already ranked and must render
 * in API order.
 *
 * Progressive enhancement — if the suggest request fails the dropdown simply
 * never opens and this behaves as the plain input it replaced.
 */
export function SearchAutocomplete({
  value,
  onValueChange,
  onSearch,
  id,
  placeholder,
}: SearchAutocompleteProps) {
  const listboxId = useId()
  const optionIdPrefix = useId()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { suggestions, loading, error } = useSearchSuggestions(value)

  const hasContent = suggestions.length > 0 || loading || (!error && value.trim().length >= 2)
  const isOpen = open && !error && hasContent

  const optionId = (index: number) => `${optionIdPrefix}-option-${index}`

  function close() {
    setOpen(false)
    setActiveIndex(-1)
  }

  function select(suggestion: Suggestion) {
    onValueChange(suggestion.value)
    close()
    onSearch()
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && isOpen && suggestions.length > 0) {
      event.preventDefault()
      setActiveIndex((prev) => (prev + 1) % suggestions.length)
      return
    }
    if (event.key === "ArrowUp" && isOpen && suggestions.length > 0) {
      event.preventDefault()
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1))
      return
    }
    if (event.key === "Enter") {
      event.preventDefault()
      if (isOpen && activeIndex >= 0 && suggestions[activeIndex]) {
        select(suggestions[activeIndex])
      } else {
        close()
        onSearch()
      }
      return
    }
    if (event.key === "Escape") {
      close()
      return
    }
    if (event.key === "Tab") {
      close()
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={(next) => !next && close()}>
      <PopoverAnchor asChild>
        <Input
          id={id}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value)
            setOpen(true)
            setActiveIndex(-1)
          }}
          onFocus={() => value.trim().length >= 2 && setOpen(true)}
          onBlur={() => {
            // Delay so a mouse click on an option lands before the close.
            blurTimer.current = setTimeout(close, 150)
          }}
          onKeyDown={handleKeyDown}
        />
      </PopoverAnchor>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] max-h-72 overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {loading && suggestions.length === 0 ? (
          <p className="px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-text-secondary">
            Searching…
          </p>
        ) : suggestions.length === 0 ? (
          <p className="px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-text-secondary">
            No matches — press Enter to search anyway
          </p>
        ) : (
          <ul id={listboxId} role="listbox" className="py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.type}-${suggestion.value}`}
                id={optionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(e) => {
                  // Beat the input's blur handler.
                  e.preventDefault()
                  if (blurTimer.current) clearTimeout(blurTimer.current)
                }}
                onClick={() => select(suggestion)}
                className={cn(
                  "cursor-pointer py-2 px-3",
                  index === activeIndex && "bg-primary-subtle"
                )}
              >
                <span className="block text-sm text-foreground">
                  {highlightMatch(suggestion.label, value)}
                </span>
                {suggestion.sublabel && (
                  <span className="block font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary">
                    {suggestion.sublabel}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
