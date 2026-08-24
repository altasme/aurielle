import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { getProduct, updateProduct, deleteProduct, type ProductInput } from "@/lib/admin/products";
import { deleteImage } from "@/lib/admin/cloudinary";
import { revalidateProduct } from "@/lib/admin/revalidate";
import { withErrorHandling } from "@/lib/with-error-handling";

type Params = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (_request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ product });
});

export const PATCH = withErrorHandling(async (request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getProduct(id);
  if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  let body: Partial<ProductInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
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
  // Product type (Atelier Supply) and Type (Aurielle Collection) are no
  // longer editable from this form -- type is chosen once at creation
  // and organizes the product into its sub-menu; preserve whatever is
  // already on the row rather than requiring it here.
  await updateProduct(id, {
    category: existing.category,
    name: body.name.trim(),
    description: body.description.trim(),
    price: body.price,
    currency: body.currency?.trim() || existing.currency,
    size: body.size.trim(),
    status: body.status === "active" ? "active" : "draft",
    tags: Array.isArray(body.tags) ? body.tags : [],
    mood: body.mood?.trim() || undefined,
    productTypeId: existing.productTypeId ?? undefined,
  });

  revalidateProduct(existing.category, existing.slug);
  return NextResponse.json({ ok: true });
});

export const DELETE = withErrorHandling(async (_request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getProduct(id);
  if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const { images } = await deleteProduct(id);

  // Best-effort Cloudinary cleanup: the product row (and its
  // product_images rows, via cascade) are already gone, so a failed
  // asset delete here shouldn't fail the request -- it'd just leave an
  // orphaned Cloudinary asset with no DB reference, not a broken
  // product.
  await Promise.allSettled(images.map((img) => deleteImage(img.cloudinaryPublicId)));

  revalidateProduct(existing.category, existing.slug);
  return NextResponse.json({ ok: true });
});
