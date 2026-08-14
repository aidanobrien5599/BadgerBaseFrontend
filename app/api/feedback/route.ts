import { Resend } from "resend";
import { NextResponse } from "next/server";
import { z } from "zod";
import { semantic, colors } from "@/lib/tokens";

const resend = new Resend(process.env.RESEND_API_KEY);

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

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY) {
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
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: ["aob55992@gmail.com"],
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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: "OK", data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
