// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";

const success = vi.fn();
const error = vi.fn();
vi.mock("sonner", () => ({ toast: { success: (m: string) => success(m), error: (m: string) => error(m) } }));

import { VerifiedToast } from "@/components/verified-toast";

const at = (search: string) => {
  window.history.replaceState({}, "", `/${search}`);
  render(<VerifiedToast />);
};

describe("VerifiedToast", () => {
  beforeEach(() => { success.mockReset(); error.mockReset(); });
  afterEach(() => { window.history.replaceState({}, "", "/"); });

  test("says nothing on a normal visit", () => {
    at("");
    expect(success).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  test("confirms success when there is no error", () => {
    at("?verified=1");
    expect(success).toHaveBeenCalledTimes(1);
    expect(error).not.toHaveBeenCalled();
  });

  // better-auth redirects to the same callbackURL on failure, adding `error`.
  // Announcing success there would tell someone with an expired link that
  // their email was confirmed.
  test("does NOT claim success when the token was rejected", () => {
    at("?verified=1&error=INVALID_TOKEN");
    expect(success).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0][0]).toMatch(/invalid/i);
  });

  test("handles an unknown error code with a generic message", () => {
    at("?verified=1&error=SOMETHING_ELSE");
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0][0]).toMatch(/couldn't confirm/i);
  });

  test("strips both parameters so a refresh does not re-announce", () => {
    at("?verified=1&error=INVALID_TOKEN&q=cs");
    expect(window.location.search).toBe("?q=cs");
  });
});
