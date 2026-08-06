import { useState, useEffect } from 'react';
import { useT } from '../lib/store';

export default function CookieBanner() {
  const t = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('mb_cookies')) setVisible(true);
  }, []);

  const accept = () => { localStorage.setItem('mb_cookies', 'accepted'); setVisible(false); };
  const refuse = () => { localStorage.setItem('mb_cookies', 'refused'); setVisible(false); };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#1a1a1a',
      color: 'white', padding: '1rem 2rem', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      borderTop: '2px solid #c9a96e'
    }}>
      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#ccc', flex: 1, minWidth: '200px' }}>
        {t('cookieConsent')}{' '}
        <a href="/confidentialite" style={{ color: '#c9a96e' }}>En savoir plus</a>
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={refuse} className="btn-outline" style={{ padding: '6px 20px', borderColor: '#555', color: '#ccc' }}>
          {t('refuseCookies')}
        </button>
        <button onClick={accept} className="btn-gold" style={{ padding: '6px 20px' }}>
          {t('acceptCookies')}
        </button>
      </div>
    </div>
  );
}
