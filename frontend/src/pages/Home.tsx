import BagHero from '../components/BagHero';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ShoppingBag, Gavel, Shield, Truck, Radio, Lock, Star, Clock } from 'lucide-react';
import { useT } from '../lib/store';
import ItemCard from '../components/ItemCard';
import LiveRail from '../components/LiveRail';
import { filterStaticItems } from '../lib/staticItems';
import { getSharedItems } from '../lib/marketplace';
import { loadExclusiveSettings, getLocalExclusiveSettings } from '../lib/exclusiveSettings';

function getLives(): any[] {
  try { return JSON.parse(localStorage.getItem('mb_lives') || '[]').filter((l: any) => l.is_live); } catch { return []; }
}

function getExclusiveSettings() {
  return getLocalExclusiveSettings();
}
function getNowParis() {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parseInt(parts.find(p => p.type === t)?.value || '0');
  return { h: get('hour'), m: get('minute'), s: get('second') };
}
function getParisDate() {
  return new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date());
}
function isWindowOpen(od: string, ot: string, ct: string) {
  if (getParisDate() !== od) return false;
  const { h, m } = getNowParis();
  const [oh, om] = ot.split(':').map(Number);
  const [ch, cm] = ct.split(':').map(Number);
  const cur = h * 60 + m;
  return cur >= oh * 60 + om && cur < ch * 60 + cm;
}
function getSecondsUntilOpen(od: string, ot: string) {
  const paris = getNowParis();
  const today = getParisDate();
  const [oh, om] = ot.split(':').map(Number);
  if (od > today) {
    return Math.max(0, Math.floor((new Date(`${od}T${ot}:00`).getTime() - Date.now()) / 1000));
  }
  const curSecs = paris.h * 3600 + paris.m * 60 + paris.s;
  const openSecs = oh * 3600 + om * 60;
  return Math.max(0, openSecs - curSecs);
}

