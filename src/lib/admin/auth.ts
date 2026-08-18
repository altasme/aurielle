import "server-only";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

// Custom admin_users table + session cookies (not Supabase Auth), per
// the admin panel spec's own suggested schema. Passwords are hashed
// with scrypt (node:crypto, no extra dependency, Workers-compatible
// via the nodejs_compat flag already set in wrangler.jsonc) -- never
// stored in plaintext. Session cookies carry a random token; only its
// SHA-256 hash is ever stored, so a leaked DB row can't be replayed
// as a session on its own.

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = "admin_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derived = (await scrypt(password, salt, expected.length)) as Buffer;
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type AdminUser = { id: string; username: string };

export async function verifyLogin(username: string, password: string): Promise<AdminUser | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, username, password_hash")
    .eq("username", username)
    .maybeSingle();

  if (error || !data) return null;
  const valid = await verifyPassword(password, data.password_hash);
  if (!valid) return null;
  return { id: data.id, username: data.username };
}

export async function createSession(adminUserId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("admin_sessions").insert({
    admin_user_id: adminUserId,
    token_hash: hashToken(token),
    expires_at: expiresAt.toISOString(),
  });
  if (error) throw new Error(`Failed to create session: ${error.message}`);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const supabase = getSupabaseAdminClient();
    await supabase.from("admin_sessions").delete().eq("token_hash", hashToken(token));
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_sessions")
    .select("expires_at, admin_users(id, username)")
    .eq("token_hash", hashToken(token))
    .maybeSingle();

  if (error || !data) return null;
  if (new Date(data.expires_at) < new Date()) return null;

  const adminUser = data.admin_users as unknown as AdminUser | null;
  return adminUser ?? null;
}

// Call at the top of every admin Server Action / Route Handler, per
// the spec's explicit "protected server-side, not only through
// frontend route protection" requirement. The admin layout also
// checks this for page navigations, but that alone would not protect
// a directly-invoked server action or API route.
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getSessionAdminUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}
