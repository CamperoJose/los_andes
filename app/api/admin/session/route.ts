import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { callAppsScriptPost } from "@/lib/apps-script";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: true, authenticated: false, user: null });
  // Cookie fields are presentation only. Apps Script owns the session and
  // validates its unpredictable token before we report authentication.
  try {
    const result = await callAppsScriptPost("admin_oportunidades", { sessionToken: session.scriptSessionToken });
    if (!result.success) return NextResponse.json({ success: true, authenticated: false, user: null });
  } catch {
    return NextResponse.json({ success: true, authenticated: false, user: null });
  }
  const user = {
    usuario_id: session.usuario_id,
    usuario: session.usuario,
    nombres: session.nombres,
    apellidos: session.apellidos,
    rol: session.rol,
    exp: session.exp,
  };
  return NextResponse.json({ success: true, authenticated: true, user });
}
