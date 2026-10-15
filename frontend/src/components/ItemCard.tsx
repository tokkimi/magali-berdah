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


  return (
    <div className="bag-card-wrap" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', height: '100%' }}>
      <div className="bag-card" style={{
        overflow: 'hidden',
        backgroundColor: '#fff',
        border: '1px solid #e8e0d8',
        display: 'flex', flexDirection: 'column', width: '100%',
      }}>
        <Link to={`/article/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {/* Image */}
          <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', backgroundColor: '#f5f2ee', flexShrink: 0 }}>
            <img
              src={imgUrl(item.photos?.[0])}
              loading="lazy" decoding="async"
              alt={item.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
              onError={e => { (e.currentTarget as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='260'><rect fill='%23f5f2ee' width='200' height='260'/><text x='50%25' y='50%25' font-family='Georgia' font-size='12' fill='%239e8e7e' text-anchor='middle' dominant-baseline='middle'>Photo</text></svg>`; }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />

            {/* Badge enchère */}
            {isAuction && (
              <div style={{
                position: 'absolute', top: '12px', left: '0',
                background: '#1a1a1a', color: '#c9a96e',
                padding: '4px 10px',
                fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.5rem', letterSpacing: '0.2em',
              }}>
                ENCHÈRE
              </div>
            )}

            {/* Favoris */}
            <button
              aria-label={faved ? "Retirer des favoris" : "Ajouter aux favoris"}
              onClick={toggleFav}
              style={{
                position: 'absolute', top: '10px', right: '10px',
                width: '32px', height: '32px',
                background: 'rgba(255,255,255,0.9)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Heart size={14} fill={faved ? '#1a1a1a' : 'none'} color="#1a1a1a" strokeWidth={1.5} />
            </button>

            {/* Certifié */}
            {(certifiedIds.has(item.id) || (item as any).certified) && (
              <div title="Certifié Authentique" style={{
                position: 'absolute', bottom: '10px', left: '10px',
                background: '#1a1a1a', color: '#c9a96e',
                padding: '3px 8px',
                fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.48rem', letterSpacing: '0.15em',
              }}>
                CERTIFIÉ
              </div>
            )}
          </div>
        </Link>

        {/* Infos */}
        <div style={{ padding: '14px 12px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <p style={{
            fontFamily: 'Helvetica Neue, Arial, sans-serif',
            fontSize: '0.55rem', letterSpacing: '0.18em',
            color: '#c9a96e', fontWeight: 500, marginBottom: '5px',
          }}>
            {item.brand?.toUpperCase()}
          </p>

          <Link to={`/article/${item.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
            <p style={{
              fontFamily: 'Georgia, serif', fontSize: '0.88rem', fontStyle: 'italic',
              color: '#1a1a1a', lineHeight: 1.4, marginBottom: '12px',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {item.title}
            </p>
          </Link>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto' }}>
            <div>
              {isAuction && (
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.48rem', letterSpacing: '0.15em', color: '#9e8e7e', marginBottom: '2px' }}>
                  {item.current_bid ? 'OFFRE EN COURS' : 'DÉPART'}
                </p>
              )}
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.9rem', color: '#1a1a1a', fontWeight: 400, letterSpacing: '0.02em' }}>
                {price.toLocaleString('fr-FR')} €
              </p>
            </div>

            {isAuction && countdown && countdown !== 'Terminée' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={10} color={isEnding ? '#cc0000' : '#9e8e7e'} />
                <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.58rem', color: isEnding ? '#cc0000' : '#9e8e7e', letterSpacing: '0.05em' }}>
                  {countdown}
                </span>
              </div>
            )}
            {isAuction && countdown === 'Terminée' && (
              <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.55rem', color: '#bbb', letterSpacing: '0.1em' }}>TERMINÉE</span>
            )}
          </div>
        </div>

        <div className="card-actions">
          {item.fixed_price && item.fixed_price > 0 ? <button type="button" onClick={() => setAction('buy')}>Acheter · {item.fixed_price.toLocaleString('fr-FR')} €</button> : null}
          {isAuction && countdown !== 'Terminée' && <button type="button" onClick={() => setAction('bid')}>Enchérir →</button>}
        </div>
      </div>
      {action && <ItemAction item={item} initial={action} onClose={() => setAction(null)} />}
    </div>
  );
}
