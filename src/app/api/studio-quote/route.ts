import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { withErrorHandling } from "@/lib/with-error-handling";

const MAX_ARTWORK_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_ARTWORK_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/postscript", // .ai / .eps
  "image/svg+xml",
];

type QuotePayload = {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  grouping?: string;
  itemInterest?: string;
  quantity?: string;
  message?: string;
};

export const POST = withErrorHandling(async (request: Request) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const payloadRaw = formData.get("payload");
  const artwork = formData.get("artwork");

  if (typeof payloadRaw !== "string") {
    return NextResponse.json({ error: "Missing quote request payload" }, { status: 400 });
  }

  let payload: QuotePayload;
  try {
    payload = JSON.parse(payloadRaw);
  } catch {
    return NextResponse.json({ error: "Malformed quote request payload" }, { status: 400 });
  }

  if (!payload.name?.trim() || !payload.email?.trim()) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  // Artwork is optional -- some customers want to discuss the request
  // before they have a final file -- but if one is attached, validate it.
  let artworkFile: File | null = null;
  if (artwork instanceof File && artwork.size > 0) {
    if (artwork.size > MAX_ARTWORK_SIZE) {
      return NextResponse.json({ error: "Artwork file is too large (max 8MB)" }, { status: 400 });
    }
    if (!ALLOWED_ARTWORK_TYPES.includes(artwork.type)) {
      return NextResponse.json(
        { error: "Artwork must be an image, PDF, SVG, or AI/EPS file" },
        { status: 400 },
      );
    }
    artworkFile = artwork;
  }

  const supabase = getSupabaseAdminClient();

  let artworkPath: string | null = null;
  if (artworkFile) {
    const artworkBytes = new Uint8Array(await artworkFile.arrayBuffer());
    artworkPath = `${crypto.randomUUID()}-${artworkFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("customisation-artwork")
      .upload(artworkPath, artworkBytes, { contentType: artworkFile.type });
    if (uploadError) {
      console.error("Artwork upload failed", uploadError);
      // Don't fail the whole quote request over a failed asset upload --
      // the team can follow up with the customer for the file directly.
      artworkPath = null;
    }
  }

  const { error } = await supabase.from("customisation_quotes").insert({
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone?.trim() || null,
    country: payload.country?.trim() || null,
    grouping: payload.grouping?.trim() || null,
    item_interest: payload.itemInterest?.trim() || null,
    quantity: payload.quantity?.trim() || null,
    message: payload.message?.trim() || null,
    artwork_path: artworkPath,
  });

  if (error) {
    console.error("Customisation quote insert failed", error);
    return NextResponse.json({ error: "Could not submit your quote request" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
});
