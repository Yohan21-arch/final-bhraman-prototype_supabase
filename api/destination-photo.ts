const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method not allowed");
  }

  const rawFile = Array.isArray(req.query?.file) ? req.query.file[0] : req.query?.file;
  const rawQuery = Array.isArray(req.query?.q) ? req.query.q[0] : req.query?.q;
  const file = typeof rawFile === "string" ? rawFile.trim() : "";
  const query = typeof rawQuery === "string" ? rawQuery.trim().slice(0, 160) : "";

  // All upstream requests are fixed to Wikimedia Commons. The optional search
  // query is used only when a legacy catalogue filename no longer resolves.
  if (
    !file ||
    file.length > 220 ||
    file.includes("/") ||
    file.includes("\\") ||
    !/\.(?:jpe?g|png|webp)$/i.test(file)
  ) {
    return res.status(400).send("Invalid destination image");
  }

  const headers = {
    Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    "User-Agent": "BhramanPrototype/1.0 (destination photography)",
  };

  const fetchExactFile = () => {
    const source =
      "https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/" +
      encodeURIComponent(file) +
      "&width=1280";
    return fetch(source, { redirect: "follow", headers });
  };

  const findCommonsFallback = async (): Promise<string | null> => {
    if (!query) return null;

    const searchUrl = new URL("https://commons.wikimedia.org/w/api.php");
    searchUrl.searchParams.set("action", "query");
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("generator", "search");
    searchUrl.searchParams.set("gsrsearch", query);
    searchUrl.searchParams.set("gsrnamespace", "6");
    searchUrl.searchParams.set("gsrlimit", "8");
    searchUrl.searchParams.set("prop", "imageinfo");
    searchUrl.searchParams.set("iiprop", "url|mime|size");
    searchUrl.searchParams.set("iiurlwidth", "1280");

    const result = await fetch(searchUrl, {
      headers: { "User-Agent": "BhramanPrototype/1.0 (destination photography search)" },
    });
    if (!result.ok) return null;

    const json: any = await result.json();
    const pages = Object.values(json?.query?.pages || {}) as any[];
    const candidates = pages
      .filter((page) => {
        const info = page?.imageinfo?.[0];
        const mime = String(info?.mime || "").toLowerCase();
        return info && mime.startsWith("image/") && !mime.includes("svg");
      })
      .sort((a, b) => Number(a?.index || 999) - Number(b?.index || 999));

    const chosen = candidates[0]?.imageinfo?.[0];
    return chosen?.thumburl || chosen?.url || null;
  };

  try {
    let upstream = await fetchExactFile();
    let contentType = upstream.headers.get("content-type") || "";

    if (!upstream.ok || !contentType.toLowerCase().startsWith("image/")) {
      const fallbackUrl = await findCommonsFallback();
      if (!fallbackUrl) {
        console.warn("[destination-photo] No Wikimedia image found", file, query);
        return res.status(404).send("Destination photograph unavailable");
      }

      upstream = await fetch(fallbackUrl, { redirect: "follow", headers });
      contentType = upstream.headers.get("content-type") || "";
    }

    if (!upstream.ok || !contentType.toLowerCase().startsWith("image/")) {
      console.warn("[destination-photo] Wikimedia fallback failed", upstream.status, file, query);
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
