import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { getProduct } from "@/lib/admin/products";
import { uploadImage } from "@/lib/admin/cloudinary";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { revalidateProduct } from "@/lib/admin/revalidate";
import { withErrorHandling } from "@/lib/with-error-handling";

type Params = { params: Promise<{ id: string }> };

export const POST = withErrorHandling(async (request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  let uploaded: Awaited<ReturnType<typeof uploadImage>>;
  try {
    uploaded = await uploadImage(file, `aurielle/${product.category}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image upload failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const supabase = getSupabaseAdminClient();
  const isFirstImage = product.images.length === 0;
  const nextSortOrder = product.images.length
    ? Math.max(...product.images.map((img) => img.sortOrder)) + 1
    : 0;

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: id,
      cloudinary_public_id: uploaded.publicId,
      cloudinary_url: uploaded.url,
      is_primary: isFirstImage,
      sort_order: nextSortOrder,
    })
    .select("id, cloudinary_public_id, cloudinary_url, is_primary, sort_order")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Failed to save image" }, { status: 500 });
  }

  revalidateProduct(product.category, product.slug);
  return NextResponse.json({
    image: {
      id: data.id,
      cloudinaryPublicId: data.cloudinary_public_id,
      cloudinaryUrl: data.cloudinary_url,
      isPrimary: data.is_primary,
      sortOrder: data.sort_order,
    },
  });
});

// Reorders every image for a product in one call: body is the full
// list of image IDs in the desired display order.
export const PATCH = withErrorHandling(async (request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  let body: { order?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const order = body.order;
  const knownIds = new Set(product.images.map((img) => img.id));
  if (!Array.isArray(order) || order.length !== product.images.length || !order.every((imgId) => knownIds.has(imgId))) {
    return NextResponse.json({ error: "order must list every image ID for this product exactly once" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const results = await Promise.all(
    order.map((imageId, index) =>
      supabase.from("product_images").update({ sort_order: index }).eq("id", imageId).eq("product_id", id),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return NextResponse.json({ error: failed.error.message }, { status: 500 });
  }

  revalidateProduct(product.category, product.slug);
  return NextResponse.json({ ok: true });
});
