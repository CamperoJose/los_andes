import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { callAppsScriptPost, integrationErrorMessage } from "@/lib/apps-script";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await callAppsScriptPost("postular", body);
    if (data.success) { revalidateTag("admin_postulaciones"); revalidateTag("admin_dashboard"); }
    return NextResponse.json(data, { status: data.success ? 200 : 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: integrationErrorMessage(error) }, { status: 502 });
  }
}
