"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ThreadMessages, type ThreadMessage } from "./thread-messages";
import { ThreadReplyForm } from "./thread-reply-form";

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
  const [thread, setThread] = useState<ThreadMessage[] | null>(null);
  const router = useRouter();

  async function loadThread() {
    try {
      const res = await fetch(`/api/admin/messages/thread?source=${source}&id=${id}`);
      const data = await res.json();
      setThread(res.ok ? (data.messages as ThreadMessage[]) : []);
    } catch {
      setThread([]);
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/messages/thread?source=${source}&id=${id}`)
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
          <ThreadMessages messages={thread === null ? null : messages} />
        </div>

        <div className="border-t border-taupe/20 bg-white px-6 py-4">
          <ThreadReplyForm
            source={source}
            id={id}
            toEmail={toEmail}
            toName={toName}
            defaultSubject={defaultSubject}
            onSent={() => {
              loadThread();
              router.refresh();
            }}
            secondaryAction={
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-ink/70">
                Close
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
}
