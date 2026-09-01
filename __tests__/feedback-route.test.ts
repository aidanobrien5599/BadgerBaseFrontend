import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

const send = vi.fn();
vi.mock("nodemailer", () => ({
  default: { createTransport: () => ({ sendMail: send }) },
}));

const VALID = {
  name: "Badger", email: "badger@wisc.edu", category: "bug",
  subject: "Something broke", message: "Here is a description of the problem.",
};
const post = async (body: unknown) => {
  const { POST } = await import("@/app/api/feedback/route");
  return POST(new Request("http://localhost/api/feedback", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
};

describe("POST /api/feedback", () => {
  beforeEach(() => { send.mockReset(); vi.resetModules(); });
  afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

  test("503s and names the missing variables in the log when SMTP is unconfigured", async () => {
    vi.stubEnv("SMTP_HOST", ""); vi.stubEnv("SMTP_USER", ""); vi.stubEnv("SMTP_PASS", "");
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post(VALID);
    expect(res.status).toBe(503);
    expect(send).not.toHaveBeenCalled();
    const logged = err.mock.calls[0]?.[0] as string;
    expect(logged).toContain("SMTP_HOST");
    expect(logged).toContain("SMTP_USER");
    expect(logged).toContain("SMTP_PASS");
  });

  test("names only the variable that is actually missing", async () => {
    vi.stubEnv("SMTP_HOST", "mail.example.com");
    vi.stubEnv("SMTP_USER", "n@example.com");
    vi.stubEnv("SMTP_PASS", "");
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post(VALID);
    expect(res.status).toBe(503);
    const logged = err.mock.calls[0]?.[0] as string;
    expect(logged).toContain("SMTP_PASS");
    expect(logged).not.toContain("SMTP_HOST");
  });

  test("logs the nodemailer error code when a send fails", async () => {
    vi.stubEnv("SMTP_HOST", "mail.example.com");
    vi.stubEnv("SMTP_USER", "n@example.com");
    vi.stubEnv("SMTP_PASS", "wrong");
    const boom = Object.assign(new Error("Invalid login"), { code: "EAUTH" });
    send.mockRejectedValueOnce(boom);
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post(VALID);
    expect(res.status).toBe(500);
    const logged = err.mock.calls[0]?.[0] as string;
    expect(logged).toContain("EAUTH");
    expect(logged).toContain("mail.example.com");
  });

  test("sends when fully configured", async () => {
    vi.stubEnv("SMTP_HOST", "mail.example.com");
    vi.stubEnv("SMTP_USER", "n@example.com");
    vi.stubEnv("SMTP_PASS", "secret");
    const res = await post(VALID);
    expect(res.status).toBe(200);
    expect(send).toHaveBeenCalledTimes(1);
  });
});
