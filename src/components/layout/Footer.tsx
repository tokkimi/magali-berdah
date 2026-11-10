"use client"
import Link from "next/link"
import { Instagram, Twitter, Linkedin } from "lucide-react"
import { useLang } from "@/lib/lang"
import { LogoMark } from "./Navbar"

export default function Footer() {
  const { t } = useLang()
  return (
    <footer className="bg-white border-t border-black/6 text-secondary">
      <div className="max-w-5xl mx-auto px-5 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4"><LogoMark /></div>
            <p className="text-xs leading-relaxed mb-5 text-secondary">{t('footer.desc')}</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[#0f0f0f] transition-colors"><Instagram size={14} /></a>
              <a href="#" className="hover:text-[#0f0f0f] transition-colors"><Twitter size={14} /></a>
              <a href="#" className="hover:text-[#0f0f0f] transition-colors"><Linkedin size={14} /></a>
            </div>
          </div>
          {[
            { title: 'Platform', links: [
              { href: '/comment-ca-marche', label: t('nav.how') },
              { href: '/tarifs', label: t('nav.pricing') },
              { href: '/faq', label: 'FAQ' },
              { href: '/auth/inscription', label: t('nav.signup') },
            ]},
            { title: 'Légal', links: [
              { href: '/cgv', label: 'CGV' },
              { href: '/cookies', label: 'Cookies' },
              { href: '#', label: 'Mentions légales' },
              { href: '#', label: 'RGPD' },
            ]},
            { title: 'Contact', links: [
              { href: '#', label: 'contact@dotthetalents.com' },
              { href: '#', label: 'Paris, France' },
              { href: '#', label: 'Support' },
              { href: '#', label: 'Presse' },
            ]},
          ].map(col => (
            <div key={col.title}>
              <h3 className="text-[#0f0f0f] font-semibold mb-3 text-[10px] uppercase tracking-widest">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l.label}><Link href={l.href} className="text-xs hover:text-[#0f0f0f] transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-black/6 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-[10px]">© 2025 Dot The Talents. {t('footer.rights')}</p>
          <p className="text-[10px]">Made with ❤️ in France</p>
        </div>
      </div>
      <p style={{ fontSize: "9px", opacity: 0.5, textAlign: "center", margin: 0, padding: "0 0 8px" }}>Made by Alexia Naudy</p>
    </footer>
  )
}
