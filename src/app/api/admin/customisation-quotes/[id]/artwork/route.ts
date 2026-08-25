import { NextResponse } from "next/server";
import { getSessionAdminUser } from "@/lib/admin/auth";
import { getCustomisationQuote, getArtworkSignedUrl } from "@/lib/admin/customisation-quotes";
import { withErrorHandling } from "@/lib/with-error-handling";

type Params = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (_request: Request, { params }: Params) => {
  const user = await getSessionAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const quote = await getCustomisationQuote(id);
  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  if (!quote.artworkPath) return NextResponse.json({ error: "No artwork on file" }, { status: 404 });

  const url = await getArtworkSignedUrl(quote.artworkPath);
  return NextResponse.json({ url });
});
