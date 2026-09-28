import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, createAdminToken } from "@/lib/admin-auth";
import { callAppsScriptPost, integrationErrorMessage } from "@/lib/apps-script";

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
  } catch (error) {
    if (error instanceof Error && error.message === "ADMIN_SESSION_SECRET no configurado") return NextResponse.json({success:false,message:"Falta ADMIN_SESSION_SECRET en Vercel"},{status:500});
    return NextResponse.json({ success: false, message: integrationErrorMessage(error) }, { status: 502 });
  }
}
