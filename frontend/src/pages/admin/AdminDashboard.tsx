import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Users, Package, ShoppingBag, TrendingUp, Eye, Mail } from 'lucide-react';
import { STATIC_ITEMS } from '../../lib/staticItems';

const STATIC_STATS = {
  totalUsers: 3, totalPros: 1, activeItems: STATIC_ITEMS.length,
  totalItems: STATIC_ITEMS.length, totalOrders: 0, pendingPayments: 0,
  totalRevenue: 0, todayVisitors: 0, weekVisitors: 0, newsletterSubs: 0,
  topItems: STATIC_ITEMS.slice(0, 8).map(i => ({ id: i.id, title: i.title, brand: i.brand, views: i.views || 0 })),
  recentOrders: [],
  dailyVisitors: Array.from({ length: 30 }, (_, k) => ({ day: `J-${30 - k}`, count: 0 })),
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(STATIC_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Utilisateurs', value: stats.totalUsers, sub: `${stats.totalPros} boutiques`, icon: Users, color: '#c9a96e' },
    { label: 'Articles actifs', value: stats.activeItems, sub: `${stats.totalItems} total`, icon: Package, color: '#1976d2' },
    { label: 'Commandes', value: stats.totalOrders, sub: `${stats.pendingPayments} en attente`, icon: ShoppingBag, color: '#ff9800' },
    { label: 'Revenus (commissions)', value: `${(stats.totalRevenue || 0).toFixed(0)} €`, icon: TrendingUp, color: '#2e7d32' },
    { label: "Visiteurs aujourd'hui", value: stats.todayVisitors ?? 0, sub: `${stats.weekVisitors ?? 0} cette semaine`, icon: Eye, color: '#9c27b0' },
    { label: 'Newsletter', value: stats.newsletterSubs ?? 0, sub: 'abonnés actifs', icon: Mail, color: '#c9a96e' },
  ];

  const payLabels: Record<string, string> = { pending: 'En attente', paid: 'Payé', failed: 'Échoué' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a' }}>Tableau de bord</h1>
        {loading && <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#c9a96e' }}>Mise à jour en cours...</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {cards.map(c => (
          <div key={c.label} style={{ backgroundColor: 'white', padding: '1.25rem', border: '1px solid #e8d5b7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.1em', color: '#9e8e7e', marginBottom: '0.5rem' }}>{c.label.toUpperCase()}</p>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', color: c.color }}>{c.value}</p>
                {c.sub && <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e', marginTop: '2px' }}>{c.sub}</p>}
              </div>
              <c.icon size={20} color={c.color} style={{ opacity: 0.5 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Top items */}
        <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 400, marginBottom: '1rem', color: '#1a1a1a' }}>Articles les plus vus</h2>
          {(stats.topItems || []).slice(0, 8).map((item: any) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0ece6' }}>
              <div style={{ minWidth: 0, flex: 1, marginRight: '8px' }}>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#c9a96e' }}>{item.brand}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <Eye size={12} color="#9e8e7e" />
                <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e' }}>{item.views ?? 0}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent orders */}
        <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 400, marginBottom: '1rem', color: '#1a1a1a' }}>Dernières commandes</h2>
          {(stats.recentOrders || []).length === 0 ? (
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#9e8e7e', textAlign: 'center', padding: '1.5rem 0' }}>Aucune commande</p>
          ) : (stats.recentOrders || []).slice(0, 8).map((o: any) => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0ece6' }}>
              <div>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1a1a1a' }}>{o.item_title}</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#9e8e7e' }}>{o.buyer_name}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.85rem', color: '#1a1a1a' }}>{o.amount?.toLocaleString('fr-FR')} €</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: o.payment_status === 'paid' ? '#2e7d32' : '#ff9800' }}>
                  {payLabels[o.payment_status] || o.payment_status}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Visitor chart */}
        <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem', gridColumn: 'span 2' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 400, marginBottom: '1rem', color: '#1a1a1a' }}>Visiteurs — 30 derniers jours</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100px' }}>
            {(stats.dailyVisitors || []).slice(-30).map((d: any, i: number) => {
              const max = Math.max(...(stats.dailyVisitors || []).map((x: any) => x.count), 1);
              const h = max > 0 ? Math.max(4, (d.count / max) * 100) : 4;
              return (
                <div key={i} title={`${d.day}: ${d.count} visiteurs`}
                  style={{ flex: 1, backgroundColor: '#c9a96e', height: `${h}%`, minWidth: '6px', opacity: 0.4 + 0.6 * (d.count / max) }} />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
