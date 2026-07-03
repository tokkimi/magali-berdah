'use client'
import { useState } from 'react'
import { mockEvents } from '@/lib/mock-data'
import { Calendar, MapPin, Users, TrendingUp, Eye, Trash2 } from 'lucide-react'

const OR = '#F37021'

export default function AdminEvenements() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

  const filtered = mockEvents.filter(e =>
    (e.name.toLowerCase().includes(search.toLowerCase()) || e.location.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'ALL' || e.type === filter)
  )

  const types = ['ALL', ...Array.from(new Set(mockEvents.map(e => e.type)))]

  return (
    <div style={{ color: 'white' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Événements</h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: 2 }}>{mockEvents.length} événements enregistrés</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total', value: mockEvents.length, color: OR },
          { label: 'Ouverts', value: mockEvents.filter(e => e.status === 'OPEN').length, color: '#30d158' },
          { label: 'Publics', value: mockEvents.filter(e => e.isPublic).length, color: '#0a84ff' },
          { label: 'Sponsoring', value: `${mockEvents.reduce((s, e) => s + e.sponsorshipRaised, 0).toLocaleString()} €`, color: 'white' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '0.875rem' }}>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.25rem' }}>{s.label}</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un événement..."
          style={{ flex: 1, minWidth: 200, padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white', fontSize: '0.85rem', outline: 'none' }} />
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{ padding: '0.5rem 0.875rem', borderRadius: 9999, fontSize: '0.75rem', fontWeight: filter === t ? 700 : 400, cursor: 'pointer', background: filter === t ? OR : 'rgba(255,255,255,0.06)', color: 'white', border: filter === t ? `1px solid ${OR}` : '1px solid rgba(255,255,255,0.1)' }}>
              {t === 'ALL' ? 'Tous' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map(evt => {
          const pct = Math.round((evt.sponsorshipRaised / evt.sponsorshipGoal) * 100)
          return (
            <div key={evt.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evt.name}</p>
                    <span style={{ background: evt.isPublic ? 'rgba(48,209,88,0.15)' : 'rgba(255,255,255,0.06)', color: evt.isPublic ? '#30d158' : 'rgba(255,255,255,0.4)', borderRadius: 9999, padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 600, flexShrink: 0 }}>
                      {evt.isPublic ? 'Public' : 'Privé'}
                    </span>
                    <span style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', borderRadius: 9999, padding: '0.1rem 0.5rem', fontSize: '0.65rem', flexShrink: 0 }}>{evt.type}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}><Calendar size={11} /> {new Date(evt.eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}><MapPin size={11} /> {evt.location}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}><Users size={11} /> {evt.expectedAttendees.toLocaleString()} attendus</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button title="Voir" style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={14} /></button>
                  <button title="Supprimer" style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.2)', color: '#ff453a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Sponsoring bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>Sponsoring levé</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: OR }}>{pct}%</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 9999, height: 4 }}>
                    <div style={{ width: `${pct}%`, background: OR, borderRadius: 9999, height: 4 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '0.6rem', color: '#30d158', fontWeight: 600 }}>{evt.sponsorshipRaised.toLocaleString()} €</span>
                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>{evt.sponsorshipGoal.toLocaleString()} €</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '0.4rem 0.75rem', flex: 1 }}>
                    <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)' }}>Budget</p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{evt.budget.toLocaleString()} €</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '0.4rem 0.75rem', flex: 1 }}>
                    <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)' }}>Secteur</p>
                    <p style={{ fontSize: '0.78rem', fontWeight: 600 }}>{evt.sector}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>
          <TrendingUp size={28} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
          <p>Aucun événement trouvé</p>
        </div>
      )}
    </div>
  )
}
