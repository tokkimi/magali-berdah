import { useEffect, useState } from 'react';
import { useStore, useT } from '../lib/store';
import { api } from '../lib/api';
import { User, Package, Gavel, Heart } from 'lucide-react';
import { STATIC_ITEMS } from '../lib/staticItems';
import ItemCard from '../components/ItemCard';

export default function Profile() {
  const t = useT();
  const { user, updateUser, favIds } = useStore();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '', city: user?.city || '', country: user?.country || 'FR' });
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (tab === 'orders') api.get('/orders/mine').then(d => setOrders(d.orders || [])).catch(() => {});
  }, [tab]);

  const saveProfile = async () => {
    try {
      const data = await api.put('/auth/me', form);
      updateUser(data.user);
    } catch {
      updateUser(form);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Favorites from Zustand store + static items fallback
  const favItems = STATIC_ITEMS.filter(item => favIds.has(item.id));

  const tabs = [
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'orders', label: t('myOrders'), icon: Package },
    { id: 'bids', label: t('myBids'), icon: Gavel },
    { id: 'favorites', label: t('favorites'), icon: Heart },
  ];

  if (!user) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem 5rem' }}>
      <style>{`
        .profile-tabs { display: flex; flex-direction: column; gap: 0; width: 200px; flex-shrink: 0; }
        .profile-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 700px) {
          .profile-layout { flex-direction: column !important; }
          .profile-tabs { flex-direction: row !important; width: 100% !important; overflow-x: auto; border-bottom: 1px solid #e8d5b7; margin-bottom: 1rem; padding-bottom: 0; gap: 0 !important; }
          .profile-tab-btn { border-left: none !important; border-bottom: 2px solid transparent; flex-shrink: 0; padding: 10px 12px !important; }
          .profile-tab-btn.active { border-left: none !important; border-bottom: 2px solid #c9a96e !important; }
          .profile-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e8d5b7', paddingBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ width: '60px', height: '60px', backgroundColor: '#f8f4ef', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #c9a96e', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#c9a96e' }}>{user.name[0]?.toUpperCase()}</span>
        </div>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 400, color: '#1a1a1a' }}>{user.name}</h1>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#9e8e7e' }}>{user.email}</p>
          {user.verified ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2e7d32', fontSize: '0.72rem', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>✓ Compte vérifié</span> : null}
        </div>
      </div>

      <div className="profile-layout" style={{ display: 'flex', gap: '2rem' }}>
        {/* Tab nav */}
        <nav className="profile-tabs">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`profile-tab-btn${tab === id ? ' active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderLeft: tab === id ? '2px solid #c9a96e' : '2px solid transparent', color: tab === id ? '#c9a96e' : '#1a1a1a', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', marginBottom: '4px', whiteSpace: 'nowrap' }}>
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {tab === 'profile' && (
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 400, marginBottom: '1.25rem', color: '#1a1a1a' }}>Mes informations</h2>
              <div className="profile-form-grid">
                {[
                  { label: 'Nom complet', key: 'name', type: 'text' },
                  { label: 'Téléphone', key: 'phone', type: 'tel' },
                  { label: 'Adresse', key: 'address', type: 'text' },
                  { label: 'Ville', key: 'city', type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label.toUpperCase()}</label>
                    <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                      style={inputStyle} />
                  </div>
                ))}
                <div>
                  <label style={labelStyle}>PAYS</label>
                  <select value={form.country} onChange={e => setForm(x => ({ ...x, country: e.target.value }))} style={{ ...inputStyle, backgroundColor: 'white' }}>
                    <option value="FR">France</option>
                    <option value="BE">Belgique</option>
                    <option value="CH">Suisse</option>
                    <option value="LU">Luxembourg</option>
                    <option value="MC">Monaco</option>
                    <option value="GB">Royaume-Uni</option>
                    <option value="US">États-Unis</option>
                    <option value="AE">Émirats Arabes Unis</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={saveProfile} className="btn-gold">{t('save').toUpperCase()}</button>
                {saved && <span style={{ color: '#2e7d32', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem' }}>✓ Enregistré</span>}
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 400, marginBottom: '1.25rem', color: '#1a1a1a' }}>Mes achats</h2>
              {orders.length === 0 ? (
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#9e8e7e', textAlign: 'center', padding: '2rem' }}>Aucun achat pour le moment</p>
              ) : orders.map(o => (
                <div key={o.id} style={{ border: '1px solid #e8d5b7', padding: '1.25rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#1a1a1a', marginBottom: '4px' }}>{o.item_title}</p>
                    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#9e8e7e' }}>{o.shop_name}</p>
                    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#9e8e7e', marginTop: '2px' }}>{new Date(o.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#1a1a1a', marginBottom: '4px' }}>{o.amount?.toLocaleString('fr-FR')} €</p>
                    <StatusBadge status={o.payment_status} type="payment" />
                    <StatusBadge status={o.shipping_status} type="shipping" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'bids' && (
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 400, marginBottom: '1.25rem', color: '#1a1a1a' }}>Mes enchères</h2>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#9e8e7e', textAlign: 'center', padding: '2rem' }}>
                Retrouvez vos enchères actives dans les articles correspondants.
              </p>
            </div>
          )}

          {tab === 'favorites' && (
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 400, marginBottom: '1.25rem', color: '#1a1a1a' }}>Mes favoris</h2>
              {favItems.length === 0 ? (
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#9e8e7e', textAlign: 'center', padding: '2rem' }}>Aucun favori</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                  {favItems.map((item: any) => <ItemCard key={item.id} item={item} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, type }: { status: string; type: string }) {
  const paymentColors: Record<string, string> = { pending: '#ff9800', paid: '#2e7d32', failed: '#cc0000' };
  const shippingColors: Record<string, string> = { pending: '#9e8e7e', shipped: '#1976d2', delivered: '#2e7d32' };
  const colors = type === 'payment' ? paymentColors : shippingColors;
  const labels: Record<string, string> = {
    pending: type === 'payment' ? 'Paiement en attente' : 'Envoi en attente',
    paid: 'Payé', shipped: 'Expédié', delivered: 'Livré', failed: 'Échec paiement'
  };
  return (
    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: colors[status] || '#9e8e7e', marginTop: '4px' }}>
      {labels[status] || status}
    </p>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'Helvetica Neue, Arial, sans-serif',
  fontSize: '0.65rem', letterSpacing: '0.1em', color: '#9e8e7e', marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid #e8d5b7', padding: '10px 12px',
  fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#1a1a1a',
  boxSizing: 'border-box',
};
