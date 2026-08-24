import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { listProducts, createProduct, type ProductCategory, type ProductInput } from "@/lib/admin/products";
import { revalidateProduct } from "@/lib/admin/revalidate";
import { withErrorHandling } from "@/lib/with-error-handling";

function isCategory(value: unknown): value is ProductCategory {
  return value === "aurielle_collection" || value === "atelier_supply";
}

export const GET = withErrorHandling(async (request: Request) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  if (!isCategory(category)) {
    return NextResponse.json({ error: "category must be aurielle_collection or atelier_supply" }, { status: 400 });
  }

  const products = await listProducts({
    category,
    search: searchParams.get("search") ?? undefined,
    productTypeId: searchParams.get("productType") ?? undefined,
  });
  return NextResponse.json({ products });
});

export const POST = withErrorHandling(async (request: Request) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Partial<ProductInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!isCategory(body.category)) {
    return NextResponse.json({ error: "category must be aurielle_collection or atelier_supply" }, { status: 400 });
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Product name is required" }, { status: 400 });
  }
  if (typeof body.price !== "number" || !Number.isFinite(body.price) || body.price < 0) {
    return NextResponse.json({ error: "Price must be a non-negative number" }, { status: 400 });
  }
  if (!body.size?.trim()) {
    return NextResponse.json({ error: "Size is required" }, { status: 400 });
  }
  if (!body.description?.trim()) {
    return NextResponse.json({ error: "Description is required" }, { status: 400 });
  }
  if (body.category === "atelier_supply" && !body.productTypeId) {
    return NextResponse.json({ error: "Product type is required" }, { status: 400 });
  }

  const { id } = await createProduct({
    category: body.category,
    name: body.name.trim(),
    description: body.description.trim(),
    price: body.price,
    currency: body.currency?.trim() || (body.category === "aurielle_collection" ? "₱" : "USD"),
    size: body.size.trim(),
    status: body.status === "active" ? "active" : "draft",
    tags: Array.isArray(body.tags) ? body.tags : [],
    mood: body.mood?.trim() || undefined,
    productTypeId: body.productTypeId,
  });

  revalidateProduct(body.category);
  return NextResponse.json({ id }, { status: 201 });
});
