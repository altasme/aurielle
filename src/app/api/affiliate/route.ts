import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { withErrorHandling } from "@/lib/with-error-handling";

type AffiliateBody = {
  name: string;
  mobileNumber: string;
  email: string;
  shopeeId?: string;
  fbPage?: string;
  tiktokAccount?: string;
};

export const POST = withErrorHandling(async (request: Request) => {
  let body: Partial<AffiliateBody>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!body.mobileNumber?.trim()) {
    return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
  }
  if (!body.email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("affiliate_applications").insert({
    name: body.name.trim(),
    mobile_number: body.mobileNumber.trim(),
    email: body.email.trim().toLowerCase(),
    shopee_id: body.shopeeId?.trim() || null,
    fb_page: body.fbPage?.trim() || null,
    tiktok_account: body.tiktokAccount?.trim() || null,
  });

  if (error) {
    console.error("Affiliate application insert failed", error);
    return NextResponse.json({ error: "Could not submit application" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
});
