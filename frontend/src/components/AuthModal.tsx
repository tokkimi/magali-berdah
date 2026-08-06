import { useState } from 'react';
import { X } from 'lucide-react';
import { useStore, useT } from '../lib/store';
import { api } from '../lib/api';

// Fallback local pour les comptes de démonstration quand le backend est indisponible
const DEMO_ACCOUNTS: Record<string, { user: any; shop?: any }> = {
  'admin@magaliberdah.com': {
    user: { id: 'static-admin', email: 'admin@magaliberdah.com', name: 'Magali Berdah', role: 'admin', avatar: null, verified: 1 },
  },
  'acheteur@test.com': {
    user: { id: 'static-buyer', email: 'acheteur@test.com', name: 'Sophie Martin', role: 'buyer', avatar: null, verified: 1 },
  },
  'boutique@test.com': {
    user: { id: 'static-pro', email: 'boutique@test.com', name: 'Élise Dupont', role: 'pro', avatar: null, verified: 1 },
    shop: { id: 'static-shop', shop_name: 'La Boutique Élise', subscription_active: 1, commission_rate: 5, wallet_balance: 0, total_sales: 0 },
  },
};
const DEMO_PASSWORDS: Record<string, string> = {
  'admin@magaliberdah.com': 'Admin2024!',
  'acheteur@test.com': 'Buyer2024!',
  'boutique@test.com': 'Shop2024!',
};
function makeDemoToken(user: any) {
  // Token factice lisible par le store — le backend le validera quand il sera dispo
  const payload = btoa(JSON.stringify({ id: user.id, role: user.role, email: user.email, demo: true }));
  return `demo.${payload}.sig`;
}

interface Props {
  mode: 'login' | 'register';
  onClose: () => void;
  onSwitchMode: (m: 'login' | 'register') => void;
}

export default function AuthModal({ mode, onClose, onSwitchMode }: Props) {
  const t = useT();
  const { login } = useStore();
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'buyer', siret: '', shopName: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const data = await api.post(endpoint, form);
      login(data.token, data.user, data.shop);
      onClose();
    } catch (e: any) {
      // Si le backend est indisponible, essayer le fallback demo pour la connexion
      if (mode === 'login') {
        const demo = DEMO_ACCOUNTS[form.email];
        const expectedPwd = DEMO_PASSWORDS[form.email];
        if (demo && expectedPwd && form.password === expectedPwd) {
          login(makeDemoToken(demo.user), demo.user, demo.shop);
          onClose();
          return;
        }
      }
      setError(e.message || 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '440px', padding: '2.5rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9e8e7e' }}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', letterSpacing: '0.1em', color: '#1a1a1a', fontWeight: 400 }}>
            {mode === 'login' ? 'CONNEXION' : 'INSCRIPTION'}
          </h2>
          <div style={{ width: '40px', height: '1px', backgroundColor: '#c9a96e', margin: '0.75rem auto 0' }} />
        </div>

        {error && <div style={{ backgroundColor: '#fff0f0', border: '1px solid #ffcccc', color: '#cc0000', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Nom complet</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} required style={inputStyle} placeholder="Sophie Martin" />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Type de compte</label>
                <select value={form.role} onChange={e => set('role', e.target.value)} style={inputStyle}>
                  <option value="buyer">Acheteur particulier</option>
                  <option value="pro">Boutique professionnelle</option>
                </select>
              </div>
              {form.role === 'pro' && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Nom de la boutique</label>
                    <input value={form.shopName} onChange={e => set('shopName', e.target.value)} required style={inputStyle} placeholder="Ma Boutique Luxe" />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Numéro SIRET</label>
                    <input value={form.siret} onChange={e => set('siret', e.target.value)} style={inputStyle} placeholder="12345678901234" />
                  </div>
                </>
              )}
            </>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required style={inputStyle} placeholder="email@exemple.com" />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Mot de passe</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)} required style={inputStyle} placeholder="••••••••" minLength={6} />
          </div>

          <button type="submit" disabled={loading} className="btn-gold" style={{ width: '100%' }}>
            {loading ? 'Chargement...' : mode === 'login' ? 'SE CONNECTER' : "S'INSCRIRE"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#9e8e7e' }}>
            {mode === 'login' ? "Pas encore de compte ? " : "Déjà un compte ? "}
            <button onClick={() => onSwitchMode(mode === 'login' ? 'register' : 'login')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c9a96e', fontSize: '0.8rem', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
              {mode === 'login' ? "S'inscrire" : 'Se connecter'}
            </button>
          </p>
        </div>

        {mode === 'register' && (
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e', textAlign: 'center', marginTop: '1rem', lineHeight: '1.5' }}>
            En vous inscrivant, vous acceptez nos <a href="/cgv" style={{ color: '#c9a96e' }}>CGV</a> et notre <a href="/confidentialite" style={{ color: '#c9a96e' }}>politique de confidentialité</a>.
          </p>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Helvetica Neue, Arial, sans-serif',
  fontSize: '0.7rem',
  letterSpacing: '0.1em',
  color: '#9e8e7e',
  marginBottom: '6px',
  textTransform: 'uppercase',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #e8d5b7',
  fontFamily: 'Helvetica Neue, Arial, sans-serif',
  fontSize: '0.85rem',
  color: '#1a1a1a',
  backgroundColor: 'white',
};
