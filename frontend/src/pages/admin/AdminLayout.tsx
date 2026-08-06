import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ShoppingBag, Store, Mail, BarChart2, Search, Inbox } from 'lucide-react';
import { useStore } from '../../lib/store';

function getPendingCount() {
  try {
    const subs = JSON.parse(localStorage.getItem('mb_submissions') || '[]');
    return subs.filter((s: any) => s.status === 'pending').length;
  } catch { return 0; }
}

export default function AdminLayout() {
  const { user } = useStore();
  const location = useLocation();
  const pendingCount = getPendingCount();

  const nav = [
    { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
    { to: '/admin/demandes', label: 'Demandes de dépôt', icon: Inbox, badge: pendingCount },
    { to: '/admin/articles', label: 'Articles', icon: Package },
    { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
    { to: '/admin/commandes', label: 'Commandes', icon: ShoppingBag },
    { to: '/admin/boutiques', label: 'Boutiques', icon: Store },
    { to: '/admin/newsletter', label: 'Newsletter', icon: Mail },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/admin/seo', label: 'SEO', icon: Search },
  ];

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
        <p style={{ color: '#9e8e7e' }}>Accès réservé à l'administration</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 120px)' }}>
      <aside style={{ width: '240px', backgroundColor: '#0f0f0f', flexShrink: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #222' }}>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.3em', color: '#c9a96e', marginBottom: '4px' }}>ADMINISTRATION</p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: 'white' }}>Magali Berdah</p>
        </div>
        <nav style={{ padding: '0.75rem 0' }}>
          {nav.map(({ to, label, icon: Icon, exact, badge }) => (
            <Link key={to} to={to}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 1.5rem', textDecoration: 'none', color: isActive(to, exact) ? '#c9a96e' : '#666', borderLeft: isActive(to, exact) ? '2px solid #c9a96e' : '2px solid transparent', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', marginBottom: '2px', backgroundColor: isActive(to, exact) ? 'rgba(201,169,110,0.08)' : 'transparent' }}>
              <Icon size={15} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge ? <span style={{ minWidth: '18px', height: '18px', borderRadius: '9px', backgroundColor: '#c9a96e', color: 'white', fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{badge}</span> : null}
            </Link>
          ))}
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '2rem', backgroundColor: '#f8f4ef', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
