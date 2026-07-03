'use client'

import { useState } from 'react'
import { Save, Upload, Eye, EyeOff } from 'lucide-react'

function GlassCard({ children }: { children: React.ReactNode }) {
  return <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.25rem' }}>{children}</div>
}

const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white', fontSize: '0.875rem', outline: 'none', width: '100%' }
const SECTORS = ['Mode', 'Beauté', 'Sport', 'Technologie', 'Alimentation', 'Luxe', 'Voyage', 'Maison', 'Santé', 'Autre']

export default function MarqueProfilPage() {
  const [companyName, setCompanyName] = useState('Maison Élégance')
  const [sector, setSector] = useState('Mode')
  const [website, setWebsite] = useState('https://maison-elegance.fr')
  const [description, setDescription] = useState('Mode et élégance française')
  const [contactEmail, setContactEmail] = useState('contact@maison-elegance.fr')
  const [contactPhone, setContactPhone] = useState('+33 1 23 45 67 89')
  const [isPublic, setIsPublic] = useState(true)
  const [saved, setSaved] = useState(false)

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 3000) }

  return (
    <div style={{ color: 'white', padding: '1.5rem', maxWidth: '680px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Profil de la marque</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>Informations publiques de votre entreprise</p>
      </div>

      {saved && (
        <div style={{ background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.2)', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#30d158', fontSize: '0.875rem' }}>
          ✓ Profil enregistré avec succès
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Public/Private toggle */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isPublic ? <Eye size={18} color="#F37021" /> : <EyeOff size={18} color="rgba(255,255,255,0.3)" />}
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{isPublic ? 'Profil public' : 'Profil privé'}</p>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{isPublic ? 'Visible dans la galerie et sur la home' : 'Uniquement visible par vous'}</p>
            </div>
          </div>
          <button onClick={() => setIsPublic(!isPublic)} style={{ position: 'relative', width: 48, height: 26, borderRadius: 13, border: 'none', background: isPublic ? '#F37021' : 'rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: 3, left: isPublic ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
          </button>
        </div>

        <GlassCard>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem' }}>Logo de la marque</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 72, height: 72, borderRadius: '1rem', background: 'rgba(243,112,33,0.2)', border: '1px solid rgba(243,112,33,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, color: '#F37021' }}>
              ME
            </div>
            <div>
              <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', padding: '0.5rem 1rem', borderRadius: '9999px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <Upload size={13} /> Changer le logo
              </button>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>JPG, PNG ou SVG · Max 2MB</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem' }}>Informations générales</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.25rem', display: 'block' }}>Nom de l&apos;entreprise</label>
              <input style={inputStyle} value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.25rem', display: 'block' }}>Secteur d&apos;activité</label>
              <select style={inputStyle} value={sector} onChange={e => setSector(e.target.value)}>
                {SECTORS.map(s => <option key={s} value={s} style={{ background: '#1a1a1a' }}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.25rem', display: 'block' }}>Site web</label>
              <input style={inputStyle} value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.25rem', display: 'block' }}>Description</label>
              <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' } as React.CSSProperties} value={description} onChange={e => setDescription(e.target.value)} placeholder="Décrivez votre marque..." />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem' }}>Informations de contact</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.25rem', display: 'block' }}>Email de contact</label>
              <input type="email" style={inputStyle} value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.25rem', display: 'block' }}>Téléphone</label>
              <input type="tel" style={inputStyle} value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem' }}>Documents de présentation</h2>
          <div style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(243,112,33,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}>
            <Upload size={20} color="rgba(255,255,255,0.3)" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Uploader votre présentation ou media kit</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.25rem' }}>PDF, PPT · Max 20MB</div>
          </div>
        </GlassCard>

        <button onClick={save} style={{ background: 'rgba(243,112,33,0.2)', border: '1px solid rgba(243,112,33,0.3)', color: '#F37021', fontSize: '0.75rem', fontWeight: 600, padding: '0.6rem 1.5rem', borderRadius: '9999px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', alignSelf: 'flex-start' }}>
          <Save size={14} /> Enregistrer le profil
        </button>
      </div>
    </div>
  )
}
