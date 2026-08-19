import { NextResponse } from "next/server";
import { verifyLogin, createSession } from "@/lib/admin/auth";

export async function POST(request: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { username, password } = body;
  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  try {
    const user = await verifyLogin(username, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Surfaced to the client deliberately: this is a private,
    // unauthenticated-only endpoint (no session to leak), and without
    // this the Workers runtime returns a bare empty-body 500 that gives
    // no signal at all about what actually failed (missing env var vs.
    // a Supabase error vs. something else).
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Admin login failed:", err);
    return NextResponse.json({ error: `Login failed: ${message}` }, { status: 500 });
  }
}
