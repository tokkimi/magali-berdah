'use client'
import { mockCollaborations, mockInfluencers } from '@/lib/mock-data'
import { Users, Star, Send, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const OR = '#F37021'

export default function EvenementCollaborations() {
  const myCollabs = mockCollaborations.filter(c => c.fromId === 'evt_1' || c.fromId === 'demo_evt')

  return (
    <div style={{ color: 'white', maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Collaborations</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: 2 }}>Influenceurs et ambassadeurs pour votre événement</p>
        </div>
        <Link href="/galerie" style={{ display: 'flex', alignItems: 'center', gap: 6, background: OR, color: 'white', padding: '0.6rem 1.25rem', borderRadius: 9999, fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}>
          <Users size={14} /> Trouver des influenceurs
        </Link>
      </div>

      {/* Active collaborations */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Collaborations envoyées</p>
        {myCollabs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 14, border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Send size={28} style={{ color: 'rgba(255,255,255,0.15)', marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>Aucune collaboration envoyée — explorez la galerie pour en démarrer une !</p>
          </div>
        ) : myCollabs.map(c => (
          <div key={c.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.2rem' }}>{c.title}</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>À : {c.toName} · {c.type}</p>
              </div>
              <StatusBadge status={c.status} />
            </div>
          </div>
        ))}
      </div>

      {/* Suggested influencers */}
      <div>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Influenceurs suggérés</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
          {mockInfluencers.slice(0, 4).map(inf => (
            <div key={inf.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1rem', display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                <Image src={inf.photo} alt={inf.name} width={44} height={44} style={{ objectFit: 'cover' }} unoptimized />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inf.name}</p>
                <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>{(inf.followers / 1000).toFixed(0)}k · {inf.engagementRate}%</p>
              </div>
              <Link href="/galerie" style={{ background: 'rgba(243,112,33,0.15)', border: '1px solid rgba(243,112,33,0.3)', color: OR, borderRadius: 9999, padding: '0.3rem 0.625rem', fontSize: '0.68rem', fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>
                <Send size={11} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
    PENDING: { label: 'En attente', color: '#ff9f0a', bg: 'rgba(255,159,10,0.12)', Icon: Star },
    ACCEPTED: { label: 'Accepté', color: '#30d158', bg: 'rgba(48,209,88,0.12)', Icon: CheckCircle },
    NEGOTIATION: { label: 'Négo.', color: '#0a84ff', bg: 'rgba(10,132,255,0.12)', Icon: TrendingUp },
    DECLINED: { label: 'Refusé', color: '#ff453a', bg: 'rgba(255,69,58,0.12)', Icon: XCircle },
  }
  const c = cfg[status] || cfg.PENDING
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: c.bg, borderRadius: 9999, padding: '0.2rem 0.6rem' }}>
      <c.Icon size={11} color={c.color} />
      <span style={{ fontSize: '0.7rem', color: c.color, fontWeight: 600 }}>{c.label}</span>
    </div>
  )
}
