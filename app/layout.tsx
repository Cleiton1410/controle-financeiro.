import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://controle-financeiro-brown-omega.vercel.app'),
  title: 'Nexa Finance — Controle financeiro',
  description: 'Controle suas receitas, despesas, metas e orçamentos em um só lugar.',
  keywords: ['controle financeiro', 'organização financeira', 'controle de despesas', 'orçamento pessoal'],
  openGraph: {
    title: 'Nexa Finance — Controle financeiro',
    description: 'Organize sua vida financeira com clareza.',
    type: 'website',
  },
}
export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#111827' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className="bg-background"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
