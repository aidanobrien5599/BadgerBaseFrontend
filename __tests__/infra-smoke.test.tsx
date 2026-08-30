// @vitest-environment jsdom
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"

function Hello({ name }: { name: string }) {
  return <p>Hello {name}</p>
}

describe("component test infrastructure", () => {
  it("renders a React component into a DOM", () => {
    render(<Hello name="Badger" />)
    expect(screen.getByText("Hello Badger")).toBeInTheDocument()
  })
})
