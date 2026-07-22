const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    let lat = parseFloat(url.searchParams.get("lat") || "");
    let lon = parseFloat(url.searchParams.get("lon") || "");
    let radius = parseInt(url.searchParams.get("radius") || "10000");

    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body?.lat != null) lat = Number(body.lat);
        if (body?.lon != null) lon = Number(body.lon);
        if (body?.radius != null) radius = Number(body.radius);
      } catch (_) { /* ignore */ }
    }

    if (isNaN(lat) || isNaN(lon)) {
      return new Response(JSON.stringify({ error: "lat/lon required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const query = `[out:json][timeout:25];(node["amenity"~"hospital|clinic|pharmacy|doctors"](around:${radius},${lat},${lon});way["amenity"~"hospital|clinic|pharmacy|doctors"](around:${radius},${lat},${lon});node["healthcare"](around:${radius},${lat},${lon}););out center;`;

    const endpoints = [
      "https://overpass.kumi.systems/api/interpreter",
      "https://overpass-api.de/api/interpreter",
      "https://overpass.openstreetmap.ru/api/interpreter",
      "https://overpass.private.coffee/api/interpreter",
    ];

    let data: any = null;
    let lastErr: any = null;
    for (const ep of endpoints) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 20000);
        const res = await fetch(ep, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `data=${encodeURIComponent(query)}`,
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
        break;
      } catch (e) {
        lastErr = e;
        console.warn(`endpoint failed ${ep}:`, (e as Error).message);
      }
    }

    if (!data) {
      return new Response(JSON.stringify({ error: "all endpoints failed", detail: String(lastErr) }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
