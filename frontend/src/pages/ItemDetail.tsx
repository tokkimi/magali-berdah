import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, Truck, Clock, Heart, CheckCircle, X, Trophy } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { api, imgUrl } from '../lib/api';
import { useStore, useT } from '../lib/store';
import { getAllItems } from '../lib/staticItems';
import { getSharedBids, getSharedItem, placeSharedBid, subscribeToSharedAuctions } from '../lib/marketplace';

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
  const [showWalletInput, setShowWalletInput] = useState(false);
  const [walletInput, setWalletInput] = useState('');
  const [showBidAuth, setShowBidAuth] = useState(false);
  const [pendingBidAmount, setPendingBidAmount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const isStatic = id?.startsWith('static-') || id?.startsWith('admin-');
  const isShared = id?.startsWith('item-');
  const isSharedItem = Boolean(item?.__shared);

  useEffect(() => {
    if (!item) return;
    document.title = `${item.title} | Magali Berdah`;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.productSchema = 'true';
    script.text = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Product', name: item.title,
      image: item.images || (item.image ? [item.image] : []), description: item.description || item.title,
      brand: item.brand ? { '@type': 'Brand', name: item.brand } : undefined,
      offers: { '@type': 'Offer', priceCurrency: 'EUR', price: item.fixed_price || item.current_bid || item.auction_start_price, availability: 'https://schema.org/InStock', url: window.location.href },
    });
    document.head.querySelector('script[data-product-schema]')?.remove();
    document.head.appendChild(script);
    return () => script.remove();
  }, [item]);

  useEffect(() => {
    if (!id) return;

    // Static item — no API call needed
    if (isStatic) {
      const refresh = async () => {
        const shared = await getSharedItem(id);
        if (shared) { setItem(shared); setBids(await getSharedBids(id)); return; }
        const found = getAllItems().find((i: any) => i.id === id);
        if (found) setItem(found); else navigate('/catalogue');
      };
      void refresh();
      return subscribeToSharedAuctions(() => { void refresh(); });
    }

    if (isShared) {
      const refresh = async () => {
        const [sharedItem, sharedBids] = await Promise.all([getSharedItem(id), getSharedBids(id)]);
        if (sharedItem) { setItem(sharedItem); setBids(sharedBids); }
        else navigate('/catalogue');
      };
      void refresh();
      return subscribeToSharedAuctions(() => { void refresh(); });
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
  }, [id, isShared, isStatic, navigate]);

  const confirmBid = async (amount: number) => {
    setShowBidAuth(false);
    // record pre-authorization
    try {
      const auths = JSON.parse(localStorage.getItem('mb_bid_authorizations') || '[]');
      auths.push({ item_id: id, user_email: user!.email, amount, authorized_at: new Date().toISOString(), status: 'authorized' });
      localStorage.setItem('mb_bid_authorizations', JSON.stringify(auths));
    } catch {}

    if (isSharedItem || isShared) {
      try {
        await placeSharedBid(id!, amount);
        setBidSuccess(true);
        setBidAmount('');
        const [freshItem, freshBids] = await Promise.all([getSharedItem(id!), getSharedBids(id!)]);
        setItem(freshItem); setBids(freshBids);
      } catch (error: unknown) {
        setBidError(error instanceof Error ? error.message : 'Impossible de placer cette offre.');
      }
      return;
    }

    try {
      const bidsStore = JSON.parse(localStorage.getItem('mb_bids') || '[]');
      const newBid = {
        id: `bid-${Date.now()}`,
        item_id: id, item_title: item.title,
        user_id: user!.id, user_email: user!.email,
        amount, created_at: new Date().toISOString(),
        is_winning: true,
      };
      const updated = bidsStore.map((b: any) => b.item_id === id ? { ...b, is_winning: false } : b);
      updated.push(newBid);
      localStorage.setItem('mb_bids', JSON.stringify(updated));
      setItem((prev: any) => ({ ...prev, current_bid: amount }));
      setBidSuccess(true);
      setBidAmount('');
    } catch {}

    if (!isStatic) {
      try { await api.post(`/items/${id}/bid`, { amount }); } catch {}
    }
  };

  const handleBid = async () => {
    if (!user) { setBidError('Connectez-vous pour enchérir.'); return; }
    setBidError('');
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) { setBidError('Montant invalide'); return; }
    const min = (item.current_bid || item.auction_start_price || 0) + 1;
    if (amount < min) { setBidError(`Enchère minimum : ${min.toLocaleString('fr-FR')} €`); return; }

    // Show pre-authorization confirmation before placing bid
    setPendingBidAmount(amount);
    setShowBidAuth(true);
  };

  // Wallet balance for buy-with-wallet option
  const userWallet = (() => {
    if (!user) return { available: 0 };
    try { const w = JSON.parse(localStorage.getItem('mb_wallet') || '{}'); return w[user.email] || { available: 0 }; } catch { return { available: 0 }; }
  })();

  // walletAmount: how much of the wallet to use (0 = card only, full price = wallet only, in between = split)
  const handleBuyNow = async (walletAmount = 0) => {
    if (!user) { alert('Connectez-vous pour acheter.'); return; }
    const price = item.fixed_price;
    const usedWallet = Math.min(walletAmount, userWallet.available, price);
    const cardAmount = price - usedWallet;
    setBuying(true);
    try {
      const orders = JSON.parse(localStorage.getItem('mb_orders') || '[]');
      const order = {
        id: `order-${Date.now()}`,
        item_id: id, item_title: item.title,
        buyer_id: user.id, buyer_email: user.email, buyer_name: user.name,
        buyer_address: user.address || '', buyer_city: user.city || '',
        amount: price,
        wallet_amount: usedWallet,
        card_amount: cardAmount,
        payment_status: 'paid',
        payment_via_wallet: usedWallet > 0,
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

      // Deduct wallet portion from buyer's wallet
      if (usedWallet > 0) {
        const allWallets = JSON.parse(localStorage.getItem('mb_wallet') || '{}');
        const w = allWallets[user.email] || { pending: 0, available: 0, transactions: [] };
        w.available = Math.max(0, (w.available || 0) - usedWallet);
        w.transactions = [...(w.transactions || []), {
          id: `tx-${Date.now()}`, item_title: item.title,
          amount: usedWallet, type: 'purchase', status: 'used', date: new Date().toISOString(),
        }];
        allWallets[user.email] = w;
        localStorage.setItem('mb_wallet', JSON.stringify(allWallets));
      }

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

      {/* Bid pre-authorization modal */}
      {showBidAuth && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', maxWidth: '440px', width: '100%', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowBidAuth(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9e8e7e' }}>
              <X size={18} />
            </button>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #c9a96e, #a8834a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Shield size={24} color="white" />
            </div>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 400, textAlign: 'center', marginBottom: '0.75rem' }}>Confirmation d'enchère</h3>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#555', textAlign: 'center', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Votre carte bancaire sera <strong>pré-autorisée</strong> pour&nbsp;
              <strong style={{ color: '#1a1a1a' }}>{pendingBidAmount.toLocaleString('fr-FR')} €</strong>.
              <br />Cette autorisation est annulée automatiquement si vous ne remportez pas l'enchère. Vous ne serez débité qu'en cas de victoire.
            </p>
            <div style={{ backgroundColor: '#fdf9f4', border: '1px solid #e8d5b7', padding: '12px', marginBottom: '1.25rem', fontSize: '0.75rem', fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#9e8e7e', lineHeight: 1.5 }}>
              En confirmant, vous acceptez d'être lié par cette enchère conformément à nos <a href="/cgv" style={{ color: '#c9a96e' }}>CGV</a>. Toute enchère est irrévocable.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowBidAuth(false)} style={{ flex: 1, padding: '12px', border: '1px solid #e8d5b7', background: 'white', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', cursor: 'pointer', color: '#9e8e7e' }}>
                Annuler
              </button>
              <button onClick={() => confirmBid(pendingBidAmount)} className="btn-gold" style={{ flex: 1, padding: '12px', fontSize: '0.8rem' }}>
                Confirmer — {pendingBidAmount.toLocaleString('fr-FR')} €
              </button>
            </div>
          </div>
        </div>
      )}

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
              {orderConfirm.wallet_amount > 0 && (
                <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem' }}>
                  <span style={{ color: '#a8834a' }}>💰 Cagnotte</span>
                  <span style={{ color: '#a8834a', fontWeight: 700 }}>−{orderConfirm.wallet_amount.toLocaleString('fr-FR')} €</span>
                </div>
              )}
              {orderConfirm.card_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem' }}>
                  <span style={{ color: '#9e8e7e' }}>💳 Carte bancaire</span>
                  <span style={{ color: '#1a1a1a', fontWeight: 700 }}>{orderConfirm.card_amount.toLocaleString('fr-FR')} €</span>
                </div>
              )}
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#9e8e7e', marginTop: '10px', lineHeight: 1.6 }}>
                Commande enregistrée. Suivez l'état de votre livraison depuis votre compte.
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
          {item.videos?.length > 0 && (
            <div style={{ marginTop: '1rem', display: 'grid', gap: '10px' }}>
              {item.videos.map((video: string, i: number) => (
                <video key={video} src={video} controls playsInline preload="metadata" aria-label={`Vidéo de l’article ${i + 1}`} style={{ width: '100%', maxHeight: '520px', background: '#111', borderRadius: '8px' }} />
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {item.status === 'sold' ? (
                      <button disabled className="btn-gold" style={{ width: '100%', fontSize: '0.85rem', padding: '1rem', opacity: 0.5 }}>VENDU</button>
                    ) : buying ? (
                      <button disabled className="btn-gold" style={{ width: '100%', fontSize: '0.85rem', padding: '1rem' }}>Traitement...</button>
                    ) : (() => {
                      const price = item.fixed_price;
                      const avail = userWallet.available || 0;
                      const walletUsed = Math.min(Math.max(0, parseFloat(walletInput) || 0), avail, price);
                      const cardPart = price - walletUsed;
                      return (
                        <>
                          <button onClick={() => handleBuyNow(0)} className="btn-gold"
                            style={{ width: '100%', fontSize: '0.85rem', padding: '1rem', letterSpacing: '0.1em' }}>
                            ACHETER MAINTENANT
                          </button>

                          {avail > 0 && (
                            <>
                              {!showWalletInput ? (
                                <button onClick={() => { setShowWalletInput(true); setWalletInput(String(Math.min(avail, price))); }}
                                  style={{ width: '100%', padding: '0.9rem', border: '1px solid #c9a96e', background: '#fff8e6', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#a8834a' }}>
                                  💰 Utiliser ma cagnotte ({avail.toLocaleString('fr-FR')} € disponible)
                                </button>
                              ) : (
                                <div style={{ border: '1px solid #c9a96e', background: '#fff8e6', padding: '1rem' }}>
                                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#a8834a', marginBottom: '10px' }}>
                                    MONTANT À UTILISER SUR MA CAGNOTTE
                                  </p>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <input
                                      type="range" min={0} max={Math.min(avail, price)} step={1}
                                      value={walletInput || 0}
                                      onChange={e => setWalletInput(e.target.value)}
                                      style={{ flex: 1, accentColor: '#c9a96e' }}
                                    />
                                    <div style={{ position: 'relative', width: '90px' }}>
                                      <input
                                        type="number" min={0} max={Math.min(avail, price)} step={1}
                                        value={walletInput}
                                        onChange={e => {
                                          const v = Math.min(parseFloat(e.target.value) || 0, avail, price);
                                          setWalletInput(String(v));
                                        }}
                                        style={{ width: '100%', padding: '6px 24px 6px 8px', border: '1px solid #c9a96e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.88rem', color: '#a8834a', backgroundColor: 'white', boxSizing: 'border-box' }}
                                      />
                                      <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: '#a8834a' }}>€</span>
                                    </div>
                                  </div>

                                  {/* Récap */}
                                  <div style={{ borderTop: '1px solid #e8d5b7', paddingTop: '10px', marginBottom: '12px' }}>
                                    {walletUsed > 0 && (
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', marginBottom: '4px' }}>
                                        <span style={{ color: '#a8834a' }}>💰 Cagnotte</span>
                                        <span style={{ color: '#a8834a', fontWeight: 700 }}>−{walletUsed.toLocaleString('fr-FR')} €</span>
                                      </div>
                                    )}
                                    {cardPart > 0 && (
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', marginBottom: '4px' }}>
                                        <span style={{ color: '#9e8e7e' }}>💳 Carte</span>
                                        <span style={{ color: '#1a1a1a', fontWeight: 700 }}>{cardPart.toLocaleString('fr-FR')} €</span>
                                      </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Georgia, serif', fontSize: '0.9rem', borderTop: '1px solid #e8d5b7', paddingTop: '6px', marginTop: '4px' }}>
                                      <span>Total</span>
                                      <span>{price.toLocaleString('fr-FR')} €</span>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleBuyNow(walletUsed)}
                                      disabled={walletUsed === 0}
                                      className="btn-gold"
                                      style={{ flex: 1, fontSize: '0.78rem', opacity: walletUsed > 0 ? 1 : 0.5 }}>
                                      CONFIRMER
                                    </button>
                                    <button onClick={() => { setShowWalletInput(false); setWalletInput(''); }}
                                      style={{ padding: '10px 14px', border: '1px solid #e8d5b7', background: 'none', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e' }}>
                                      ANNULER
                                    </button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </>
                      );
                    })()}
                  </div>
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
