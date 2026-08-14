"use client";

import { useState } from "react";

// Shared submit lifecycle for the four forms that POST/GET to an API
// route (contact, business inquiry, checkout, order lookup): tracks
// submitting/error state around an async action. The action should
// throw an Error with a user-facing message on a handled failure (e.g.
// a non-2xx response); a raw network failure (fetch rejecting with
// TypeError) falls back to a generic message instead of surfacing
// something like "Failed to fetch".
export function useSubmit() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit<T>(action: () => Promise<T>): Promise<T | undefined> {
    setError(null);
    setSubmitting(true);
    try {
      return await action();
    } catch (err) {
      setError(
        err instanceof Error && !(err instanceof TypeError)
          ? err.message
          : "Network error. Please try again.",
      );
      return undefined;
    } finally {
      setSubmitting(false);
    }
  }

  return { submitting, error, setError, submit };
}
