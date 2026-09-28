import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: true, authenticated: false, user: null });
  const { scriptSessionToken: _token, ...user } = session;
  return NextResponse.json({ success: true, authenticated: true, user });
}
