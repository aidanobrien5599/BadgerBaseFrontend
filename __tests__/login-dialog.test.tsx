// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const signInEmail = vi.fn();
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: { email: (...a: unknown[]) => signInEmail(...a) },
    signUp: { email: vi.fn() },
    useSession: () => ({ data: null, isPending: false }),
  },
}));

import { LoginDialog } from "@/components/login-dialog";

describe("LoginDialog", () => {
  beforeEach(() => { signInEmail.mockReset(); signInEmail.mockResolvedValue({ data: {}, error: null }); });

  test("submits email and password to better-auth", async () => {
    render(<LoginDialog open onOpenChange={() => {}} />);
    await userEvent.type(screen.getByLabelText(/email/i), "badger@wisc.edu");
    await userEvent.type(screen.getByLabelText(/password/i), "on-wisconsin-2026");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(signInEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email: "badger@wisc.edu", password: "on-wisconsin-2026" })
    );
  });

  test("surfaces an error message when sign-in fails", async () => {
    signInEmail.mockResolvedValue({ data: null, error: { message: "Invalid email or password" } });
    render(<LoginDialog open onOpenChange={() => {}} />);
    await userEvent.type(screen.getByLabelText(/email/i), "badger@wisc.edu");
    await userEvent.type(screen.getByLabelText(/password/i), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });
});
