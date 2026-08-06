import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Eye } from 'lucide-react';
import { STATIC_ITEMS } from '../../lib/staticItems';

const STATIC_VISITORS = {
  daily: Array.from({ length: 30 }, (_, i) => ({ day: `J-${30 - i}`, unique_visitors: 0, page_views: 0 })),
  topPages: [
    { page: '/', views: 0 }, { page: '/catalogue', views: 0 }, { page: '/pro', views: 0 },
  ],
  countries: [],
};
const STATIC_ITEMS_ANALYTICS = {
  topViewed: STATIC_ITEMS.slice(0, 10).map(i => ({ id: i.id, title: i.title, brand: i.brand, views: i.views || 0 })),
  byCategory: [
    { name_fr: 'Sacs', total_views: 0 }, { name_fr: 'Femme', total_views: 0 },
    { name_fr: 'Homme', total_views: 0 }, { name_fr: 'Accessoires', total_views: 0 },
  ],
};

export default function AdminAnalytics() {
  const [visitors, setVisitors] = useState<any>(STATIC_VISITORS);
  const [items, setItems] = useState<any>(STATIC_ITEMS_ANALYTICS);

  useEffect(() => {
    api.get('/admin/analytics/visitors').then(d => setVisitors(d)).catch(() => {});
    api.get('/admin/analytics/items').then(d => setItems(d)).catch(() => {});
  }, []);

  const maxV = Math.max(...(visitors.daily || []).map((d: any) => d.unique_visitors), 1);

  return (
    <div>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '2rem' }}>Analytics</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Visitor chart */}
        <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem', gridColumn: '1 / -1' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 400, marginBottom: '1rem', color: '#1a1a1a' }}>Visiteurs uniques — 30 derniers jours</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '120px', marginBottom: '0.5rem' }}>
            {(visitors.daily || []).slice(-30).map((d: any, i: number) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                <div title={`${d.day}: ${d.unique_visitors} visiteurs, ${d.page_views} pages vues`}
                  style={{ width: '100%', backgroundColor: '#c9a96e', height: `${Math.max(4, (d.unique_visitors / maxV) * 100)}%`, minWidth: '6px', opacity: 0.7 }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#9e8e7e' }}>
            <span>{(visitors.daily || []).slice(-30)[0]?.day}</span>
            <span>Aujourd'hui</span>
          </div>
          {maxV === 1 && (
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#9e8e7e', marginTop: '0.75rem', textAlign: 'center' }}>
              Les statistiques de visites seront disponibles dès que le backend est connecté.
            </p>
          )}
        </div>

        {/* Top pages */}
        <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 400, marginBottom: '1rem', color: '#1a1a1a' }}>Pages les plus visitées</h2>
          {(visitors.topPages || []).length === 0 ? (
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#9e8e7e', padding: '1rem 0' }}>Aucune donnée disponible</p>
          ) : (visitors.topPages || []).slice(0, 10).map((p: any) => (
            <div key={p.page} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0ece6' }}>
              <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1a1a1a' }}>{p.page || '/'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Eye size={12} color="#9e8e7e" />
                <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e' }}>{p.views}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Top items */}
        <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 400, marginBottom: '1rem', color: '#1a1a1a' }}>Articles les plus vus</h2>
          {(items.topViewed || []).slice(0, 10).map((item: any) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0ece6' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#c9a96e' }}>{item.brand}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginLeft: 8 }}>
                <Eye size={12} color="#9e8e7e" />
                <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e' }}>{item.views ?? 0}</span>
              </div>
            </div>
          ))}
        </div>

        {/* By category */}
        <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 400, marginBottom: '1rem', color: '#1a1a1a' }}>Vues par catégorie</h2>
          {(items.byCategory || []).map((cat: any) => {
            const maxCat = Math.max(...(items.byCategory || []).map((c: any) => c.total_views), 1);
            return (
              <div key={cat.name_fr} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1a1a1a' }}>{cat.name_fr}</span>
                  <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e' }}>{cat.total_views} vues</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#f0ece6', borderRadius: '3px' }}>
                  <div style={{ height: '100%', backgroundColor: '#c9a96e', borderRadius: '3px', width: `${Math.max(2, (cat.total_views / maxCat) * 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Countries */}
        <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 400, marginBottom: '1rem', color: '#1a1a1a' }}>Pays des visiteurs</h2>
          {!visitors.countries?.length ? (
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#9e8e7e', padding: '1rem 0' }}>Aucune donnée disponible</p>
          ) : visitors.countries.map((c: any) => (
            <div key={c.country} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0ece6' }}>
              <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1a1a1a' }}>{c.country || 'Inconnu'}</span>
              <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e' }}>{c.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
