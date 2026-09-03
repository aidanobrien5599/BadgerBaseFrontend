import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-url";

export const runtime = "nodejs";

/**
 * Server-side proxy for registration.
 *
 * Goes to the API's /v2/api/register rather than better-auth's
 * /sign-up/email, because better-auth deliberately returns a decoy success
 * for an address that already exists — no write, no email, no way for the
 * user to learn why nothing arrives. The API endpoint reports the real
 * outcome so the UI can act on it.
 *
 * Proxied rather than called from the browser so the API key stays server-side.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const res = await fetch(`${apiUrl()}/v2/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.API_KEY ?? "",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(
      "[register] upstream failed:",
      (error as Error)?.message ?? error
    );
    return NextResponse.json(
      { error: "Registration is temporarily unavailable" },
      { status: 502 }
    );
  }
}
