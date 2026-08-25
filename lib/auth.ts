import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"

const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "change-this-secret-in-vercel")

export async function createSession(userId: number) {
  const token = await new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret)
  const cookieStore = await cookies()
  cookieStore.set("nexa-session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/" })
}

export async function getSessionUserId() {
  const token = (await cookies()).get("nexa-session")?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return typeof payload.userId === "number" ? payload.userId : null
  } catch { return null }
}

export async function clearSession() {
  (await cookies()).delete("nexa-session")
}