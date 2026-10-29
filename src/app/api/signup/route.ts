import { NextResponse } from "next/server";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { signupSchema } from "@/lib/signup";

// Where sign-ups go:
//  - SIGNUP_WEBHOOK_URL set: POST the JSON there (Google Apps Script sheet, Zapier, Make, Discord webhook...).
//  - Otherwise, in development only: append to .data/signups.jsonl.
//  - Production with no webhook: refuse with 503 so nobody's sign-up silently disappears.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: real people never fill this hidden field.
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 422 });
  }

  const record = { ...parsed.data, submittedAt: new Date().toISOString() };
  const webhook = process.env.SIGNUP_WEBHOOK_URL;

  try {
    if (webhook) {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    } else if (process.env.NODE_ENV !== "production") {
      const dir = path.join(process.cwd(), ".data");
      await mkdir(dir, { recursive: true });
      await appendFile(path.join(dir, "signups.jsonl"), JSON.stringify(record) + "\n");
    } else {
      return NextResponse.json({ error: "Sign-ups are not open yet. Please join the Discord for now." }, { status: 503 });
    }
  } catch (err) {
    console.error("signup failed", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
