import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { callAppsScriptAdmin } from "@/lib/apps-script";

export async function GET() {
  try {
    const admin = await requireAdmin();
    const result = await callAppsScriptAdmin("admin_dashboard", { sessionToken: admin.scriptSessionToken });
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    if (error instanceof Error && ["UNAUTHORIZED", "Sesión administrativa inválida"].includes(error.message)) return NextResponse.json({ success: false, message: "Sesión vencida. Vuelve a ingresar" }, { status: 401 });
    return NextResponse.json({ success: false, message: "No se pudo cargar el dashboard" }, { status: 502 });
  }
}
