import { unstable_cache } from "next/cache";
import { createHmac } from "crypto";

export function integrationErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return "No se pudo conectar con Apps Script";
  if (error.message.startsWith("Variables faltantes: ")) return error.message;
  if (error.message === "URL de Apps Script inválida") return "APPS_SCRIPT_URL debe ser la URL publicada que termina en /exec";
  if (error.message === "Apps Script requiere acceso anónimo") return "Apps Script exige iniciar sesión en Google. La aplicación web debe permitir acceso anónimo";
  if (error.message === "Firma administrativa inválida") return "ADMIN_SESSION_SECRET no coincide con el configurado en Apps Script";
  if (error.message.startsWith("Apps Script respondió ")) return error.message;
  return "Apps Script no respondió correctamente. Revisa sus ejecuciones y la implementación publicada";
}

function settings() {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url?.trim()) throw new Error("Variables faltantes: APPS_SCRIPT_URL");
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(url!)) throw new Error("URL de Apps Script inválida");
  return url;
}

async function parseResponse(response: Response) {
  if (response.status === 401 || response.status === 403) throw new Error("Apps Script requiere acceso anónimo");
  if (!response.ok) throw new Error(`Apps Script respondió ${response.status}`);
  if (!(response.headers.get("content-type") || "").includes("application/json")) throw new Error("Apps Script requiere acceso anónimo");
  const data = await response.json();
  if (!data.success && data.message === "No autorizado") throw new Error("Firma administrativa inválida");
  return data;
}

const adminActions = new Set([
  "login", "admin_oportunidades", "admin_dashboard", "admin_postulaciones",
  "guardar_oportunidad", "eliminar_oportunidad", "actualizar_postulacion",
]);

async function requestPost(action: string, body: Record<string, unknown> = {}) {
  const url = settings();
  const payload = JSON.stringify({ ...body, action });
  let requestBody = payload;
  if (adminActions.has(action)) {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) throw new Error("ADMIN_SESSION_SECRET no configurado");
    const timestamp = Date.now();
    const signature = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("base64url");
    requestBody = JSON.stringify({ timestamp, payload, signature });
  }
  const response = await fetch(url, {
    method: "POST", redirect: "follow", cache: "no-store",
    signal: AbortSignal.timeout(30000),
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: requestBody,
  });
  return parseResponse(response);
}

export async function callAppsScriptGet(action: string, params: Record<string, string> = {}) {
  const url = settings();
  // Cache only validated results. Apps Script reports application errors with
  // HTTP 200; caching the raw fetch would replace the last good data with them.
  return unstable_cache(async () => {
    let data;
    if (action === "oportunidades") {
      const query = new URLSearchParams({ action, ...params });
      const response = await fetch(`${url}?${query}`, {
        redirect: "follow", cache: "no-store", signal: AbortSignal.timeout(30000),
      });
      data = await parseResponse(response);
    } else if (adminActions.has(action) && action.startsWith("admin_")) {
      data = await requestPost(action, params);
    } else {
      throw new Error("Acción no válida");
    }
    if (!data.success) throw new Error(data.message || "Apps Script devolvió un error");
    return data;
  }, ["los-andes", action, JSON.stringify(params), url], {
    revalidate: action === "oportunidades" ? 120 : 60,
    tags: [action],
  })();
}

export async function callAppsScriptPost(action: string, body: Record<string, unknown> = {}) {
  if (action !== "postular" && !adminActions.has(action)) throw new Error("Acción no válida");
  return requestPost(action, body);
}
