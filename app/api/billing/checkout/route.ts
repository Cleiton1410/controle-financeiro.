import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function POST(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  if (!stripe || !process.env.STRIPE_PREMIUM_PRICE_ID) return NextResponse.json({ error: "Pagamento Premium ainda não configurado." }, { status: 503 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
  const origin = new URL(request.url).origin
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PREMIUM_PRICE_ID, quantity: 1 }],
    customer: user.stripeCustomerId ?? undefined,
    customer_email: user.stripeCustomerId ? undefined : user.email,
    client_reference_id: String(user.id),
    metadata: { userId: String(user.id) },
    subscription_data: { metadata: { userId: String(user.id) } },
    success_url: `${origin}/?billing=success`,
    cancel_url: `${origin}/?billing=cancelled`,
  })
  return NextResponse.json({ url: session.url })
}