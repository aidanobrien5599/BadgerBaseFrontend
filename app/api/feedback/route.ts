import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { z } from "zod";
import { semantic, colors } from "@/lib/tokens";

const CATEGORY_LABELS: Record<string, string> = {
  bug: "Bug Report",
  question: "Question",
  comment: "Comment",
};

const feedbackSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  category: z.enum(["bug", "question", "comment"]),
  subject: z.string().min(3),
  message: z.string().min(10),
});

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * SMTP settings this route cannot run without. Checked as a group so the log
 * names every missing one at once, rather than revealing them one failed
 * request at a time.
 */
const REQUIRED_SMTP_VARS = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"] as const;

export async function POST(req: Request) {
  const missing = REQUIRED_SMTP_VARS.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    // Without this the 503 is silent in the platform log: a bare status code
    // with nothing indicating that configuration, not code, is at fault.
    console.error(
      `[feedback] Email is not configured — missing ${missing.join(", ")}. ` +
        "Set these in the deployment environment and redeploy; environment " +
        "changes do not apply to an already-built deployment."
    );
    return NextResponse.json(
      { error: "Email service not configured" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, category, subject, message } = parsed.data;
  const categoryLabel = CATEGORY_LABELS[category];

  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM || "notifications@badgerbase.app",
      to: "aob55992@gmail.com",
      subject: `[${categoryLabel}] ${subject}`,
      replyTo: email,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${semantic.primary}; border-bottom: 2px solid ${semantic.primary}; padding-bottom: 8px;">
            BadgerBase ${categoryLabel}
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr>
              <td style="padding: 8px 12px; font-weight: 600; color: ${colors.gray[700]}; width: 100px;">From</td>
              <td style="padding: 8px 12px; color: ${colors.gray[600]};">${name}</td>
            </tr>
            <tr style="background: ${colors.gray[50]};">
              <td style="padding: 8px 12px; font-weight: 600; color: ${colors.gray[700]};">Email</td>
              <td style="padding: 8px 12px; color: ${colors.gray[600]};">
                <a href="mailto:${email}" style="color: ${semantic.primary};">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: 600; color: ${colors.gray[700]};">Category</td>
              <td style="padding: 8px 12px; color: ${colors.gray[600]};">${categoryLabel}</td>
            </tr>
            <tr style="background: ${colors.gray[50]};">
              <td style="padding: 8px 12px; font-weight: 600; color: ${colors.gray[700]};">Subject</td>
              <td style="padding: 8px 12px; color: ${colors.gray[600]};">${subject}</td>
            </tr>
          </table>
          <div style="background: ${colors.gray[100]}; padding: 16px; border-radius: 8px; margin-top: 16px;">
            <h3 style="margin: 0 0 8px; color: ${colors.gray[700]}; font-size: 14px;">Message</h3>
            <p style="margin: 0; color: ${colors.gray[600]}; white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ status: "OK" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
