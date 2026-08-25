import "server-only";
import { renderReplyEmailHtml } from "./reply-template";

export type ReplyAttachment = { filename: string; content: string; mimeType?: string };

// Sends via the project's z.com SMTP mailbox using worker-mailer, the
// only SMTP client that works on Cloudflare Workers (it speaks SMTP
// over `cloudflare:sockets` directly -- Node libraries like nodemailer
// assume `node:net`/`node:tls`, which nodejs_compat does not provide).
// Requires SMTP_HOST/SMTP_PORT/SMTP_USERNAME/SMTP_PASSWORD/
// SMTP_FROM_EMAIL/SMTP_FROM_NAME as real env vars (see .github/
// workflows/deploy.yml and README "Reply via Aurielle Email").
export async function sendReplyEmail({
  toEmail,
  toName,
  subject,
  bodyText,
  attachments,
}: {
  toEmail: string;
  toName: string;
  subject: string;
  bodyText: string;
  attachments: ReplyAttachment[];
}): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const username = process.env.SMTP_USERNAME;
  const password = process.env.SMTP_PASSWORD;
  const fromEmail = process.env.SMTP_FROM_EMAIL;
  const fromName = process.env.SMTP_FROM_NAME ?? "Aurielle Paris Atelier";

  if (!host || !port || !username || !password || !fromEmail) {
    // Names exactly which secrets the running Worker doesn't see,
    // rather than always listing all five -- this is the only signal
    // available for diagnosing a GitHub Actions secrets mismatch
    // without a live wrangler tail session.
    const missing = [
      !host && "SMTP_HOST",
      !port && "SMTP_PORT",
      !username && "SMTP_USERNAME",
      !password && "SMTP_PASSWORD",
      !fromEmail && "SMTP_FROM_EMAIL",
    ].filter((name): name is string => Boolean(name));
    throw new Error(`Email sending is not configured. Missing: ${missing.join(", ")}.`);
  }

  // Dynamic import, not a top-level one: worker-mailer resolves
  // `cloudflare:sockets` at import time, which only exists in the real
  // Workers runtime. A static import makes `next build`'s page-data
  // collection pass (plain Node, pre-deploy) fail trying to resolve it.
  const { WorkerMailer } = await import("worker-mailer");

  const mailer = await WorkerMailer.connect({
    host,
    port,
    secure: port === 465,
    credentials: { username, password },
    authType: ["plain", "login", "cram-md5"],
  });

  try {
    await mailer.send({
      from: { name: fromName, email: fromEmail },
      to: { name: toName, email: toEmail },
      subject,
      text: bodyText,
      html: renderReplyEmailHtml({ recipientName: toName, bodyText }),
      attachments: attachments.length > 0 ? attachments : undefined,
    });
  } finally {
    await mailer.close();
  }
}
