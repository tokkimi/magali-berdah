import { useEffect, useState } from 'react';
import { useStore, useT } from '../lib/store';
import { api } from '../lib/api';
import { User, Package, Gavel, Heart, Truck, ExternalLink } from 'lucide-react';
import { getAllItems } from '../lib/staticItems';
import ItemCard from '../components/ItemCard';

function loadMyOrders(userId: string): any[] {
  try {
    const all = JSON.parse(localStorage.getItem('mb_orders') || '[]');
    return all.filter((o: any) => o.buyer_id === userId || o.buyer_email === userId);
  } catch { return []; }
}

export default function Profile() {
  const t = useT();
  const { user, updateUser, favIds } = useStore();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '', city: user?.city || '', country: user?.country || 'FR' });
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (tab === 'orders' && user) {
      const local = loadMyOrders(user.id || user.email);
      setOrders(local);
      api.get('/orders/mine').then(d => {
        if (d.orders?.length) setOrders(d.orders);
      }).catch(() => {});
    }
  }, [tab, user]);

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

  const favItems = getAllItems().filter((item: any) => favIds.has(item.id));

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
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9e8e7e' }}>
                  <Package size={40} color="#e8d5b7" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem' }}>Aucun achat pour le moment</p>
                </div>
              ) : orders.map(o => (
                <div key={o.id} style={{ border: `1px solid ${o.shipping_status === 'delivered' ? '#c3e6cb' : o.shipping_status === 'shipped' ? '#bee5eb' : '#e8d5b7'}`, marginBottom: '1rem', overflow: 'hidden' }}>
                  {/* Status bar */}
                  <div style={{ padding: '6px 14px', backgroundColor: o.shipping_status === 'delivered' ? '#d4edda' : o.shipping_status === 'shipped' ? '#d1ecf1' : o.payment_status === 'paid' ? '#fff3cd' : '#f8f4ef', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {o.shipping_status === 'delivered'
                      ? <><span style={{ color: '#2e7d32', fontSize: '0.72rem', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontWeight: 700 }}>✓ LIVRÉ</span></>
                      : o.shipping_status === 'shipped'
                      ? <><Truck size={13} color="#1976d2" /><span style={{ color: '#1976d2', fontSize: '0.72rem', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontWeight: 700 }}>EN COURS DE LIVRAISON</span></>
                      : o.payment_status === 'paid'
                      ? <><span style={{ color: '#856404', fontSize: '0.72rem', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontWeight: 700 }}>✓ PAYÉ — PRÉPARATION EN COURS</span></>
                      : <><span style={{ color: '#9e8e7e', fontSize: '0.72rem', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>PAIEMENT EN ATTENTE</span></>
                    }
                  </div>

                  <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#1a1a1a', marginBottom: '4px' }}>{o.item_title}</p>
                      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e' }}>
                        {new Date(o.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#1a1a1a' }}>
                      {(o.amount || 0).toLocaleString('fr-FR')} €
                    </p>
                  </div>

                  {/* Tracking */}
                  {o.tracking_number && (
                    <div style={{ margin: '0 1.25rem 1rem', padding: '12px 14px', backgroundColor: '#f0f7ff', borderLeft: '3px solid #1976d2' }}>
                      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#1976d2', marginBottom: '6px' }}>SUIVI D'ENVOI</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div>
                          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1a1a1a' }}>
                            {o.carrier_label} · <strong>{o.tracking_number}</strong>
                          </p>
                        </div>
                        {o.tracking_url && (
                          <a href={o.tracking_url} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px', backgroundColor: '#1976d2', color: 'white', textDecoration: 'none', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', borderRadius: '4px', marginLeft: 'auto' }}>
                            <Truck size={13} /> SUIVRE MON COLIS <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div style={{ padding: '0 1.25rem 1rem', display: 'flex', gap: '0', alignItems: 'center' }}>
                    {[
                      { label: 'Commandé', done: true },
                      { label: 'Payé', done: o.payment_status === 'paid' },
                      { label: 'Expédié', done: o.shipping_status === 'shipped' || o.shipping_status === 'delivered' },
                      { label: 'Livré', done: o.shipping_status === 'delivered' },
                    ].map((step, i, arr) => (
                      <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: i < arr.length - 1 ? 1 : 0 }}>
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: step.done ? '#c9a96e' : '#e8d5b7', margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {step.done && <span style={{ color: 'white', fontSize: '11px' }}>✓</span>}
                          </div>
                          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.55rem', color: step.done ? '#c9a96e' : '#bbb', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{step.label}</p>
                        </div>
                        {i < arr.length - 1 && (
                          <div style={{ flex: 1, height: '2px', backgroundColor: step.done ? '#c9a96e' : '#e8d5b7', margin: '0 4px 14px' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'bids' && (
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 400, marginBottom: '1.25rem', color: '#1a1a1a' }}>Mes enchères</h2>
              {(() => {
                try {
                  const bids: any[] = JSON.parse(localStorage.getItem('mb_bids') || '[]')
                    .filter((b: any) => b.user_id === user?.id || b.user_email === user?.email);
                  if (!bids.length) return (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9e8e7e' }}>
                      <Gavel size={40} color="#e8d5b7" style={{ margin: '0 auto 1rem' }} />
                      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem' }}>Vous n'avez pas encore participé à une enchère</p>
                    </div>
                  );
                  return bids.map(b => (
                    <div key={b.id} style={{ border: '1px solid #e8d5b7', padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#1a1a1a', marginBottom: '4px' }}>{b.item_title}</p>
                        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e' }}>
                          Votre enchère : <strong style={{ color: '#c9a96e' }}>{(b.amount || 0).toLocaleString('fr-FR')} €</strong>
                        </p>
                      </div>
                      <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: b.is_winning ? '#2e7d32' : '#ff9800' }}>
                        {b.is_winning ? '✓ Meilleure offre' : '↑ Surenchère possible'}
                      </span>
                    </div>
                  ));
                } catch { return null; }
              })()}
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
