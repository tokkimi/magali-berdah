'use client'
import { useSession } from 'next-auth/react'
import { mockEvents } from '@/lib/mock-data'
import { Calendar, MapPin, Users, Globe, Mail, Tag, Eye, EyeOff, Edit3 } from 'lucide-react'
import { useState } from 'react'

const OR = '#F37021'

export default function EvenementProfil() {
  const { data: session } = useSession()
  const event = mockEvents.find(e => e.userId === 'event-1') || mockEvents[0]
  const [isPublic, setIsPublic] = useState(event.isPublic)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ color: 'white', maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Mon Événement</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: 2 }}>Profil visible par les sponsors potentiels</p>
        </div>
        <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6, background: saved ? 'rgba(48,209,88,0.2)' : OR, border: 'none', color: 'white', padding: '0.6rem 1.25rem', borderRadius: 9999, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
          <Edit3 size={14} /> {saved ? 'Sauvegardé !' : 'Sauvegarder'}
        </button>
      </div>

      {/* Public/Private toggle */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isPublic ? <Eye size={18} color={OR} /> : <EyeOff size={18} color="rgba(255,255,255,0.3)" />}
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{isPublic ? 'Profil public' : 'Profil privé'}</p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{isPublic ? 'Visible dans la galerie et sur la home' : 'Uniquement visible par vous'}</p>
          </div>
        </div>
        <button onClick={() => setIsPublic(!isPublic)} style={{ position: 'relative', width: 48, height: 26, borderRadius: 13, border: 'none', background: isPublic ? OR : 'rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
          <span style={{ position: 'absolute', top: 3, left: isPublic ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
        </button>
      </div>

      {/* Form */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Field label="Nom de l'événement" defaultValue={event.name} icon={<Tag size={14} />} />
        <Field label="Type" defaultValue={event.type} />
        <Field label="Secteur" defaultValue={event.sector} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Field label="Date de l'événement" defaultValue={event.eventDate} type="date" icon={<Calendar size={14} />} />
          <Field label="Date de fin" defaultValue={event.endDate} type="date" />
        </div>
        <Field label="Lieu" defaultValue={event.location} icon={<MapPin size={14} />} />
        <Field label="Participants attendus" defaultValue={String(event.expectedAttendees)} type="number" icon={<Users size={14} />} />
        <Field label="Description" defaultValue={event.description} textarea />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Field label="Objectif sponsoring (€)" defaultValue={String(event.sponsorshipGoal)} type="number" />
          <Field label="Budget total (€)" defaultValue={String(event.budget)} type="number" />
        </div>
        <Field label="Site web" defaultValue={event.website || ''} icon={<Globe size={14} />} />
        <Field label="Email de contact" defaultValue={event.contactEmail} icon={<Mail size={14} />} />
        <Field label="Tags (séparés par des virgules)" defaultValue={event.tags.join(', ')} icon={<Tag size={14} />} />
      </div>
    </div>
  )
}

function Field({ label, defaultValue, type = 'text', textarea = false, icon }: {
  label: string; defaultValue: string; type?: string; textarea?: boolean; icon?: React.ReactNode
}) {
  const base: React.CSSProperties = {
    width: '100%', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem',
    color: 'white', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
  }
  return (
    <div>
      <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: '0.375rem', fontWeight: 500 }}>
        {icon} {label}
      </label>
      {textarea
        ? <textarea rows={4} defaultValue={defaultValue} style={{ ...base, resize: 'vertical' }} />
        : <input type={type} defaultValue={defaultValue} style={base} />
      }
    </div>
  )
}
