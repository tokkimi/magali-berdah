'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, PlusCircle, List, Wallet, User,
  Users, Building2, Mail, Search, ArrowLeftRight,
  LogOut, CheckSquare, Briefcase, Bell, Menu, X
} from 'lucide-react'
import { LogoMark } from './Navbar'

interface NavItem { href: string; label: string; icon: React.ElementType }

function BrandNav(): NavItem[] {
  return [
    { href: '/marque/tableau-de-bord', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/marque/nouvelle-campagne', label: 'Nouvelle campagne', icon: PlusCircle },
    { href: '/marque/campagnes', label: 'Campagnes', icon: List },
    { href: '/marque/portefeuille', label: 'Portefeuille', icon: Wallet },
    { href: '/marque/profil', label: 'Profil', icon: User },
  ]
}

function InfluencerNav(): NavItem[] {
  return [
    { href: '/influenceur/tableau-de-bord', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/influenceur/propositions', label: 'Propositions', icon: CheckSquare },
    { href: '/influenceur/missions', label: 'Missions', icon: Briefcase },
    { href: '/influenceur/portefeuille', label: 'Portefeuille', icon: Wallet },
    { href: '/influenceur/profil', label: 'Profil', icon: User },
  ]
}

function EventNav(): NavItem[] {
  return [
    { href: '/evenement/tableau-de-bord', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/evenement/profil', label: 'Mon Événement', icon: User },
    { href: '/evenement/sponsors', label: 'Sponsors', icon: Wallet },
    { href: '/evenement/collaborations', label: 'Collaborations', icon: Users },
  ]
}

function ProjectNav(): NavItem[] {
  return [
    { href: '/projet/tableau-de-bord', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/projet/profil', label: 'Mon Projet', icon: User },
    { href: '/projet/sponsors', label: 'Sponsors', icon: Wallet },
    { href: '/projet/collaborations', label: 'Collaborations', icon: Users },
  ]
}

function AdminNav(): NavItem[] {
  return [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/influenceurs', label: 'Influenceurs', icon: Users },
    { href: '/admin/marques', label: 'Marques', icon: Building2 },
    { href: '/admin/campagnes', label: 'Campagnes', icon: List },
    { href: '/admin/evenements', label: 'Événements', icon: Bell },
    { href: '/admin/projets', label: 'Projets', icon: Briefcase },
    { href: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { href: '/admin/newsletter', label: 'Newsletter', icon: Mail },
    { href: '/admin/seo', label: 'SEO', icon: Search },
  ]
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const role = (session?.user as { role?: string })?.role

  const navItems = role === 'ADMIN' ? AdminNav() : role === 'BRAND' ? BrandNav() : role === 'EVENT' ? EventNav() : role === 'PROJECT' ? ProjectNav() : InfluencerNav()
  const roleLabel = role === 'ADMIN' ? 'Administration' : role === 'BRAND' ? 'Espace Marque' : role === 'EVENT' ? 'Espace Événement' : role === 'PROJECT' ? 'Espace Projet' : 'Espace Influenceur'

  const SidebarContent = () => (
    <>
      <div className="px-5 py-5 border-b" style={{borderColor:'rgba(255,255,255,0.07)'}}>
        <div className="flex items-center justify-between">
          <Link href="/" onClick={() => setSidebarOpen(false)}><LogoMark dark /></Link>
          <button className="md:hidden text-white/40 hover:text-white/70" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 text-[10px] font-medium px-2 py-0.5 rounded-full inline-block" style={{background:'rgba(243,112,33,0.15)', color:'#F37021'}}>
          {roleLabel}
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setSidebarOpen(false)} className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all',
                  active ? 'text-white' : 'text-white/40 hover:text-white/70'
                )} style={active ? {background:'rgba(255,255,255,0.08)'} : {}}>
                  <item.icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-[#F37021]' : 'text-white/30')} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t" style={{borderColor:'rgba(255,255,255,0.07)'}}>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{background:'rgba(243,112,33,0.2)'}}>
            {session?.user?.name?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{session?.user?.name}</p>
            <p className="text-[10px] text-white/30 truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full flex items-center gap-2 text-xs text-white/30 hover:text-white/70 transition px-2 py-2 rounded-lg hover:bg-white/5">
          <LogOut className="w-3.5 h-3.5" /> Déconnexion
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex overflow-x-hidden" style={{background:'#0c0c0c'}}>

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20" style={{background:'radial-gradient(circle, #F37021 0%, transparent 65%)', filter:'blur(80px)'}} />
        <div className="absolute bottom-0 left-64 w-[400px] h-[400px] rounded-full opacity-10" style={{background:'radial-gradient(circle, #0a84ff 0%, transparent 65%)', filter:'blur(80px)'}} />
      </div>

      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-56 flex-col fixed inset-y-0 left-0 z-30" style={{background:'rgba(255,255,255,0.04)', borderRight:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(20px)'}}>
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 flex flex-col z-50" style={{background:'rgba(20,20,20,0.97)', borderRight:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(20px)'}}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-5 md:px-8 py-3" style={{background:'rgba(12,12,12,0.8)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div className="flex items-center gap-3">
            <button className="md:hidden text-white/50 hover:text-white/80 transition" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <p className="text-xs text-white/30 hidden sm:block">{new Date().toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'})}</p>
          </div>
          <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{background:'rgba(255,255,255,0.06)'}}>
            <Bell className="w-4 h-4 text-white/50" />
          </button>
        </header>

        <main className="flex-1 p-5 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
