import "server-only";
import { renderReplyEmailHtml } from "./reply-template";

export type ReplyAttachment = { filename: string; content: string; mimeType?: string };

export class SendReplyError extends Error {
  smtpLog: string[];
  constructor(message: string, smtpLog: string[]) {
    super(message);
    this.smtpLog = smtpLog;
  }
}

// Sends via the project's z.com SMTP mailbox using worker-mailer, the
// only SMTP client that works on Cloudflare Workers (it speaks SMTP
// over `cloudflare:sockets` directly -- Node libraries like nodemailer
// assume `node:net`/`node:tls`, which nodejs_compat does not provide).
// Requires SMTP_HOST/SMTP_PORT/SMTP_USERNAME/SMTP_PASSWORD/
// SMTP_FROM_EMAIL/SMTP_FROM_NAME as real env vars (see .github/
// workflows/deploy.yml and README "Reply via Aurielle Email").
//
// Returns the captured SMTP transcript (TEMPORARY: worker-mailer's
// send() currently resolves with no thrown error, but the message
// never reaches the recipient, isn't in spam, and never shows in the
// z.com Sent folder either -- capturing DEBUG-level console output
// here and handing it back to the caller is the fastest way to see the
// real EHLO/AUTH/MAIL FROM/RCPT TO/DATA exchange without needing a
// separately-timed Cloudflare dashboard log-tail session). Remove this
// capture once the real delivery issue is found.
export async function sendReplyEmail({
  toEmail,
  toName,
  subject,
  bodyText,
  attachments,
  replyToEmail,
}: {
  toEmail: string;
  toName: string;
  subject: string;
  bodyText: string;
  attachments: ReplyAttachment[];
  // The per-inquiry hello+<source>-<id>@... address (see
  // buildReplyToAddress in src/lib/admin/inquiry-messages.ts) so a
  // customer's reply arrives self-identifying instead of needing
  // subject-line or sender-address matching.
  replyToEmail: string;
}): Promise<string[]> {
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
    throw new SendReplyError(`Email sending is not configured. Missing: ${missing.join(", ")}.`, []);
  }

  const log: string[] = [];
  const original = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };
  const capture =
    (level: string) =>
    (...args: unknown[]) => {
      log.push(`[${level}] ${args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ")}`);
      original[level as keyof typeof original](...args);
    };
  console.debug = capture("debug");
  console.info = capture("info");
  console.warn = capture("warn");
  console.error = capture("error");

  try {
    // Dynamic import, not a top-level one: worker-mailer resolves
    // `cloudflare:sockets` at import time, which only exists in the
    // real Workers runtime. A static import makes `next build`'s
    // page-data collection pass (plain Node, pre-deploy) fail trying
    // to resolve it.
    //
    // Import the explicit `.mjs` file, not the bare "worker-mailer"
    // specifier: worker-mailer ships both an ESM build (clean `import
    // { connect } from "cloudflare:sockets"`) and a CJS build
    // (`require("cloudflare:sockets")`, which the Workers runtime
    // rejects). It has no `exports` map, so bundler resolution is
    // ambiguous without pinning the exact file. Also excluded from
    // Next's own bundling via `serverExternalPackages` in
    // next.config.ts, which is the fix that actually matters --
    // Turbopack was rewriting the import before this file even
    // mattered.
    const { WorkerMailer, LogLevel } = await import("worker-mailer/dist/index.mjs");

    const mailer = await WorkerMailer.connect({
      host,
      port,
      secure: port === 465,
      credentials: { username, password },
      authType: ["plain", "login", "cram-md5"],
      logLevel: LogLevel.DEBUG,
    });

    try {
      await mailer.send({
        from: { name: fromName, email: fromEmail },
        to: { name: toName, email: toEmail },
        reply: replyToEmail,
        subject,
        text: bodyText,
        html: renderReplyEmailHtml({ recipientName: toName, bodyText }),
        attachments: attachments.length > 0 ? attachments : undefined,
      });
    } finally {
      await mailer.close();
    }

    return log;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    throw new SendReplyError(message, log);
  } finally {
    console.debug = original.debug;
    console.info = original.info;
    console.warn = original.warn;
    console.error = original.error;
  }
}
