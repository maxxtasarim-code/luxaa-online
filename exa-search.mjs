const EXA_SEARCH_URL = "https://api.exa.ai/search";
const EXA_TIMEOUT_MS = 8_000;
const MAX_RESULTS = 5;

function sourceName(url) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return "Web kaynağı";
  }
}

function publicError(code, message, retryable = false) {
  return { ok: false, error: { code, message, retryable } };
}

function sanitizeErrorCode(value) {
  if (typeof value !== "string") return null;
  const safe = value.replace(/[^A-Za-z0-9_.:-]/g, "").slice(0, 80);
  return safe || null;
}

function logFailure(status, data) {
  const upstreamCode = data?.error?.code ?? data?.error?.type ?? data?.code;
  console.warn("[LUXA] Exa upstream failure", {
    status: Number.isInteger(status) ? status : null,
    error_code: sanitizeErrorCode(upstreamCode),
  });
}

function publishedAtFor(result) {
  const value = [result?.publishedDate, result?.published_date, result?.date]
    .find((candidate) => typeof candidate === "string" && candidate.trim());
  return value && !Number.isNaN(Date.parse(value)) ? new Date(value).toISOString() : null;
}

function resultDescription(result) {
  const highlights = Array.isArray(result?.highlights)
    ? result.highlights.filter((item) => typeof item === "string" && item.trim()).join(" ")
    : "";
  const text = typeof result?.text === "string" ? result.text.trim() : "";
  return (highlights || text).replace(/\s+/g, " ").trim();
}

function normalizeResults(data) {
  if (!Array.isArray(data?.results)) return [];
  return data.results
    .map((result) => {
      const title = typeof result?.title === "string" ? result.title.trim() : "";
      const url = typeof result?.url === "string" ? result.url.trim() : "";
      const description = resultDescription(result);
      try {
        const parsed = new URL(url);
        if (!title || !description || !["http:", "https:"].includes(parsed.protocol)) return null;
        return {
          title: title.slice(0, 240),
          description: description.slice(0, 800),
          source: sourceName(parsed.href),
          url: parsed.href,
          publishedAt: publishedAtFor(result),
          provider: "exa",
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .slice(0, MAX_RESULTS);
}

export function exaConfigured() {
  return Boolean(process.env.EXA_API_KEY);
}

export async function searchExa(query, preferences = {}) {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    return { sources: [], error: publicError("exa_not_configured", "Exa web araması sunucuda yapılandırılmamış.") };
  }

  const body = {
    query: query.slice(0, 500),
    type: "fast",
    numResults: MAX_RESULTS,
    contents: { highlights: { maxCharacters: 800 } },
  };
  if (preferences.country) body.userLocation = { country: preferences.country };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EXA_TIMEOUT_MS);
  try {
    const upstream = await fetch(EXA_SEARCH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await upstream.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!upstream.ok) {
      logFailure(upstream.status, data);
      if (upstream.status === 401 || upstream.status === 403) {
        return { sources: [], error: publicError("exa_unauthorized", "Exa web araması yetkilendirilemedi.") };
      }
      if (upstream.status === 402) {
        return { sources: [], error: publicError("exa_credits_unavailable", "Exa web araması için kullanılabilir ücretsiz kredi bulunamadı.") };
      }
      if (upstream.status === 429) {
        return { sources: [], error: publicError("exa_limit", "Exa web araması kullanım limiti doldu.", true) };
      }
      return { sources: [], error: publicError("exa_failed", "Exa web araması şu anda tamamlanamadı.", upstream.status >= 500) };
    }

    const sources = normalizeResults(data);
    return { sources, error: null };
  } catch (error) {
    logFailure(null, { error: { code: error?.name === "AbortError" ? "timeout" : "network_error" } });
    return {
      sources: [],
      error: publicError(
        error?.name === "AbortError" ? "exa_timeout" : "exa_network_error",
        "Exa web aramasına ulaşılamadı.",
        true,
      ),
    };
  } finally {
    clearTimeout(timeout);
  }
}
