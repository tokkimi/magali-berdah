import { useEffect, useState } from 'react';
import { Star, StarOff } from 'lucide-react';
import { api } from '../../lib/api';

export default function AdminShops() {
  const [shops, setShops] = useState<any[]>([]);

  useEffect(() => {
    api.get('/admin/shops').then(d => setShops(d.shops || [])).catch(() => {});
  }, []);

  const toggleSub = async (id: string, active: number) => {
    await api.put(`/admin/shops/${id}/subscription`, { active: !active });
    setShops(s => s.map(x => x.id === id ? { ...x, subscription_active: active ? 0 : 1, commission_rate: active ? 20 : 5 } : x));
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '1.5rem' }}>Boutiques ({shops.length})</h1>

      <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e8d5b7', backgroundColor: '#f8f4ef' }}>
              {['Boutique', 'Propriétaire', 'SIRET', 'Articles', 'Ventes', 'Commission', 'Abonnement', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.12em', color: '#9e8e7e' }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shops.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f0ece6' }}>
                <td style={{ padding: '10px 14px' }}>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: '#1a1a1a' }}>{s.shop_name}</p>
                  {s.subscription_active ? <span style={{ fontSize: '0.65rem', color: '#c9a96e' }}>★ Premium</span> : null}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1a1a1a' }}>{s.owner_name}</p>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#9e8e7e' }}>{s.email}</p>
                </td>
                <td style={{ padding: '10px 14px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#666' }}>{s.siret || '-'}</td>
                <td style={{ padding: '10px 14px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#1a1a1a' }}>{s.item_count}</td>
                <td style={{ padding: '10px 14px', fontFamily: 'Georgia, serif', fontSize: '0.85rem' }}>
                  {(s.total_sales || 0).toLocaleString('fr-FR')} €
                </td>
                <td style={{ padding: '10px 14px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#c9a96e', fontWeight: 600 }}>
                  {s.commission_rate}%
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: s.subscription_active ? '#2e7d32' : '#9e8e7e', fontWeight: 600 }}>
                    {s.subscription_active ? 'Premium actif' : 'Gratuit'}
                  </span>
                  {s.subscription_active && s.subscription_end && (
                    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#9e8e7e' }}>
                      Expire: {new Date(s.subscription_end).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => toggleSub(s.id, s.subscription_active)} title={s.subscription_active ? 'Retirer premium' : 'Activer premium'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: s.subscription_active ? '#ff9800' : '#c9a96e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem' }}>
                    {s.subscription_active ? <StarOff size={16} /> : <Star size={16} />}
                    {s.subscription_active ? 'Retirer' : 'Activer Premium'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
