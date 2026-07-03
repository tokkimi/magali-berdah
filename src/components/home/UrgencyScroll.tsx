'use client'
import { mockOpportunities } from '@/lib/mock-data'
import { Calendar, MapPin, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const OR = '#F37021'

function daysLeft(deadline: string): number {
  const d = new Date(deadline).getTime() - Date.now()
  return Math.max(0, Math.ceil(d / (1000 * 60 * 60 * 24)))
}

function urgencyColor(days: number): string {
  if (days <= 7) return '#ff453a'
  if (days <= 30) return '#ff9f0a'
  return '#30d158'
}

function pct(raised: number, goal: number) {
  return Math.min(100, Math.round((raised / goal) * 100))
}

export default function UrgencyScroll() {
  const opps = mockOpportunities.slice(0, 50)

  return (
    <section style={{ background: '#0f0f0f', padding: '4rem 0 3rem', overflow: 'hidden' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Zap size={16} color={OR} />
              <p style={{ fontSize: '0.7rem', color: OR, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>Opportunités urgentes</p>
            </div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              Les projets qui ont besoin <span style={{ color: OR }}>de vous maintenant</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.5rem' }}>Triés par date la plus proche — agissez avant qu&apos;il ne soit trop tard</p>
          </div>
          <Link href="/galerie?tab=evenements" style={{ display: 'flex', alignItems: 'center', gap: 6, color: OR, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', border: `1px solid rgba(243,112,33,0.3)`, padding: '0.5rem 1rem', borderRadius: 9999 }}>
            Tout voir <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Horizontal scroll */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
        <div style={{ display: 'flex', gap: '1rem', padding: '0.5rem 1.25rem 1.5rem', width: 'max-content' }}>
          {opps.map(opp => {
            const days = daysLeft(opp.deadline)
            const urgColor = urgencyColor(days)
            const progress = pct(opp.sponsorshipRaised, opp.sponsorshipGoal)
            const isEvent = opp.type === 'EVENT'

            return (
              <div key={opp.id} style={{
                width: 260,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                overflow: 'hidden',
                flexShrink: 0,
                transition: 'transform 0.2s, border-color 0.2s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(243,112,33,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>

                {/* Header with urgency indicator */}
                <div style={{ padding: '1rem', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: isEvent ? 'rgba(10,132,255,0.15)' : 'rgba(243,112,33,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.9rem' }}>{isEvent ? '🎪' : '💡'}</span>
                      </div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isEvent ? '#0a84ff' : OR, background: isEvent ? 'rgba(10,132,255,0.1)' : 'rgba(243,112,33,0.1)', borderRadius: 9999, padding: '0.1rem 0.45rem' }}>
                        {isEvent ? 'Événement' : 'Projet'}
                      </span>
                    </div>
                    {/* Urgency badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: `${urgColor}15`, border: `1px solid ${urgColor}30`, borderRadius: 9999, padding: '0.15rem 0.5rem', flexShrink: 0 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: urgColor }} />
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, color: urgColor }}>
                        {days === 0 ? "Aujourd'hui" : days === 1 ? '1 jour' : `${days} j`}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white', lineHeight: 1.35, marginBottom: '0.4rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
                    {opp.name}
                  </p>

                  <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
                    {opp.description}
                  </p>
                </div>

                {/* Meta */}
                <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>
                    <Calendar size={11} /> {new Date(opp.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {opp.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>
                      <MapPin size={11} /> {opp.location}
                    </span>
                  )}
                  <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>{opp.sector}</span>
                </div>

                {/* Progress */}
                <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>Financement</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: OR }}>{progress}%</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 9999, height: 4 }}>
                    <div style={{ width: `${progress}%`, background: OR, borderRadius: 9999, height: 4 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.6rem', color: '#30d158', fontWeight: 600 }}>{opp.sponsorshipRaised.toLocaleString()} €</span>
                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>{opp.sponsorshipGoal.toLocaleString()} €</span>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ padding: '0 1rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {opp.tags.slice(0, 3).map(t => (
                    <span key={t} style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', borderRadius: 9999, padding: '0.1rem 0.45rem', fontSize: '0.6rem' }}>{t}</span>
                  ))}
                </div>

                {/* CTA */}
                <div style={{ padding: '0 1rem 1rem' }}>
                  <Link href="/galerie" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: OR, color: 'white', borderRadius: 9999, padding: '0.55rem', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
                    Soutenir <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Hide scrollbar CSS */}
      <style>{`.urgency-scroll::-webkit-scrollbar { display: none; }`}</style>
    </section>
  )
}
