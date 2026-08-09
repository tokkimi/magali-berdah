import { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';

interface Props { mode: 'login' | 'register'; onClose: () => void; onSwitchMode: (m: 'login' | 'register') => void; }

export default function AuthModal({ mode, onClose, onSwitchMode }: Props) {
  const { login } = useStore();
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'register') {
        const { data, error: authError } = await supabase.auth.signUp({ email: form.email.trim(), password: form.password, options: { data: { name: form.name.trim() } } });
        if (authError) throw authError;
        if (!data.session) { setSuccess('Compte créé. Consultez votre e-mail pour confirmer votre inscription.'); return; }
        if (data.user) {
          login(data.session.access_token, { id: data.user.id, email: data.user.email || form.email, name: form.name.trim() || 'Utilisateur', role: 'buyer', verified: data.user.email_confirmed_at ? 1 : 0 });
          onClose();
        }
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password });
        if (authError || !data.session || !data.user) throw authError || new Error('Connexion impossible.');
        const role = data.user.app_metadata?.role === 'admin' ? 'admin' : 'buyer';
        login(data.session.access_token, { id: data.user.id, email: data.user.email || form.email, name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Utilisateur', role, verified: data.user.email_confirmed_at ? 1 : 0 });
        onClose();
      }
    } catch (caught: unknown) { setError(caught instanceof Error ? caught.message : 'Connexion impossible.'); }
    finally { setLoading(false); }
  };

  return <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background: 'white', width: 'calc(100% - 24px)', maxWidth: 440, padding: 'clamp(1.5rem,6vw,2.5rem)', position: 'relative', maxHeight: '90vh', overflowY: 'auto', borderRadius: 16 }}>
      <button aria-label="Fermer" onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 0, cursor: 'pointer' }}><X size={22} /></button>
      <h2 style={{ textAlign: 'center', font: '400 24px Georgia, serif', marginBottom: 24 }}>{mode === 'login' ? 'CONNEXION' : 'INSCRIPTION'}</h2>
      {error && <p style={{ background: '#fff0f0', color: '#b91c1c', padding: 12, marginBottom: 14 }}>{error}</p>}
      {success && <p style={{ background: '#eef9f0', color: '#26723a', padding: 12, marginBottom: 14 }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        {mode === 'register' && <label style={labelStyle}>Nom complet<input value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} required style={inputStyle} autoComplete="name" /></label>}
        <label style={labelStyle}>E-mail<input type="email" value={form.email} onChange={e => setForm(v => ({ ...v, email: e.target.value }))} required style={inputStyle} autoComplete="email" /></label>
        <label style={labelStyle}>Mot de passe<input type="password" value={form.password} onChange={e => setForm(v => ({ ...v, password: e.target.value }))} required minLength={10} style={inputStyle} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
        <button type="submit" disabled={loading} className="btn-gold" style={{ width: '100%', minHeight: 46 }}>{loading ? 'Chargement…' : mode === 'login' ? 'SE CONNECTER' : 'CRÉER MON COMPTE'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 20, color: '#777', fontSize: 13 }}>{mode === 'login' ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}<button onClick={() => onSwitchMode(mode === 'login' ? 'register' : 'login')} style={{ border: 0, background: 'none', color: '#b8935a', cursor: 'pointer' }}>{mode === 'login' ? 'S’inscrire' : 'Se connecter'}</button></p>
      {mode === 'register' && <p style={{ textAlign: 'center', color: '#777', fontSize: 11, marginTop: 14 }}>En créant un compte, vous acceptez les <a href="/cgv">CGV</a> et la <a href="/confidentialite">politique de confidentialité</a>.</p>}
    </div>
  </div>;
}

const labelStyle: React.CSSProperties = { display: 'block', color: '#666', font: '700 11px Helvetica Neue, Arial', letterSpacing: '.08em', marginBottom: 15 };
const inputStyle: React.CSSProperties = { display: 'block', width: '100%', marginTop: 7, padding: 12, border: '1px solid #e8d5b7', borderRadius: 9, fontSize: 15 };
