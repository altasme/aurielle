"use client";

import { useState, type ReactNode } from "react";
import { InquiryThreadModal } from "./inquiry-thread-modal";

// Wraps a table row so clicking anywhere in it opens the full
// conversation (Gmail-style: subject, participants, thread, reply box)
// -- instead of a small "Reply" link buried in the Actions column.
// Interactive elements inside the row (e.g. "Mark as Read") stop
// propagation so they don't also trigger the row-open.
//
// The modal itself renders in a trailing zero-width <td>, not as a
// sibling of <tr>, so the table stays valid HTML (a <div> can't be a
// direct child of <tbody>) -- its `fixed inset-0` positioning makes it
// a full-viewport overlay regardless of that cell's size.
export function InquiryThreadRow({
  source,
  id,
  toEmail,
  toName,
  defaultSubject,
  originalMessage,
  originalCreatedAt,
  meta,
  extra,
  children,
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
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <tr
      onClick={() => setOpen(true)}
      className="cursor-pointer border-b border-taupe/10 align-top transition-colors last:border-0 hover:bg-beige/30"
    >
      {children}
      <td className="w-0 p-0">
        {open && (
          <InquiryThreadModal
            source={source}
            id={id}
            toEmail={toEmail}
            toName={toName}
            defaultSubject={defaultSubject}
            originalMessage={originalMessage}
            originalCreatedAt={originalCreatedAt}
            meta={meta}
            extra={extra}
            onClose={() => setOpen(false)}
          />
        )}
      </td>
    </tr>
  );
}
