"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { useSubmit } from "@/lib/use-submit";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { submitting, error, submit } = useSubmit();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = await submit(async () => {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid username or password");
      return data;
    });
    if (result) {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <FormField label="Username" value={username} onChange={setUsername} required />
      <FormField label="Password" type="password" value={password} onChange={setPassword} required />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <SubmitButton pending={submitting} pendingLabel="Signing in...">
        Sign In
      </SubmitButton>
    </form>
  );
}
