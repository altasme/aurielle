"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmit } from "@/lib/use-submit";

const FIELD_CLASSES =
  "w-full rounded-sm border border-taupe/40 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-burgundy focus:ring-1 focus:ring-burgundy/20";

type ThreadAttachment = { filename: string; mimeType: string | null; path: string; url: string };

type ThreadMessage = {
  id: string;
  direction: "inbound" | "outbound";
  fromEmail: string;
  fromName: string | null;
  toEmail: string;
  subject: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  attachments: ThreadAttachment[];
  createdAt: string;
};

export function InquiryReplyComposer({
  source,
  id,
  toEmail,
  toName,
  defaultSubject,
}: {
  source: "contact" | "business" | "studio";
  id: string;
  toEmail: string;
  toName: string;
  defaultSubject: string;
}) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState("");
  const [smtpLog, setSmtpLog] = useState<string[] | null>(null);
  const [thread, setThread] = useState<ThreadMessage[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { submitting, error, setError, submit } = useSubmit();

  // Fetches straight in .then()/.catch() callbacks rather than through
  // an awaited async helper: setState calls inside those callbacks run
  // after the fetch settles, not synchronously as part of the effect's
  // own call stack, which is what react-hooks/set-state-in-effect
  // actually checks for (see customisation-quote-artwork-viewer.tsx for
  // the same pattern).
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch(`/api/admin/quotes-and-inquiries/thread?source=${source}&id=${id}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        setThread(res.ok ? (data.messages as ThreadMessage[]) : []);
      })
      .catch(() => {
        if (!cancelled) setThread([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, source, id]);

  async function loadThread() {
    try {
      const res = await fetch(`/api/admin/quotes-and-inquiries/thread?source=${source}&id=${id}`);
      const data = await res.json();
      setThread(res.ok ? (data.messages as ThreadMessage[]) : []);
    } catch {
      setThread([]);
    }
  }

  async function handleSend() {
    setSmtpLog(null);
    const result = await submit(async () => {
      const formData = new FormData();
      formData.set("source", source);
      formData.set("id", id);
      formData.set("toEmail", toEmail);
      formData.set("toName", toName);
      formData.set("subject", subject);
      formData.set("body", body);
      for (const file of fileInputRef.current?.files ?? []) {
        formData.append("attachments", file);
      }

      const res = await fetch("/api/admin/quotes-and-inquiries/reply", { method: "POST", body: formData });
      const data = await res.json();
      // TEMPORARY: always keep the SMTP transcript, success or failure,
      // while diagnosing why a "sent" reply never reaches the
      // recipient, spam, or the z.com Sent folder.
      setSmtpLog(Array.isArray(data.smtpLog) ? data.smtpLog : []);
      if (!res.ok) throw new Error(data.error ?? "Failed to send reply");
      return data;
    });
    if (result) {
      setBody("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadThread();
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs uppercase tracking-wide text-burgundy underline"
      >
        Reply via Aurielle Email
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto border border-taupe/20 bg-white p-6">
        <h2 className="font-serif text-lg text-ink">Reply to {toName || toEmail}</h2>
        <p className="mt-1 text-xs text-ink/50">
          Sends as the Aurielle Paris Atelier mailbox, to {toEmail}.
        </p>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-wide text-ink/60">Conversation</p>
          {thread === null && <p className="mt-2 text-xs text-ink/50">Loading thread...</p>}
          {thread !== null && thread.length === 0 && (
            <p className="mt-2 text-xs text-ink/50">No messages yet -- this will start the thread.</p>
          )}
          {thread !== null && thread.length > 0 && (
            <div className="mt-2 max-h-72 space-y-3 overflow-y-auto border border-taupe/20 bg-beige/20 p-3">
              {thread.map((message) => (
                <div
                  key={message.id}
                  className={`border-l-2 pl-3 ${
                    message.direction === "inbound" ? "border-taupe/50" : "border-burgundy"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2 text-[11px] text-ink/50">
                    <span className="font-medium text-ink/70">
                      {message.direction === "inbound" ? message.fromName || message.fromEmail : "Aurielle Paris Atelier"}
                    </span>
                    <span>{new Date(message.createdAt).toLocaleString()}</span>
                  </div>
                  {message.bodyText && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-ink/80">{message.bodyText}</p>
                  )}
                  {message.attachments.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {message.attachments.map((attachment) => (
                        <a
                          key={attachment.path}
                          href={attachment.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-burgundy underline"
                        >
                          {attachment.filename}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/60">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`mt-1.5 ${FIELD_CLASSES}`}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/60">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={7}
              placeholder="Type your reply..."
              className={`mt-1.5 ${FIELD_CLASSES}`}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/60">
              Attach Images / Files (optional)
            </label>
            <input type="file" ref={fileInputRef} multiple className={`mt-1.5 ${FIELD_CLASSES}`} />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        {!error && smtpLog && <p className="mt-3 text-sm text-green-700">Server reported success. SMTP transcript below.</p>}

        {smtpLog && smtpLog.length > 0 && (
          <div className="mt-3">
            <p className="text-xs uppercase tracking-wide text-ink/60">SMTP Transcript</p>
            <pre className="mt-1.5 max-h-64 overflow-y-auto whitespace-pre-wrap break-all border border-taupe/30 bg-beige/40 p-3 text-[11px] text-ink/80">
              {smtpLog.join("\n")}
            </pre>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setError(null);
              setSmtpLog(null);
            }}
            disabled={submitting}
            className="px-4 py-2 text-sm text-ink/70"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={submitting || !subject.trim() || !body.trim()}
            className="bg-burgundy px-4 py-2 text-sm text-ivory disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send Reply"}
          </button>
        </div>
      </div>
    </div>
  );
}
