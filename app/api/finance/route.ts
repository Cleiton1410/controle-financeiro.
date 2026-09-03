import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/lib/auth"

const defaultGoals = [
  { id: 1, name: "Minha primeira meta", current: 0, target: 1000 },
]
const defaultAccounts = [
  { id: 1, name: "Nubank principal", type: "Conta corrente", value: 0 },
  { id: 2, name: "Cartão Platinum", type: "Fatura atual", value: 0 },
]
type FinanceData = {
  transactions: Array<{ id?: number; name: string; category: string; date: string; value: number; type: string }>
  goals: Array<{ id?: number; name: string; current: number; target: number }>
  accounts: Array<{ id?: number; name: string; type: string; value: number }>
  budgets?: Array<{ id?: number; category: string; limit: number }>
  recurrences?: Array<{ id?: number; name: string; category: string; value: number; active?: boolean }>
}
const planLimits = { basic: { transactions: 50, goals: 3, accounts: 2 }, premium: { transactions: Infinity, goals: Infinity, accounts: Infinity } }

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } })
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 })

  const [transactions, goals, accounts, budgets, recurrences] = await prisma.$transaction(async database => {
    if (!(await database.goal.count({ where: { userId } }))) await database.goal.createMany({ data: defaultGoals.map(({ id, ...goal }) => ({ ...goal, userId })) })
    if (!(await database.account.count({ where: { userId } }))) await database.account.createMany({ data: defaultAccounts.map(({ id, ...account }) => ({ ...account, userId })) })

    return Promise.all([
      database.transaction.findMany({ where: { userId }, orderBy: { id: "desc" } }),
      database.goal.findMany({ where: { userId }, orderBy: { id: "asc" }, include: { contributions: { orderBy: { createdAt: "desc" } } } }),
      database.account.findMany({ where: { userId }, orderBy: { id: "asc" } }),
      database.budget.findMany({ where: { userId }, orderBy: { id: "asc" } }),
      database.recurrence.findMany({ where: { userId }, orderBy: { id: "asc" } }),
    ])
  })

  return NextResponse.json({ transactions, goals, accounts, budgets, recurrences, plan: user.plan, limits: planLimits[user.plan as keyof typeof planLimits] ?? planLimits.basic })
}

