import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const url = process.env.APPS_SCRIPT_URL;
  const apiKey = process.env.APPS_SCRIPT_API_KEY;

  if (!url || !apiKey) {
    return NextResponse.json({ success: false, message: "Integración no configurada" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const response = await fetch(url, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "postular", apiKey, ...body }),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: data.success ? 200 : 400 });
  } catch {
    return NextResponse.json({ success: false, message: "No se pudo registrar la postulación" }, { status: 502 });
  }
}
