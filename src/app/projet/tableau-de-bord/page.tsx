'use client'
import { useSession } from 'next-auth/react'
import { mockProjects } from '@/lib/mock-data'
import { Lightbulb, Users, TrendingUp, Eye, Edit } from 'lucide-react'
import Link from 'next/link'

const OR = '#F37021'

export default function ProjetDashboard() {
  const { data: session } = useSession()
  const project = mockProjects.find(p => p.userId === 'project-1') || mockProjects[mockProjects.length - 1]
  const pct = Math.round((project.sponsorshipRaised / project.sponsorshipGoal) * 100)

  return (
    <div style={{ color: 'white', maxWidth: '100%' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Bonjour, {session?.user?.name} 👋</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', marginTop: 2 }}>Tableau de bord — {project.name}</p>
      </div>

      {/* Banner projet */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(48,209,88,0.15)', color: '#30d158', border: '1px solid rgba(48,209,88,0.3)', borderRadius: 9999, padding: '0.15rem 0.6rem', fontSize: '0.7rem', fontWeight: 600 }}>● Ouvert aux sponsors</span>
              <span style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', borderRadius: 9999, padding: '0.15rem 0.6rem', fontSize: '0.7rem' }}>{project.type}</span>
              <span style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', borderRadius: 9999, padding: '0.15rem 0.6rem', fontSize: '0.7rem' }}>{project.stage}</span>
            </div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{project.name}</h2>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{project.sector} · Lancement : {new Date(project.launchDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
          </div>
          <Link href="/projet/profil" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(243,112,33,0.15)', border: '1px solid rgba(243,112,33,0.3)', color: OR, fontSize: '0.75rem', fontWeight: 600, padding: '0.5rem 0.875rem', borderRadius: 9999, textDecoration: 'none', flexShrink: 0 }}>
            <Edit size={12} /> Modifier
          </Link>
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Financement levé</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: OR }}>{pct}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 9999, height: 6 }}>
            <div style={{ width: `${pct}%`, background: OR, borderRadius: 9999, height: 6 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#30d158', fontWeight: 600 }}>{project.sponsorshipRaised.toLocaleString()} €</span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>objectif {project.sponsorshipGoal.toLocaleString()} €</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Taille équipe', value: `${project.teamSize} pers.` },
          { label: 'Budget total', value: `${project.budget.toLocaleString()} €` },
          { label: 'Sponsors intéressés', value: '2', color: OR },
          { label: 'Collaborations', value: '1', color: '#30d158' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1rem' }}>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>{s.label}</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color || 'white' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        {[
          { href: '/projet/sponsors', icon: TrendingUp, label: 'Gérer mes sponsors', sub: 'Voir les partenaires', color: OR },
          { href: '/projet/collaborations', icon: Users, label: 'Collaborations', sub: 'Influenceurs & ambassadeurs', color: '#0a84ff' },
          { href: '/galerie', icon: Eye, label: 'Explorer la galerie', sub: 'Trouver des influenceurs', color: '#30d158' },
          { href: '/projet/profil', icon: Lightbulb, label: 'Mon profil public', sub: 'Visible par les sponsors', color: 'rgba(255,255,255,0.5)' },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1rem', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <item.icon size={16} color={item.color} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white' }}>{item.label}</p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{item.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
