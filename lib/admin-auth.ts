import { cookies } from "next/headers";

export const ADMIN_COOKIE = "postulantes_admin";

type AdminSession = {
  usuario_id: string;
  usuario: string;
  nombres: string;
  apellidos: string;
  rol: string;
  scriptSessionToken: string;
  exp: number;
};

export function createAdminToken(user: Omit<AdminSession, "exp" | "scriptSessionToken">, scriptSessionToken: string) {
  const session: AdminSession = { ...user, scriptSessionToken, exp: Date.now() + 6 * 60 * 60 * 1000 };
  return Buffer.from(JSON.stringify(session)).toString("base64url");
}

export function verifyAdminToken(token?: string | null): AdminSession | null {
  if (!token) return null;
  try {
    const session = JSON.parse(Buffer.from(token, "base64url").toString("utf8")) as AdminSession;
    if (!session.exp || session.exp < Date.now() || session.rol !== "ADMIN" ||
        !/^[0-9a-f-]{36}$/i.test(session.scriptSessionToken || "")) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}
