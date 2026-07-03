'use client'

import { useState } from 'react'
import { Save, Plus, Instagram, Youtube, Eye, EyeOff } from 'lucide-react'

export default function ProfilInfluenceur() {
  const [saved, setSaved] = useState(false)
  const [plan, setPlan] = useState('PRO')
  const [isPublic, setIsPublic] = useState(true)
  const [form, setForm] = useState({
    name: 'Marie Dupont',
    bio: 'Influenceuse lifestyle et mode. Basée à Paris.',
    instagram: '@mariedupont',
    tiktok: '@mariedupont',
    youtube: '',
    twitter: '',
    followers: '25000',
    engagementRate: '4.7',
    ratePost: '400',
    rateStory: '100',
    rateVideo: '800',
    gender: 'Femme',
    country: 'France',
    languages: 'Français, Anglais',
    interests: 'Mode, Lifestyle, Beauté',
    communityGenderF: '72',
    communityGenderM: '28',
    communityAge1824: '35',
    communityAge2534: '42',
    communityAge3544: '16',
    communityAge45: '7',
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-4">Mon profil influenceur</h1>

      {/* Public/Private toggle */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isPublic ? <Eye size={18} color="#F37021" /> : <EyeOff size={18} color="rgba(255,255,255,0.3)" />}
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'white' }}>{isPublic ? 'Profil public' : 'Profil privé'}</p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{isPublic ? 'Visible dans la galerie et accessible aux marques' : 'Uniquement visible par vous'}</p>
          </div>
        </div>
        <button onClick={() => setIsPublic(!isPublic)} style={{ position: 'relative', width: 48, height: 26, borderRadius: 13, border: 'none', background: isPublic ? '#F37021' : 'rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
          <span style={{ position: 'absolute', top: 3, left: isPublic ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Abonnement */}
        <div className="bg-transparent rounded-2xl border border-white/8 p-6">
          <h2 className="font-semibold text-white mb-4">Mon offre</h2>
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => setPlan('FREE')}
              className={`p-4 rounded-xl border-2 text-left transition ${plan === 'FREE' ? 'border-white/30 bg-transparent' : 'border-white/10 hover:border-white/30'}`}>
              <p className={`font-semibold ${plan === 'FREE' ? 'text-white' : 'text-white/40'}`}>Gratuit</p>
              <p className="text-xs text-white/30 mt-1">0€/mois · 30% commission</p>
            </button>
            <button type="button" onClick={() => setPlan('PRO')}
              className={`p-4 rounded-xl border-2 text-left transition ${plan === 'PRO' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 hover:border-orange-400/50'}`}>
              <p className={`font-semibold ${plan === 'PRO' ? 'text-orange-500' : 'text-white/40'}`}>⭐ Pro</p>
              <p className="text-xs text-white/30 mt-1">29€/mois · 5% commission</p>
            </button>
          </div>
        </div>

        {/* Info de base */}
        <div className="bg-transparent rounded-2xl border border-white/8 p-6 space-y-4">
          <h2 className="font-semibold text-white">Informations de base</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Prénom & Nom / Pseudo</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-0 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Genre</label>
              <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-0 text-sm">
                <option>Femme</option><option>Homme</option><option>Non-binaire</option><option>Préfère ne pas dire</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Bio</label>
            <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-0 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Pays</label>
              <input value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-0 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Langues parlées</label>
              <input value={form.languages} onChange={e => setForm({...form, languages: e.target.value})} placeholder="Français, Anglais..." className="w-full px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-0 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Centres d&apos;intérêt</label>
            <input value={form.interests} onChange={e => setForm({...form, interests: e.target.value})} placeholder="Mode, Voyage, Tech..." className="w-full px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-0 text-sm" />
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div className="bg-transparent rounded-2xl border border-white/8 p-6 space-y-4">
          <h2 className="font-semibold text-white">Réseaux sociaux</h2>
          {[
            { key: 'instagram', label: 'Instagram', placeholder: '@monpseudo' },
            { key: 'tiktok', label: 'TikTok', placeholder: '@monpseudo' },
            { key: 'youtube', label: 'YouTube', placeholder: 'MaChaîne' },
            { key: 'twitter', label: 'Twitter/X', placeholder: '@monpseudo' },
          ].map(r => (
            <div key={r.key}>
              <label className="block text-sm font-medium text-white/80 mb-1">{r.label}</label>
              <input value={form[r.key as keyof typeof form]} onChange={e => setForm({...form, [r.key]: e.target.value})} placeholder={r.placeholder} className="w-full px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-0 text-sm" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Nombre d&apos;abonnés</label>
              <input type="number" value={form.followers} onChange={e => setForm({...form, followers: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-0 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Taux d&apos;engagement (%)</label>
              <input type="number" step="0.1" value={form.engagementRate} onChange={e => setForm({...form, engagementRate: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-0 text-sm" />
            </div>
          </div>
        </div>

        {/* Tarifs */}
        <div className="bg-transparent rounded-2xl border border-white/8 p-6 space-y-4">
          <h2 className="font-semibold text-white">Mes tarifs</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'ratePost', label: 'Post / Photo (€)' },
              { key: 'rateStory', label: 'Story (€)' },
              { key: 'rateVideo', label: 'Vidéo / Reel (€)' },
            ].map(r => (
              <div key={r.key}>
                <label className="block text-sm font-medium text-white/80 mb-1">{r.label}</label>
                <input type="number" value={form[r.key as keyof typeof form]} onChange={e => setForm({...form, [r.key]: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-0 text-sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Communauté */}
        <div className="bg-transparent rounded-2xl border border-white/8 p-6 space-y-4">
          <h2 className="font-semibold text-white">Statistiques de ma communauté</h2>
          <div>
            <p className="text-sm font-medium text-white/80 mb-2">Genre de l&apos;audience (%)</p>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-white/40 mb-1 block">Femmes</label><input type="number" value={form.communityGenderF} onChange={e => setForm({...form, communityGenderF: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-0 text-sm" /></div>
              <div><label className="text-xs text-white/40 mb-1 block">Hommes</label><input type="number" value={form.communityGenderM} onChange={e => setForm({...form, communityGenderM: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-0 text-sm" /></div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-white/80 mb-2">Âge de l&apos;audience (%)</p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { key: 'communityAge1824', label: '18-24' },
                { key: 'communityAge2534', label: '25-34' },
                { key: 'communityAge3544', label: '35-44' },
                { key: 'communityAge45', label: '45+' },
              ].map(a => (
                <div key={a.key}><label className="text-xs text-white/40 mb-1 block">{a.label}</label><input type="number" value={form[a.key as keyof typeof form]} onChange={e => setForm({...form, [a.key]: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-0 text-sm" /></div>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" className="flex items-center gap-2 text-white px-6 py-3 rounded-full font-medium  transition">
          <Save className="w-4 h-4" />
          {saved ? '✅ Sauvegardé !' : 'Sauvegarder les modifications'}
        </button>
      </form>
    </div>
  )
}
