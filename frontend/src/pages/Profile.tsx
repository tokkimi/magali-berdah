import { useEffect, useState } from 'react';
import { useStore, useT } from '../lib/store';
import { api } from '../lib/api';
import { User, Package, Gavel, Heart, Truck, ExternalLink, Send, ShoppingBag, Wallet, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllItems } from '../lib/staticItems';
import ItemCard from '../components/ItemCard';

function loadMyOrders(userId: string): any[] {
  try {
    const all = JSON.parse(localStorage.getItem('mb_orders') || '[]');
    return all.filter((o: any) => o.buyer_id === userId || o.buyer_email === userId);
  } catch { return []; }
}

function getWallet(email: string) {
  try {
    const w = JSON.parse(localStorage.getItem('mb_wallet') || '{}');
    return w[email] || { pending: 0, available: 0, transactions: [] };
  } catch { return { pending: 0, available: 0, transactions: [] }; }
}

function saveWallet(email: string, data: any) {
  try {
    const w = JSON.parse(localStorage.getItem('mb_wallet') || '{}');
    w[email] = data;
    localStorage.setItem('mb_wallet', JSON.stringify(w));
  } catch {}
}

export default function Profile() {
  const t = useT();
  const { user, updateUser, favIds } = useStore();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '', city: user?.city || '', country: user?.country || 'FR' });
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>({ pending: 0, available: 0, transactions: [] });
  const [transferDone, setTransferDone] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (tab === 'orders') {
      const local = loadMyOrders(user.id || user.email);
      setOrders(local);
      api.get('/orders/mine').then(d => {
        if (d.orders?.length) setOrders(d.orders);
      }).catch(() => {});
    }
    if (tab === 'wallet') {
      setWallet(getWallet(user.email));
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

  const confirmReceived = (order: any) => {
    // Mark order as delivered + buyer_confirmed
    const all = JSON.parse(localStorage.getItem('mb_orders') || '[]');
    const updated = all.map((o: any) => o.id === order.id
      ? { ...o, shipping_status: 'delivered', buyer_confirmed: true, wallet_credited: true }
      : o
    );
    localStorage.setItem('mb_orders', JSON.stringify(updated));
    setOrders(prev => prev.map(o => o.id === order.id
      ? { ...o, shipping_status: 'delivered', buyer_confirmed: true }
      : o
    ));

    // Credit seller wallet: move from pending to available
    if (order.seller_email && order.seller_payout && !order.wallet_credited) {
      const w = getWallet(order.seller_email);
      w.pending = Math.max(0, (w.pending || 0) - order.seller_payout);
      w.available = (w.available || 0) + order.seller_payout;
      w.transactions = (w.transactions || []).map((tx: any) =>
        tx.order_id === order.id ? { ...tx, status: 'available' } : tx
      );
      saveWallet(order.seller_email, w);
      // Refresh own wallet if user is the seller
      if (order.seller_email === user?.email) setWallet({ ...w });
    }
  };

  const requestTransfer = () => {
    if (!user || wallet.available <= 0) return;
    const w = { ...wallet };
    w.transactions = [...(w.transactions || []), {
      id: `tx-${Date.now()}`,
      item_title: 'Virement demandé',
      amount: w.available,
      type: 'transfer',
      status: 'requested',
      date: new Date().toISOString(),
    }];
    w.available = 0;
    saveWallet(user.email, w);
    setWallet(w);
    setTransferDone(true);
    setTimeout(() => setTransferDone(false), 5000);
  };

  const favItems = getAllItems().filter((item: any) => favIds.has(item.id));
  const mySellerItems = user ? getAllItems().filter((item: any) => item.seller_email === user.email) : [];

  const tabs = [
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'orders', label: t('myOrders'), icon: Package },
    { id: 'bids', label: t('myBids'), icon: Gavel },
    { id: 'my-items', label: 'Mes articles', icon: ShoppingBag },
    { id: 'wallet', label: 'Cagnotte', icon: Wallet },
    { id: 'submissions', label: 'Soumissions', icon: Send },
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
          {user.verified && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2e7d32', fontSize: '0.72rem', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>✓ Compte vérifié</span>}
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

          {/* ── PROFIL ── */}
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

          {/* ── MES ACHATS ── */}
          {tab === 'orders' && (
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 400, marginBottom: '1.25rem', color: '#1a1a1a' }}>Mes achats</h2>
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9e8e7e' }}>
                  <Package size={40} color="#e8d5b7" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem' }}>Aucun achat pour le moment</p>
                </div>
              ) : orders.map(o => (
                <div key={o.id} style={{ border: `1px solid ${o.buyer_confirmed ? '#c3e6cb' : o.shipping_status === 'shipped' ? '#bee5eb' : '#e8d5b7'}`, marginBottom: '1rem', overflow: 'hidden' }}>
                  {/* Status bar */}
                  <div style={{ padding: '6px 14px', backgroundColor: o.buyer_confirmed ? '#d4edda' : o.shipping_status === 'shipped' ? '#d1ecf1' : o.payment_status === 'paid' ? '#fff3cd' : '#f8f4ef', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {o.buyer_confirmed
                      ? <><CheckCircle size={13} color="#2e7d32" /><span style={{ color: '#2e7d32', fontSize: '0.72rem', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontWeight: 700 }}>REÇU — MERCI !</span></>
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
                        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1a1a1a' }}>
                          {o.carrier_label} · <strong>{o.tracking_number}</strong>
                        </p>
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
                      { label: 'Expédié', done: o.shipping_status === 'shipped' || o.buyer_confirmed },
                      { label: 'Reçu', done: !!o.buyer_confirmed },
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

                  {/* Bien reçu button */}
                  {o.shipping_status === 'shipped' && !o.buyer_confirmed && (
                    <div style={{ padding: '0 1.25rem 1.25rem' }}>
                      <button onClick={() => confirmReceived(o)} className="btn-gold"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', fontSize: '0.78rem', padding: '12px' }}>
                        <CheckCircle size={16} /> J'AI BIEN REÇU MON COLIS
                      </button>
                      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#9e8e7e', textAlign: 'center', marginTop: '6px' }}>
                        Confirmez la réception pour valider la transaction
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── MES ENCHÈRES ── */}
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

          {/* ── MES ARTICLES EN VENTE ── */}
          {tab === 'my-items' && (
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 400, marginBottom: '0.5rem', color: '#1a1a1a' }}>Mes articles en vente</h2>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', marginBottom: '1.5rem' }}>
                Articles mis en vente par Magali Berdah à partir de vos pièces soumises
              </p>
              {mySellerItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: 'white', border: '1px solid #e8d5b7' }}>
                  <ShoppingBag size={40} color="#e8d5b7" style={{ margin: '0 auto 1rem', display: 'block' }} />
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#9e8e7e', marginBottom: '1rem' }}>
                    Aucun article en vente pour le moment
                  </p>
                  <Link to="/soumettre" className="btn-gold" style={{ fontSize: '0.72rem', textDecoration: 'none' }}>
                    SOUMETTRE UN ARTICLE
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {mySellerItems.map((item: any) => {
                    const isAuction = item.auction_enabled === 1;
                    const isSold = item.status === 'sold';
                    const auctionEnded = isAuction && item.auction_end_time && new Date(item.auction_end_time) < new Date();

                    return (
                      <div key={item.id} style={{ backgroundColor: 'white', border: `1px solid ${isSold || auctionEnded ? '#c3e6cb' : '#e8d5b7'}`, overflow: 'hidden' }}>
                        <div style={{ padding: '8px 16px', backgroundColor: isSold || auctionEnded ? '#d4edda' : isAuction ? '#fff8e6' : '#f8f4ef', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: isSold || auctionEnded ? '#2e7d32' : isAuction ? '#a8834a' : '#9e8e7e' }}>
                            {isSold ? 'VENDU' : auctionEnded ? 'ENCHÈRE TERMINÉE' : isAuction ? 'ENCHÈRE EN COURS' : 'EN VENTE'}
                          </span>
                          {item.seller_payout && (
                            <span style={{ marginLeft: 'auto', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#c9a96e', fontWeight: 700 }}>
                              Cagnotte : {item.seller_payout.toLocaleString('fr-FR')} €
                            </span>
                          )}
                        </div>
                        <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                          {item.photos?.[0] && (
                            <img src={item.photos[0]} alt={item.title}
                              style={{ width: '70px', height: '90px', objectFit: 'cover', backgroundColor: '#f8f4ef', flexShrink: 0 }}
                              onError={e => (e.currentTarget.style.display = 'none')} />
                          )}
                          <div style={{ flex: 1 }}>
                            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#c9a96e', marginBottom: '3px' }}>{item.brand?.toUpperCase()}</p>
                            <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#1a1a1a', marginBottom: '6px' }}>{item.title}</p>
                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                              {isAuction ? (
                                <div>
                                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', color: '#9e8e7e', letterSpacing: '0.1em' }}>
                                    {auctionEnded ? 'PRIX FINAL' : 'OFFRE EN COURS'}
                                  </p>
                                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#1a1a1a' }}>
                                    {(item.current_bid || item.auction_start_price || 0).toLocaleString('fr-FR')} €
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', color: '#9e8e7e', letterSpacing: '0.1em' }}>PRIX DE VENTE</p>
                                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#1a1a1a' }}>
                                    {(item.fixed_price || 0).toLocaleString('fr-FR')} €
                                  </p>
                                </div>
                              )}
                              {item.seller_payout && (
                                <div>
                                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', color: '#9e8e7e', letterSpacing: '0.1em' }}>VOTRE CAGNOTTE</p>
                                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#c9a96e' }}>
                                    {item.seller_payout.toLocaleString('fr-FR')} €
                                  </p>
                                </div>
                              )}
                            </div>
                            {isAuction && !auctionEnded && item.auction_end_time && (
                              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e', marginTop: '6px' }}>
                                Fin : {new Date(item.auction_end_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                          <Link to={`/article/${item.id}`}
                            style={{ flexShrink: 0, fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#c9a96e', textDecoration: 'none', marginTop: '4px' }}>
                            Voir →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── CAGNOTTE ── */}
          {tab === 'wallet' && (
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 400, marginBottom: '0.5rem', color: '#1a1a1a' }}>Ma cagnotte</h2>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', marginBottom: '1.5rem' }}>
                Le virement est possible uniquement après confirmation de réception par l'acheteur
              </p>

              {/* Solde */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: wallet.available > 0 ? '#fff8e6' : 'white', border: `2px solid ${wallet.available > 0 ? '#c9a96e' : '#e8d5b7'}`, padding: '1.5rem', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#9e8e7e', marginBottom: '8px' }}>DISPONIBLE</p>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', color: wallet.available > 0 ? '#c9a96e' : '#1a1a1a' }}>
                    {(wallet.available || 0).toLocaleString('fr-FR')} €
                  </p>
                  {wallet.available > 0 && (
                    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#a8834a', marginTop: '4px' }}>
                      ✓ Virement possible
                    </p>
                  )}
                </div>
                <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#9e8e7e', marginBottom: '8px' }}>EN ATTENTE</p>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', color: '#9e8e7e' }}>
                    {(wallet.pending || 0).toLocaleString('fr-FR')} €
                  </p>
                  {wallet.pending > 0 && (
                    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#9e8e7e', marginTop: '4px' }}>
                      En attente de réception acheteur
                    </p>
                  )}
                </div>
              </div>

              {/* Transfer button */}
              <button onClick={requestTransfer} disabled={wallet.available <= 0}
                className="btn-gold"
                style={{ width: '100%', padding: '14px', fontSize: '0.82rem', letterSpacing: '0.1em', opacity: wallet.available > 0 ? 1 : 0.4, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Wallet size={16} /> DEMANDER UN VIREMENT
              </button>
              {wallet.available <= 0 && (
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#9e8e7e', textAlign: 'center', marginTop: '-1rem', marginBottom: '1.5rem' }}>
                  Le virement sera possible dès que l'acheteur aura confirmé la réception
                </p>
              )}
              {transferDone && (
                <div style={{ backgroundColor: '#d4edda', border: '1px solid #c3e6cb', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#2e7d32', fontWeight: 700 }}>
                    ✓ Demande de virement envoyée !
                  </p>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#2e7d32', marginTop: '4px' }}>
                    L'équipe vous contactera sous 2-3 jours ouvrés
                  </p>
                </div>
              )}

              {/* Transaction history */}
              {wallet.transactions?.length > 0 && (
                <div>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#9e8e7e', marginBottom: '0.75rem' }}>HISTORIQUE</p>
                  {[...(wallet.transactions || [])].reverse().map((tx: any) => (
                    <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f0ece6' }}>
                      <div>
                        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#1a1a1a' }}>
                          {tx.item_title}
                        </p>
                        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#9e8e7e' }}>
                          {new Date(tx.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {' · '}
                          <span style={{ color: tx.status === 'available' ? '#2e7d32' : tx.status === 'requested' ? '#1976d2' : '#b45309' }}>
                            {tx.status === 'available' ? 'Disponible' : tx.status === 'requested' ? 'Virement demandé' : 'En attente'}
                          </span>
                        </p>
                      </div>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: tx.type === 'transfer' ? '#cc0000' : '#2e7d32' }}>
                        {tx.type === 'transfer' ? '-' : '+'}{tx.amount.toLocaleString('fr-FR')} €
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {(!wallet.transactions || wallet.transactions.length === 0) && wallet.available === 0 && wallet.pending === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9e8e7e', border: '1px solid #e8d5b7' }}>
                  <Wallet size={36} color="#e8d5b7" style={{ margin: '0 auto 1rem', display: 'block' }} />
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem' }}>
                    Votre cagnotte est vide pour le moment
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── SOUMISSIONS ── */}
          {tab === 'submissions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 400, color: '#1a1a1a' }}>Mes soumissions</h2>
                <Link to="/mes-soumissions" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#c9a96e', textDecoration: 'none' }}>
                  Voir tout →
                </Link>
              </div>
              {(() => {
                try {
                  const all = JSON.parse(localStorage.getItem('mb_submissions') || '[]');
                  const mine = all.filter((s: any) => s.email === user?.email);
                  if (!mine.length) return (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#9e8e7e' }}>
                      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', marginBottom: '1rem' }}>Aucune soumission</p>
                      <Link to="/soumettre" className="btn-gold" style={{ fontSize: '0.72rem', textDecoration: 'none' }}>SOUMETTRE UN ARTICLE</Link>
                    </div>
                  );
                  const colors: Record<string, string> = { pending: '#b45309', approved: '#2e7d32', rejected: '#cc0000' };
                  const labels: Record<string, string> = { pending: 'En cours de révision', approved: 'Validé ✓', rejected: 'Rejeté' };
                  return mine.map((s: any) => (
                    <div key={s.id} style={{ border: '1px solid #e8d5b7', padding: '1rem 1.25rem', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: '#1a1a1a', marginBottom: '3px' }}>{s.brand}</p>
                        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e' }}>{s.category}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: colors[s.status] || '#9e8e7e' }}>
                          {labels[s.status] || s.status}
                        </p>
                        {s.status === 'approved' && !s.tracking_sent && (
                          <Link to="/mes-soumissions" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#1976d2', textDecoration: 'none' }}>
                            → Entrer le numéro de suivi
                          </Link>
                        )}
                      </div>
                    </div>
                  ));
                } catch { return null; }
              })()}
            </div>
          )}

          {/* ── FAVORIS ── */}
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

const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'Helvetica Neue, Arial, sans-serif',
  fontSize: '0.65rem', letterSpacing: '0.1em', color: '#9e8e7e', marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid #e8d5b7', padding: '10px 12px',
  fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#1a1a1a',
  boxSizing: 'border-box',
};
