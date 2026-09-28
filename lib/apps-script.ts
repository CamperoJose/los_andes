import { unstable_cache } from "next/cache";

export function integrationErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return "No se pudo conectar con Apps Script";
  if (error.message.startsWith("Variables faltantes: ")) return error.message;
  if (error.message === "URL de Apps Script inválida") return "APPS_SCRIPT_URL debe ser la URL publicada que termina en /exec";
  if (error.message === "Apps Script requiere acceso anónimo") return "Apps Script exige iniciar sesión en Google. La aplicación web debe permitir acceso anónimo";
  if (error.message === "API_KEY no coincide") return "APPS_SCRIPT_API_KEY no coincide con API_KEY de Apps Script";
  if (error.message.startsWith("Apps Script respondió ")) return error.message;
  return "Apps Script no respondió correctamente. Revisa sus ejecuciones y la implementación publicada";
}

function settings() {
  const url = process.env.APPS_SCRIPT_URL;
  const apiKey = process.env.APPS_SCRIPT_API_KEY;
  const missing = [!url?.trim() && "APPS_SCRIPT_URL", !apiKey?.trim() && "APPS_SCRIPT_API_KEY"].filter(Boolean);
  if (missing.length) throw new Error(`Variables faltantes: ${missing.join(", ")}`);
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(url!)) throw new Error("URL de Apps Script inválida");
  return { url: url!, apiKey: apiKey! };
}

async function parseResponse(response: Response) {
  if (response.status === 401 || response.status === 403) throw new Error("Apps Script requiere acceso anónimo");
  if (!response.ok) throw new Error(`Apps Script respondió ${response.status}`);
  if (!(response.headers.get("content-type") || "").includes("application/json")) throw new Error("Apps Script requiere acceso anónimo");
  const data = await response.json();
  if (!data.success && data.message === "No autorizado") throw new Error("API_KEY no coincide");
  return data;
}

export async function callAppsScriptGet(action: string, params: Record<string, string> = {}) {
  const { url, apiKey } = settings();
  // Cache only validated results. Apps Script reports application errors with
  // HTTP 200; caching the raw fetch would replace the last good data with them.
  return unstable_cache(async () => {
    const query = new URLSearchParams({ action, apiKey, ...params });
    const response = await fetch(`${url}?${query}`, {
      redirect: "follow", cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    const data = await parseResponse(response);
    if (!data.success) throw new Error(data.message || "Apps Script devolvió un error");
    return data;
  }, ["los-andes", action, JSON.stringify(params), url], {
    revalidate: action === "oportunidades" ? 120 : 60,
    tags: [action],
  })();
}

export async function callAppsScriptPost(action: string, body: Record<string, unknown> = {}) {
  const { url, apiKey } = settings();
  const response = await fetch(url, {
    method: "POST",
    redirect: "follow",
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, apiKey, ...body }),
  });
  return parseResponse(response);
}
