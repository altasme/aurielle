import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { updateProductType } from "@/lib/admin/products";
import { withErrorHandling } from "@/lib/with-error-handling";

type Params = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling(async (request: Request, { params }: Params) => {
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

  const { id } = await params;
  try {
    const type = await updateProductType(id, body.name);
    return NextResponse.json({ type });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update product type";
    // A unique-constraint hit (duplicate name for this category) is a
    // normal outcome, not a server error.
    const status = message.includes("duplicate") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
});
