import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { listProductTypes, createProductType } from "@/lib/admin/products";
import { withErrorHandling } from "@/lib/admin/with-error-handling";

export const GET = withErrorHandling(async () => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const types = await listProductTypes("atelier_supply");
  return NextResponse.json({ types });
});

export const POST = withErrorHandling(async (request: Request) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Type name is required" }, { status: 400 });
  }

  try {
    const type = await createProductType("atelier_supply", body.name);
    return NextResponse.json({ type }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create product type";
    // A unique-constraint hit (duplicate name for this category) is a
    // normal outcome, not a server error.
    const status = message.includes("duplicate") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
});
