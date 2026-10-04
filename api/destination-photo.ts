const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method not allowed");
  }

  const rawFile = Array.isArray(req.query?.file) ? req.query.file[0] : req.query?.file;
  const file = typeof rawFile === "string" ? rawFile.trim() : "";

  // The upstream host is fixed to Wikimedia Commons, so callers cannot turn
  // this endpoint into a general-purpose proxy.
  if (
    !file ||
    file.length > 220 ||
    file.includes("/") ||
    file.includes("\\") ||
    !/\.(?:jpe?g|png|webp)$/i.test(file)
  ) {
    return res.status(400).send("Invalid destination image");
  }

  const source =
    "https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/" +
    encodeURIComponent(file) +
    "&width=1280";

  try {
    const upstream = await fetch(source, {
      redirect: "follow",
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "User-Agent": "BhramanPrototype/1.0 (destination photography)",
      },
    });

    if (!upstream.ok) {
      console.warn("[destination-photo] Wikimedia returned", upstream.status, file);
      return res.status(404).send("Destination photograph unavailable");
    }

    const contentType = upstream.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) {
      console.warn("[destination-photo] Unexpected content type", contentType, file);
      return res.status(502).send("Invalid upstream image response");
    }

    const declaredLength = Number(upstream.headers.get("content-length") || 0);
    if (declaredLength > MAX_IMAGE_BYTES) {
      return res.status(413).send("Destination photograph is too large");
    }

    const bytes = await upstream.arrayBuffer();
    if (bytes.byteLength > MAX_IMAGE_BYTES) {
      return res.status(413).send("Destination photograph is too large");
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400");
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.status(200).send(Buffer.from(bytes));
  } catch (error: any) {
    console.error("[destination-photo] Upstream fetch failed", file, error?.message || error);
    return res.status(502).send("Destination photograph unavailable");
  }
}
