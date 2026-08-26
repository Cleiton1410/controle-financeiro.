import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createSession } from "@/lib/auth"

export async function POST(request: Request) {
  const { name, email, password } = await request.json()
  const normalizedEmail = String(email ?? "").trim().toLowerCase()
  if (!String(name ?? "").trim() || !normalizedEmail.includes("@") || String(password ?? "").length < 6) {
    return NextResponse.json({ error: "Informe nome, e-mail válido e senha com pelo menos 6 caracteres." }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 409 })

  const user = await prisma.$transaction(async database => {
    const created = await database.user.create({ data: { name: String(name).trim(), email: normalizedEmail, passwordHash: await hash(String(password), 12), plan: "basic", planStatus: "active" } })
    await database.transaction.updateMany({ where: { userId: null }, data: { userId: created.id } })
    await database.goal.updateMany({ where: { userId: null }, data: { userId: created.id } })
    await database.account.updateMany({ where: { userId: null }, data: { userId: created.id } })
    return created
  })

  await createSession(user.id)
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, plan: user.plan, planStatus: user.planStatus } }, { status: 201 })
}