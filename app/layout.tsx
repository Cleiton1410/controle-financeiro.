import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Nexa Finance — Controle financeiro', description: 'Organize suas finanças, acompanhe seus gastos e alcance suas metas.' }
export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#111827' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className="bg-background"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
