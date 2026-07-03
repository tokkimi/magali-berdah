'use client'

import { useState } from 'react'
import { mockProposals, mockMissions, mockCollaborations } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import { Wallet, Briefcase, TrendingUp, Clock, ArrowRight, Check, X } from 'lucide-react'
import Link from 'next/link'

function GlassCard({ children }: { children: React.ReactNode }) {
  return <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.25rem' }}>{children}</div>
}

export default function InfluenceurTableauDeBordPage() {
  const balance = 200
  const pendingProposals = mockProposals.filter(p => p.status === 'PENDING')
  const activeMissions = mockMissions.filter(m => m.status === 'ACCEPTED')
  const monthlyEarnings = 400

  const [proposals, setProposals] = useState(mockProposals)

  const accept = (id: string) => setProposals(p => p.map(x => x.id === id ? { ...x, status: 'ACCEPTED' } : x))
  const decline = (id: string) => setProposals(p => p.map(x => x.id === id ? { ...x, status: 'REJECTED' } : x))

  const stats = [
    { label: 'Portefeuille', value: formatCurrency(balance), icon: Wallet, color: '#F37021', sub: 'Disponible' },
    { label: 'Propositions', value: String(proposals.filter(p => p.status === 'PENDING').length), icon: Clock, color: '#ff9500', sub: 'En attente' },
    { label: 'Missions actives', value: String(activeMissions.length), icon: Briefcase, color: '#0a84ff', sub: 'En cours' },
    { label: 'Revenus ce mois', value: formatCurrency(monthlyEarnings), icon: TrendingUp, color: '#30d158', sub: 'Octobre 2024' },
  ]

  return (
    <div style={{ color: 'white', padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Tableau de bord</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>Bienvenue, Sofia Martini</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {stats.map(s => (
          <GlassCard key={s.label}>
            <div style={{ width: 36, height: 36, borderRadius: '0.75rem', background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, marginBottom: '0.1rem' }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.1rem' }}>{s.label}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{s.sub}</div>
          </GlassCard>
        ))}
      </div>

      {/* Collaborations reçues (système bidirectionnel) */}
      {mockCollaborations.filter(c => c.toId === 'demo_inf' || c.toType === 'INFLUENCER').length > 0 && (
        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Collaborations reçues</h2>
            <span style={{ fontSize: '0.7rem', background: 'rgba(243,112,33,0.15)', color: '#F37021', borderRadius: 9999, padding: '0.1rem 0.5rem', fontWeight: 700 }}>
              {mockCollaborations.filter(c => c.toId === 'demo_inf' || c.toType === 'INFLUENCER').length} nouvelles
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mockCollaborations.filter(c => c.toId === 'demo_inf' || c.toType === 'INFLUENCER').map(c => (
              <div key={c.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>De : {c.fromName} · {c.fromType === 'EVENT' ? 'Événement' : c.fromType === 'BRAND' ? 'Marque' : 'Projet'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {c.price > 0 && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#30d158', background: 'rgba(48,209,88,0.1)', borderRadius: 9999, padding: '0.15rem 0.5rem' }}>{c.price.toLocaleString()} €</span>}
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', borderRadius: 9999, padding: '0.15rem 0.5rem' }}>{c.type}</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem', lineHeight: 1.4 }}>{c.message.substring(0, 120)}...</p>
                {c.status === 'NEGOTIATION' && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button style={{ background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.2)', color: '#30d158', fontSize: '0.7rem', fontWeight: 600, padding: '0.35rem 0.9rem', borderRadius: '9999px', cursor: 'pointer' }}>Accepter</button>
                    <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', padding: '0.35rem 0.9rem', borderRadius: '9999px', cursor: 'pointer' }}>Contre-offre</button>
                    <button style={{ background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.2)', color: '#ff453a', fontSize: '0.7rem', padding: '0.35rem 0.9rem', borderRadius: '9999px', cursor: 'pointer' }}>Refuser</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'start', marginTop: '1rem' }}>
        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Propositions en attente</h2>
            <Link href="/influenceur/propositions" style={{ fontSize: '0.75rem', color: '#F37021', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Voir tout <ArrowRight size={12} /></Link>
          </div>
          {proposals.filter(p => p.status === 'PENDING').length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>Aucune proposition en attente</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {proposals.filter(p => p.status === 'PENDING').map(p => (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{p.campaignTitle}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{p.brandName}</div>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#30d158' }}>{formatCurrency(p.payment)}</div>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem', lineHeight: 1.4 }}>{p.description?.substring(0, 100)}...</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => accept(p.id)} style={{ background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.2)', color: '#30d158', fontSize: '0.7rem', fontWeight: 600, padding: '0.35rem 0.9rem', borderRadius: '9999px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Check size={12} /> Accepter
                    </button>
                    <button onClick={() => decline(p.id)} style={{ background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.2)', color: '#ff453a', fontSize: '0.7rem', fontWeight: 600, padding: '0.35rem 0.9rem', borderRadius: '9999px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <X size={12} /> Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <GlassCard>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem', fontWeight: 600 }}>Accès rapides</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Mes propositions', href: '/influenceur/propositions', color: '#ff9500' },
                { label: 'Mes missions', href: '/influenceur/missions', color: '#0a84ff' },
                { label: 'Mon portefeuille', href: '/influenceur/portefeuille', color: '#F37021' },
                { label: 'Mon profil', href: '/influenceur/profil', color: 'rgba(255,255,255,0.5)' },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', padding: '0.75rem', textDecoration: 'none', color: l.color, fontSize: '0.8rem', fontWeight: 500 }}>
                  {l.label} <ArrowRight size={13} />
                </Link>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>Portefeuille</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F37021', marginBottom: '0.25rem' }}>{formatCurrency(balance)}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>Solde disponible</div>
            <Link href="/influenceur/portefeuille">
              <button style={{ background: 'rgba(243,112,33,0.2)', border: '1px solid rgba(243,112,33,0.3)', color: '#F37021', fontSize: '0.75rem', fontWeight: 600, padding: '0.5rem 1.25rem', borderRadius: '9999px', cursor: 'pointer', width: '100%' }}>
                Virer vers mon compte
              </button>
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
