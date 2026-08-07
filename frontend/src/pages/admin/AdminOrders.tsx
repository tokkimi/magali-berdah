import { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle, X, ExternalLink } from 'lucide-react';
import { api } from '../../lib/api';

const CARRIERS = [
  { id: 'colissimo', label: 'Colissimo', url: (n: string) => `https://www.laposte.fr/outils/suivre-vos-envois?code=${n}` },
  { id: 'chronopost', label: 'Chronopost', url: (n: string) => `https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLtc=${n}` },
  { id: 'dhl', label: 'DHL', url: (n: string) => `https://www.dhl.com/fr-fr/home/tracking.html?tracking-id=${n}` },
  { id: 'ups', label: 'UPS', url: (n: string) => `https://www.ups.com/track?tracknum=${n}` },
  { id: 'fedex', label: 'FedEx', url: (n: string) => `https://www.fedex.com/fr-fr/tracking.html?trackingNumber=${n}` },
  { id: 'mondial', label: 'Mondial Relay', url: (n: string) => `https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=${n}` },
  { id: 'other', label: 'Autre transporteur', url: () => '' },
];

function loadLocalOrders(): any[] {
  try { return JSON.parse(localStorage.getItem('mb_orders') || '[]'); } catch { return []; }
}
function saveLocalOrders(orders: any[]) {
  localStorage.setItem('mb_orders', JSON.stringify(orders));
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [trackModal, setTrackModal] = useState<any>(null);
  const [trackForm, setTrackForm] = useState({ carrier: 'colissimo', number: '', custom_url: '' });

  useEffect(() => {
    const local = loadLocalOrders();
    setOrders(local);
    api.get('/admin/orders').then(d => {
      if (d.orders?.length) {
        const merged = [...d.orders, ...local.filter(l => !d.orders.find((o: any) => o.id === l.id))];
        setOrders(merged);
      }
    }).catch(() => {});
  }, []);

  const updateOrder = (id: string, patch: any) => {
    const updated = orders.map(o => o.id === id ? { ...o, ...patch } : o);
    setOrders(updated);
    saveLocalOrders(updated);
    try { api.put(`/admin/orders/${id}/status`, patch); } catch {}
  };

  const openTrackModal = (order: any) => {
    setTrackForm({ carrier: order.carrier || 'colissimo', number: order.tracking_number || '', custom_url: order.custom_url || '' });
    setTrackModal(order);
  };

  const saveTracking = () => {
    if (!trackForm.number.trim()) return;
    const carrier = CARRIERS.find(c => c.id === trackForm.carrier);
    const tracking_url = trackForm.carrier === 'other'
      ? trackForm.custom_url
      : carrier?.url(trackForm.number.trim()) || '';

    updateOrder(trackModal.id, {
      tracking_number: trackForm.number.trim(),
      carrier: trackForm.carrier,
      carrier_label: carrier?.label || trackForm.carrier,
      tracking_url,
      shipping_status: 'shipped',
    });
    setTrackModal(null);
  };

  const markDelivered = (id: string) => {
    updateOrder(id, { shipping_status: 'delivered' });
  };

  const setPayment = (id: string, payment_status: string) => {
    updateOrder(id, { payment_status });
  };

  const filtered = orders.filter(o => {
    if (filter === 'pending_payment') return o.payment_status === 'pending';
    if (filter === 'paid') return o.payment_status === 'paid' && o.shipping_status === 'pending';
    if (filter === 'shipped') return o.shipping_status === 'shipped';
    if (filter === 'delivered') return o.shipping_status === 'delivered';
    return true;
  });

  const payColors: Record<string, string> = { pending: '#ff9800', paid: '#2e7d32', failed: '#cc0000' };
  const shipColors: Record<string, string> = { pending: '#9e8e7e', shipped: '#1976d2', delivered: '#2e7d32' };
  const shipLabels: Record<string, string> = { pending: 'En attente', shipped: 'Expédié', delivered: 'Livré' };

  const toShipCount = orders.filter(o => o.payment_status === 'paid' && o.shipping_status === 'pending').length;

  return (
    <div>
      {/* Tracking modal */}
      {trackModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', maxWidth: '480px', width: '100%', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setTrackModal(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9e8e7e' }}>
              <X size={18} />
            </button>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#c9a96e', marginBottom: '0.5rem' }}>SAISIR LE NUMÉRO DE SUIVI</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '0.25rem' }}>{trackModal.item_title}</h2>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', marginBottom: '1.5rem' }}>
              {trackModal.buyer_name} · {trackModal.buyer_email}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={labelStyle}>TRANSPORTEUR</label>
                <select value={trackForm.carrier} onChange={e => setTrackForm(f => ({ ...f, carrier: e.target.value }))} style={inputStyle}>
                  {CARRIERS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>NUMÉRO DE SUIVI *</label>
                <input
                  value={trackForm.number}
                  onChange={e => setTrackForm(f => ({ ...f, number: e.target.value }))}
                  placeholder="Ex: 2C12345678901"
                  style={inputStyle}
                  autoFocus
                />
              </div>
              {trackForm.carrier === 'other' && (
                <div>
                  <label style={labelStyle}>LIEN DE SUIVI (optionnel)</label>
                  <input
                    value={trackForm.custom_url}
                    onChange={e => setTrackForm(f => ({ ...f, custom_url: e.target.value }))}
                    placeholder="https://..."
                    style={inputStyle}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={saveTracking} disabled={!trackForm.number.trim()} className="btn-gold"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', opacity: trackForm.number.trim() ? 1 : 0.5 }}>
                <Truck size={14} /> MARQUER EXPÉDIÉ
              </button>
              <button onClick={() => setTrackModal(null)}
                style={{ flex: 1, padding: '10px', border: '1px solid #e8d5b7', background: 'none', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e' }}>
                ANNULER
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a' }}>Commandes ({filtered.length})</h1>
          {toShipCount > 0 && (
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#ff9800', marginTop: '4px' }}>
              ● {toShipCount} commande{toShipCount > 1 ? 's' : ''} payée{toShipCount > 1 ? 's' : ''} en attente d'expédition
            </p>
          )}
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ border: '1px solid #e8d5b7', padding: '6px 12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', backgroundColor: 'white' }}>
          <option value="all">Toutes ({orders.length})</option>
          <option value="pending_payment">Paiement en attente</option>
          <option value="paid">Payées — à expédier ({toShipCount})</option>
          <option value="shipped">Expédiées</option>
          <option value="delivered">Livrées</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '3rem', textAlign: 'center' }}>
          <Package size={40} color="#e8d5b7" style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#9e8e7e' }}>Aucune commande dans cette catégorie</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(o => (
            <div key={o.id} style={{ backgroundColor: 'white', border: `1px solid ${o.shipping_status === 'delivered' ? '#c3e6cb' : o.shipping_status === 'shipped' ? '#bee5eb' : '#e8d5b7'}`, padding: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {/* Info article + acheteur */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#1a1a1a', marginBottom: '3px' }}>{o.item_title}</p>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#9e8e7e' }}>
                    {o.buyer_name} · <a href={`mailto:${o.buyer_email}`} style={{ color: '#c9a96e', textDecoration: 'none' }}>{o.buyer_email}</a>
                  </p>
                  {o.buyer_address && (
                    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#666', marginTop: '3px' }}>
                      📍 {o.buyer_address}, {o.buyer_city}
                    </p>
                  )}
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#bbb', marginTop: '4px' }}>
                    {new Date(o.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                {/* Prix + statuts */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#1a1a1a', marginBottom: '6px' }}>
                    {(o.amount || 0).toLocaleString('fr-FR')} €
                  </p>
                  <select value={o.payment_status} onChange={e => setPayment(o.id, e.target.value)}
                    style={{ border: 'none', background: 'transparent', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: payColors[o.payment_status] || '#9e8e7e', cursor: 'pointer', fontWeight: 600, marginBottom: '4px', display: 'block', marginLeft: 'auto' }}>
                    <option value="pending">Paiement en attente</option>
                    <option value="paid">Payé ✓</option>
                    <option value="failed">Échec paiement</option>
                  </select>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: shipColors[o.shipping_status] || '#9e8e7e', fontWeight: 600 }}>
                    {o.shipping_status === 'shipped' ? '📦 Expédié' : o.shipping_status === 'delivered' ? '✓ Livré' : '⏳ Envoi en attente'}
                  </p>
                </div>
              </div>

              {/* Tracking info */}
              {o.tracking_number && (
                <div style={{ marginTop: '10px', padding: '10px 14px', backgroundColor: '#f0f7ff', borderLeft: '3px solid #1976d2', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <Truck size={16} color="#1976d2" />
                  <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1976d2' }}>
                    {o.carrier_label} · <strong>{o.tracking_number}</strong>
                  </span>
                  {o.tracking_url && (
                    <a href={o.tracking_url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#1976d2', marginLeft: 'auto', textDecoration: 'none' }}>
                      Suivre <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                {o.payment_status === 'paid' && o.shipping_status !== 'delivered' && (
                  <button onClick={() => openTrackModal(o)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: o.tracking_number ? 'none' : 'linear-gradient(135deg, #c9a96e, #a8834a)', border: o.tracking_number ? '1px solid #1976d2' : 'none', cursor: 'pointer', color: o.tracking_number ? '#1976d2' : 'white', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem' }}>
                    <Truck size={13} /> {o.tracking_number ? 'Modifier le suivi' : 'SAISIR NUMÉRO DE SUIVI'}
                  </button>
                )}
                {o.shipping_status === 'shipped' && (
                  <button onClick={() => markDelivered(o.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'none', border: '1px solid #2e7d32', cursor: 'pointer', color: '#2e7d32', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem' }}>
                    <CheckCircle size={13} /> MARQUER LIVRÉ
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'Helvetica Neue, Arial, sans-serif',
  fontSize: '0.6rem', letterSpacing: '0.15em', color: '#9e8e7e', marginBottom: '6px',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1px solid #e8d5b7',
  fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem',
  backgroundColor: 'white', boxSizing: 'border-box' as const,
};
