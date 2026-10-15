import ItemAction from './ItemAction';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock } from 'lucide-react';
import { useStore } from '../lib/store';
import { api, imgUrl } from '../lib/api';

interface Item {
  id: string;
  title: string;
  brand: string;
  category_name_fr?: string;
  photos: string[];
  fixed_price?: number;
  auction_enabled: number;
  auction_start_price?: number;
  current_bid?: number;
  auction_end_time?: string;
  condition: string;
  size?: string;
  featured?: number;
  _faved?: boolean;
}

function useCountdown(endTime?: string) {
  const [time, setTime] = useState('');
  useEffect(() => {
    if (!endTime) return;
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
  return time;
}

export default function ItemCard({ item }: { item: Item }) {
  const { user, favIds, toggleFavId, certifiedIds } = useStore();
  const countdown = useCountdown(item.auction_enabled ? item.auction_end_time : undefined);
  const faved = favIds.has(item.id);

  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    toggleFavId(item.id);
    try { await api.post(`/favorites/${item.id}`); } catch {}
  };

  const price = item.auction_enabled
    ? (item.current_bid || item.auction_start_price || 0)
    : (item.fixed_price || 0);

  const isAuction = Boolean(item.auction_enabled);
  const isEnding = countdown && countdown !== 'Terminée' && !countdown.includes('j');
  const [action, setAction] = useState<'buy' | 'bid' | null>(null);


  const [hovered, setHovered] = useState(false);

  return (
    <div className="bag-card-wrap" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Image block */}
      <div
        style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', backgroundColor: '#f7f7f5', cursor: 'pointer' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Link to={`/article/${item.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
          <img
            src={imgUrl(item.photos?.[0])}
            loading="lazy" decoding="async"
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s cubic-bezier(.25,.46,.45,.94)', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
            onError={e => { (e.currentTarget as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='260'><rect fill='%23f2f2f0' width='200' height='260'/></svg>`; }}
          />
        </Link>

        {/* Hover overlay CTA */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.38)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
          padding: '20px',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: hovered ? 'auto' : 'none',
        }}>
          {item.fixed_price && item.fixed_price > 0 && (
            <button type="button" onClick={() => setAction('buy')}
              style={{ width: '100%', background: '#fff', border: 'none', padding: '12px', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.58rem', letterSpacing: '0.22em', color: '#000', marginBottom: '8px' }}>
              ACHETER
            </button>
          )}
          {isAuction && countdown !== 'Terminée' && (
            <button type="button" onClick={() => setAction('bid')}
              style={{ width: '100%', background: '#fff', border: 'none', padding: '12px', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.58rem', letterSpacing: '0.22em', color: '#000' }}>
              ENCHÉRIR
            </button>
          )}
        </div>

        {/* Favori */}
        <button
          aria-label={faved ? "Retirer des favoris" : "Ajouter aux favoris"}
          onClick={toggleFav}
          style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
        >
          <Heart size={16} fill={faved ? '#000' : 'none'} color="#000" strokeWidth={1.5} />
        </button>

        {/* Enchère badge */}
        {isAuction && (
          <div style={{ position: 'absolute', top: '12px', left: '0', background: '#000', color: '#c9a96e', padding: '3px 10px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.45rem', letterSpacing: '0.25em' }}>
            ENCHÈRE
          </div>
        )}

        {/* Certifié */}
        {Boolean((item as any).certified) && (
          <div style={{ position: 'absolute', bottom: '12px', left: '0', background: '#000', color: '#c9a96e', padding: '3px 10px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.45rem', letterSpacing: '0.2em' }}>
            CERTIFIÉ
          </div>
        )}
      </div>

      {/* Infos sous l'image */}
      <div style={{ paddingTop: '10px' }}>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.52rem', letterSpacing: '0.18em', color: '#c9a96e', marginBottom: '3px', textTransform: 'uppercase' }}>
          {item.brand}
        </p>
        <Link to={`/article/${item.id}`} style={{ textDecoration: 'none' }}>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#000', lineHeight: 1.4, marginBottom: '6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.title}
          </p>
        </Link>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', fontWeight: 500, color: '#000', marginBottom: '4px' }}>
          {price.toLocaleString('fr-FR')} €
        </p>
        {isAuction && countdown && countdown !== 'Terminée' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={9} color={isEnding ? '#c00' : '#aaa'} />
            <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.58rem', color: isEnding ? '#c00' : '#aaa' }}>{countdown}</span>
          </div>
        )}
      </div>

      {action && <ItemAction item={item} initial={action} onClose={() => setAction(null)} />}
    </div>
  );
}
