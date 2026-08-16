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

  const isAuction = item.auction_enabled === 1;
  const isEnding = countdown && countdown !== 'Terminée' && !countdown.includes('j');

  return (
    <Link to={`/article/${item.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', height: '100%' }}>
      <div style={{
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'flex', flexDirection: 'column', width: '100%',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)';
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', height: '200px', overflow: 'hidden', backgroundColor: '#f8f4ef', flexShrink: 0 }}>
          <img
            src={imgUrl(item.photos?.[0])}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onError={e => { (e.currentTarget as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect fill='%23f5f0eb' width='200' height='200'/><text x='50%25' y='50%25' font-family='Georgia' font-size='12' fill='%239e8e7e' text-anchor='middle' dominant-baseline='middle'>Photo</text></svg>`; }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />

          {/* Badge enchère */}
          {isAuction && (
            <div style={{
              position: 'absolute', top: '8px', left: '8px',
              background: '#1a1a1a', color: '#c9a96e',
              padding: '3px 8px', borderRadius: '4px',
              fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.55rem', letterSpacing: '0.1em',
            }}>
              ENCHÈRE
            </div>
          )}

          {/* Cœur favoris + icône certifié */}
          <div style={{ position: 'absolute', bottom: '8px', right: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {(certifiedIds.has(item.id) || (item as any).certified) && (
              <div title="Certifié Authentique" style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #c9a96e, #a8834a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(201,169,110,0.45)',
              }}>
                <span style={{ color: 'white', fontSize: '11px', fontWeight: 700, lineHeight: 1 }}>✓</span>
              </div>
            )}
            <button
              onClick={toggleFav}
              style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(6px)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              <Heart
                size={14}
                fill={faved ? '#c9a96e' : 'none'}
                color={faved ? '#c9a96e' : '#555'}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>

        {/* Infos */}
        <div style={{ padding: '10px 10px 12px', display: 'flex', flexDirection: 'column', minHeight: '100px' }}>
          {/* Marque + catégorie */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px', overflow: 'hidden', flexShrink: 0 }}>
            <p style={{
              fontFamily: 'Helvetica Neue, Arial, sans-serif',
              fontSize: '0.6rem', letterSpacing: '0.1em',
              color: '#c9a96e', fontWeight: 600,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 1, minWidth: 0,
            }}>
              {item.brand?.toUpperCase()}
            </p>
            {item.category_name_fr && (
              <p style={{
                fontFamily: 'Helvetica Neue, Arial, sans-serif',
                fontSize: '0.55rem', color: '#bbb', flexShrink: 0, whiteSpace: 'nowrap',
              }}>
                · {item.category_name_fr}
              </p>
            )}
          </div>

          {/* Titre — 2 lignes max */}
          <p style={{
            fontFamily: 'Georgia, serif', fontSize: '0.82rem',
            color: '#1a1a1a', lineHeight: '1.3', marginBottom: '6px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            flex: 1,
          }}>
            {item.title}
          </p>

          {/* Prix */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
            <div>
              {isAuction && (
                <p style={{
                  fontFamily: 'Helvetica Neue, Arial, sans-serif',
                  fontSize: '0.55rem', color: '#9e8e7e', marginBottom: '1px',
                }}>
                  {item.current_bid ? 'OFFRE ACTUELLE' : 'MISE DE DÉPART'}
                </p>
              )}
              <p style={{
                fontFamily: 'Georgia, serif', fontSize: '0.95rem',
                color: '#1a1a1a', fontWeight: 400,
              }}>
                {price.toLocaleString('fr-FR')} €
              </p>
            </div>

            {/* Countdown enchère */}
            {isAuction && countdown && countdown !== 'Terminée' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '3px',
                background: isEnding ? 'rgba(204,0,0,0.08)' : 'rgba(201,169,110,0.1)',
                borderRadius: '6px', padding: '3px 7px',
              }}>
                <Clock size={10} color={isEnding ? '#cc0000' : '#c9a96e'} />
                <span style={{
                  fontFamily: 'Helvetica Neue, Arial, sans-serif',
                  fontSize: '0.6rem',
                  color: isEnding ? '#cc0000' : '#c9a96e',
                  fontWeight: 600,
                }}>
                  {countdown}
                </span>
              </div>
            )}
            {isAuction && countdown === 'Terminée' && (
              <span style={{
                fontFamily: 'Helvetica Neue, Arial, sans-serif',
                fontSize: '0.6rem', color: '#bbb',
              }}>Terminée</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
