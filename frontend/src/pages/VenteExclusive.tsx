import { useEffect, useState } from 'react';
import { Lock, Gavel, Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllItems } from '../lib/staticItems';
import ItemCard from '../components/ItemCard';

const SETTINGS_KEY = 'mb_exclusive_settings';

function getExclusiveSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return {
      open_time: s.open_time || '09:00',
      close_time: s.close_time || '19:00',
      exclusive_ids: (s.exclusive_ids as string[]) || [],
    };
  } catch { return { open_time: '09:00', close_time: '19:00', exclusive_ids: [] }; }
}

function getNowParis() {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parseInt(parts.find(p => p.type === t)?.value || '0');
  return { h: get('hour'), m: get('minute'), s: get('second') };
}

function isWindowOpen(openTime: string, closeTime: string) {
  const { h, m } = getNowParis();
  const [oh, om] = openTime.split(':').map(Number);
  const [ch, cm] = closeTime.split(':').map(Number);
  const cur = h * 60 + m;
  return cur >= oh * 60 + om && cur < ch * 60 + cm;
}

function getSecondsUntilOpen(openTime: string): number {
  const paris = getNowParis();
  const [oh, om] = openTime.split(':').map(Number);
  const curSecs = paris.h * 3600 + paris.m * 60 + paris.s;
  const openSecs = oh * 3600 + om * 60;
  const diff = openSecs - curSecs;
  return diff > 0 ? diff : 86400 + diff;
}

function formatCountdown(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') };
}

function CountdownBlock({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.5rem, 8vw, 5rem)', color: '#c9a96e', lineHeight: 1, fontWeight: 400 }}>{value}</div>
      <div style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.55rem', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>{label}</div>
    </div>
  );
}

