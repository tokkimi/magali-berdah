import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Heart, Bell, ChevronDown, Menu, X, ShoppingBag } from 'lucide-react';
import { useStore, useT } from '../lib/store';
import { api } from '../lib/api';
import AuthModal from './AuthModal';

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
  const { user, shop, lang, setLang, logout } = useStore();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [search, setSearch] = useState('');
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

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
          <span>LIVRAISON OFFERTE POUR TOUT ACHAT / FREE SHIPPING ON ALL ORDERS</span>
          <div className="flex items-center gap-4">
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
                  <button onClick={() => { setShowNotifs(!showNotifs); markNotisRead(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a', position: 'relative' }}>
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

                <Link to="/favoris" style={{ color: '#1a1a1a' }}><Heart size={20} /></Link>

                {/* User menu */}
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowUserMenu(!showUserMenu)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {user.avatar ? <img src={user.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} /> : <User size={20} />}
                    <ChevronDown size={12} />
                  </button>
                  {showUserMenu && (
                    <div style={{ position: 'absolute', right: 0, top: '100%', backgroundColor: 'white', border: '1px solid #e8d5b7', minWidth: '180px', zIndex: 100, marginTop: '8px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
                      {[
                        { label: t('profile'), to: '/profil' },
                        { label: t('myOrders'), to: '/mes-achats' },
                        { label: t('myBids'), to: '/mes-encheres' },
                        ...(user.role === 'pro' ? [{ label: t('proAccount'), to: '/boutique' }] : []),
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

            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
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
          </div>
        )}
      </header>

      {showAuth && <AuthModal mode={authMode} onClose={() => setShowAuth(false)} onSwitchMode={m => setAuthMode(m)} />}
    </>
  );
}
