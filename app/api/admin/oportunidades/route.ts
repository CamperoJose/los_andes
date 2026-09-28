import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { callAppsScriptGet, callAppsScriptPost } from "@/lib/apps-script";

export async function GET() {
  try {
    await requireAdmin();
    const result = await callAppsScriptGet("admin_oportunidades");
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    return NextResponse.json({ success: false, message: "No se pudieron cargar los cargos" }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const result = await callAppsScriptPost("guardar_oportunidad", { ...body, usuario_id: admin.usuario_id });
    if (result.success) revalidateTag("oportunidades");
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    return NextResponse.json({ success: false, message: "No se pudo guardar el cargo" }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { oportunidad_id } = await request.json();
    const result = await callAppsScriptPost("eliminar_oportunidad", { oportunidad_id, usuario_id: admin.usuario_id });
    if (result.success) revalidateTag("oportunidades");
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    return NextResponse.json({ success: false, message: "No se pudo eliminar el cargo" }, { status: 502 });
  }
}
