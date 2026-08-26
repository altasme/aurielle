import Image from "next/image";

export type ThreadAttachment = { filename: string; mimeType: string | null; path: string; url: string };

export type ThreadMessage = {
  id: string;
  direction: "inbound" | "outbound";
  fromEmail: string;
  fromName: string | null;
  bodyText: string | null;
  attachments: ThreadAttachment[];
  createdAt: string;
  isOriginal?: boolean;
};

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

// Shared conversation-body renderer: avatar'd chat bubbles, admin
// replies (the site logo, right-aligned, burgundy) vs. everything else
// (initials, left-aligned, neutral). Used by both the Quotes and
// Inquiries thread modal and the Aurielle Mail reading pane so the two
// inboxes read as one consistent mail client rather than two designs.
export function ThreadMessages({ messages }: { messages: ThreadMessage[] | null }) {
  if (messages === null) return <p className="text-xs text-ink/50">Loading conversation...</p>;

  return (
    <>
      {messages.map((message) => {
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
                {message.isOriginal && <span className="italic">original message</span>}
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
    </>
  );
}