function ExclusiveSection() {
  const [settings, setSettings] = useState(getExclusiveSettings);
  const [open, setOpen] = useState(() => isWindowOpen(settings.open_date, settings.open_time, settings.close_time));
  const [secs, setSecs] = useState(() => getSecondsUntilOpen(settings.open_date, settings.open_time));

  useEffect(() => {
    loadExclusiveSettings().then(s => {
      setSettings(s);
      setOpen(isWindowOpen(s.open_date, s.open_time, s.close_time));
      setSecs(getSecondsUntilOpen(s.open_date, s.open_time));
    });
    const iv = setInterval(() => {
      const s = getExclusiveSettings();
      setSettings(s);
      setOpen(isWindowOpen(s.open_date, s.open_time, s.close_time));
      setSecs(getSecondsUntilOpen(s.open_date, s.open_time));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const hh = String(Math.floor(secs / 3600)).padStart(2, '0');
  const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  const dateLabel = settings.open_date && settings.open_date !== getParisDate()
    ? `Le ${new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(new Date(settings.open_date + 'T12:00'))} à ${settings.open_time}`
    : `Aujourd'hui à ${settings.open_time}`;

  const allItems = filterStaticItems({ limit: 20 }).items;
  const exclusiveItems = allItems.filter((i: any) => settings.exclusive_ids.includes(i.id));

  // OPEN — articles en scroll horizontal
  if (open) {
    return (
      <div style={{ backgroundColor: '#0f0f0f' }}>
        <style>{`.hscroll-excl::-webkit-scrollbar{display:none}`}</style>
        {/* Header */}
        <div style={{ padding: '1.25rem 1rem 0.75rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Star size={11} color="#c9a96e" fill="#c9a96e" />
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.52rem', letterSpacing: '0.28em', color: '#c9a96e' }}>VENTE EXCLUSIVE · AUJOURD'HUI SEULEMENT</p>
              <Star size={11} color="#c9a96e" fill="#c9a96e" />
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.25rem', fontWeight: 400, color: 'white' }}>Sélection du jour</h2>
          </div>
          <Link to="/vente-exclusive" style={{ display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.62rem', color: '#c9a96e' }}>
            Tout voir <ChevronRight size={12} />
          </Link>
        </div>
        {/* Fermeture countdown */}
        <div style={{ padding: '0 1rem 0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={12} color="rgba(255,255,255,0.4)" />
          <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Ferme à {settings.close_time}</span>
        </div>
        {/* Scroll */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', padding: '0 1rem 1.5rem' }}>
          <div className="hscroll-excl" style={{ display: 'flex', gap: '10px', width: 'max-content', alignItems: 'stretch' }}>
            {exclusiveItems.length === 0
              ? [1,2,3].map(i => <SkeletonCard key={i} />)
              : exclusiveItems.map((item: any) => (
                <div key={item.id} style={{ flexShrink: 0, width: '158px', display: 'flex', flexDirection: 'column' }}>
                  <ItemCard item={item} />
                </div>
              ))
            }
            <Link to="/vente-exclusive" style={{ flexShrink: 0, width: '110px', borderRadius: '12px', border: '1.5px solid rgba(201,169,110,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', backgroundColor: 'rgba(201,169,110,0.06)' }}>
              <ChevronRight size={22} color="#c9a96e" />
              <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.58rem', color: '#c9a96e', letterSpacing: '0.08em', textAlign: 'center' }}>VOIR TOUT</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // CLOSED — bloc suspense
  return (
    <Link to="/vente-exclusive" style={{ display: 'block', textDecoration: 'none', backgroundColor: '#0f0f0f' }}>
      <style>{`@keyframes goldPulse{0%,100%{opacity:1}50%{opacity:0.45}} @keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ padding: '2rem 1.25rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* Icône */}
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', animation: 'goldPulse 2s infinite' }}>
          <Lock size={22} color="#c9a96e" />
        </div>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.52rem', letterSpacing: '0.3em', color: '#c9a96e', marginBottom: '0.5rem', animation: 'fadeInUp 0.5s ease' }}>
          VENTE EXCLUSIVE · ACCÈS LIMITÉ
        </p>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', color: 'white', fontWeight: 400, lineHeight: 1.3, marginBottom: '0.5rem', animation: 'fadeInUp 0.7s ease' }}>
          La sélection ouvre {dateLabel.toLowerCase()}
        </h2>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.38)', marginBottom: '1.25rem', animation: 'fadeInUp 0.9s ease' }}>
          Des pièces d'exception disponibles pour quelques heures seulement
        </p>
        {/* Countdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 3vw, 20px)', marginBottom: '1.5rem', animation: 'fadeInUp 1.1s ease' }}>
          {[{ v: hh, l: 'HEURES' }, { v: mm, l: 'MIN' }, { v: ss, l: 'SEC' }].map(({ v, l }, i) => (
            <>
              {i > 0 && <span key={`sep${i}`} style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', color: 'rgba(201,169,110,0.35)', lineHeight: 1 }}>:</span>}
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 7vw, 3.5rem)', color: '#c9a96e', lineHeight: 1, fontWeight: 400 }}>{v}</div>
                <div style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.45rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginTop: '5px' }}>{l}</div>
              </div>
            </>
          ))}
        </div>
        {/* Aperçu flouté si articles configurés */}
        {exclusiveItems.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', animation: 'fadeInUp 1.3s ease' }}>
            {exclusiveItems.slice(0, 4).map((item: any) => (
              <div key={item.id} style={{ width: '64px', height: '86px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                {(item.image || item.images?.[0]) && (
                  <img src={item.image || item.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(6px) brightness(0.35)' }} />
                )}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={14} color="rgba(201,169,110,0.6)" />
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.25)', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem' }}>
          Découvrir la sélection <ChevronRight size={13} color="rgba(255,255,255,0.25)" />
        </div>
      </div>
    </Link>
  );
}

function LivesHScroll() {
  const [lives, setLives] = useState<any[]>([]);
  useEffect(() => {
    setLives(getLives());
    const iv = setInterval(() => setLives(getLives()), 5000);
    return () => clearInterval(iv);
  }, []);

  if (lives.length === 0) return null;

  return (
    <div style={{ padding: '1rem 0 0' }}>
      <div style={{ padding: '0.75rem 1rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#e53935', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 400, color: '#1a1a1a' }}>En direct maintenant</p>
        </div>
        <Link to="/lives" style={{ display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#9e8e7e' }}>
          Voir tout <ChevronRight size={12} />
        </Link>
      </div>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', padding: '0 1rem 1rem' }}>
        <style>{`.hscroll-lives::-webkit-scrollbar{display:none} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        <div className="hscroll-lives" style={{ display: 'flex', gap: '10px', width: 'max-content' }}>
          {lives.map(live => (
            <a key={live.id} href={`https://www.whatnot.com/${live.whatnot_username}`} target="_blank" rel="noopener noreferrer"
              style={{ flexShrink: 0, width: '120px', textDecoration: 'none', display: 'block' }}>
              <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#1a1a1a', paddingBottom: '133%' }}>
                {live.avatar && <img src={live.avatar} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />}
                <div style={{ position: 'absolute', top: '6px', left: '6px', backgroundColor: '#e53935', color: 'white', fontSize: '0.55rem', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontWeight: 700, padding: '2px 6px', borderRadius: '2px' }}>LIVE</div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem 0.5rem 0.4rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)' }}>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', fontWeight: 700, color: 'white' }}>@{live.whatnot_username}</p>
                </div>
              </div>
            </a>
          ))}
          <Link to="/lives" style={{ flexShrink: 0, width: '80px', borderRadius: '10px', border: '1.5px solid #e8d5b7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', textDecoration: 'none', backgroundColor: '#faf7f4' }}>
            <Radio size={18} color="#c9a96e" />
            <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.55rem', color: '#9e8e7e', letterSpacing: '0.05em', textAlign: 'center' }}>VOIR TOUS</span>
          </Link>
        </div>
      </div>
      <div style={{ height: '1px', backgroundColor: '#f0ece6', margin: '0 1rem' }} />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f0ece6', flexShrink: 0, width: '160px' }}>
      <div style={{ width: '160px', height: '213px', background: 'linear-gradient(90deg, #ece8e2 25%, #f5f1ec 50%, #ece8e2 75%)', backgroundSize: '400% 100%', animation: 'shimmer 1.4s infinite' }} />
      <div style={{ padding: '8px' }}>
        <div style={{ height: '7px', backgroundColor: '#e0d8cc', borderRadius: '4px', width: '50%', marginBottom: '6px' }} />
        <div style={{ height: '9px', backgroundColor: '#e8e0d8', borderRadius: '4px', width: '85%', marginBottom: '5px' }} />
        <div style={{ height: '9px', backgroundColor: '#e8e0d8', borderRadius: '4px', width: '40%' }} />
      </div>
    </div>
  );
}

function HScrollSection({ title, label, link, items, loading, seeAll, seeMore }: {
  title: string; label: string; link: string;
  items: any[]; loading: boolean; seeAll: string; seeMore: string;
}) {
  const navigate = useNavigate();
  if (!loading && items.length === 0) return null;
  return (
    <div style={{ marginBottom: '0' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 1rem 0.75rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.55rem', letterSpacing: '0.3em', color: '#c9a96e', marginBottom: '2px' }}>{label}</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.15rem', fontWeight: 400, color: '#1a1a1a' }}>{title}</h2>
        </div>
        <Link to={link} style={{ display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#9e8e7e' }}>
          {seeAll} <ChevronRight size={12} />
        </Link>
      </div>

      {/* Horizontal scroll */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none', padding: '0 1rem 1.25rem' }}>
        <style>{`.hscroll::-webkit-scrollbar{display:none}`}</style>
        <div className="hscroll" style={{ display: 'flex', gap: '10px', width: 'max-content', alignItems: 'stretch' }}>
          {loading
            ? [1,2,3,4].map(i => <SkeletonCard key={i} />)
            : items.map(item => (
                <div key={item.id} style={{ flexShrink: 0, width: '158px', display: 'flex', flexDirection: 'column' }}>
                  <ItemCard item={item} />
                </div>
              ))
          }
          {!loading && items.length > 0 && (
            <div
              onClick={() => navigate(link)}
              style={{ flexShrink: 0, width: '120px', borderRadius: '12px', border: '1.5px solid #e8d5b7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', backgroundColor: '#faf7f4' }}
            >
              <ChevronRight size={22} color="#c9a96e" />
              <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', color: '#9e8e7e', letterSpacing: '0.08em' }}>{seeMore}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: '#f0ece6', margin: '0 1rem' }} />
    </div>
  );
}

export default function Home() {
  const [items, setItems] = useState<any[]>(() => filterStaticItems({ category: 'bags', limit: 20 }).items);
  const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; getSharedItems({category:'bags'}).then(shared => { if(active) setItems([...new Map([...filterStaticItems({category:'bags',limit:100}).items,...shared].map(i=>[i.id,i])).values()].filter(i=>i.status==='active')); }).catch(()=>{}).finally(()=>{if(active)setLoading(false)}); return ()=>{active=false}; }, []);
  const auctions=items.filter(i=>i.auction_enabled);
  const direct=items.filter(i=>i.fixed_price>0);
  return <div style={{background:'#faf8f4'}}>
    <BagHero />
    <ExclusiveSection />
    <section id="auction-items" className="premium-section"><div className="premium-section-heading"><div><p className="eyebrow">À VOUS DE JOUER</p><h2>Les sacs aux enchères</h2></div><Link to="/catalogue?type=auction">Tout voir →</Link></div><div className="premium-products">{auctions.slice(0,4).map(item=><ItemCard key={item.id} item={item}/>)}</div>{!auctions.length&&<p className="bag-empty">{loading?'Chargement de la sélection…':'Les prochaines enchères arrivent bientôt.'}</p>}</section>
    <div className="entrupy-strip"><strong>Nos pièces de luxe sont vérifiées et contrôlées avec Entrupy.</strong><p>Retrouvez le certificat disponible sur la fiche de votre sac.</p></div>
    <section id="direct-items" className="premium-section"><div className="premium-section-heading"><div><p className="eyebrow">SANS ATTENDRE</p><h2>Le coup de cœur n’attend pas.</h2></div><Link to="/catalogue?type=fixed">Tout voir →</Link></div><div className="premium-products">{direct.slice(0,4).map(item=><ItemCard key={item.id} item={item}/>)}</div>{!direct.length&&<p className="bag-empty">{loading?'Chargement de la sélection…':'La prochaine sélection sera bientôt disponible.'}</p>}</section>
    <LivesHScroll />
    <div className="entrupy-strip"><strong>Un sac. Deux façons de le faire vôtre.</strong><p>Achetez au prix affiché, ou placez votre offre aux enchères.</p><Link to="/comment-acheter">Le guide d’achat</Link></div>
  </div>;
}
