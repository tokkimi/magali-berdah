import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Wallet, Settings, Star, Send, MessageCircle, Menu, X } from 'lucide-react';
import { useStore, useT } from '../../lib/store';

export default function ProLayout() {
  const t = useT();
  const { user, shop } = useStore();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const nav = [
    { to: '/boutique', label: t('dashboard'), icon: LayoutDashboard, exact: true },
    { to: '/boutique/commandes', label: 'Commandes', icon: ShoppingBag },
    { to: '/boutique/messages', label: 'Messages', icon: MessageCircle },
    { to: '/boutique/portefeuille', label: t('wallet'), icon: Wallet },
    { to: '/boutique/abonnement', label: t('subscription'), icon: Star },
    { to: '/boutique/profil', label: t('myStore'), icon: Settings },
  ];

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  if (!user || user.role !== 'pro') {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
        <p style={{ color: '#9e8e7e', marginBottom: '1rem' }}>Accès réservé aux boutiques professionnelles</p>
        <Link to="/" className="btn-gold">Retour à l'accueil</Link>
      </div>
    );
  }

  const NavContent = ({ onClose }: { onClose?: () => void }) => (
    <>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#c9a96e', marginBottom: '4px' }}>ESPACE BOUTIQUE</p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: 'white' }}>{shop?.shop_name || user.name}</p>
          {shop?.subscription_active ? (
            <span style={{ fontSize: '0.65rem', color: '#c9a96e', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>★ Premium</span>
          ) : (
            <span style={{ fontSize: '0.65rem', color: '#666', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>Gratuit</span>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
            <X size={20} />
          </button>
        )}
      </div>
      <nav style={{ padding: '0.75rem 0', flex: 1 }}>
        {nav.map(({ to, label, icon: Icon, exact }) => (
          <Link key={to} to={to} onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 1.5rem', textDecoration: 'none', color: isActive(to, exact) ? '#c9a96e' : '#888', borderLeft: isActive(to, exact) ? '2px solid #c9a96e' : '2px solid transparent', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', marginBottom: '2px' }}>
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #333' }}>
        <Link to="/soumettre" onClick={onClose} className="btn-gold" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', fontSize: '0.7rem' }}>
          <Send size={14} /> SOUMETTRE UN ARTICLE
        </Link>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        .pro-sidebar { display: flex; flex-direction: column; width: 240px; background: #1a1a1a; flex-shrink: 0; }
        .pro-mobile-topbar { display: none; }
        .pro-drawer-overlay { display: none; }
        @media (max-width: 767px) {
          .pro-sidebar { display: none !important; }
          .pro-mobile-topbar { display: flex !important; align-items: center; justify-content: space-between; background: #1a1a1a; padding: 0.75rem 1rem; position: sticky; top: 0; z-index: 50; }
          .pro-drawer-overlay { display: flex !important; position: fixed; inset: 0; z-index: 200; }
        }
      `}</style>

      {/* Mobile top bar */}
      <div className="pro-mobile-topbar">
        <div>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.55rem', letterSpacing: '0.15em', color: '#c9a96e' }}>ESPACE BOUTIQUE</p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: 'white' }}>{shop?.shop_name || user.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link to="/soumettre" className="btn-gold" style={{ fontSize: '0.6rem', padding: '6px 12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Send size={12} /> Soumettre
          </Link>
          <button onClick={() => setDrawerOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: '4px' }}>
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="pro-drawer-overlay">
          <div style={{ width: '280px', backgroundColor: '#1a1a1a', height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <NavContent onClose={() => setDrawerOpen(false)} />
          </div>
          <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setDrawerOpen(false)} />
        </div>
      )}

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 120px)' }}>
        {/* Desktop sidebar */}
        <aside className="pro-sidebar">
          <NavContent />
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: '1.5rem', backgroundColor: '#f8f4ef', overflowY: 'auto', minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
