import { compare } from "bcryptjs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createSession } from "@/lib/auth"

export async function POST(request: Request) {
  const { email, password } = await request.json()
  const user = await prisma.user.findUnique({ where: { email: String(email ?? "").trim().toLowerCase() } })
  if (!user || !(await compare(String(password ?? ""), user.passwordHash))) return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 })
  await createSession(user.id)
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } })
}