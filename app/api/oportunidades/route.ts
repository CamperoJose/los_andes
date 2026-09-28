import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.APPS_SCRIPT_URL;
  const apiKey = process.env.APPS_SCRIPT_API_KEY;

  if (!url || !apiKey) {
    return NextResponse.json({ success: false, message: "Integración no configurada" }, { status: 500 });
  }

  try {
    const response = await fetch(`${url}?action=oportunidades&apiKey=${encodeURIComponent(apiKey)}`, {
      redirect: "follow",
      next: { revalidate: 60, tags: ["oportunidades"] },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Apps Script respondió ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "No se pudieron consultar las oportunidades" },
      { status: 502 },
    );
  }
}
