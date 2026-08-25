"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmit } from "@/lib/use-submit";

const FIELD_CLASSES =
  "w-full rounded-sm border border-taupe/40 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-burgundy focus:ring-1 focus:ring-burgundy/20";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { submitting, error, setError, submit } = useSubmit();

  async function handleSend() {
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
      if (!res.ok) throw new Error(data.error ?? "Failed to send reply");
      return data;
    });
    if (result) {
      setOpen(false);
      setBody("");
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
      <div className="w-full max-w-lg border border-taupe/20 bg-white p-6">
        <h2 className="font-serif text-lg text-ink">Reply to {toName || toEmail}</h2>
        <p className="mt-1 text-xs text-ink/50">
          Sends as the Aurielle Paris Atelier mailbox, to {toEmail}.
        </p>

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

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setError(null);
            }}
            disabled={submitting}
            className="px-4 py-2 text-sm text-ink/70"
          >
            Cancel
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
