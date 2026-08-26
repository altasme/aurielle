"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ThreadMessages, type ThreadMessage, type ThreadAttachment } from "./thread-messages";
import { ThreadReplyForm } from "./thread-reply-form";

type MailMessage = {
  id: string;
  toEmail: string;
  fromEmail: string;
  fromName: string | null;
  subject: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  attachments: ThreadAttachment[];
  viewedAt: string | null;
  createdAt: string;
};

function relativeTime(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function snippet(message: MailMessage): string {
  const text = (message.bodyText ?? "").replace(/\s+/g, " ").trim();
  return text.length > 100 ? `${text.slice(0, 100)}...` : text;
}

function replySubject(subject: string | null): string {
  if (!subject) return "Re: Your message to Aurielle Paris Atelier";
  return subject.toLowerCase().startsWith("re:") ? subject : `Re: ${subject}`;
}

// The Aurielle Mail inbox: everything sent to hello@ that isn't a
// Quotes and Inquiries reply (email-worker/src/index.ts's "unmatched"
// fallback -> general_mail). A classic list + reading-pane mail
// client, sharing the same thread renderer and reply form as the
// Quotes and Inquiries thread modal so both read as one system.
export function AurielleMailClient({ initialMessages }: { initialMessages: MailMessage[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<ThreadMessage[] | null>(null);
  const router = useRouter();

  const selected = useMemo(
    () => initialMessages.find((message) => message.id === selectedId) ?? null,
    [initialMessages, selectedId],
  );

  async function loadThread(id: string) {
    try {
      const res = await fetch(`/api/admin/messages/thread?source=mail&id=${id}`);
      const data = await res.json();
      setThread(res.ok ? (data.messages as ThreadMessage[]) : []);
    } catch {
      setThread([]);
    }
  }

  function openMessage(message: MailMessage) {
    setSelectedId(message.id);
    setThread(null);
    void loadThread(message.id);
    if (!message.viewedAt) {
      void fetch(`/api/admin/general-mail/${message.id}`, { method: "PATCH" }).then(() => router.refresh());
    }
  }

  async function handleDelete() {
    if (!selected) return;
    if (!window.confirm("Permanently delete this email? This cannot be undone.")) return;
    await fetch(`/api/admin/general-mail/${selected.id}`, { method: "DELETE" });
    setSelectedId(null);
    setThread(null);
    router.refresh();
  }

  const messages: ThreadMessage[] | null =
    thread === null || !selected
      ? null
      : [
          {
            id: "original",
            direction: "inbound",
            fromEmail: selected.fromEmail,
            fromName: selected.fromName,
            bodyText: selected.bodyText,
            attachments: selected.attachments,
            createdAt: selected.createdAt,
            isOriginal: true,
          },
          ...thread,
        ];

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden border border-taupe/20 bg-white">
      <div
        className={`w-full shrink-0 flex-col border-r border-taupe/20 md:flex md:w-80 ${selected ? "hidden" : "flex"}`}
      >
        <div className="flex items-center justify-between border-b border-taupe/20 px-4 py-3">
          <span className="text-xs uppercase tracking-wide text-ink/50">
            {initialMessages.length} message{initialMessages.length === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="text-xs uppercase tracking-wide text-burgundy underline"
          >
            Refresh
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {initialMessages.map((message) => {
            const unread = !message.viewedAt;
            const active = message.id === selectedId;
            return (
              <button
                key={message.id}
                type="button"
                onClick={() => openMessage(message)}
                className={`block w-full border-b border-taupe/10 px-4 py-3 text-left transition-colors ${
                  active ? "bg-beige/50" : "hover:bg-beige/20"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`truncate text-sm ${unread ? "font-semibold text-ink" : "text-ink/70"}`}>
                    {message.fromName || message.fromEmail}
                  </span>
                  <span className="shrink-0 text-[11px] text-ink/40">{relativeTime(message.createdAt)}</span>
                </div>
                <p className={`mt-0.5 truncate text-sm ${unread ? "font-medium text-ink" : "text-ink/60"}`}>
                  {message.subject || "(no subject)"}
                </p>
                <p className="mt-0.5 truncate text-xs text-ink/40">{snippet(message)}</p>
              </button>
            );
          })}
          {initialMessages.length === 0 && <p className="px-4 py-10 text-center text-sm text-ink/50">No mail yet.</p>}
        </div>
      </div>

      <div className={`min-w-0 flex-1 flex-col md:flex ${selected ? "flex" : "hidden"}`}>
        {!selected && (
          <div className="flex flex-1 items-center justify-center text-sm text-ink/40">Select a message to read it.</div>
        )}
        {selected && (
          <>
            <div className="flex items-start justify-between gap-4 border-b border-taupe/20 bg-beige/30 px-6 py-4">
              <div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="mb-1 text-xs uppercase tracking-wide text-ink/50 underline md:hidden"
                >
                  &larr; Back to Inbox
                </button>
                <h2 className="font-serif text-lg text-ink">{selected.subject || "(no subject)"}</h2>
                <p className="mt-0.5 text-xs text-ink/60">
                  {selected.fromName ? `${selected.fromName} · ` : ""}
                  {selected.fromEmail}
                </p>
              </div>
              <button type="button" onClick={handleDelete} className="text-xs uppercase tracking-wide text-red-700 underline">
                Delete
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-beige/10 px-6 py-5">
              <ThreadMessages messages={messages} />
            </div>

            <div className="border-t border-taupe/20 bg-white px-6 py-4">
              <ThreadReplyForm
                source="mail"
                id={selected.id}
                toEmail={selected.fromEmail}
                toName={selected.fromName ?? ""}
                defaultSubject={replySubject(selected.subject)}
                onSent={() => {
                  void loadThread(selected.id);
                  router.refresh();
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
