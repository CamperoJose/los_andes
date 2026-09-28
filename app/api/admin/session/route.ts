import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: true, authenticated: false, user: null });
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
