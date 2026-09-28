export async function callAppsScriptGet(action: string, params: Record<string, string> = {}) {
  const url = process.env.APPS_SCRIPT_URL;
  const apiKey = process.env.APPS_SCRIPT_API_KEY;
  if (!url || !apiKey) throw new Error("Integración no configurada");
  const query = new URLSearchParams({ action, apiKey, ...params });
  const response = await fetch(`${url}?${query}`, {
    redirect: "follow",
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Apps Script respondió ${response.status}`);
  return response.json();
}

export async function callAppsScriptPost(action: string, body: Record<string, unknown> = {}) {
  const url = process.env.APPS_SCRIPT_URL;
  const apiKey = process.env.APPS_SCRIPT_API_KEY;
  if (!url || !apiKey) throw new Error("Integración no configurada");
  const response = await fetch(url, {
    method: "POST",
    redirect: "follow",
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, apiKey, ...body }),
  });
  if (!response.ok) throw new Error(`Apps Script respondió ${response.status}`);
  return response.json();
}
