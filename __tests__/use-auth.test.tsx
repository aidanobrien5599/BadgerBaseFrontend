// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const mockUseSession = vi.fn();
vi.mock("@/lib/auth-client", () => ({
  authClient: { useSession: () => mockUseSession() },
}));

import { useAuth } from "@/hooks/use-auth";

describe("useAuth", () => {
  beforeEach(() => { mockUseSession.mockReset(); });

  test("reports loading while the session is pending", () => {
    mockUseSession.mockReturnValue({ data: null, isPending: true });
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  test("exposes the user once the session resolves", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: "9f8c2a41", email: "badger@wisc.edu" } },
      isPending: false,
    });
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user?.email).toBe("badger@wisc.edu");
    expect(result.current.isAuthenticated).toBe(true);
  });

  test("reports signed out when there is no session", async () => {
    mockUseSession.mockReturnValue({ data: null, isPending: false });
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
