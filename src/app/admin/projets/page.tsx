'use client'
import { useState } from 'react'
import { mockProjects } from '@/lib/mock-data'
import { Calendar, Users, TrendingUp, Eye, Trash2 } from 'lucide-react'

const OR = '#F37021'

export default function AdminProjets() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

  const filtered = mockProjects.filter(p =>
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sector.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'ALL' || p.type === filter)
  )

  const types = ['ALL', ...Array.from(new Set(mockProjects.map(p => p.type)))]

  return (
    <div style={{ color: 'white' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Projets</h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: 2 }}>{mockProjects.length} projets enregistrés</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total', value: mockProjects.length, color: OR },
          { label: 'Ouverts', value: mockProjects.filter(p => p.status === 'OPEN').length, color: '#30d158' },
          { label: 'Publics', value: mockProjects.filter(p => p.isPublic).length, color: '#0a84ff' },
          { label: 'Financement', value: `${mockProjects.reduce((s, p) => s + p.sponsorshipRaised, 0).toLocaleString()} €`, color: 'white' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '0.875rem' }}>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.25rem' }}>{s.label}</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un projet..."
          style={{ flex: 1, minWidth: 200, padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white', fontSize: '0.85rem', outline: 'none' }} />
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{ padding: '0.5rem 0.875rem', borderRadius: 9999, fontSize: '0.75rem', fontWeight: filter === t ? 700 : 400, cursor: 'pointer', background: filter === t ? OR : 'rgba(255,255,255,0.06)', color: 'white', border: filter === t ? `1px solid ${OR}` : '1px solid rgba(255,255,255,0.1)' }}>
              {t === 'ALL' ? 'Tous' : t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map(proj => {
          const pct = Math.round((proj.sponsorshipRaised / proj.sponsorshipGoal) * 100)
          return (
            <div key={proj.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proj.name}</p>
                    <span style={{ background: proj.isPublic ? 'rgba(48,209,88,0.15)' : 'rgba(255,255,255,0.06)', color: proj.isPublic ? '#30d158' : 'rgba(255,255,255,0.4)', borderRadius: 9999, padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 600, flexShrink: 0 }}>
                      {proj.isPublic ? 'Public' : 'Privé'}
                    </span>
                    <span style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', borderRadius: 9999, padding: '0.1rem 0.5rem', fontSize: '0.65rem', flexShrink: 0 }}>{proj.type}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}><Calendar size={11} /> Lancement : {new Date(proj.launchDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}><Users size={11} /> {proj.teamSize} membres</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button title="Voir" style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={14} /></button>
                  <button title="Supprimer" style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.2)', color: '#ff453a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14} /></button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>Financement levé</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: OR }}>{pct}%</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 9999, height: 4 }}>
                    <div style={{ width: `${pct}%`, background: OR, borderRadius: 9999, height: 4 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '0.6rem', color: '#30d158', fontWeight: 600 }}>{proj.sponsorshipRaised.toLocaleString()} €</span>
                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>{proj.sponsorshipGoal.toLocaleString()} €</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '0.4rem 0.75rem', flex: 1 }}>
                    <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)' }}>Budget</p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{proj.budget.toLocaleString()} €</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '0.4rem 0.75rem', flex: 1 }}>
                    <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)' }}>Secteur</p>
                    <p style={{ fontSize: '0.78rem', fontWeight: 600 }}>{proj.sector}</p>
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
          <p>Aucun projet trouvé</p>
        </div>
      )}
    </div>
  )
}
