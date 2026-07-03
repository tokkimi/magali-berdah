'use client'
import { useState, useMemo } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { mockInfluencers, mockBrands, mockEvents, mockProjects } from '@/lib/mock-data'
import { Search, Filter, MapPin, Users, Star, Calendar, Lightbulb, Building2, X, Send, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const OR = '#F37021'

type Tab = 'influenceurs' | 'marques' | 'evenements' | 'projets'

const tabs: { id: Tab; label: string; Icon: React.ElementType; count: number }[] = [
  { id: 'influenceurs', label: 'Influenceurs', Icon: Star, count: mockInfluencers.length },
  { id: 'marques', label: 'Marques', Icon: Building2, count: mockBrands.length },
  { id: 'evenements', label: 'Événements', Icon: Calendar, count: mockEvents.length },
  { id: 'projets', label: 'Projets', Icon: Lightbulb, count: mockProjects.length },
]

function formatK(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${Math.round(n / 1000)}k`
  return `${n}`
}

function ProposalModal({ target, onClose }: { target: { name: string; type: string }; onClose: () => void }) {
  const [form, setForm] = useState({ type: 'PAID', message: '', price: '' })
  const [sent, setSent] = useState(false)

  if (sent) return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '2rem', textAlign: 'center', maxWidth: 360, width: '100%', color: 'white' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✅</div>
        <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Proposition envoyée !</h3>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem' }}>Votre message a été transmis à {target.name}.</p>
        <button onClick={onClose} style={{ background: OR, color: 'white', border: 'none', borderRadius: 9999, padding: '0.6rem 1.5rem', fontWeight: 600, cursor: 'pointer' }}>Fermer</button>
      </div>
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem', maxWidth: 440, width: '100%', color: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Faire une proposition</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem' }}>À : <strong style={{ color: 'white' }}>{target.name}</strong></p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {[['PAID', 'Payante'], ['PRODUCT', 'Contre produit'], ['FREE', 'Gratuite'], ['AMBASSADOR', 'Ambassadeur']].map(([v, l]) => (
            <button key={v} onClick={() => setForm(f => ({ ...f, type: v }))} style={{ padding: '0.35rem 0.75rem', borderRadius: 9999, fontSize: '0.72rem', fontWeight: form.type === v ? 700 : 400, cursor: 'pointer', border: form.type === v ? `1px solid ${OR}` : '1px solid rgba(255,255,255,0.1)', background: form.type === v ? `rgba(243,112,33,0.15)` : 'rgba(255,255,255,0.04)', color: form.type === v ? OR : 'rgba(255,255,255,0.5)' }}>
              {l}
            </button>
          ))}
        </div>

        {form.type === 'PAID' && (
          <div style={{ marginBottom: '0.875rem' }}>
            <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.375rem' }}>Budget proposé (€)</label>
            <input type="number" placeholder="ex: 500" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              style={{ width: '100%', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }} />
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.375rem' }}>Message</label>
          <textarea rows={4} placeholder="Décrivez votre proposition, ce que vous offrez et ce que vous attendez..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            style={{ width: '100%', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white', fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' as const }} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => { if (form.message) setSent(true) }} disabled={!form.message} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: form.message ? OR : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: 9999, padding: '0.75rem', fontWeight: 600, fontSize: '0.875rem', cursor: form.message ? 'pointer' : 'not-allowed' }}>
            <Send size={14} /> Envoyer
          </button>
          <button onClick={onClose} style={{ padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9999, color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', cursor: 'pointer' }}>Annuler</button>
        </div>
      </div>
    </div>
  )
}

export default function GaleriePage() {
  const [tab, setTab] = useState<Tab>('influenceurs')
  const [search, setSearch] = useState('')
  const [proposal, setProposal] = useState<{ name: string; type: string } | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ category: '', country: '', minFollowers: '' })

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (tab === 'influenceurs') {
      return mockInfluencers.filter(i => i.isPublic && (
        i.name.toLowerCase().includes(q) ||
        i.interests.some((t: string) => t.toLowerCase().includes(q)) ||
        i.category.toLowerCase().includes(q)
      ) && (!filters.category || i.category === filters.category) && (!filters.country || i.country === filters.country))
    }
    if (tab === 'marques') return mockBrands.filter(b => b.isPublic && b.companyName.toLowerCase().includes(q))
    if (tab === 'evenements') return mockEvents.filter(e => e.isPublic && (e.name.toLowerCase().includes(q) || e.sector.toLowerCase().includes(q)))
    return mockProjects.filter(p => p.isPublic && (p.name.toLowerCase().includes(q) || p.sector.toLowerCase().includes(q)))
  }, [tab, search, filters])

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#fafaf8', paddingBottom: '4rem' }}>
        {/* Header */}
        <div style={{ background: '#0f0f0f', paddingTop: '5rem', paddingBottom: '3rem' }}>
          <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.25rem' }}>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Annuaire</p>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
              Explorez tous les <span style={{ color: OR }}>talents</span>
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', maxWidth: 480, marginBottom: '1.75rem' }}>
              Influenceurs, marques, événements et projets à la recherche de partenariats. Filtrez, trouvez, proposez.
            </p>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 560 }}>
              <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un influenceur, une marque, un événement..."
                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.875rem', color: 'white', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.25rem' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.375rem', marginTop: '-1.25rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            {tabs.map(({ id, label, Icon, count }) => (
              <button key={id} onClick={() => setTab(id)} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.6rem 1.1rem', borderRadius: 9999, fontSize: '0.8rem', fontWeight: tab === id ? 700 : 500, cursor: 'pointer',
                background: tab === id ? OR : 'white',
                color: tab === id ? 'white' : '#0f0f0f',
                border: tab === id ? `1px solid ${OR}` : '1px solid rgba(0,0,0,0.1)',
                boxShadow: tab === id ? `0 4px 16px rgba(243,112,33,0.25)` : '0 2px 8px rgba(0,0,0,0.06)',
              }}>
                <Icon size={13} /> {label}
                <span style={{ background: tab === id ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)', borderRadius: 9999, padding: '0 0.4rem', fontSize: '0.65rem', fontWeight: 700 }}>{count}</span>
              </button>
            ))}

            <button onClick={() => setShowFilters(!showFilters)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', borderRadius: 9999, fontSize: '0.8rem', cursor: 'pointer', background: 'white', border: '1px solid rgba(0,0,0,0.1)', color: '#0f0f0f', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Filter size={13} /> Filtres <ChevronDown size={12} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>
          </div>

          {/* Filters panel */}
          {showFilters && tab === 'influenceurs' && (
            <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: '1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Catégorie', key: 'category', options: ['MICRO', 'MACRO', 'PERSONNALITE'] },
                { label: 'Pays', key: 'country', options: ['France', 'Belgique', 'Suisse'] },
              ].map(({ label, key, options }) => (
                <div key={key}>
                  <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#6b6b6b', display: 'block', marginBottom: '0.25rem' }}>{label}</label>
                  <select value={filters[key as keyof typeof filters]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '0.625rem', border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.8rem', color: '#0f0f0f', background: 'white', cursor: 'pointer' }}>
                    <option value="">Tous</option>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <button onClick={() => setFilters({ category: '', country: '', minFollowers: '' })} style={{ alignSelf: 'flex-end', padding: '0.5rem 0.875rem', borderRadius: '0.625rem', border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.75rem', cursor: 'pointer', background: 'transparent', color: '#6b6b6b' }}>
                Réinitialiser
              </button>
            </div>
          )}

          {/* Count */}
          <p style={{ fontSize: '0.8rem', color: '#6b6b6b', marginBottom: '1.25rem' }}>{(filtered as unknown[]).length} résultat{(filtered as unknown[]).length > 1 ? 's' : ''}</p>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>

            {tab === 'influenceurs' && (filtered as typeof mockInfluencers).map(inf => (
              <div key={inf.id} style={{ background: 'white', borderRadius: 16, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ position: 'relative', height: 180 }}>
                  <Image src={inf.photo} alt={inf.name} fill style={{ objectFit: 'cover' }} unoptimized />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
                    <p style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{inf.name}</p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>{inf.country}</p>
                  </div>
                  {inf.isVerified && <div style={{ position: 'absolute', top: 10, right: 10, background: '#0a84ff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Star size={11} color="white" />
                  </div>}
                  <div style={{ position: 'absolute', top: 10, left: 10, background: inf.category === 'MICRO' ? 'rgba(48,209,88,0.9)' : inf.category === 'PERSONNALITE' ? 'rgba(10,132,255,0.9)' : `rgba(243,112,33,0.9)`, color: 'white', borderRadius: 9999, padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700 }}>
                    {inf.category}
                  </div>
                </div>
                <div style={{ padding: '0.875rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ background: '#f8f7f4', borderRadius: 8, padding: '0.4rem 0.6rem' }}>
                      <p style={{ fontSize: '0.65rem', color: '#6b6b6b' }}>Abonnés</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f0f0f' }}>{formatK(inf.followers)}</p>
                    </div>
                    <div style={{ background: '#f8f7f4', borderRadius: 8, padding: '0.4rem 0.6rem' }}>
                      <p style={{ fontSize: '0.65rem', color: '#6b6b6b' }}>Engage.</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#30d158' }}>{inf.engagementRate}%</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {inf.interests.slice(0, 3).map((t: string) => (
                      <span key={t} style={{ background: '#f0f0f0', color: '#6b6b6b', borderRadius: 9999, padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setProposal({ name: inf.name, type: 'INFLUENCER' })} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: OR, color: 'white', border: 'none', borderRadius: 9999, padding: '0.55rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                      <Send size={12} /> Proposer
                    </button>
                    <Link href={`/influenceur/${inf.id}`} style={{ padding: '0.55rem 0.875rem', background: '#f0f0f0', borderRadius: 9999, fontSize: '0.75rem', color: '#0f0f0f', textDecoration: 'none', fontWeight: 500 }}>Voir</Link>
                  </div>
                </div>
              </div>
            ))}

            {tab === 'marques' && (filtered as typeof mockBrands).map(brand => (
              <div key={brand.id} style={{ background: 'white', borderRadius: 16, border: '1px solid rgba(0,0,0,0.07)', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.875rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f0f0f0', overflow: 'hidden', flexShrink: 0 }}>
                    {brand.logo ? <Image src={brand.logo} alt={brand.companyName} width={48} height={48} style={{ objectFit: 'cover' }} unoptimized /> : <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, color: OR }}>{brand.companyName[0]}</div>}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f0f0f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{brand.companyName}</p>
                    <p style={{ fontSize: '0.72rem', color: '#6b6b6b' }}>{brand.sector}</p>
                  </div>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#6b6b6b', lineHeight: 1.5, marginBottom: '0.875rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{brand.description}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setProposal({ name: brand.companyName, type: 'BRAND' })} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: OR, color: 'white', border: 'none', borderRadius: 9999, padding: '0.55rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    <Send size={12} /> Proposer
                  </button>
                </div>
              </div>
            ))}

            {tab === 'evenements' && (filtered as typeof mockEvents).map(evt => (
              <div key={evt.id} style={{ background: 'white', borderRadius: 16, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}>
                <div style={{ height: 120, background: 'linear-gradient(135deg, #0f0f0f, #1a1a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${evt.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.4 }} />
                  <div style={{ position: 'relative', textAlign: 'center' }}>
                    <p style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem', padding: '0 1rem' }}>{evt.name}</p>
                  </div>
                  <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(48,209,88,0.9)', color: 'white', borderRadius: 9999, padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700 }}>Ouvert</div>
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#6b6b6b' }}><Calendar size={11} /> {new Date(evt.eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#6b6b6b' }}><MapPin size={11} /> {evt.location}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#6b6b6b' }}><Users size={11} /> {evt.expectedAttendees.toLocaleString()}</span>
                  </div>
                  <div style={{ background: '#f8f7f4', borderRadius: 8, padding: '0.5rem 0.75rem', marginBottom: '0.75rem' }}>
                    <p style={{ fontSize: '0.65rem', color: '#6b6b6b', marginBottom: '0.2rem' }}>Sponsoring</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: OR }}>{evt.sponsorshipRaised.toLocaleString()} €</span>
                      <span style={{ fontSize: '0.7rem', color: '#6b6b6b' }}>/ {evt.sponsorshipGoal.toLocaleString()} €</span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: 9999, height: 4 }}>
                      <div style={{ width: `${Math.round((evt.sponsorshipRaised / evt.sponsorshipGoal) * 100)}%`, background: OR, borderRadius: 9999, height: 4 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setProposal({ name: evt.name, type: 'EVENT' })} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: OR, color: 'white', border: 'none', borderRadius: 9999, padding: '0.55rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                      <Send size={12} /> Soutenir
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {tab === 'projets' && (filtered as typeof mockProjects).map(proj => (
              <div key={proj.id} style={{ background: 'white', borderRadius: 16, border: '1px solid rgba(0,0,0,0.07)', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.875rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(243,112,33,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Lightbulb size={20} color={OR} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f0f0f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proj.name}</p>
                    <p style={{ fontSize: '0.7rem', color: '#6b6b6b' }}>{proj.type} · {proj.stage}</p>
                  </div>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#6b6b6b', lineHeight: 1.5, marginBottom: '0.875rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{proj.description}</p>
                <div style={{ background: '#f8f7f4', borderRadius: 8, padding: '0.5rem 0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.65rem', color: '#6b6b6b' }}>Financement</span>
                    <span style={{ fontSize: '0.65rem', color: OR, fontWeight: 700 }}>{Math.round((proj.sponsorshipRaised / proj.sponsorshipGoal) * 100)}%</span>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: 9999, height: 4 }}>
                    <div style={{ width: `${Math.min(Math.round((proj.sponsorshipRaised / proj.sponsorshipGoal) * 100), 100)}%`, background: OR, borderRadius: 9999, height: 4 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {proj.tags.slice(0, 3).map(t => <span key={t} style={{ background: '#f0f0f0', color: '#6b6b6b', borderRadius: 9999, padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>{t}</span>)}
                </div>
                <button onClick={() => setProposal({ name: proj.name, type: 'PROJECT' })} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: OR, color: 'white', border: 'none', borderRadius: 9999, padding: '0.6rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                  <Send size={12} /> Soutenir ce projet
                </button>
              </div>
            ))}

          </div>

          {(filtered as unknown[]).length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#6b6b6b' }}>
              <p style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>🔍</p>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Aucun résultat</p>
              <p style={{ fontSize: '0.875rem' }}>Essayez d'autres mots-clés ou catégories</p>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {proposal && <ProposalModal target={proposal} onClose={() => setProposal(null)} />}
    </>
  )
}