export default function VenteExclusive() {
  const settings = getExclusiveSettings();
  const [open, setOpen] = useState(() => isWindowOpen(settings.open_time, settings.close_time));
  const [countdown, setCountdown] = useState(() => getSecondsUntilOpen(settings.open_time));
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      const s = getExclusiveSettings();
      setOpen(isWindowOpen(s.open_time, s.close_time));
      setCountdown(getSecondsUntilOpen(s.open_time));
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const allItems = getAllItems();
  const exclusiveItems = allItems.filter((i: any) => settings.exclusive_ids.includes(i.id));

  const { h, m, s } = formatCountdown(countdown);

  if (!open) {
    return (
      <div style={{ backgroundColor: '#0f0f0f', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem 6rem', textAlign: 'center' }}>
        <style>{`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes goldPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
          .cd-sep { font-family: Georgia, serif; font-size: clamp(2rem, 7vw, 4rem); color: rgba(201,169,110,0.4); line-height: 1; }
        `}</style>

        {/* Lock icon */}
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', animation: 'goldPulse 2s infinite' }}>
          <Lock size={32} color="#c9a96e" />
        </div>

        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.4em', color: '#c9a96e', marginBottom: '1rem', animation: 'fadeInUp 0.6s ease' }}>
          VENTE EXCLUSIVE · ACCÈS LIMITÉ
        </p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem, 5vw, 3rem)', color: 'white', fontWeight: 400, lineHeight: 1.25, marginBottom: '0.75rem', maxWidth: '600px', animation: 'fadeInUp 0.8s ease' }}>
          La sélection du jour ouvre dans…
        </h1>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', marginBottom: '3rem', animation: 'fadeInUp 1s ease' }}>
          Des pièces d'exception, disponibles uniquement de {settings.open_time} à {settings.close_time}
        </p>

        {/* Countdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 3vw, 1.5rem)', marginBottom: '3rem', animation: 'fadeInUp 1.2s ease' }}>
          <CountdownBlock value={h} label="HEURES" />
          <span className="cd-sep">:</span>
          <CountdownBlock value={m} label="MINUTES" />
          <span className="cd-sep">:</span>
          <CountdownBlock value={s} label="SECONDES" />
        </div>

        {/* Teaser cards blurred */}
        {exclusiveItems.length > 0 && (
          <div style={{ width: '100%', maxWidth: '900px', marginBottom: '2.5rem', animation: 'fadeInUp 1.4s ease' }}>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.62rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>APERÇU DE LA SÉLECTION</p>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', justifyContent: 'center', padding: '0 1rem', scrollbarWidth: 'none' }}>
              {exclusiveItems.slice(0, 4).map((item: any) => (
                <div key={item.id} style={{ flexShrink: 0, width: '140px', position: 'relative' }}>
                  <div style={{ width: '140px', height: '190px', borderRadius: '4px', overflow: 'hidden', filter: 'blur(8px) brightness(0.4)', pointerEvents: 'none' }}>
                    {(item.image || item.images?.[0]) && (
                      <img src={item.image || item.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={22} color="rgba(201,169,110,0.7)" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link to="/catalogue?type=auction"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '2px' }}>
          Voir toutes les enchères en attendant <ChevronRight size={13} />
        </Link>
      </div>
    );
  }

  // OPEN — show items
  return (
    <div style={{ backgroundColor: '#faf7f4', minHeight: '80vh', padding: '0 0 6rem' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .exclusive-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        @media (min-width: 600px) { .exclusive-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 900px) { .exclusive-grid { grid-template-columns: repeat(4, 1fr); } }
      `}</style>

      {/* Header */}
      <div style={{ backgroundColor: '#1a1a1a', padding: 'clamp(2rem, 5vw, 3.5rem) 1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.3)', padding: '6px 16px', borderRadius: '20px', marginBottom: '1.25rem' }}>
          <Star size={12} color="#c9a96e" fill="#c9a96e" />
          <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.58rem', letterSpacing: '0.25em', color: '#c9a96e' }}>VENTE EXCLUSIVE · AUJOURD'HUI SEULEMENT</span>
          <Star size={12} color="#c9a96e" fill="#c9a96e" />
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem, 5vw, 2.8rem)', color: 'white', fontWeight: 400, marginBottom: '0.75rem' }}>
          Sélection du jour
        </h1>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>
          Fermeture à {settings.close_time} · {exclusiveItems.length} pièce{exclusiveItems.length > 1 ? 's' : ''} disponible{exclusiveItems.length > 1 ? 's' : ''}
        </p>

        {/* Live countdown to close */}
        <CloseCountdown closeTime={settings.close_time} />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
        {exclusiveItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#9e8e7e' }}>
            <Gavel size={40} color="#e8d5b7" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#1a1a1a', marginBottom: '0.5rem' }}>Sélection en cours de préparation</p>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem' }}>Revenez dans quelques instants.</p>
          </div>
        ) : (
          <div className="exclusive-grid">
            {exclusiveItems.map((item: any, i: number) => (
              <div key={item.id} style={{ animation: `fadeInUp ${0.3 + i * 0.08}s ease` }}>
                <ItemCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CloseCountdown({ closeTime }: { closeTime: string }) {
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    const calc = () => {
      const paris = getNowParis();
      const [ch, cm] = closeTime.split(':').map(Number);
      const curSecs = paris.h * 3600 + paris.m * 60 + paris.s;
      const closeSecs = ch * 3600 + cm * 60;
      return Math.max(0, closeSecs - curSecs);
    };
    setSecs(calc());
    const iv = setInterval(() => setSecs(calc()), 1000);
    return () => clearInterval(iv);
  }, [closeTime]);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'Georgia, serif', fontSize: 'clamp(1rem, 3vw, 1.5rem)', color: '#c9a96e' }}>
      <Gavel size={16} color="#c9a96e" />
      Ferme dans {h > 0 ? `${h}h ` : ''}{String(m).padStart(2, '0')}m {String(s).padStart(2, '0')}s
    </div>
  );
}
