import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Heart, Bell, ChevronDown, Menu, X, Radio, Download, Smartphone } from 'lucide-react';
import { useStore, useT } from '../lib/store';
import { api } from '../lib/api';
import AuthModal from './AuthModal';
import { getSavedWhatnotToken } from '../lib/whatnot';

function getLiveCount(): number {
  try { return JSON.parse(localStorage.getItem('mb_lives') || '[]').filter((l: any) => l.is_live).length; } catch { return 0; }
}

const NAV_ITEMS = [
  {
    key: 'sales', slug: 'ventes',
    subs: [
      { key: 'women', id: 'women' }, { key: 'men', id: 'men' },
      { key: 'bags', id: 'bags' }, { key: 'accessories', id: 'accessories' },
    ]
  },
  {
    key: 'auctions', slug: 'encheres',
    subs: [
      { key: 'women', id: 'women' }, { key: 'men', id: 'men' },
      { key: 'bags', id: 'bags' }, { key: 'accessories', id: 'accessories' },
    ]
  },
];

export default function Header() {
  const t = useT();
  const { user, lang, setLang, logout } = useStore();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [search, setSearch] = useState('');
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [liveCount, setLiveCount] = useState(getLiveCount());
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showIOSHint, setShowIOSHint] = useState(() => /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream);
  const [installed, setInstalled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

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

  useEffect(() => {
    const iv = setInterval(() => setLiveCount(getLiveCount()), 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (user) {
      api.get('/notifications').then(d => setNotifications(d.notifications || [])).catch(() => {});
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/catalogue?search=${encodeURIComponent(search)}`);
  };

  const openLogin = () => { setAuthMode('login'); setShowAuth(true); };
  const openRegister = () => { setAuthMode('register'); setShowAuth(true); };

  const markNotisRead = () => {
    api.put('/notifications/read').then(() => setNotifications(n => n.map(x => ({ ...x, read: 1 })))).catch(() => {});
  };

  return (
    <>
      <header style={{ borderBottom: '1px solid #e8d5b7', backgroundColor: 'white' }} className="sticky top-0 z-50">
        {/* Top bar */}
        <div style={{ backgroundColor: '#1a1a1a', color: '#c9a96e', fontSize: '0.7rem', letterSpacing: '0.15em', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
          className="flex items-center justify-between px-6 py-1.5">
          <span>{lang === 'fr' ? 'LIVRAISON OFFERTE POUR TOUT ACHAT' : 'FREE SHIPPING ON ALL ORDERS'}</span>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              style={{ color: '#c9a96e', background: 'transparent', border: '1px solid #c9a96e', padding: '2px 10px', cursor: 'pointer', fontSize: '0.65rem', letterSpacing: '0.1em' }}>
              {lang === 'fr' ? 'EN' : 'FR'}
            </button>
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', marginLeft: '0.5rem' }}>
            <div style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a' }}>
              <div style={{ fontSize: '1.5rem', letterSpacing: '0.3em', fontWeight: 400 }}>MAGALI</div>
              <div style={{ fontSize: '0.7rem', letterSpacing: '0.4em', color: '#c9a96e', marginTop: '-4px' }}>BERDAH</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8" ref={navRef}>
            <Link to="/lives" style={{ textDecoration: 'none', color: liveCount > 0 ? '#e53935' : '#1a1a1a', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: liveCount > 0 ? 700 : 400 }}>
              {liveCount > 0 && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#e53935', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />}
              <Radio size={13} />
              LIVE
              {liveCount > 0 && <span style={{ backgroundColor: '#e53935', color: 'white', fontSize: '0.55rem', padding: '1px 5px', borderRadius: '10px' }}>{liveCount}</span>}
            </Link>
            <Link to="/vente-exclusive" style={{ textDecoration: 'none', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', letterSpacing: '0.15em', color: '#c9a96e', fontWeight: 600 }}>
              ✦ EXCLU
            </Link>
            {NAV_ITEMS.map(item => (
              <div key={item.key}
                onMouseEnter={() => setActiveNav(item.key)}
                onMouseLeave={() => setActiveNav(null)}
                style={{ position: 'relative' }}>
                <Link to={`/catalogue?type=${item.key === 'auctions' ? 'auction' : 'fixed'}`}
                  style={{ textDecoration: 'none', color: '#1a1a1a', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {t(item.key as any).toUpperCase()}
                  <ChevronDown size={12} />
                </Link>
                {activeNav === item.key && (
                  <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1rem', minWidth: '160px', zIndex: 100, marginTop: '8px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
                    {item.subs.map(sub => (
                      <Link key={sub.id} to={`/catalogue?type=${item.key === 'auctions' ? 'auction' : 'fixed'}&category=${sub.id}`}
                        style={{ display: 'block', padding: '6px 0', textDecoration: 'none', color: '#1a1a1a', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', letterSpacing: '0.1em' }}
                        className="luxury-link">
                        {t(sub.key as any)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden md:flex items-center" style={{ border: '1px solid #e8d5b7', padding: '6px 12px', gap: '8px' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search')}
                style={{ border: 'none', outline: 'none', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', width: '180px', color: '#1a1a1a' }} />
              <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9e8e7e' }}>
                <Search size={16} />
              </button>
            </form>

            {user ? (
              <>
                {/* Notifications */}
                <div style={{ position: 'relative' }}>
                  <button className="header-icon-button" aria-label="Notifications" onClick={() => { setShowNotifs(!showNotifs); markNotisRead(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a', position: 'relative' }}>
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                  </button>
                  {showNotifs && (
                    <div style={{ position: 'absolute', right: 0, top: '100%', width: '300px', backgroundColor: 'white', border: '1px solid #e8d5b7', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', zIndex: 100, marginTop: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <p style={{ padding: '1rem', color: '#9e8e7e', fontSize: '0.8rem', textAlign: 'center' }}>Aucune notification</p>
                      ) : notifications.map(n => (
                        <div key={n.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f0ece6', backgroundColor: n.read ? 'white' : '#fdf9f4' }}>
                          <p style={{ fontSize: '0.8rem', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontWeight: 600, color: '#1a1a1a', marginBottom: '2px' }}>{n.title}</p>
                          <p style={{ fontSize: '0.75rem', color: '#9e8e7e' }}>{n.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Link to="/favoris" className="header-icon-button" aria-label="Favoris" style={{ color: '#1a1a1a' }}><Heart size={20} /></Link>

                {/* User menu */}
                <div style={{ position: 'relative' }}>
                  <button className="header-icon-button" aria-label="Mon profil" onClick={() => setShowUserMenu(!showUserMenu)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {user.avatar ? <img src={user.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} /> : <User size={20} />}
                    <ChevronDown size={12} />
                  </button>
                  {showUserMenu && (
                    <div style={{ position: 'absolute', right: 0, top: '100%', backgroundColor: 'white', border: '1px solid #e8d5b7', minWidth: '180px', zIndex: 100, marginTop: '8px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
                      {[
                        { label: t('profile'), to: '/profil' },
                        ...(user.role === 'admin' || getSavedWhatnotToken(user.email) ? [{ label: 'Passer en live', to: '/profil?onglet=live' }] : []),
                        { label: t('myOrders'), to: '/mes-achats' },
                        { label: t('myBids'), to: '/mes-encheres' },
                        ...(user.role === 'admin' ? [{ label: t('adminPanel'), to: '/admin' }] : []),
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setShowUserMenu(false)}
                          style={{ display: 'block', padding: '10px 16px', textDecoration: 'none', color: '#1a1a1a', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', borderBottom: '1px solid #f0ece6' }}
                          className="luxury-link">
                          {item.label}
                        </Link>
                      ))}
                      <button onClick={() => { logout(); setShowUserMenu(false); navigate('/'); }}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#c9a96e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem' }}>
                        {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <button onClick={openLogin}
                  style={{ background: 'none', border: '1px solid #e8d5b7', padding: '7px 16px', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', letterSpacing: '0.1em', color: '#1a1a1a' }}>
                  {t('login').toUpperCase()}
                </button>
                <button onClick={openRegister} className="btn-gold"
                  style={{ padding: '7px 16px', fontSize: '0.72rem' }}>
                  {t('register').toUpperCase()}
                </button>
              </div>
            )}

            <button className="header-icon-button md:hidden" aria-label="Menu" onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ backgroundColor: 'white', borderTop: '1px solid #e8d5b7', padding: '1rem' }}>
            <form onSubmit={handleSearch} className="flex items-center mb-4" style={{ border: '1px solid #e8d5b7', padding: '8px 12px', gap: '8px' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search')}
                style={{ border: 'none', outline: 'none', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', flex: 1 }} />
              <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Search size={16} /></button>
            </form>
            <Link to="/lives" onClick={() => setMobileOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 0', textDecoration: 'none', color: liveCount > 0 ? '#e53935' : '#1a1a1a', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', letterSpacing: '0.1em', borderBottom: '1px solid #f0ece6', fontWeight: liveCount > 0 ? 700 : 400 }}>
              <Radio size={15} /> LIVE {liveCount > 0 && `(${liveCount})`}
            </Link>
            <Link to="/vente-exclusive" onClick={() => setMobileOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 0', textDecoration: 'none', color: '#c9a96e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', letterSpacing: '0.1em', borderBottom: '1px solid #f0ece6', fontWeight: 600 }}>
              ✦ VENTE EXCLUSIVE
            </Link>
            {NAV_ITEMS.map(item => (
              <Link key={item.key} to={`/catalogue?type=${item.key === 'auctions' ? 'auction' : 'fixed'}`}
                onClick={() => setMobileOpen(false)}
                style={{ display: 'block', padding: '10px 0', textDecoration: 'none', color: '#1a1a1a', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', letterSpacing: '0.1em', borderBottom: '1px solid #f0ece6' }}>
                {t(item.key as any).toUpperCase()}
              </Link>
            ))}
            {/* Auth buttons in mobile menu */}
            {!user && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '1rem' }}>
                <button onClick={() => { openLogin(); setMobileOpen(false); }} className="btn-outline" style={{ width: '100%', padding: '10px' }}>{t('login')}</button>
                <button onClick={() => { openRegister(); setMobileOpen(false); }} className="btn-gold" style={{ width: '100%', padding: '10px' }}>{t('register')}</button>
              </div>
            )}

            {/* Langue + Install */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f0ece6', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: '1px solid #e8d5b7', padding: '10px 14px', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#1a1a1a' }}>
                <span>{lang === 'fr' ? 'Version anglaise' : 'Version française'}</span>
                <span style={{ color: '#c9a96e', fontWeight: 600, letterSpacing: '0.1em' }}>{lang === 'fr' ? 'EN →' : 'FR →'}</span>
              </button>

              {!isStandalone && !installed && (
                <div>
                  <button onClick={handleInstall}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', backgroundColor: '#1a1a1a', border: 'none', padding: '11px 14px', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#c9a96e', letterSpacing: '0.05em' }}>
                    <Smartphone size={16} color="#c9a96e" />
                    Installer l'application
                    <Download size={14} color="#c9a96e" style={{ marginLeft: 'auto' }} />
                  </button>
                  {showIOSHint && (
                    <div style={{ backgroundColor: '#f8f4ef', border: '1px solid #e8d5b7', borderRadius: '8px', padding: '14px', marginTop: '6px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#444', lineHeight: 1.7 }}>
                      <div style={{ fontWeight: 600, marginBottom: '10px', color: '#1a1a1a' }}>2 étapes pour installer l'app :</div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ background: '#c9a96e', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '11px', fontWeight: 700 }}>1</span>
                        <span>Appuyez sur <svg style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> <strong style={{ color: '#007AFF' }}>Partager</strong> en bas de Safari</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ background: '#c9a96e', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '11px', fontWeight: 700 }}>2</span>
                        <span>Choisissez <strong>Sur l'écran d'accueil</strong> <svg style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {(isStandalone || installed) && (
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#2e7d32', textAlign: 'center', padding: '8px 0' }}>✓ Application installée</p>
              )}
            </div>
          </div>
        )}
      </header>

      {showAuth && <AuthModal mode={authMode} onClose={() => setShowAuth(false)} onSwitchMode={m => setAuthMode(m)} />}
    </>
  );
}
