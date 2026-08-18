import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin Login | Aurielle Paris Atelier",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const user = await getSessionAdminUser();
  if (user) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <div className="w-full max-w-sm border border-taupe/20 bg-white p-8">
        <p className="font-serif text-xl tracking-[0.15em] text-burgundy">AURIELLE</p>
        <h1 className="mt-1 text-sm text-ink/60">Admin Panel</h1>
        <LoginForm />
      </div>
    </div>
  );
}