export async function PUT(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  const data = await request.json() as FinanceData

  if (!Array.isArray(data.transactions) || !Array.isArray(data.goals) || !Array.isArray(data.accounts)) {
    return NextResponse.json({ error: "Formato de dados inválido" }, { status: 400 })
  }

  await prisma.$transaction(async database => {
    await database.transaction.deleteMany({ where: { userId } })
    await database.goal.deleteMany({ where: { userId } })
    await database.account.deleteMany({ where: { userId } })
    await database.budget.deleteMany({ where: { userId } })
    await database.recurrence.deleteMany({ where: { userId } })
    if (data.transactions.length) await database.transaction.createMany({ data: data.transactions.map(({ id, ...transaction }) => ({ ...transaction, userId })) })
    if (data.goals.length) await database.goal.createMany({ data: data.goals.map(({ id, ...goal }) => ({ ...goal, userId })) })
    if (data.accounts.length) await database.account.createMany({ data: data.accounts.map(({ id, ...account }) => ({ ...account, userId })) })
    if (data.budgets?.length) await database.budget.createMany({ data: data.budgets.map(({ id, ...budget }) => ({ ...budget, userId })) })
    if (data.recurrences?.length) await database.recurrence.createMany({ data: data.recurrences.map(({ id, ...recurrence }) => ({ ...recurrence, active: recurrence.active ?? true, userId })) })
  })

  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  const { resource, data } = await request.json()
  if (resource === "goalContribution") {
    const goal = await prisma.goal.findFirst({ where: { id: Number(data.goalId), userId } })
    const value = Number(data.value)
    if (!goal || !Number.isFinite(value) || value <= 0) return NextResponse.json({ error: "Aporte inválido" }, { status: 400 })
    const contribution = await prisma.$transaction(async database => {
      const created = await database.goalContribution.create({ data: { goalId: goal.id, userId, value } })
      await database.goal.update({ where: { id: goal.id }, data: { current: { increment: value } } })
      return created
    })
    return NextResponse.json(contribution)
  }
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } })
  const limits = planLimits[user?.plan as keyof typeof planLimits] ?? planLimits.basic
  if (resource === "transaction") {
    if (await prisma.transaction.count({ where: { userId } }) >= limits.transactions) return NextResponse.json({ error: "Limite de 50 transações do plano Basic atingido." }, { status: 403 })
    return NextResponse.json(await prisma.transaction.create({ data: { name: data.name, category: data.category, date: data.date, value: data.value, type: data.type, userId } }))
  }
  if (resource === "goal") {
    if (await prisma.goal.count({ where: { userId } }) >= limits.goals) return NextResponse.json({ error: "Limite de 3 metas do plano Basic atingido." }, { status: 403 })
    return NextResponse.json(await prisma.goal.create({ data: { name: data.name, current: data.current, target: data.target, userId } }))
  }
  if (resource === "account") {
    if (await prisma.account.count({ where: { userId } }) >= limits.accounts) return NextResponse.json({ error: "Limite de 2 contas do plano Basic atingido." }, { status: 403 })
    return NextResponse.json(await prisma.account.create({ data: { name: data.name, type: data.type, value: data.value, userId } }))
  }
  if (resource === "budget") return NextResponse.json(await prisma.budget.create({ data: { category: data.category, limit: data.limit, userId } }))
  if (resource === "recurrence") {
    const result = await prisma.$transaction(async database => {
      const recurrence = await database.recurrence.create({ data: { name: data.name, category: data.category, value: data.value, userId } })
      const transaction = await database.transaction.create({ data: { name: recurrence.name, category: recurrence.category, date: new Date().toLocaleDateString("pt-BR"), value: recurrence.value, type: "expense", userId } })
      return { recurrence, transaction }
    })
    return NextResponse.json(result)
  }
  if (resource === "recurrenceCharge") {
    const recurrence = await prisma.recurrence.findFirst({ where: { id: Number(data.id), userId, active: true } })
    if (!recurrence) return NextResponse.json({ error: "Recorrência não encontrada ou inativa." }, { status: 404 })
    return NextResponse.json(await prisma.transaction.create({ data: { name: recurrence.name, category: recurrence.category, date: new Date().toLocaleDateString("pt-BR"), value: recurrence.value, type: "expense", userId } }))
  }
  return NextResponse.json({ error: "Recurso inválido" }, { status: 400 })
}

export async function PATCH(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  const { resource, id, data } = await request.json()
  const where = { id: Number(id), userId }
  if (resource === "transaction") return NextResponse.json(await prisma.transaction.updateMany({ where, data }))
  if (resource === "goal") return NextResponse.json(await prisma.goal.updateMany({ where, data }))
  if (resource === "account") return NextResponse.json(await prisma.account.updateMany({ where, data }))
  if (resource === "budget") return NextResponse.json(await prisma.budget.updateMany({ where, data }))
  if (resource === "recurrence") return NextResponse.json(await prisma.recurrence.updateMany({ where, data }))
  return NextResponse.json({ error: "Recurso inválido" }, { status: 400 })
}

export async function DELETE(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  const { resource, id } = await request.json()
  const where = { id: Number(id), userId }
  if (resource === "transaction") return NextResponse.json(await prisma.transaction.deleteMany({ where }))
  if (resource === "goal") return NextResponse.json(await prisma.goal.deleteMany({ where }))
  if (resource === "account") return NextResponse.json(await prisma.account.deleteMany({ where }))
  if (resource === "budget") return NextResponse.json(await prisma.budget.deleteMany({ where }))
  if (resource === "recurrence") return NextResponse.json(await prisma.recurrence.deleteMany({ where }))
  return NextResponse.json({ error: "Recurso inválido" }, { status: 400 })
}