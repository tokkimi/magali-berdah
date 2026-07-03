'use client'

import { SessionProvider } from 'next-auth/react'
import { LangProvider } from '@/lib/lang'
import ScrollToTop from '@/components/ui/ScrollToTop'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LangProvider>
        <ScrollToTop />
        {children}
      </LangProvider>
    </SessionProvider>
  )
}
