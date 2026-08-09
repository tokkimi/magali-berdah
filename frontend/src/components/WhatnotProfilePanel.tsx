import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Radio, Square, UserCheck } from 'lucide-react';
import { useStore } from '../lib/store';
import { checkAmbassadorRequest, getOwnWhatnotProfile, getSavedRequestSecret, getSavedWhatnotToken, requestAmbassador, saveWhatnotToken, setWhatnotLive, type WhatnotLive } from '../lib/whatnot';

export default function WhatnotProfilePanel() {
  const { user } = useStore();
  const [profile, setProfile] = useState<WhatnotLive | null>(null);
  const [requestStatus, setRequestStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [activationCode, setActivationCode] = useState('');
  const [form, setForm] = useState({ handle: '', showUrl: '', previewUrl: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const token = getSavedWhatnotToken(user.email);
    setProfile(token ? await getOwnWhatnotProfile(user.email, token) : null);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      if (getSavedRequestSecret(user.email)) {
        const request = await checkAmbassadorRequest(user.email);
        setRequestStatus(request?.status || null);
      }
      await loadProfile();
    })();
  }, [user, loadProfile]);

  const submitRequest = async () => {
    if (!user || !form.handle.trim() || !form.showUrl.trim()) return;
    setBusy(true); setMessage('');
    try {
      await requestAmbassador({ email: user.email, displayName: user.name, ...form });
      setRequestStatus('pending'); setMessage('Votre demande a été envoyée à l’administration.');
    } catch (error: unknown) { setMessage(error instanceof Error ? error.message : 'Impossible d’envoyer la demande.'); }
    finally { setBusy(false); }
  };

  const connectWithCode = async () => {
    if (!user || !activationCode.trim()) return;
    setBusy(true); setMessage('');
    const connected = await getOwnWhatnotProfile(user.email, activationCode.trim());
    if (!connected) setMessage('Code invalide ou profil non autorisé.');
    else { saveWhatnotToken(user.email, activationCode); setProfile(connected); setActivationCode(''); setMessage('Compte Whatnot connecté.'); }
    setBusy(false);
  };

  const toggleLive = async (next: boolean) => {
    if (!user || !profile) return;
    setBusy(true); setMessage('');
    try {
      await setWhatnotLive(user.email, getSavedWhatnotToken(user.email), next);
      setProfile({ ...profile, is_live: next });
      if (next) window.open(profile.show_url, '_blank', 'noopener,noreferrer');
    } catch { setMessage('Impossible de modifier le live. Réessayez.'); }
    finally { setBusy(false); }
  };

  return (
    <section className="whatnot-panel">
      <style>{`.whatnot-panel{background:#fff;border:1px solid #e8d5b7;padding:24px;border-radius:14px}.whatnot-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.whatnot-input{width:100%;border:1px solid #e8d5b7;border-radius:10px;padding:13px;font:14px Helvetica Neue,Arial}.whatnot-live-button{width:100%;min-height:58px;border:0;border-radius:14px;background:#e11d48;color:#fff;display:flex;align-items:center;justify-content:center;gap:10px;font:700 14px Helvetica Neue,Arial;letter-spacing:.08em;cursor:pointer}@media(max-width:700px){.whatnot-panel{padding:18px}.whatnot-grid{grid-template-columns:1fr}.whatnot-live-button{position:sticky;bottom:88px;z-index:5}}`}</style>
      <p style={{ color: '#e11d48', font: '700 11px Helvetica Neue, Arial', letterSpacing: '.16em', marginBottom: 8 }}>MON COMPTE LIVE</p>
      {profile ? <>
        <h2 style={{ font: '400 24px Georgia, serif', marginBottom: 6 }}>@{profile.whatnot_handle}</h2>
        <p style={{ color: '#777', font: '14px Helvetica Neue, Arial', marginBottom: 18 }}>Votre profil est autorisé. Lancez Whatnot en un seul geste.</p>
        {profile.is_live
          ? <button disabled={busy} onClick={() => toggleLive(false)} className="whatnot-live-button" style={{ background: '#171717' }}><Square size={19} /> ARRÊTER LE LIVE</button>
          : <button disabled={busy} onClick={() => toggleLive(true)} className="whatnot-live-button"><Radio size={20} /> PASSER EN LIVE <ExternalLink size={17} /></button>}
      </> : requestStatus === 'pending' ? <div><h2 style={{ font: '400 22px Georgia, serif' }}>Demande en cours</h2><p style={{ color: '#8a6500', marginTop: 8 }}>L’administration doit encore valider votre profil ambassadeur.</p></div> : <>
        <h2 style={{ font: '400 22px Georgia, serif', marginBottom: 6 }}>{user?.role === 'admin' ? 'Connecter le compte Whatnot administrateur' : 'Demander le statut ambassadeur'}</h2>
        <p style={{ color: '#777', font: '13px Helvetica Neue, Arial', marginBottom: 16 }}>Après validation, le bouton « Passer en live » apparaîtra ici automatiquement.</p>
        <div className="whatnot-grid">
          <input className="whatnot-input" value={form.handle} onChange={e => setForm(v => ({ ...v, handle: e.target.value }))} placeholder="@pseudo Whatnot" />
          <input className="whatnot-input" value={form.showUrl} onChange={e => setForm(v => ({ ...v, showUrl: e.target.value }))} placeholder="Lien du profil ou show Whatnot" />
          <input className="whatnot-input" value={form.previewUrl} onChange={e => setForm(v => ({ ...v, previewUrl: e.target.value }))} placeholder="Miniature (facultatif)" />
          <input className="whatnot-input" value={form.message} onChange={e => setForm(v => ({ ...v, message: e.target.value }))} placeholder="Message pour l’admin (facultatif)" />
        </div>
        <button disabled={busy || !form.handle.trim() || !form.showUrl.trim()} onClick={submitRequest} className="whatnot-live-button" style={{ marginTop: 14 }}><UserCheck size={19} /> ENVOYER MA DEMANDE</button>
        <details style={{ marginTop: 18 }}><summary style={{ cursor: 'pointer', color: '#777', fontSize: 13 }}>J’ai déjà un code d’activation</summary><div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}><input className="whatnot-input" style={{ flex: 1 }} value={activationCode} onChange={e => setActivationCode(e.target.value)} placeholder="Code d’activation" /><button disabled={busy} onClick={connectWithCode} className="btn-gold">CONNECTER</button></div></details>
      </>}
      {message && <p style={{ marginTop: 14, color: message.includes('Impossible') || message.includes('invalide') ? '#b91c1c' : '#2e7d32', fontSize: 13 }}>{message}</p>}
    </section>
  );
}
