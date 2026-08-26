"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
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
  bodyText: string | null;
  attachments: ThreadAttachment[];
  createdAt: string;
  isOriginal?: boolean;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

// The full conversation for one inquiry: the original submission (a
// synthesized first bubble -- it lives on the inquiry row itself, not
// in inquiry_messages), then every reply/inbound message since, styled
// like a real email thread rather than a bare form.
export function InquiryThreadModal({
  source,
  id,
  toEmail,
  toName,
  defaultSubject,
  originalMessage,
  originalCreatedAt,
  meta,
  extra,
  onClose,
}: {
  source: "contact" | "business" | "studio";
  id: string;
  toEmail: string;
  toName: string;
  defaultSubject: string;
  originalMessage: string;
  originalCreatedAt: string;
  meta: { label: string; value: string }[];
  extra?: ReactNode;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState("");
  const [smtpLog, setSmtpLog] = useState<string[] | null>(null);
  const [thread, setThread] = useState<ThreadMessage[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { submitting, error, setError, submit } = useSubmit();

  useEffect(() => {
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
  }, [source, id]);

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

  const messages: ThreadMessage[] = [
    {
      id: "original",
      direction: "inbound",
      fromEmail: toEmail,
      fromName: toName,
      bodyText: originalMessage,
      attachments: [],
      createdAt: originalCreatedAt,
      isOriginal: true,
    },
    ...(thread ?? []),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 py-8"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-sm border border-taupe/20 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-taupe/20 bg-beige/30 px-6 py-4">
          <div>
            <h2 className="font-serif text-lg text-ink">{defaultSubject}</h2>
            <p className="mt-0.5 text-xs text-ink/60">
              {toName ? `${toName} · ` : ""}
              {toEmail}
            </p>
            {meta.length > 0 && (
              <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/50">
                {meta.map((item) => (
                  <div key={item.label} className="flex gap-1">
                    <dt className="uppercase tracking-wide">{item.label}:</dt>
                    <dd className="text-ink/70">{item.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {extra && <div className="mt-2">{extra}</div>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-lg leading-none text-ink/40 hover:text-ink">
            &times;
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-beige/10 px-6 py-5">
          {thread === null && <p className="text-xs text-ink/50">Loading conversation...</p>}
          {thread !== null &&
            messages.map((message) => {
              const isAdmin = message.direction === "outbound";
              return (
                <div key={message.id} className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : ""}`}>
                  {isAdmin ? (
                    <Image
                      src="/images/logo.png"
                      alt="Aurielle Paris Atelier"
                      width={32}
                      height={32}
                      className="h-8 w-8 shrink-0 rounded-full border border-burgundy/20 object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-taupe/30 text-[11px] font-medium text-ink/70">
                      {initials(message.fromName || message.fromEmail)}
                    </div>
                  )}
                  <div className={`flex max-w-[75%] flex-col gap-1 ${isAdmin ? "items-end" : "items-start"}`}>
                    <div className="flex items-baseline gap-2 text-[11px] text-ink/50">
                      <span className="font-medium text-ink/70">
                        {isAdmin ? "Aurielle Paris Atelier" : message.fromName || message.fromEmail}
                      </span>
                      <span>{new Date(message.createdAt).toLocaleString()}</span>
                      {message.isOriginal && <span className="italic">original inquiry</span>}
                    </div>
                    <div
                      className={`rounded-sm border px-3 py-2 text-sm ${
                        isAdmin ? "border-burgundy/20 bg-burgundy/10 text-ink" : "border-taupe/20 bg-white text-ink/80"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.bodyText}</p>
                      {message.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
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
                  </div>
                </div>
              );
            })}
        </div>

        <div className="border-t border-taupe/20 bg-white px-6 py-4">
          <div className="space-y-3">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className={FIELD_CLASSES}
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Type your reply..."
              className={FIELD_CLASSES}
            />
            <input type="file" ref={fileInputRef} multiple className={`${FIELD_CLASSES} text-xs`} />
          </div>

          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
          {!error && smtpLog && (
            <p className="mt-2 text-sm text-green-700">Server reported success. SMTP transcript below.</p>
          )}
          {smtpLog && smtpLog.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs uppercase tracking-wide text-ink/50">SMTP Transcript</summary>
              <pre className="mt-1.5 max-h-48 overflow-y-auto whitespace-pre-wrap break-all border border-taupe/30 bg-beige/40 p-3 text-[11px] text-ink/80">
                {smtpLog.join("\n")}
              </pre>
            </details>
          )}

          <div className="mt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setError(null);
                onClose();
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
    </div>
  );
}
