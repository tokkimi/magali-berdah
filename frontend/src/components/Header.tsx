import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Heart, X, Radio, Download, Smartphone } from 'lucide-react';
import { useStore, useT } from '../lib/store';
import { api } from '../lib/api';
import AuthModal from './AuthModal';
import { getSavedWhatnotToken } from '../lib/whatnot';

function getLiveCount(): number {
  try { return JSON.parse(localStorage.getItem('mb_lives') || '[]').filter((l: any) => l.is_live).length; } catch { return 0; }
}

const MENU_LINKS = [
  { label: 'LA GALERIE', to: '/catalogue' },
  { label: 'VENTE EXCLUSIVE', to: '/vente-exclusive', gold: true },
  { label: 'LIVE', to: '/lives', live: true },
  { label: 'SOUMETTRE UN ARTICLE', to: '/soumettre' },
  { label: 'COMMENT ACHETER', to: '/comment-acheter' },
  { label: 'FAQ', to: '/faq' },
];

export default function Header() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 20);
    update(); window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [location.pathname]);

  const t = useT();
  const { user, lang, setLang, logout } = useStore();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const iconColor = isHome ? '#fff' : '#1a1a1a';
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [galerieOpen, setGalerieOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [liveCount, setLiveCount] = useState(getLiveCount());
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setLiveCount(getLiveCount()), 5000);
    return () => clearInterval(iv);
  }, []);

  // Close menu on route change
  useEffect(() => { setMobileOpen(false); setShowSearch(false); }, [location.pathname]);

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  const handleInstall = async () => {
    if (isStandalone || installed) return;
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') setInstalled(true);
      setInstallPrompt(null);
    } else if (isIOS) {
      setShowIOSHint(h => !h);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/catalogue?search=${encodeURIComponent(search)}`); setShowSearch(false); }
  };

  const openLogin = () => { setAuthMode('login'); setShowAuth(true); };

  return (
    <>
      <style>{`
        .ysl-header {
          position: fixed; top: 0; left: 0; right: 0; z-index: 500;
          background: transparent;
          border-bottom: none;
        }
        .ysl-header-inner {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          height: 44px;
          padding: 0 14px;
        }
        .ysl-left { display: flex; align-items: center; gap: 20px; }
        .ysl-center { display: flex; justify-content: center; }
        .ysl-right { display: flex; align-items: center; justify-content: flex-end; gap: 16px; }
        .ysl-icon-btn {
          background: none; border: none; cursor: pointer; padding: 6px;
          display: flex; align-items: center; justify-content: center;
          line-height: 1;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }
        .ysl-menu-overlay {
          position: fixed; inset: 0; z-index: 600;
          background: #f5f5f5;
          display: flex; flex-direction: column;
          overflow-y: auto;
        }
        .ysl-menu-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px; height: 60px; flex-shrink: 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .ysl-menu-nav {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 6px; padding: 2rem 1rem;
        }
        .ysl-menu-link {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: clamp(0.85rem, 3.5vw, 1.4rem);
          font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
          color: #1a1a1a; text-decoration: none;
          padding: 5px 0;
          transition: opacity 0.15s;
        }
        .ysl-menu-link:hover { opacity: 0.45; }
        .ysl-menu-link.gold { color: #c9a96e; }
        .ysl-menu-link.live-link { color: #e53935; }
        .ysl-menu-footer {
          padding: 1.5rem 2rem 2.5rem;
          border-top: 1px solid #ddd;
          display: flex; flex-wrap: wrap; gap: 10px 20px; justify-content: center;
        }
        .ysl-menu-footer a, .ysl-menu-footer button {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 0.65rem; letter-spacing: 0.14em; text-transform: uppercase;
          color: #555; text-decoration: none; background: none; border: none; cursor: pointer; font-weight: 400;
        }
        .ysl-search-bar {
          position: fixed; top: 60px; left: 0; right: 0; z-index: 490;
          background: #fff; border-bottom: 1px solid #e0e0e0;
          padding: 12px 20px;
          display: flex; gap: 10px; align-items: center;
        }
        .ysl-search-input {
          flex: 1; border: none; outline: none;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 0.9rem; color: #1a1a1a;
          background: transparent;
        }
        .ysl-search-bar { top: 52px; }
      `}</style>

      <header className="ysl-header">
        <div className="ysl-header-inner">
          {/* Left: hamburger */}
          <div className="ysl-left">
            <button className="ysl-icon-btn" aria-label="Menu" style={{ color: iconColor }} onClick={() => setMobileOpen(true)}>
              <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
                <line x1="0" y1="1" x2="22" y2="1" stroke={iconColor} strokeWidth="1.5"/>
                <line x1="0" y1="7" x2="22" y2="7" stroke={iconColor} strokeWidth="1.5"/>
                <line x1="0" y1="13" x2="22" y2="13" stroke={iconColor} strokeWidth="1.5"/>
              </svg>
            </button>
          </div>

          {/* Center: logo */}
          <div className="ysl-center">
            <Link to="/" style={{ textDecoration: 'none' }}>
              <img src="/mb-logo.png" alt="Magali Berdah" height="34" width="34" style={{ objectFit: 'contain', display: 'block' }} />
            </Link>
          </div>

          {/* Right: search + heart + user */}
          <div className="ysl-right">
            <button className="ysl-icon-btn" aria-label="Rechercher" style={{ color: iconColor }} onClick={() => setShowSearch(s => !s)}>
              {showSearch ? <X size={20} /> : <Search size={20} />}
            </button>
            {user ? (
              <>
                <Link to="/favoris" className="ysl-icon-btn" aria-label="Favoris" style={{ color: iconColor }}><Heart size={20} /></Link>
                <button className="ysl-icon-btn" aria-label="Mon profil" style={{ color: iconColor }} onClick={() => navigate('/profil')}>
                  {user.avatar ? <img src={user.avatar} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} /> : <User size={20} />}
                </button>
              </>
            ) : (
              <button className="ysl-icon-btn" aria-label="Connexion" style={{ color: iconColor }} onClick={openLogin}><User size={20} /></button>
            )}
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <form className="ysl-search-bar" onSubmit={handleSearch}>
            <Search size={16} color="#999" />
            <input autoFocus className="ysl-search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un article, une marque…" />
            {search && <button type="button" className="ysl-icon-btn" onClick={() => setSearch('')}><X size={16} /></button>}
          </form>
        )}
      </header>

      {/* Full-screen menu overlay */}
      {mobileOpen && (
        <div className="ysl-menu-overlay">
          <div className="ysl-menu-header">
            <button className="ysl-icon-btn" aria-label="Fermer" onClick={() => setMobileOpen(false)}>
              <X size={22} />
            </button>
            <Link to="/" style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
              <img src="/mb-logo.png" alt="Magali Berdah" height="42" width="42" style={{ objectFit: 'contain' }} />
            </Link>
            <button className="ysl-icon-btn" onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', letterSpacing: '0.1em', color: '#666' }}>
              {lang === 'fr' ? 'EN' : 'FR'}
            </button>
          </div>

          <nav className="ysl-menu-nav">
            {MENU_LINKS.map(item => item.label === 'LA GALERIE' ? (
              <div key={item.to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button
                  className="ysl-menu-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => setGalerieOpen(o => !o)}>
                  LA GALERIE
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transition: 'transform 0.2s', transform: galerieOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <path d="M1 1l4 4 4-4" stroke="#1a1a1a" strokeWidth="1.2"/>
                  </svg>
                </button>
                {galerieOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', marginTop: '4px' }}>
                    <Link to="/catalogue" className="ysl-menu-link" style={{ fontSize: '0.72rem', fontWeight: 400, letterSpacing: '0.12em', color: '#666' }} onClick={() => setMobileOpen(false)}>TOUT</Link>
                    <Link to="/catalogue?type=auction" className="ysl-menu-link" style={{ fontSize: '0.72rem', fontWeight: 400, letterSpacing: '0.12em', color: '#666' }} onClick={() => setMobileOpen(false)}>ENCHÈRES</Link>
                    <Link to="/catalogue?type=fixed" className="ysl-menu-link" style={{ fontSize: '0.72rem', fontWeight: 400, letterSpacing: '0.12em', color: '#666' }} onClick={() => setMobileOpen(false)}>VENTE</Link>
                  </div>
                )}
              </div>
            ) : (
              <Link key={item.to} to={item.to}
                className={`ysl-menu-link${item.gold ? ' gold' : ''}${item.live ? ' live-link' : ''}`}
                onClick={() => setMobileOpen(false)}>
                {item.live && liveCount > 0 ? `● ${item.label} (${liveCount})` : item.label}
              </Link>
            ))}
          </nav>

          <div className="ysl-menu-footer">
            {!user ? (
              <>
                <button onClick={() => { openLogin(); setMobileOpen(false); }}>CONNEXION</button>
                <span style={{ color: '#ccc' }}>|</span>
                <button onClick={() => { setAuthMode('register'); setShowAuth(true); setMobileOpen(false); }}>CRÉER UN COMPTE</button>
              </>
            ) : (
              <>
                <Link to="/profil" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', letterSpacing: '0.1em', color: '#666', textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>MON PROFIL</Link>
                <span style={{ color: '#ccc' }}>|</span>
                <Link to="/mes-achats" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', letterSpacing: '0.1em', color: '#666', textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>MES ACHATS</Link>
                <span style={{ color: '#ccc' }}>|</span>
                <button onClick={() => { logout(); setMobileOpen(false); navigate('/'); }} style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', letterSpacing: '0.1em', color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}>DÉCONNEXION</button>
              </>
            )}
            {!isStandalone && !installed && (
              <button onClick={handleInstall}
                style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', letterSpacing: '0.1em', color: '#666', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Smartphone size={13} /> INSTALLER L'APP
              </button>
            )}
            {showIOSHint && (
              <div style={{ width: '100%', backgroundColor: '#fff', border: '1px solid #e0e0e0', padding: '14px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#444', lineHeight: 1.7, marginTop: '6px' }}>
                Appuyez sur <strong>Partager</strong> puis <strong>Sur l'écran d'accueil</strong> dans Safari.
              </div>
            )}
          </div>
        </div>
      )}

      {showAuth && <AuthModal mode={authMode} onClose={() => setShowAuth(false)} onSwitchMode={m => setAuthMode(m)} />}
    </>
  );
}
