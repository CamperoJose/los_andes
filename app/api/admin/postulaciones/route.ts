import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { callAppsScriptGet, callAppsScriptPost } from "@/lib/apps-script";

export async function GET() {
  try {
    await requireAdmin();
    const result = await callAppsScriptGet("admin_postulaciones");
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    return NextResponse.json({ success: false, message: "No se pudieron cargar las postulaciones" }, { status: 502 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const result = await callAppsScriptPost("actualizar_postulacion", { ...body, usuario_revision_id: admin.usuario_id });
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    return NextResponse.json({ success: false, message: "No se pudo actualizar la postulación" }, { status: 502 });
  }
}
