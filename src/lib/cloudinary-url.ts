// Every uploaded product/site photo is served at whatever resolution
// was originally uploaded, with no resizing or format optimization --
// Next's own image optimizer is disabled sitewide (images.unoptimized
// in next.config.ts, since automatic optimization needs a Cloudflare
// Images binding this project doesn't have). Cloudinary can do the
// same job on the fly, for free, purely via the delivery URL: this
// inserts a transformation segment right after "/upload/" so Cloudinary
// resizes/reformats/compresses at its own edge and caches the result,
// no re-upload and no new infra required.
//
// Static /images/... paths (this site's original, pre-Cloudinary
// assets) aren't Cloudinary URLs at all and pass through unchanged.
export function cloudinaryTransform(url: string, transform: string): string {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/${transform}/`);
}

// A grid/list card thumbnail -- square crop, capped well above any
// rendered size on today's densest displays.
export function cloudinaryCardUrl(url: string): string {
  return cloudinaryTransform(url, "w_700,h_700,c_fill,g_auto,q_auto,f_auto");
}

// A product page's large gallery photo.
export function cloudinaryDetailUrl(url: string): string {
  return cloudinaryTransform(url, "w_1200,h_1200,c_fill,g_auto,q_auto,f_auto");
}

// A gallery's small thumbnail strip.
export function cloudinaryThumbUrl(url: string): string {
  return cloudinaryTransform(url, "w_200,h_200,c_fill,g_auto,q_auto,f_auto");
}

// A full-bleed hero/banner photo (Website Management image slots) --
// capped to a sane max width, no forced crop since slots vary in
// aspect ratio and already rely on CSS object-cover for that.
export function cloudinaryHeroUrl(url: string): string {
  return cloudinaryTransform(url, "w_1920,q_auto,f_auto");
}
