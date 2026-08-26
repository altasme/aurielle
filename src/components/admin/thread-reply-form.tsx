"use client";

import { useRef, useState, type ReactNode } from "react";
import { useSubmit } from "@/lib/use-submit";
import type { InquirySource } from "@/lib/admin/inquiry-messages";

const FIELD_CLASSES =
  "w-full rounded-sm border border-taupe/40 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-burgundy focus:ring-1 focus:ring-burgundy/20";

// The compose box shared by the Quotes and Inquiries thread modal and
// the Aurielle Mail reading pane: subject/body/attachments, POSTs to
// the shared /api/admin/messages/reply endpoint (works for any source
// -- contact/business/studio/mail), and surfaces the SMTP transcript
// either way (TEMPORARY, see send-reply.ts).
export function ThreadReplyForm({
  source,
  id,
  toEmail,
  toName,
  defaultSubject,
  onSent,
  secondaryAction,
}: {
  source: InquirySource;
  id: string;
  toEmail: string;
  toName: string;
  defaultSubject: string;
  onSent: () => void;
  secondaryAction?: ReactNode;
}) {
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState("");
  const [smtpLog, setSmtpLog] = useState<string[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { submitting, error, submit } = useSubmit();

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

      const res = await fetch("/api/admin/messages/reply", { method: "POST", body: formData });
      const data = await res.json();
      setSmtpLog(Array.isArray(data.smtpLog) ? data.smtpLog : []);
      if (!res.ok) throw new Error(data.error ?? "Failed to send reply");
      return data;
    });
    if (result) {
      setBody("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      onSent();
    }
  }

  return (
    <div>
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
      {!error && smtpLog && <p className="mt-2 text-sm text-green-700">Server reported success. SMTP transcript below.</p>}
      {smtpLog && smtpLog.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs uppercase tracking-wide text-ink/50">SMTP Transcript</summary>
          <pre className="mt-1.5 max-h-48 overflow-y-auto whitespace-pre-wrap break-all border border-taupe/30 bg-beige/40 p-3 text-[11px] text-ink/80">
            {smtpLog.join("\n")}
          </pre>
        </details>
      )}

      <div className="mt-3 flex justify-end gap-3">
        {secondaryAction}
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
  );
}
