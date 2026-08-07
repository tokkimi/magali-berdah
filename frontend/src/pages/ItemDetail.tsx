import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, Truck, Clock, Heart, CheckCircle, X, Trophy } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { api, imgUrl } from '../lib/api';
import { useStore, useT } from '../lib/store';
import { getAllItems } from '../lib/staticItems';

const SOCKET_URL = import.meta.env.VITE_API_URL || '';

function Countdown({ endTime }: { endTime: string }) {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setTime('Terminée'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime(d > 0 ? `${d}j ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return <span style={{ color: '#c9a96e', fontFamily: 'Georgia, serif', fontSize: '1.8rem' }}>{time}</span>;
}

export default function ItemDetail() {
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, favIds, toggleFavId, certifiedIds } = useStore();
  const [item, setItem] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [activePhoto, setActivePhoto] = useState(0);
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState(false);
  const [buying, setBuying] = useState(false);
  const [orderConfirm, setOrderConfirm] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const isStatic = id?.startsWith('static-') || id?.startsWith('admin-');

  useEffect(() => {
    if (!id) return;

    // Static item — no API call needed
    if (isStatic) {
      const found = getAllItems().find((i: any) => i.id === id);
      if (found) setItem(found);
      else navigate('/catalogue');
      return;
    }

    api.get(`/items/${id}`).then(d => {
      setItem(d.item);
      setBids(d.bids || []);
    }).catch(() => {
      // Try static fallback before redirecting
      const found = getAllItems().find((i: any) => i.id === id);
      if (found) setItem(found);
      else navigate('/catalogue');
    });

    if (SOCKET_URL) {
      const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
      socketRef.current = socket;
      socket.emit('join-item', id);
      socket.on('bid-update', (bid: any) => {
        setItem((prev: any) => prev ? { ...prev, current_bid: bid.amount } : prev);
        setBids(prev => [bid, ...prev]);
      });
      return () => { socket.disconnect(); };
    }
  }, [id]);

  const handleBid = async () => {
    if (!user) { setBidError('Connectez-vous pour enchérir.'); return; }
    setBidError('');
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) { setBidError('Montant invalide'); return; }
    const min = (item.current_bid || item.auction_start_price || 0) + 1;
    if (amount < min) { setBidError(`Enchère minimum : ${min.toLocaleString('fr-FR')} €`); return; }

    // Save bid to localStorage
    try {
      const bidsStore = JSON.parse(localStorage.getItem('mb_bids') || '[]');
      const newBid = {
        id: `bid-${Date.now()}`,
        item_id: id, item_title: item.title,
        user_id: user.id, user_email: user.email,
        amount, created_at: new Date().toISOString(),
        is_winning: true,
      };
      // mark previous bids on this item as not winning
      const updated = bidsStore.map((b: any) => b.item_id === id ? { ...b, is_winning: false } : b);
      updated.push(newBid);
      localStorage.setItem('mb_bids', JSON.stringify(updated));
      // update item locally
      setItem((prev: any) => ({ ...prev, current_bid: amount }));
      setBidSuccess(true);
      setBidAmount('');
    } catch {}

    if (!isStatic) {
      try { await api.post(`/items/${id}/bid`, { amount }); } catch {}
    }
  };

  const handleBuyNow = async () => {
    if (!user) { alert('Connectez-vous pour acheter.'); return; }
    setBuying(true);
    try {
      const orders = JSON.parse(localStorage.getItem('mb_orders') || '[]');
      const order = {
        id: `order-${Date.now()}`,
        item_id: id, item_title: item.title,
        buyer_id: user.id, buyer_email: user.email, buyer_name: user.name,
        buyer_address: user.address || '', buyer_city: user.city || '',
        amount: item.fixed_price,
        payment_status: 'paid',
        shipping_status: 'pending',
        tracking_number: null,
        seller_email: item.seller_email || null,
        seller_payout: item.seller_payout || null,
        buyer_confirmed: false,
        wallet_credited: false,
        created_at: new Date().toISOString(),
      };
      orders.push(order);
      localStorage.setItem('mb_orders', JSON.stringify(orders));

      // Credit seller pending wallet immediately on sale
      if (item.seller_email && item.seller_payout) {
        const wallet = JSON.parse(localStorage.getItem('mb_wallet') || '{}');
        if (!wallet[item.seller_email]) wallet[item.seller_email] = { pending: 0, available: 0, transactions: [] };
        wallet[item.seller_email].pending += item.seller_payout;
        wallet[item.seller_email].transactions.push({
          id: `tx-${Date.now()}`,
          order_id: order.id,
          item_title: item.title,
          amount: item.seller_payout,
          type: 'credit',
          status: 'pending',
          date: new Date().toISOString(),
        });
        localStorage.setItem('mb_wallet', JSON.stringify(wallet));
      }

      setOrderConfirm(order);
      if (!isStatic) {
        try { await api.post('/orders', { item_id: id }); } catch {}
      }
    } catch { alert('Erreur lors de la commande'); }
    finally { setBuying(false); }
  };

  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    toggleFavId(item.id); // optimistic local update always works
    if (!isStatic) {
      try { await api.post(`/favorites/${item.id}`); }
      catch { toggleFavId(item.id); }
    }
  };

  if (!item) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: '#9e8e7e', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
      Chargement...
    </div>
  );

  const faved = favIds.has(item.id);
  const minBid = (item.current_bid || item.auction_start_price || 0) + 1;
  const conditionMap: Record<string, string> = { excellent: 'Excellent état', very_good: 'Très bon état', good: 'Bon état', fair: 'État correct' };
  const isAuction = item.auction_enabled === 1 && item.auction_end_time && new Date(item.auction_end_time) > new Date();

  // Check if user has the winning bid on this auction (after it ended)
  const myWinningBid = (() => {
    if (!user || !isAuction) return null;
    if (new Date(item?.auction_end_time) > new Date()) return null;
    try {
      const bidsStore = JSON.parse(localStorage.getItem('mb_bids') || '[]');
      return bidsStore.find((b: any) => b.item_id === id && b.user_id === user.id && b.is_winning) || null;
    } catch { return null; }
  })();

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem 1rem 8rem' }}>
      <style>{`@media(max-width:640px){.detail-grid{grid-template-columns:1fr !important; gap:1.5rem !important;}}`}</style>

      {/* Order confirmation modal */}
      {orderConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', maxWidth: '460px', width: '100%', padding: '2.5rem 2rem', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setOrderConfirm(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9e8e7e' }}>
              <X size={18} />
            </button>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #c9a96e, #a8834a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle size={28} color="white" />
            </div>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.3em', color: '#c9a96e', marginBottom: '0.5rem' }}>COMMANDE CONFIRMÉE</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '0.5rem' }}>{orderConfirm.item_title}</h2>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem', color: '#1a1a1a', marginBottom: '1.5rem' }}>{(orderConfirm.amount || 0).toLocaleString('fr-FR')} €</p>
            <div style={{ backgroundColor: '#f8f4ef', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#1a1a1a', lineHeight: 1.7 }}>
                Votre commande a bien été enregistrée. Vous recevrez une confirmation par email et pourrez suivre l'envoi depuis votre compte.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/profil" onClick={() => setOrderConfirm(null)} className="btn-gold"
                style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', padding: '12px' }}>
                MES ACHATS
              </Link>
              <button onClick={() => setOrderConfirm(null)}
                style={{ flex: 1, border: '1px solid #e8d5b7', background: 'none', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', padding: '12px' }}>
                FERMER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auction win banner */}
      {myWinningBid && (
        <div style={{ backgroundColor: '#fff8e6', border: '1px solid #c9a96e', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Trophy size={20} color="#c9a96e" />
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', fontWeight: 700, color: '#a8834a', marginBottom: '2px' }}>
              Félicitations, vous avez remporté cette enchère !
            </p>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#9e8e7e' }}>
              Offre gagnante : {myWinningBid.amount.toLocaleString('fr-FR')} € · L'équipe vous contactera pour finaliser le paiement.
            </p>
          </div>
        </div>
      )}

      <Link to="/catalogue" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#9e8e7e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
        <ChevronLeft size={16} /> Retour
      </Link>

      <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>

        {/* Photos */}
        <div>
          <div style={{ backgroundColor: '#f8f4ef', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.75rem', position: 'relative' }}>
            <img
              src={imgUrl(item.photos?.[activePhoto])}
              alt={item.title}
              style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }}
              onError={e => { (e.currentTarget as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='533'><rect fill='%23f5f0eb' width='400' height='533'/><text x='50%25' y='50%25' font-family='Georgia' font-size='16' fill='%239e8e7e' text-anchor='middle' dominant-baseline='middle'>Photo</text></svg>`; }}
            />
            {/* Fav button */}
            <button onClick={toggleFav} style={{ position: 'absolute', top: '12px', right: '12px', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              <Heart size={16} fill={faved ? '#c9a96e' : 'none'} color={faved ? '#c9a96e' : '#555'} />
            </button>
          </div>
          {item.photos?.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
              {item.photos.map((p: string, i: number) => (
                <button key={i} onClick={() => setActivePhoto(i)}
                  style={{ flexShrink: 0, width: '64px', height: '80px', border: `2px solid ${i === activePhoto ? '#c9a96e' : 'transparent'}`, borderRadius: '4px', padding: 0, cursor: 'pointer', overflow: 'hidden' }}>
                  <img src={imgUrl(p)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Détails */}
        <div>
          {/* Marque */}
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.3em', color: '#c9a96e', marginBottom: '6px' }}>
            {item.brand?.toUpperCase()}
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '0.5rem', lineHeight: '1.25' }}>
            {item.title}
            {(certifiedIds.has(item.id) || item.certified) ? (
              <span title="Certifié Authentique par Magali Berdah" style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle',
                marginLeft: '10px', background: 'linear-gradient(135deg, #c9a96e, #a8834a)',
                color: 'white', padding: '3px 10px', borderRadius: '20px',
                fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.1em', fontWeight: 700,
                boxShadow: '0 2px 8px rgba(201,169,110,0.35)',
              }}>
                ✓ CERTIFIÉ AUTHENTIQUE
              </span>
            ) : null}
          </h1>
          {item.category_name_fr && (
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', marginBottom: '1.5rem' }}>{item.category_name_fr}</p>
          )}

          {/* Prix / Enchère */}
          <div style={{ borderTop: '1px solid #e8d5b7', borderBottom: '1px solid #e8d5b7', padding: '1.25rem 0', marginBottom: '1.5rem' }}>
            {isAuction ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', color: '#9e8e7e', letterSpacing: '0.15em', marginBottom: '4px' }}>
                      {item.current_bid ? 'OFFRE ACTUELLE' : 'MISE DE DÉPART'}
                    </p>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', color: '#1a1a1a' }}>
                      {(item.current_bid || item.auction_start_price || 0).toLocaleString('fr-FR')} €
                    </p>
                    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e', marginTop: '2px' }}>
                      {bids.length} offre{bids.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', color: '#9e8e7e', letterSpacing: '0.1em', marginBottom: '4px' }}>TEMPS RESTANT</p>
                    <Countdown endTime={item.auction_end_time} />
                  </div>
                </div>
                {user ? (
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                        placeholder={`Min. ${minBid.toLocaleString('fr-FR')} €`}
                        style={{ flex: 1, border: '1px solid #e8d5b7', padding: '12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.9rem', borderRadius: '2px' }} />
                      <button onClick={handleBid} className="btn-gold" style={{ padding: '0 1.5rem', fontSize: '0.8rem' }}>ENCHÉRIR</button>
                    </div>
                    {bidError && <p style={{ color: '#cc0000', fontSize: '0.8rem', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>{bidError}</p>}
                    {bidSuccess && <p style={{ color: '#2e7d32', fontSize: '0.8rem', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>✓ Offre placée !</p>}
                  </div>
                ) : (
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#9e8e7e' }}>
                    <Link to="#" style={{ color: '#c9a96e' }}>Connectez-vous</Link> pour enchérir
                  </p>
                )}
              </>
            ) : item.fixed_price ? (
              <>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '2.2rem', color: '#1a1a1a', marginBottom: '1rem' }}>
                  {item.fixed_price.toLocaleString('fr-FR')} €
                </p>
                {user ? (
                  <button onClick={handleBuyNow} disabled={buying || item.status === 'sold'} className="btn-gold"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '1rem', letterSpacing: '0.1em' }}>
                    {item.status === 'sold' ? 'VENDU' : buying ? 'Traitement...' : 'ACHETER MAINTENANT'}
                  </button>
                ) : (
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#9e8e7e' }}>
                    <Link to="#" style={{ color: '#c9a96e' }}>Connectez-vous</Link> pour acheter
                  </p>
                )}
              </>
            ) : null}
          </div>

          {/* Attributs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1.5rem' }}>
            {[
              { label: 'ÉTAT', value: conditionMap[item.condition] || item.condition },
              ...(item.size && item.size !== 'Taille unique' ? [{ label: 'TAILLE', value: item.size }] : []),
              ...(item.color ? [{ label: 'COULEUR', value: item.color }] : []),
              ...(item.material ? [{ label: 'MATIÈRE', value: item.material }] : []),
            ].map(attr => (
              <div key={attr.label} style={{ backgroundColor: '#f8f4ef', padding: '0.75rem', borderRadius: '4px' }}>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.12em', color: '#9e8e7e', marginBottom: '3px' }}>{attr.label}</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#1a1a1a' }}>{attr.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {item.description && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#9e8e7e', marginBottom: '8px' }}>DESCRIPTION</p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.88rem', color: '#1a1a1a', lineHeight: '1.75' }}>{item.description}</p>
            </div>
          )}

          {/* Trust */}
          <div style={{ display: 'flex', gap: '1.25rem', borderTop: '1px solid #e8d5b7', paddingTop: '1.25rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {[
              { icon: Shield, text: 'Vendeur vérifié' },
              { icon: Truck, text: 'Livraison incluse' },
              { icon: Clock, text: 'Retour 14 jours' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon size={14} color="#c9a96e" />
                <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e' }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Boutique */}
          {item.shop_name && (
            <Link to={`/catalogue?shop_id=${item.shop_id}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ padding: '1rem', border: '1px solid #e8d5b7', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#c9a96e'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#e8d5b7'}>
                <div style={{ width: '44px', height: '44px', backgroundColor: '#f8f4ef', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid #e8d5b7', overflow: 'hidden' }}>
                  {item.shop_avatar ? (
                    <img src={imgUrl(item.shop_avatar)} alt={item.shop_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#c9a96e' }}>{item.shop_name[0]}</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#1a1a1a', fontWeight: 600 }}>{item.shop_name}</p>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e' }}>Boutique professionnelle vérifiée · Voir tous ses articles →</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Historique enchères */}
      {bids.length > 0 && (
        <div style={{ marginTop: '3rem', borderTop: '1px solid #e8d5b7', paddingTop: '2rem' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 400, marginBottom: '1.25rem' }}>Historique des enchères</h2>
          <div style={{ maxWidth: '480px' }}>
            {bids.map((bid, i) => (
              <div key={bid.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f0ece6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {i === 0 && <span style={{ backgroundColor: '#c9a96e', color: 'white', fontSize: '0.55rem', padding: '2px 6px', fontFamily: 'Helvetica Neue, Arial, sans-serif', letterSpacing: '0.08em' }}>MEILLEURE</span>}
                  <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#1a1a1a' }}>{bid.bidder_name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: '#1a1a1a' }}>{bid.amount.toLocaleString('fr-FR')} €</p>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#9e8e7e' }}>
                    {new Date(bid.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
