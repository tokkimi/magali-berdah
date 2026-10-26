import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useT } from '../lib/store';
import { api } from '../lib/api';

const SECTIONS = [
  {
    label: 'ACHETER',
    links: [
      { label: 'Ventes', to: '/catalogue?type=fixed' },
      { label: 'Enchères', to: '/catalogue?type=auction' },
      { label: 'Nouvelles pièces', to: '/catalogue' },
    ],
  },
  {
    label: 'VENDRE',
    links: [
      { label: 'Soumettre un article', to: '/soumettre' },
      { label: 'Comment ça marche', to: '/pro' },
    ],
  },
  {
    label: 'INFORMATIONS',
    links: [
      { label: 'CGV', to: '/cgv' },
      { label: 'Politique de confidentialité', to: '/confidentialite' },
      { label: 'Contact', to: '/contact' },
      { label: 'À propos', to: '/a-propos' },
    ],
  },
];

function AccordionSection({ label, links }: { label: string; links: { label: string; to: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer', color: '#c9a96e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em' }}>
        {label}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
          <path d="M1 1l4 4 4-4" stroke="#c9a96e" strokeWidth="1.2"/>
        </svg>
      </button>
      {open && (
        <div style={{ paddingBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#888', textDecoration: 'none', letterSpacing: '0.04em' }}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

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
      <div style={{ borderBottom: '1px solid #2a2a2a', padding: '2rem 1.25rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', marginBottom: '0.4rem' }}>
          NEWSLETTER
        </p>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#666', marginBottom: '1.25rem' }}>
          {t('subscribeNewsletter')}
        </p>
        {subscribed ? (
          <p style={{ color: '#c9a96e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem' }}>✓ {t('subscribeThanks')}</p>
        ) : (
          <form onSubmit={handleNewsletter} style={{ display: 'flex', maxWidth: '360px', margin: '0 auto' }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder={t('emailPlaceholder')}
              style={{ flex: 1, padding: '10px 14px', border: '1px solid #333', backgroundColor: '#222', color: 'white', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem' }} />
            <button type="submit" className="btn-gold" style={{ flexShrink: 0, fontSize: '0.6rem', letterSpacing: '0.12em', padding: '0 16px' }}>S'ABONNER</button>
          </form>
        )}
      </div>

      {/* Brand + socials */}
      <div style={{ padding: '1.5rem 1.25rem 0.5rem' }}>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.3em', color: '#c9a96e', marginBottom: '0.5rem' }}>VENDYY'S</p>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#555', lineHeight: 1.7, marginBottom: '0.75rem' }}>
          {t('footerDesc')}
        </p>
        <div style={{ display: 'flex', gap: '14px' }}>
          <a href="#" style={{ color: '#c9a96e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.68rem' }}>Instagram</a>
          <a href="#" style={{ color: '#c9a96e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.68rem' }}>Facebook</a>
        </div>
      </div>

      {/* Accordion sections */}
      <div style={{ padding: '0.5rem 1.25rem', display: 'flex', gap: '0', borderTop: '1px solid #2a2a2a', borderBottom: '1px solid #2a2a2a' }}>
        {SECTIONS.map((s, i) => (
          <div key={s.label} style={{ flex: 1, borderLeft: i > 0 ? '1px solid #2a2a2a' : 'none', paddingLeft: i > 0 ? '12px' : '0' }}>
            <AccordionSection label={s.label} links={s.links} />
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #2a2a2a', padding: '1.25rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', color: '#444', letterSpacing: '0.1em' }}>
          © 2024 VENDYY'S — TOUS DROITS RÉSERVÉS
        </p>
      </div>
    </footer>
  );
}
