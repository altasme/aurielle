import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { getProduct } from "@/lib/admin/products";
import { deleteImage } from "@/lib/admin/cloudinary";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { revalidateProduct } from "@/lib/admin/revalidate";
import { withErrorHandling } from "@/lib/with-error-handling";

type Params = { params: Promise<{ id: string; imageId: string }> };

export const PATCH = withErrorHandling(async (request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, imageId } = await params;
  const product = await getProduct(id);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  if (!product.images.some((img) => img.id === imageId)) {
    return NextResponse.json({ error: "Image not found on this product" }, { status: 404 });
  }

  let body: { isPrimary?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (body.isPrimary !== true) {
    return NextResponse.json({ error: "Only isPrimary: true is supported" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { error: clearError } = await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", id);
  if (clearError) return NextResponse.json({ error: clearError.message }, { status: 500 });

  const { error: setError } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId);
  if (setError) return NextResponse.json({ error: setError.message }, { status: 500 });

  revalidateProduct(product.category, product.slug);
  return NextResponse.json({ ok: true });
});

export const DELETE = withErrorHandling(async (_request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, imageId } = await params;
  const product = await getProduct(id);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const image = product.images.find((img) => img.id === imageId);
  if (!image) return NextResponse.json({ error: "Image not found on this product" }, { status: 404 });

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Best-effort: the DB row is already gone either way.
  await deleteImage(image.cloudinaryPublicId).catch(() => undefined);

  // If the deleted image was primary and others remain, promote the
  // next one so the product never ends up with images but no primary.
  if (image.isPrimary) {
    const remaining = product.images.filter((img) => img.id !== imageId).sort((a, b) => a.sortOrder - b.sortOrder);
    if (remaining[0]) {
      await supabase.from("product_images").update({ is_primary: true }).eq("id", remaining[0].id);
    }
  }

  revalidateProduct(product.category, product.slug);
  return NextResponse.json({ ok: true });
});
