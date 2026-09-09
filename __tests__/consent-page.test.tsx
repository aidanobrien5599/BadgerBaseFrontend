// @vitest-environment jsdom
import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useSearchParams: () =>
    new URLSearchParams(
      "client_id=https%3A%2F%2Fclaude.ai%2Fmcp&scope=courses%3Aread+subscriptions%3Aread"
    ),
}));

import ConsentPage from "@/app/consent/page";

describe("consent page", () => {
  test("names the client asking for access", () => {
    render(<ConsentPage />);
    expect(screen.getByText(/claude\.ai/i)).toBeInTheDocument();
  });

  test("says what is being granted, in plain words", () => {
    render(<ConsentPage />);
    expect(screen.getAllByText(/course/i).length).toBeGreaterThan(0);
  });

  test("offers both approve and deny", () => {
    render(<ConsentPage />);
    expect(screen.getByRole("button", { name: /approve|allow/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /deny|cancel/i })).toBeInTheDocument();
  });

  test("describes both real scopes in plain words", () => {
    render(<ConsentPage />);
    expect(screen.getByText(/search uw–madison courses/i)).toBeInTheDocument();
    expect(screen.getByText(/courses and sections you.re watching/i)).toBeInTheDocument();
  });

  // better-auth returns `{ redirect: true, url }` from /oauth2/consent for a
  // fetch/JSON request, not the `redirect_uri` its OpenAPI metadata documents.
  // Reading only redirect_uri showed "Something went wrong" over a request the
  // server had already approved with a 200 — the whole flow dead-ended there.
  test("treats better-auth's actual success shape as success", async () => {
    // The endpoint returns `{ redirect: true, url }` for a fetch/JSON request,
    // not the `redirect_uri` its OpenAPI metadata documents. Reading only
    // redirect_uri raised "Something went wrong" over a request the server had
    // already approved with a 200, dead-ending the whole flow.
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ redirect: true, url: "https://claude.ai/api/mcp/cb?code=abc" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ConsentPage />);
    fireEvent.click(screen.getByRole("button", { name: /approve|allow/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  test("tells the student to sign in again on a 401, not to retry", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ConsentPage />);
    fireEvent.click(screen.getByRole("button", { name: /approve|allow/i }));

    expect(await screen.findByText(/session has expired/i)).toBeInTheDocument();
    expect(screen.queryByText(/try again/i)).not.toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});
