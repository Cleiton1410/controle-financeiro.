import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function POST(request: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: "Stripe não configurado" }, { status: 503 })
  const signature = (await headers()).get("stripe-signature")
  if (!signature) return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 })
  let event: Stripe.Event
  try { event = stripe.webhooks.constructEvent(await request.text(), signature, process.env.STRIPE_WEBHOOK_SECRET) } catch { return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 }) }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = Number(session.metadata?.userId ?? session.client_reference_id)
    if (userId) await prisma.user.update({ where: { id: userId }, data: { plan: "premium", planStatus: "active", stripeCustomerId: String(session.customer), stripeSubscriptionId: String(session.subscription) } })
  }
  if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.paused") {
    const subscription = event.data.object as Stripe.Subscription
    const userId = Number(subscription.metadata?.userId)
    if (userId) await prisma.user.update({ where: { id: userId }, data: { plan: "basic", planStatus: "inactive", stripeSubscriptionId: null } })
  }
  return NextResponse.json({ received: true })
}