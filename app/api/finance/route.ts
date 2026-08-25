import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const defaultGoals = [
  { id: 1, name: "Viagem para Europa eu e  fran", current: 0, target: 0 },
  { id: 2, name: "Reserva de emergência", current: 0, target: 0 },
]
const defaultAccounts = [
  { id: 1, name: "Nubank principal", type: "Conta corrente", value: 0 },
  { id: 2, name: "Cartão Platinum", type: "Fatura atual", value: 0 },
]
type FinanceData = {
  transactions: Array<{ id?: number; name: string; category: string; date: string; value: number; type: string }>
  goals: Array<{ id?: number; name: string; current: number; target: number }>
  accounts: Array<{ id?: number; name: string; type: string; value: number }>
}

export async function GET() {
  const [transactions, goals, accounts] = await prisma.$transaction(async database => {
    if (!(await database.goal.count())) await database.goal.createMany({ data: defaultGoals })
    if (!(await database.account.count())) await database.account.createMany({ data: defaultAccounts })

    return Promise.all([
      database.transaction.findMany({ orderBy: { id: "desc" } }),
      database.goal.findMany({ orderBy: { id: "asc" } }),
      database.account.findMany({ orderBy: { id: "asc" } }),
    ])
  })

  return NextResponse.json({ transactions, goals, accounts })
}

export async function PUT(request: Request) {
  const data = await request.json() as FinanceData

  if (!Array.isArray(data.transactions) || !Array.isArray(data.goals) || !Array.isArray(data.accounts)) {
    return NextResponse.json({ error: "Formato de dados inválido" }, { status: 400 })
  }

  await prisma.$transaction(async database => {
    await database.transaction.deleteMany()
    await database.goal.deleteMany()
    await database.account.deleteMany()
    if (data.transactions.length) await database.transaction.createMany({ data: data.transactions.map(({ id, ...transaction }) => transaction) })
    if (data.goals.length) await database.goal.createMany({ data: data.goals.map(({ id, ...goal }) => goal) })
    if (data.accounts.length) await database.account.createMany({ data: data.accounts.map(({ id, ...account }) => account) })
  })

  return NextResponse.json({ ok: true })
}