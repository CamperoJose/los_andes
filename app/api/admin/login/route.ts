import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, createAdminToken } from "@/lib/admin-auth";
import { callAppsScriptPost } from "@/lib/apps-script";

export async function POST(request: NextRequest) {
  try {
    const { usuario, contrasena } = await request.json();
    if (!usuario || !contrasena) return NextResponse.json({ success: false, message: "Completa usuario y contraseña" }, { status: 400 });
    const result = await callAppsScriptPost("login", { usuario, contrasena });
    if (!result.success || !result.user) return NextResponse.json({ success: false, message: result.message || "Credenciales inválidas" }, { status: 401 });
    const response = NextResponse.json({ success: true, user: result.user });
    response.cookies.set(ADMIN_COOKIE, createAdminToken(result.user), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 8 * 60 * 60,
    });
    return response;
  } catch {
    return NextResponse.json({ success: false, message: "No se pudo iniciar sesión" }, { status: 502 });
  }
}
