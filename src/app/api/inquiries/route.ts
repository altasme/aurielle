import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { withErrorHandling } from "@/lib/with-error-handling";

type ContactBody = {
  type: "contact";
  name: string;
  email: string;
  country?: string;
  inquiryType?: string;
  message: string;
};

type WholesaleBody = {
  type: "wholesale";
  name: string;
  businessName?: string;
  email: string;
  country: string;
  productInterest?: string;
  estimatedQuantity?: string;
  message?: string;
};

export const POST = withErrorHandling(async (request: Request) => {
  let body: ContactBody | WholesaleBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();

  if (body.type === "contact") {
    if (!body.message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    const { error } = await supabase.from("contact_inquiries").insert({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      country: body.country?.trim() || null,
      inquiry_type: body.inquiryType?.trim() || null,
      message: body.message.trim(),
    });
    if (error) {
      console.error("Contact inquiry insert failed", error);
      return NextResponse.json({ error: "Could not submit inquiry" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (body.type === "wholesale") {
    if (!body.country?.trim()) {
      return NextResponse.json({ error: "Country is required" }, { status: 400 });
    }
    const { error } = await supabase.from("wholesale_inquiries").insert({
      name: body.name.trim(),
      business_name: body.businessName?.trim() || null,
      email: body.email.trim().toLowerCase(),
      country: body.country.trim(),
      product_interest: body.productInterest?.trim() || null,
      estimated_quantity: body.estimatedQuantity?.trim() || null,
      message: body.message?.trim() || null,
    });
    if (error) {
      console.error("Wholesale inquiry insert failed", error);
      return NextResponse.json({ error: "Could not submit inquiry" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid inquiry type" }, { status: 400 });
});
