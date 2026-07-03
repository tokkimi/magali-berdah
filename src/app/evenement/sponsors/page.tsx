'use client'
import { mockCollaborations } from '@/lib/mock-data'
import { Send, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react'
import { useState } from 'react'

const OR = '#F37021'

const statusConfig = {
  PENDING: { label: 'En attente', color: '#ff9f0a', bg: 'rgba(255,159,10,0.15)', Icon: Clock },
  ACCEPTED: { label: 'Accepté', color: '#30d158', bg: 'rgba(48,209,88,0.15)', Icon: CheckCircle },
  NEGOTIATION: { label: 'Négociation', color: '#0a84ff', bg: 'rgba(10,132,255,0.15)', Icon: TrendingUp },
  DECLINED: { label: 'Refusé', color: '#ff453a', bg: 'rgba(255,69,58,0.15)', Icon: XCircle },
}

export default function EvenementSponsors() {
  const collabs = mockCollaborations.filter(c => c.toId === 'demo_evt' || c.fromId === 'evt_1' || c.toType === 'EVENT')
  const [tab, setTab] = useState<'reçues' | 'envoyées'>('reçues')

  const reçues = collabs.filter(c => c.toType === 'EVENT')
  const envoyées = collabs.filter(c => c.fromType === 'EVENT')

  return (
    <div style={{ color: 'white', maxWidth: 720 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Sponsors & Demandes</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: 2 }}>Gérez les propositions de sponsoring reçues et envoyées</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Demandes reçues', value: '3', color: OR },
          { label: 'Partenariats actifs', value: '1', color: '#30d158' },
          { label: 'En négociation', value: '1', color: '#0a84ff' },
          { label: 'Sponsoring levé', value: '0 €', color: 'white' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '0.875rem' }}>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem' }}>{s.label}</p>
            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.25rem' }}>
        {(['reçues', 'envoyées'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '0.5rem 1rem', borderRadius: 9999, fontSize: '0.8rem', fontWeight: tab === t ? 700 : 400, cursor: 'pointer', background: tab === t ? OR : 'rgba(255,255,255,0.06)', color: 'white', border: tab === t ? `1px solid ${OR}` : '1px solid rgba(255,255,255,0.1)' }}>
            {t === 'reçues' ? `Reçues (${reçues.length})` : `Envoyées (${envoyées.length})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {(tab === 'reçues' ? reçues : envoyées).length === 0 ? (
          <EmptyState tab={tab} />
        ) : (tab === 'reçues' ? reçues : envoyées).map(c => {
          const cfg = statusConfig[c.status as keyof typeof statusConfig] || statusConfig.PENDING
          return (
            <div key={c.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{c.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>De : {tab === 'reçues' ? c.fromName : c.toName}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: cfg.bg, border: `1px solid ${cfg.color}30`, borderRadius: 9999, padding: '0.25rem 0.75rem' }}>
                  <cfg.Icon size={12} color={cfg.color} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.875rem', lineHeight: 1.5 }}>{c.message}</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {c.price > 0 && <span style={{ background: 'rgba(243,112,33,0.15)', color: OR, borderRadius: 9999, padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 600 }}>{c.price.toLocaleString()} €</span>}
                <span style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', borderRadius: 9999, padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}>{c.type}</span>
              </div>
              {tab === 'reçues' && c.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem' }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(48,209,88,0.15)', border: '1px solid rgba(48,209,88,0.3)', color: '#30d158', borderRadius: 9999, padding: '0.45rem 1rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    <CheckCircle size={12} /> Accepter
                  </button>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', borderRadius: 9999, padding: '0.45rem 1rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    Contre-offre
                  </button>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.2)', color: '#ff453a', borderRadius: 9999, padding: '0.45rem 1rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <XCircle size={12} /> Refuser
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EmptyState({ tab }: { tab: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 14, border: '1px dashed rgba(255,255,255,0.1)' }}>
      <Send size={32} style={{ color: 'rgba(255,255,255,0.15)', marginBottom: '0.75rem' }} />
      <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>Aucune proposition {tab}</p>
      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>Les demandes de sponsoring apparaîtront ici</p>
    </div>
  )
}
