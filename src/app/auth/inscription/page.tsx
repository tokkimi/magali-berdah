'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Building2, Star, Calendar, Lightbulb, ArrowRight, CheckCircle } from 'lucide-react'
import { LogoMark } from '@/components/layout/Navbar'

const OR = '#F37021'

const roles = [
  { id: 'brand', Icon: Building2, label: 'Marque', sub: 'Lancer des campagnes', field: "Nom de l'entreprise", placeholder: 'Ma Marque SAS' },
  { id: 'influencer', Icon: Star, label: 'Influenceur(se)', sub: 'Monétiser mon audience', field: 'Prénom & Nom', placeholder: 'Sofia Martini' },
  { id: 'event', Icon: Calendar, label: 'Événement', sub: 'Trouver des sponsors', field: "Nom de l'événement", placeholder: 'Mon Festival 2026' },
  { id: 'project', Icon: Lightbulb, label: 'Nouveau Projet', sub: 'Financer mon projet', field: 'Nom du projet', placeholder: 'Mon App / Ma Marque' },
]

function InscriptionForm() {
  const searchParams = useSearchParams()
  const defaultRole = roles.find(r => r.id === searchParams.get('role'))?.id || 'influencer'
  const [role, setRole] = useState(defaultRole)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ entityName: '', email: '', password: '' })

  const current = roles.find(r => r.id === role)!

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '0.875rem',
    border: '1px solid rgba(0,0,0,0.08)', background: 'white',
    fontSize: '0.875rem', color: '#0f0f0f', outline: 'none', boxSizing: 'border-box',
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8', padding: '1rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ width: 56, height: 56, background: 'rgba(243,112,33,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <CheckCircle style={{ width: 28, height: 28, color: OR }} />
          </div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f0f0f', marginBottom: '0.5rem' }}>Demande envoyée !</h2>
          <p style={{ fontSize: '0.875rem', color: '#6b6b6b', marginBottom: '1.5rem' }}>Notre équipe va valider votre profil sous 24h.</p>
          <Link href="/auth/connexion" style={{ background: '#0f0f0f', color: 'white', padding: '0.75rem 2rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <Link href="/" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}><LogoMark /></Link>

        <div style={{ background: 'white', borderRadius: '1.5rem', border: '1px solid rgba(0,0,0,0.06)', padding: '2rem', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f0f0f', marginBottom: '0.25rem' }}>Créer mon compte</h1>
          <p style={{ fontSize: '0.75rem', color: '#6b6b6b', marginBottom: '1.5rem' }}>Rejoignez la communauté Dot The Talents</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {roles.map(({ id, Icon, label, sub }) => (
              <button key={id} onClick={() => setRole(id)} style={{
                padding: '0.875rem', borderRadius: '0.875rem', textAlign: 'left', cursor: 'pointer',
                border: role === id ? `1px solid ${OR}` : '1px solid rgba(0,0,0,0.08)',
                background: role === id ? 'rgba(243,112,33,0.05)' : 'white',
              }}>
                <Icon style={{ width: 16, height: 16, marginBottom: 6, color: role === id ? OR : '#aaaaaa' }} />
                <p style={{ fontWeight: 600, fontSize: '0.7rem', color: role === id ? '#0f0f0f' : '#6b6b6b', lineHeight: 1.3, marginBottom: 2 }}>{label}</p>
                <p style={{ fontSize: '0.65rem', color: '#aaaaaa' }}>{sub}</p>
              </button>
            ))}
          </div>

          <form onSubmit={e => { e.preventDefault(); setSubmitted(true) }} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#0f0f0f', marginBottom: '0.375rem' }}>{current.field}</label>
              <input style={inputStyle} type="text" required placeholder={current.placeholder}
                value={formData.entityName} onChange={e => setFormData({ ...formData, entityName: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#0f0f0f', marginBottom: '0.375rem' }}>Email</label>
              <input style={inputStyle} type="email" required placeholder="vous@exemple.com"
                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#0f0f0f', marginBottom: '0.375rem' }}>Mot de passe</label>
              <input style={inputStyle} type="password" required minLength={8} placeholder="8 caractères minimum"
                value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <input type="checkbox" id="cgv" required style={{ marginTop: 3, accentColor: OR } as React.CSSProperties} />
              <label htmlFor="cgv" style={{ fontSize: '0.7rem', color: '#6b6b6b' }}>
                J&apos;accepte les <Link href="/cgv" style={{ color: OR }}>CGV</Link> et la <Link href="/cookies" style={{ color: OR }}>Politique de confidentialité</Link>
              </label>
            </div>
            <button type="submit" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#0f0f0f', color: 'white', fontWeight: 600, padding: '0.875rem', borderRadius: '9999px', fontSize: '0.875rem', cursor: 'pointer', border: 'none' }}>
              Créer mon compte <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#6b6b6b', marginTop: '1.25rem' }}>
            Déjà un compte ? <Link href="/auth/connexion" style={{ color: OR, fontWeight: 600 }}>Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function InscriptionPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#fafaf8' }} />}>
      <InscriptionForm />
    </Suspense>
  )
}
