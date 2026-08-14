"use client";

import type { ReactNode } from "react";
import { buttonClassName } from "./button-styles";

export function SubmitButton({
  pending,
  pendingLabel,
  children,
}: {
  pending: boolean;
  pendingLabel: string;
  children: ReactNode;
}) {
  return (
    <button type="submit" disabled={pending} className={`w-full ${buttonClassName("primary")}`}>
      {pending ? pendingLabel : children}
    </button>
  );
}
