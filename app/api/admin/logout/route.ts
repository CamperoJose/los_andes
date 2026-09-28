import { NextResponse } from "next/server";
import { ADMIN_COOKIE, getAdminSession } from "@/lib/admin-auth";
import { callAppsScriptPost } from "@/lib/apps-script";

export async function POST() {
  const session = await getAdminSession();
  if (session) {
    try { await callAppsScriptPost("logout", { sessionToken: session.scriptSessionToken }); } catch { /* Cookie is cleared even if Apps Script is unavailable. */ }
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
