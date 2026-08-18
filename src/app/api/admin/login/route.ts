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

  const user = await verifyLogin(username, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
