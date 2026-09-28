import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { callAppsScriptGet } from "@/lib/apps-script";

export async function GET() {
  try {
    await requireAdmin();
    const result = await callAppsScriptGet("admin_dashboard");
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    return NextResponse.json({ success: false, message: "No se pudo cargar el dashboard" }, { status: 502 });
  }
}
