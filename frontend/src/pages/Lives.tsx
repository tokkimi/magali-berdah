import { useEffect, useState } from 'react';
import { ExternalLink, Radio, Square } from 'lucide-react';
import { useStore } from '../lib/store';
import LiveCard from '../components/LiveCard';
import { getWhatnotLives, isApprovedAmbassador, saveWhatnotLive, stopWhatnotLive, type WhatnotLive } from '../lib/whatnot';

export default function Lives() {
  const { user } = useStore();
  const [lives, setLives] = useState<WhatnotLive[]>(getWhatnotLives);
  const [username, setUsername] = useState(() => user ? localStorage.getItem(`mb_whatnot_handle_${user.email}`) || '' : '');
  const [whatnotUrl, setWhatnotUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [title, setTitle] = useState('');
  const canBroadcast = user?.role === 'admin' || isApprovedAmbassador(user?.email);
  const ownLive = lives.find(live => live.userEmail === user?.email);
  const refresh = () => setLives(getWhatnotLives());

  useEffect(() => {
    window.addEventListener('whatnot-lives-updated', refresh);
    return () => window.removeEventListener('whatnot-lives-updated', refresh);
  }, []);

  const goLive = () => {
    if (!user || !canBroadcast || !username.trim() || !whatnotUrl.startsWith('https://')) return;
    saveWhatnotLive({ id: `live-${Date.now()}`, userEmail: user.email, username: username.replace(/^@/, '').trim(), whatnotUrl, previewUrl: previewUrl || undefined, title: title || undefined, isLive: true, startedAt: new Date().toISOString() });
    refresh();
    window.open(whatnotUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ background: '#faf7f4', minHeight: '70vh', padding: '3rem 1rem 7rem' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <p style={{ color: '#e11d48', font: '700 .62rem Helvetica Neue, Arial', letterSpacing: '.22em' }}>WHATNOT · EN DIRECT</p>
        <h1 style={{ font: '400 2.2rem Georgia, serif', margin: '.4rem 0 2rem' }}>Les lives en cours</h1>

        {user && canBroadcast && (
          <section style={{ background: 'white', border: '1px solid #e8d5b7', padding: '1.4rem', marginBottom: '2rem' }}>
            <h2 style={{ font: '400 1.2rem Georgia, serif', marginBottom: '.5rem' }}>Espace diffuseur</h2>
            <p style={{ color: '#777', font: '.75rem Helvetica Neue, Arial', marginBottom: '1rem' }}>Le live reste hébergé par Whatnot. La preview est muette par défaut et le clic ouvre la vente sur Whatnot.</p>
            {ownLive ? (
              <button onClick={() => { stopWhatnotLive(user.email); refresh(); }} style={dangerButton}><Square size={15} /> ARRÊTER L’AFFICHAGE DU LIVE</button>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 10 }}>
                  <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Pseudo Whatnot (@pseudo)" style={inputStyle} />
                  <input value={whatnotUrl} onChange={e => setWhatnotUrl(e.target.value)} placeholder="Lien https://whatnot.com/live/..." style={inputStyle} />
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre du live (optionnel)" style={inputStyle} />
                  <input value={previewUrl} onChange={e => setPreviewUrl(e.target.value)} placeholder="URL image ou vidéo preview (optionnel)" style={inputStyle} />
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                  <button onClick={goLive} style={liveButton}><Radio size={16} /> PASSER EN LIVE</button>
                  <a href="https://www.whatnot.com/" target="_blank" rel="noreferrer" style={{ ...secondaryButton, textDecoration: 'none' }}><ExternalLink size={15} /> OUVRIR WHATNOT</a>
                </div>
              </>
            )}
          </section>
        )}

        {user && !canBroadcast && <p style={{ background: '#fff8e6', border: '1px solid #e8d5b7', padding: '1rem', color: '#755b31', font: '.78rem Helvetica Neue, Arial', marginBottom: '2rem' }}>La diffusion est réservée aux ambassadeurs validés par l’administration. Vous pouvez demander cette validation depuis votre profil.</p>}

        {lives.length ? <div className="live-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 16 }}>{lives.map(live => <LiveCard key={live.id} live={live} />)}</div> : <div style={{ textAlign: 'center', padding: '5rem 1rem', color: '#9e8e7e' }}><Radio size={42} style={{ margin: '0 auto 1rem' }} /><p style={{ font: '1rem Georgia, serif' }}>Aucun live en cours pour le moment.</p></div>}
      </div>
      <style>{`@media(max-width:1000px){.live-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}@media(max-width:600px){.live-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = { border: '1px solid #e8d5b7', padding: '11px 12px', font: '.8rem Helvetica Neue, Arial', width: '100%' };
const liveButton: React.CSSProperties = { border: 0, background: '#e11d48', color: 'white', padding: '11px 16px', display: 'inline-flex', gap: 8, alignItems: 'center', cursor: 'pointer', font: '700 .7rem Helvetica Neue, Arial', letterSpacing: '.08em' };
const dangerButton: React.CSSProperties = { ...liveButton, background: '#1a1a1a' };
const secondaryButton: React.CSSProperties = { border: '1px solid #1a1a1a', color: '#1a1a1a', padding: '10px 16px', display: 'inline-flex', gap: 8, alignItems: 'center', font: '700 .7rem Helvetica Neue, Arial', letterSpacing: '.08em' };
