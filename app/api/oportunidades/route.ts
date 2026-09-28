import { NextResponse } from "next/server";
import { callAppsScriptGet, integrationErrorMessage } from "@/lib/apps-script";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await callAppsScriptGet("oportunidades");
    return NextResponse.json(data, {
      status: data.success ? 200 : 502,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: integrationErrorMessage(error) },
      { status: 502 },
    );
  }
}
