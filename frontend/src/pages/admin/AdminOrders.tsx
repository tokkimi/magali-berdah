import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/admin/orders').then(d => setOrders(d.orders || [])).catch(() => {});
  }, []);

  const setPayment = async (id: string, status: string) => {
    await api.put(`/admin/orders/${id}/payment`, { status });
    setOrders(o => o.map(x => x.id === id ? { ...x, payment_status: status } : x));
  };

  const filtered = orders.filter(o => {
    if (filter === 'pending') return o.payment_status === 'pending';
    if (filter === 'paid') return o.payment_status === 'paid';
    if (filter === 'shipped') return o.shipping_status === 'shipped';
    return true;
  });

  const payColors: Record<string, string> = { pending: '#ff9800', paid: '#2e7d32', failed: '#cc0000' };
  const shipColors: Record<string, string> = { pending: '#9e8e7e', shipped: '#1976d2', delivered: '#2e7d32' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a' }}>Commandes ({filtered.length})</h1>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ border: '1px solid #e8d5b7', padding: '6px 12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', backgroundColor: 'white' }}>
          <option value="all">Toutes</option>
          <option value="pending">Paiement en attente</option>
          <option value="paid">Payées</option>
          <option value="shipped">Expédiées</option>
        </select>
      </div>

      <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e8d5b7', backgroundColor: '#f8f4ef' }}>
              {['Article', 'Acheteur', 'Boutique', 'Montant', 'Commission', 'Paiement', 'Envoi', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.12em', color: '#9e8e7e' }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid #f0ece6' }}>
                <td style={{ padding: '10px 12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1a1a1a' }}>{o.item_title?.slice(0, 25)}</td>
                <td style={{ padding: '10px 12px' }}>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1a1a1a' }}>{o.buyer_name}</p>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#9e8e7e' }}>{o.buyer_email}</p>
                </td>
                <td style={{ padding: '10px 12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#666' }}>{o.shop_name}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'Georgia, serif', fontSize: '0.85rem' }}>{o.amount?.toLocaleString('fr-FR')} €</td>
                <td style={{ padding: '10px 12px', fontFamily: 'Georgia, serif', fontSize: '0.85rem', color: '#c9a96e' }}>
                  {o.commission_amount?.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <select value={o.payment_status} onChange={e => setPayment(o.id, e.target.value)}
                    style={{ border: 'none', background: 'transparent', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: payColors[o.payment_status] || '#9e8e7e', cursor: 'pointer', fontWeight: 600 }}>
                    <option value="pending">En attente</option>
                    <option value="paid">Payé</option>
                    <option value="failed">Échoué</option>
                  </select>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: shipColors[o.shipping_status] || '#9e8e7e' }}>
                    {o.shipping_status === 'shipped' ? 'Expédié' : o.shipping_status === 'delivered' ? 'Livré' : 'En attente'}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e' }}>
                  {new Date(o.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  {o.tracking_number && (
                    <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#1976d2' }}>{o.tracking_number}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
