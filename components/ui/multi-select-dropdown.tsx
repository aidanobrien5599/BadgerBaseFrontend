"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Option {
  value: string
  label: string
}

interface MultiSelectDropdownProps {
  value: string
  onValueChange: (value: string) => void
  options: Option[]
  placeholder: string
  triggerClassName?: string
}

export function MultiSelectDropdown({
  value,
  onValueChange,
  options,
  placeholder,
  triggerClassName,
}: MultiSelectDropdownProps) {
  const selected = value.split(",").filter(Boolean)
  const labelMap = Object.fromEntries(options.map((o) => [o.value, o.label]))

  const toggle = (optionValue: string, checked: boolean) => {
    const next = checked
      ? [...selected, optionValue]
      : selected.filter((v) => v !== optionValue)
    onValueChange(next.join(","))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-between bg-transparent font-normal ${triggerClassName ?? ""}`}
        >
          <span className="truncate text-left flex-1">
            {selected.length > 0
              ? selected.map((v) => labelMap[v] ?? v).join(", ")
              : <span className="text-muted-foreground">{placeholder}</span>}
          </span>
          {selected.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground font-mono text-[11px] font-semibold tabular-nums">
              {selected.length}
            </span>
          )}
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={0} align="start" style={{ minWidth: "var(--radix-dropdown-menu-trigger-width)" }}>
        {options.map(({ value: optVal, label }) => (
          <DropdownMenuCheckboxItem
            key={optVal}
            checked={selected.includes(optVal)}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={(checked) => toggle(optVal, !!checked)}
          >
            {label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
