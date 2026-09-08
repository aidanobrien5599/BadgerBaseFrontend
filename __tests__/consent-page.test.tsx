// @vitest-environment jsdom
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("client_id=https%3A%2F%2Fclaude.ai%2Fmcp&scope=courses%3Aread"),
}));

import ConsentPage from "@/app/consent/page";

describe("consent page", () => {
  test("names the client asking for access", () => {
    render(<ConsentPage />);
    expect(screen.getByText(/claude\.ai/i)).toBeInTheDocument();
  });

  test("says what is being granted, in plain words", () => {
    render(<ConsentPage />);
    expect(screen.getByText(/course/i)).toBeInTheDocument();
  });

  test("offers both approve and deny", () => {
    render(<ConsentPage />);
    expect(screen.getByRole("button", { name: /approve|allow/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /deny|cancel/i })).toBeInTheDocument();
  });
});
