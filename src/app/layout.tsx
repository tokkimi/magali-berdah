import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import CookieBanner from '@/components/CookieBanner'
import BottomNav from '@/components/layout/BottomNav'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = { creator: "Alexia Naudy",
  title: 'Dot The Talents – Plateforme de Marketing d\'Influence Internationale',
  description: 'Connectez votre marque aux meilleurs influenceurs du monde. Campagnes d\'influence ciblées, ROI mesurable, talent certifié.',
  keywords: 'marketing influence, influenceurs, marques, campagne influence, micro-influenceurs, macro-influenceurs',
  openGraph: {
    title: 'Dot The Talents – Marketing d\'Influence International',
    description: 'La plateforme qui connecte les marques aux meilleurs talents digitaux.',
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className={inter.className}>
        <Providers>
          {children}
          <BottomNav />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  )
}
