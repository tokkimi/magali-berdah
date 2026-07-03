'use client'

import { useState } from 'react'
import { mockCampaigns, mockInfluencers, mockCollaborations } from '@/lib/mock-data'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Wallet, TrendingUp, Users, BarChart3, Plus, ArrowRight, MessageCircle } from 'lucide-react'
import Link from 'next/link'

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.25rem' }}>{children}</div>
}

const myCampaigns = mockCampaigns.filter(c => c.brandProfileId === 'brand-1')
const myInfluencers = mockInfluencers.slice(0, 3)

export default function MarqueTableauDeBordPage() {
  const balance = 3200

  const stats = [
    { label: 'Portefeuille', value: formatCurrency(balance), icon: Wallet, color: '#F37021', sub: 'Solde disponible' },
    { label: 'Campagnes actives', value: String(myCampaigns.filter(c => c.status === 'ACTIVE').length), icon: BarChart3, color: '#0a84ff', sub: 'En cours' },
    { label: 'Influenceurs assignés', value: String(myInfluencers.length), icon: Users, color: '#30d158', sub: 'Sur vos campagnes' },
    { label: 'ROI moyen', value: '+142%', icon: TrendingUp, color: '#F37021', sub: 'Ce mois-ci' },
  ]

  return (
    <div style={{ color: 'white', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Tableau de bord</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>Maison Élégance</p>
        </div>
        <Link href="/marque/nouvelle-campagne">
          <button style={{ background: 'rgba(243,112,33,0.2)', border: '1px solid rgba(243,112,33,0.3)', color: '#F37021', fontSize: '0.75rem', fontWeight: 600, padding: '0.6rem 1.25rem', borderRadius: '9999px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={14} /> Nouvelle campagne
          </button>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {stats.map(s => (
          <GlassCard key={s.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '0.75rem', background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={18} color={s.color} />
              </div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, marginBottom: '0.15rem' }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.1rem' }}>{s.label}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{s.sub}</div>
          </GlassCard>
        ))}
      </div>

      {/* Collaborations reçues */}
      {mockCollaborations.filter(c => c.toType === 'BRAND' || c.toId === 'demo_brand').length > 0 && (
        <GlassCard className="" style={{ marginBottom: '1rem' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Collaborations reçues</h2>
            <span style={{ fontSize: '0.7rem', background: 'rgba(243,112,33,0.15)', color: '#F37021', borderRadius: 9999, padding: '0.1rem 0.5rem', fontWeight: 700 }}>
              {mockCollaborations.filter(c => c.toType === 'BRAND' || c.toId === 'demo_brand').length} nouvelles
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mockCollaborations.filter(c => c.toType === 'BRAND' || c.toId === 'demo_brand').map(c => (
              <div key={c.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>De : {c.fromName} · {c.fromType === 'EVENT' ? 'Événement' : c.fromType === 'PROJECT' ? 'Projet' : 'Influenceur'}</div>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <GlassCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Mes campagnes</h2>
              <Link href="/marque/campagnes" style={{ fontSize: '0.75rem', color: '#F37021', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Voir tout <ArrowRight size={12} /></Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myCampaigns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>Aucune campagne pour l&apos;instant</div>
              ) : myCampaigns.map(c => (
                <div key={c.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{c.title}</div>
                    <span style={{ background: c.status === 'ACTIVE' ? 'rgba(48,209,88,0.1)' : 'rgba(255,149,0,0.1)', color: c.status === 'ACTIVE' ? '#30d158' : '#ff9500', border: `1px solid ${c.status === 'ACTIVE' ? 'rgba(48,209,88,0.2)' : 'rgba(255,149,0,0.2)'}`, borderRadius: '9999px', padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 600 }}>
                      {c.status === 'ACTIVE' ? 'Active' : 'En attente'}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>Budget</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{formatCurrency(c.budget)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>Restant</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#30d158' }}>{formatCurrency(c.budgetRemaining)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>Influenceurs</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{c.influencersCount}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Influenceurs assignés</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myInfluencers.map(inf => (
                <div key={inf.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', padding: '0.75rem' }}>
                  <img src={inf.photo} alt={inf.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{inf.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{formatNumber(inf.followers)} abonnés · {inf.engagementRate}% eng.</div>
                  </div>
                  <button style={{ background: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.2)', color: '#0a84ff', fontSize: '0.65rem', fontWeight: 600, padding: '0.3rem 0.75rem', borderRadius: '9999px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MessageCircle size={11} /> Chat
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <GlassCard>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem' }}>Accès rapides</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Nouvelle campagne', href: '/marque/nouvelle-campagne', color: '#F37021' },
                { label: 'Recharger le portefeuille', href: '/marque/portefeuille', color: '#30d158' },
                { label: 'Voir mes campagnes', href: '/marque/campagnes', color: '#0a84ff' },
                { label: 'Mon profil', href: '/marque/profil', color: 'rgba(255,255,255,0.5)' },
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
            <Link href="/marque/portefeuille">
              <button style={{ background: 'rgba(243,112,33,0.2)', border: '1px solid rgba(243,112,33,0.3)', color: '#F37021', fontSize: '0.75rem', fontWeight: 600, padding: '0.5rem 1.25rem', borderRadius: '9999px', cursor: 'pointer', width: '100%' }}>
                Recharger
              </button>
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
