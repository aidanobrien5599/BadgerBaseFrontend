import "@testing-library/jest-dom/vitest"
import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

// @testing-library/react's own auto-cleanup only registers when `afterEach`
// is a global (i.e. `test.globals: true` in vitest.config.ts). This repo
// doesn't set that, so component tests that call `render()` more than once
// per file (as search-autocomplete.test.tsx does) would otherwise leak DOM
// nodes across `it` blocks within the same file.
afterEach(() => {
  cleanup()
})
