import { useEffect, useState } from 'react';
import { MessageCircle, Package, Check } from 'lucide-react';
import { api } from '../../lib/api';

export default function ProOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgInput, setMsgInput] = useState('');

  useEffect(() => {
    api.get('/orders/shop').then(d => setOrders(d.orders || [])).catch(() => {});
  }, []);

  const openChat = async (order: any) => {
    setSelected(order);
    const d = await api.get(`/orders/${order.id}/messages`);
    setMessages(d.messages || []);
  };

  const sendMsg = async () => {
    if (!msgInput.trim() || !selected) return;
    const d = await api.post(`/orders/${selected.id}/messages`, { content: msgInput });
    setMessages(m => [...m, d.message]);
    setMsgInput('');
  };

  const markShipped = async (orderId: string, tracking?: string) => {
    try {
      await api.put(`/orders/${orderId}/shipping`, { status: 'shipped', tracking_number: tracking });
      setOrders(o => o.map(x => x.id === orderId ? { ...x, shipping_status: 'shipped' } : x));
    } catch {}
  };

  const payColors: Record<string, string> = { pending: '#ff9800', paid: '#2e7d32', failed: '#cc0000' };
  const shipColors: Record<string, string> = { pending: '#9e8e7e', shipped: '#1976d2', delivered: '#2e7d32' };

  return (
    <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 200px)' }}>
      {/* Orders list */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '1.5rem' }}>Commandes</h1>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'white', border: '1px solid #e8d5b7' }}>
            <p style={{ fontFamily: 'Georgia, serif', color: '#9e8e7e' }}>Aucune commande pour le moment</p>
          </div>
        ) : orders.map(o => (
          <div key={o.id} style={{ backgroundColor: 'white', border: `1px solid ${selected?.id === o.id ? '#c9a96e' : '#e8d5b7'}`, padding: '1.25rem', marginBottom: '0.75rem', cursor: 'pointer' }} onClick={() => openChat(o)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#1a1a1a', marginBottom: '2px' }}>{o.item_title}</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e' }}>
                  Client: {o.buyer_name} · {o.buyer_email}
                </p>
              </div>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#1a1a1a' }}>{o.amount?.toLocaleString('fr-FR')} €</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: payColors[o.payment_status] || '#9e8e7e' }}>
                  Paiement: {o.payment_status === 'paid' ? 'Payé ✓' : o.payment_status === 'pending' ? 'En attente' : 'Échoué'}
                </span>
                <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: shipColors[o.shipping_status] || '#9e8e7e' }}>
                  Envoi: {o.shipping_status === 'shipped' ? 'Expédié' : o.shipping_status === 'delivered' ? 'Livré' : 'En attente'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {o.shipping_status === 'pending' && o.payment_status === 'paid' && (
                  <button className="btn-gold" style={{ fontSize: '0.65rem', padding: '4px 12px' }}
                    onClick={e => { e.stopPropagation(); const t = prompt('Numéro de suivi (optionnel):') || undefined; markShipped(o.id, t); }}>
                    <Package size={12} style={{ display: 'inline', marginRight: '4px' }} /> Marquer expédié
                  </button>
                )}
                <button className="btn-outline" style={{ fontSize: '0.65rem', padding: '4px 12px' }} onClick={e => { e.stopPropagation(); openChat(o); }}>
                  <MessageCircle size={12} style={{ display: 'inline', marginRight: '4px' }} /> Chat {o.unread_count > 0 && `(${o.unread_count})`}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat panel */}
      {selected && (
        <div style={{ width: '340px', flexShrink: 0, backgroundColor: 'white', border: '1px solid #e8d5b7', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #e8d5b7', backgroundColor: '#1a1a1a' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: 'white', marginBottom: '2px' }}>{selected.item_title}</p>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#c9a96e' }}>{selected.buyer_name}</p>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '200px' }}>
            {messages.length === 0 && <p style={{ color: '#9e8e7e', fontSize: '0.8rem', fontFamily: 'Helvetica Neue, Arial, sans-serif', textAlign: 'center', marginTop: '2rem' }}>Démarrez la conversation</p>}
            {messages.map((m: any) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: m.sender_id === selected.seller_user_id ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '80%', padding: '8px 12px', backgroundColor: m.sender_id === selected.seller_user_id ? '#c9a96e' : '#f8f4ef', color: m.sender_id === selected.seller_user_id ? 'white' : '#1a1a1a', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', lineHeight: '1.5' }}>
                  <p style={{ fontSize: '0.65rem', color: m.sender_id === selected.seller_user_id ? 'rgba(255,255,255,0.7)' : '#9e8e7e', marginBottom: '2px' }}>{m.sender_name}</p>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '0.75rem', borderTop: '1px solid #e8d5b7', display: 'flex', gap: '8px' }}>
            <input value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()}
              placeholder="Message..." style={{ flex: 1, border: '1px solid #e8d5b7', padding: '8px 10px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem' }} />
            <button onClick={sendMsg} className="btn-gold" style={{ padding: '8px 14px' }}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}
