import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useT } from '../lib/store';
import { api } from '../lib/api';
// social icons inline

export default function Footer() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/newsletter/subscribe', { email });
      setSubscribed(true);
    } catch {}
  };

  return (
    <footer style={{ backgroundColor: '#1a1a1a', color: '#f8f4ef', marginTop: 0 }}>
      {/* Newsletter */}
      <div style={{ borderBottom: '1px solid #333', padding: '3rem 2rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          {t('newsletter').toUpperCase()}
        </p>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#9e8e7e', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>
          {t('subscribeNewsletter')}
        </p>
        {subscribed ? (
          <p style={{ color: '#c9a96e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem' }}>
            ✓ {t('subscribeThanks')}
          </p>
        ) : (
          <form onSubmit={handleNewsletter} style={{ display: 'flex', justifyContent: 'center', gap: '0', maxWidth: '400px', margin: '0 auto' }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder={t('emailPlaceholder')}
              style={{ flex: 1, padding: '10px 16px', border: '1px solid #444', backgroundColor: '#222', color: 'white', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem' }} />
            <button type="submit" className="btn-gold" style={{ flexShrink: 0 }}>{t('subscribe').toUpperCase()}</button>
          </form>
        )}
      </div>

      {/* Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', padding: '3rem 4rem' }}>
        <div>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', letterSpacing: '0.3em', marginBottom: '1rem', color: '#c9a96e' }}>MAGALI BERDAH</p>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#666', lineHeight: '1.8' }}>
            {t('footerDesc')}
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
            <a href="#" style={{ color: '#c9a96e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem' }}>Instagram</a>
            <a href="#" style={{ color: '#c9a96e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem' }}>Facebook</a>
          </div>
        </div>

        <div>
          <p style={footLabelStyle}>{t('footerBuy')}</p>
          {[
            { label: t('footerSales'), to: '/catalogue?type=fixed' },
            { label: t('footerAuctions'), to: '/catalogue?type=auction' },
            { label: t('footerNew'), to: '/catalogue' },
          ].map(l => (
            <Link key={l.to} to={l.to} style={footLinkStyle}>{l.label}</Link>
          ))}
        </div>

        <div>
          <p style={footLabelStyle}>VENDRE</p>
          {[
            { label: 'Soumettre un article', to: '/soumettre' },
            { label: 'Comment ça marche', to: '/pro' },
          ].map(l => (
            <Link key={l.to} to={l.to} style={footLinkStyle}>{l.label}</Link>
          ))}
        </div>

        <div>
          <p style={footLabelStyle}>{t('footerInfo')}</p>
          {[
            { label: t('cgv'), to: '/cgv' },
            { label: t('privacy'), to: '/confidentialite' },
            { label: t('contact'), to: '/contact' },
            { label: t('aboutUs'), to: '/a-propos' },
          ].map(l => (
            <Link key={l.to} to={l.to} style={footLinkStyle}>{l.label}</Link>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #333', padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#555', letterSpacing: '0.1em' }}>
          © 2024 MAGALI BERDAH — SOCIÉTÉ FRANÇAISE · TOUS DROITS RÉSERVÉS
        </p>
      </div>
    </footer>
  );
}

const footLabelStyle: React.CSSProperties = {
  fontFamily: 'Helvetica Neue, Arial, sans-serif',
  fontSize: '0.65rem',
  letterSpacing: '0.2em',
  color: '#c9a96e',
  marginBottom: '0.75rem',
};

const footLinkStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Helvetica Neue, Arial, sans-serif',
  fontSize: '0.75rem',
  color: '#888',
  textDecoration: 'none',
  marginBottom: '6px',
  letterSpacing: '0.05em',
};
