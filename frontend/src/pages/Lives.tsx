import { useCallback, useEffect, useState } from 'react';
import { Copy, Radio, Square, UserCheck } from 'lucide-react';
import { useStore } from '../lib/store';
import LiveCard from '../components/LiveCard';
import {
  adminConnectWhatnot, getOwnWhatnotProfile, getSavedWhatnotToken, getWhatnotLives,
  saveWhatnotToken, setWhatnotLive, subscribeToWhatnotLives, type WhatnotLive,
} from '../lib/whatnot';

export default function Lives() {
  const { user } = useStore();
  const [lives, setLives] = useState<WhatnotLive[]>([]);
  const [ownProfile, setOwnProfile] = useState<WhatnotLive | null>(null);
  const [activationCode, setActivationCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const [adminForm, setAdminForm] = useState({ adminCode: '', email: '', displayName: '', handle: '', showUrl: '', previewUrl: '' });

  const refresh = useCallback(() => { getWhatnotLives().then(setLives).catch(() => setLives([])); }, []);
  const loadOwn = useCallback(async () => {
    if (!user) return setOwnProfile(null);
    const token = getSavedWhatnotToken(user.email);
    setOwnProfile(token ? await getOwnWhatnotProfile(user.email, token) : null);
  }, [user]);

  useEffect(() => {
    refresh(); void loadOwn();
    const unsubscribe = subscribeToWhatnotLives(refresh);
    const timer = window.setInterval(refresh, 30000);
    return () => { unsubscribe(); window.clearInterval(timer); };
  }, [refresh, loadOwn]);

  const activateAccount = async () => {
    if (!user || !activationCode.trim()) return;
    setBusy(true); setMessage('');
    const profile = await getOwnWhatnotProfile(user.email, activationCode.trim());
    if (!profile) setMessage("Code d’activation invalide ou compte non autorisé.");
    else { saveWhatnotToken(user.email, activationCode); setOwnProfile(profile); setActivationCode(''); setMessage('Compte Whatnot connecté.'); }
    setBusy(false);
  };

  const toggleLive = async (next: boolean) => {
    if (!user || !ownProfile) return;
    setBusy(true); setMessage('');
    try {
      await setWhatnotLive(user.email, getSavedWhatnotToken(user.email), next);
      await Promise.all([refresh(), loadOwn()]);
      if (next) window.open(ownProfile.show_url, '_blank', 'noopener,noreferrer');
    } catch { setMessage("Impossible de modifier le live. Vérifiez votre connexion."); }
    setBusy(false);
  };

  const createAmbassador = async () => {
    setBusy(true); setMessage(''); setCreatedCode('');
    try {
      const token = await adminConnectWhatnot(adminForm);
      setCreatedCode(token);
      if (user?.email.toLowerCase() === adminForm.email.trim().toLowerCase()) {
        saveWhatnotToken(user.email, token); await loadOwn();
      }
      setMessage('Profil autorisé. Transmettez uniquement le code ci-dessous à cette personne.');
    } catch (error: any) { setMessage(error?.message || 'Informations invalides.'); }
    setBusy(false);
  };

  return (
    <div style={{ background: '#faf7f4', minHeight: '70vh', padding: '3rem 1rem 7rem' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <p style={{ color: '#e11d48', font: '700 .62rem Helvetica Neue, Arial', letterSpacing: '.22em' }}>WHATNOT · EN DIRECT</p>
        <h1 style={{ font: '400 2.2rem Georgia, serif', margin: '.4rem 0 2rem' }}>Les lives en cours</h1>

        {user && ownProfile && (
          <section style={panelStyle}>
            <h2 style={headingStyle}>@{ownProfile.whatnot_handle}</h2>
            <p style={helpStyle}>Votre compte est connecté. Un seul bouton suffit.</p>
            {ownProfile.is_live ? (
              <button disabled={busy} onClick={() => toggleLive(false)} style={darkButton}><Square size={15} /> ARRÊTER LE LIVE</button>
            ) : (
              <button disabled={busy} onClick={() => toggleLive(true)} style={liveButton}><Radio size={16} /> PASSER EN LIVE</button>
            )}
          </section>
        )}

        {user && !ownProfile && (
          <section style={panelStyle}>
            <h2 style={headingStyle}>Connecter mon compte Whatnot</h2>
            <p style={helpStyle}>Saisissez une seule fois le code transmis par l’administratrice.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input value={activationCode} onChange={e => setActivationCode(e.target.value)} placeholder="Code d’activation" style={{ ...inputStyle, flex: 1, minWidth: 230 }} />
              <button disabled={busy} onClick={activateAccount} style={darkButton}><UserCheck size={15} /> CONNECTER</button>
            </div>
          </section>
        )}

        {user?.role === 'admin' && (
          <details style={{ ...panelStyle, marginTop: '1rem' }}>
            <summary style={{ cursor: 'pointer', font: '600 .82rem Helvetica Neue, Arial' }}>AUTORISER UN ADMIN OU UN AMBASSADEUR</summary>
            <p style={{ ...helpStyle, marginTop: '1rem' }}>Cette configuration se fait une seule fois par personne.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 10 }}>
              <input type="password" value={adminForm.adminCode} onChange={e => setAdminForm(f => ({ ...f, adminCode: e.target.value }))} placeholder="Code administrateur Live" style={inputStyle} />
              <input type="email" value={adminForm.email} onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))} placeholder="Email du compte du site" style={inputStyle} />
              <input value={adminForm.displayName} onChange={e => setAdminForm(f => ({ ...f, displayName: e.target.value }))} placeholder="Nom affiché" style={inputStyle} />
              <input value={adminForm.handle} onChange={e => setAdminForm(f => ({ ...f, handle: e.target.value }))} placeholder="@pseudo Whatnot" style={inputStyle} />
              <input value={adminForm.showUrl} onChange={e => setAdminForm(f => ({ ...f, showUrl: e.target.value }))} placeholder="Lien du show Whatnot" style={inputStyle} />
              <input value={adminForm.previewUrl} onChange={e => setAdminForm(f => ({ ...f, previewUrl: e.target.value }))} placeholder="Miniature (optionnel)" style={inputStyle} />
            </div>
            <button disabled={busy} onClick={createAmbassador} style={{ ...darkButton, marginTop: 12 }}>AUTORISER CE PROFIL</button>
            {createdCode && <div style={{ marginTop: 12, background: '#f4f0ea', padding: 12, wordBreak: 'break-all', font: '.72rem monospace' }}><strong>Code d’activation :</strong> {createdCode} <button onClick={() => navigator.clipboard.writeText(createdCode)} style={{ border: 0, background: 'transparent', cursor: 'pointer' }} title="Copier"><Copy size={14} /></button></div>}
          </details>
        )}

        {message && <p style={{ margin: '1rem 0', color: message.includes('invalide') || message.includes('Impossible') ? '#b91c1c' : '#2e7d32', font: '.76rem Helvetica Neue, Arial' }}>{message}</p>}

        {lives.length ? <div className="live-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 16, marginTop: '2rem' }}>{lives.map(live => <LiveCard key={live.email} live={live} />)}</div> : <div style={{ textAlign: 'center', padding: '5rem 1rem', color: '#9e8e7e' }}><Radio size={42} style={{ margin: '0 auto 1rem' }} /><p style={{ font: '1rem Georgia, serif' }}>Aucun live en cours pour le moment.</p></div>}
      </div>
      <style>{`@media(max-width:1000px){.live-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}@media(max-width:600px){.live-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

const panelStyle: React.CSSProperties = { background: 'white', border: '1px solid #e8d5b7', padding: '1.4rem', marginBottom: '1rem' };
const headingStyle: React.CSSProperties = { font: '400 1.2rem Georgia, serif', marginBottom: '.4rem' };
const helpStyle: React.CSSProperties = { color: '#777', font: '.75rem Helvetica Neue, Arial', marginBottom: '1rem' };
const inputStyle: React.CSSProperties = { border: '1px solid #e8d5b7', padding: '11px 12px', font: '.8rem Helvetica Neue, Arial', width: '100%' };
const liveButton: React.CSSProperties = { border: 0, background: '#e11d48', color: 'white', padding: '11px 16px', display: 'inline-flex', gap: 8, alignItems: 'center', cursor: 'pointer', font: '700 .7rem Helvetica Neue, Arial', letterSpacing: '.08em' };
const darkButton: React.CSSProperties = { ...liveButton, background: '#1a1a1a' };
