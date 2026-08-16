import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ShoppingBag, Gavel, Shield, Truck, Radio, Lock, Star } from 'lucide-react';
import { useT } from '../lib/store';
import ItemCard from '../components/ItemCard';
import LiveRail from '../components/LiveRail';
import { filterStaticItems } from '../lib/staticItems';
import { getSharedItems } from '../lib/marketplace';

function getLives(): any[] {
  try { return JSON.parse(localStorage.getItem('mb_lives') || '[]').filter((l: any) => l.is_live); } catch { return []; }
}

const SETTINGS_KEY = 'mb_exclusive_settings';
function getExclusiveSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return { open_time: s.open_time || '09:00', close_time: s.close_time || '19:00', exclusive_ids: (s.exclusive_ids as string[]) || [] };
  } catch { return { open_time: '09:00', close_time: '19:00', exclusive_ids: [] }; }
}
function getNowParis() {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parseInt(parts.find(p => p.type === t)?.value || '0');
  return { h: get('hour'), m: get('minute'), s: get('second') };
}
function isWindowOpen(ot: string, ct: string) {
  const { h, m } = getNowParis();
  const [oh, om] = ot.split(':').map(Number);
  const [ch, cm] = ct.split(':').map(Number);
  const cur = h * 60 + m;
  return cur >= oh * 60 + om && cur < ch * 60 + cm;
}
function getSecondsUntilOpen(ot: string) {
  const paris = getNowParis();
  const [oh, om] = ot.split(':').map(Number);
  const curSecs = paris.h * 3600 + paris.m * 60 + paris.s;
  const openSecs = oh * 3600 + om * 60;
  const diff = openSecs - curSecs;
  return diff > 0 ? diff : 86400 + diff;
}

function ExclusiveTeaser() {
  const [settings, setSettings] = useState(getExclusiveSettings);
  const [open, setOpen] = useState(() => isWindowOpen(settings.open_time, settings.close_time));
  const [secs, setSecs] = useState(() => getSecondsUntilOpen(settings.open_time));

  useEffect(() => {
    const iv = setInterval(() => {
      const s = getExclusiveSettings();
      setSettings(s);
      setOpen(isWindowOpen(s.open_time, s.close_time));
      setSecs(getSecondsUntilOpen(s.open_time));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  if (settings.exclusive_ids.length === 0) return null;

  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');

  return (
    <Link to="/vente-exclusive" style={{ display: 'block', textDecoration: 'none', margin: '0', backgroundColor: '#0f0f0f', padding: '1rem 1.25rem', borderBottom: '1px solid #1e1e1e' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {open
            ? <Star size={16} color="#c9a96e" fill="#c9a96e" />
            : <Lock size={15} color="#c9a96e" />
          }
          <div>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.55rem', letterSpacing: '0.25em', color: '#c9a96e', marginBottom: '2px' }}>
              {open ? 'VENTE EXCLUSIVE · OUVERTE MAINTENANT' : 'VENTE EXCLUSIVE · BIENTÔT'}
            </p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: 'white', fontWeight: 400 }}>
              {open
                ? `Sélection du jour — ferme à ${settings.close_time}`
                : `Ouvre à ${settings.open_time} · Dans ${h}h ${m}m ${s}s`
              }
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.62rem', color: open ? '#c9a96e' : '#666', letterSpacing: '0.1em' }}>
            {open ? 'VOIR' : ''}
          </span>
          <ChevronRight size={14} color={open ? '#c9a96e' : '#444'} />
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
  const t = useT();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [women, setWomen] = useState<any[]>([]);
  const [men, setMen] = useState<any[]>([]);
  const [bags, setBags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getSharedItems({ type: 'auction', limit: 8 }),
      getSharedItems({ category: 'women', limit: 8 }),
      getSharedItems({ category: 'men', limit: 8 }),
      getSharedItems({ category: 'bags', limit: 8 }),
    ]).then(([a, w, m, b]) => {
      const aItems = a.status === 'fulfilled' ? a.value : [];
      const wItems = w.status === 'fulfilled' ? w.value : [];
      const mItems = m.status === 'fulfilled' ? m.value : [];
      const bItems = b.status === 'fulfilled' ? b.value : [];

      // Use static fallback if API returns nothing
      const merge = (shared: any[], fallback: any[]) => [...new Map([...fallback, ...shared].map(item => [item.id, item])).values()].filter(item => item.status === 'active').slice(0, 8);
      setAuctions(merge(aItems, filterStaticItems({ type: 'auction', limit: 8 }).items));
      setWomen(merge(wItems, filterStaticItems({ category: 'women', limit: 8 }).items));
      setMen(merge(mItems, filterStaticItems({ category: 'men', limit: 8 }).items));
      setBags(merge(bItems, filterStaticItems({ category: 'bags', limit: 8 }).items));
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ backgroundColor: '#faf7f4' }}>
      <style>{`
        @keyframes shimmer{0%{background-position:400% 0}100%{background-position:-400% 0}}
        .hero-img { object-fit: cover; object-position: center 25%; }
        .hero-btns { display: none; }
        @media (min-width: 768px) {
          .hero-btns { display: flex; }
          .hero-img { object-position: center 15%; }
          .hero-text { padding: 3rem 4rem !important; }
          .comment-acheter-inner { max-width: 1100px; margin: 0 auto; }
          .comment-acheter-links { flex-direction: row !important; gap: 0 !important; }
          .comment-acheter-links a { flex: 1; border-right: 1px solid #e8e0d8; padding: 1.5rem 2rem !important; border-bottom: none !important; }
          .comment-acheter-links a:last-child { border-right: none; }
          .trust-inner { max-width: 1100px; margin: 0 auto; grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>

      {/* Hero */}
      <div className="hero-section" style={{ position: 'relative', backgroundColor: '#1a1a1a', minHeight: '65vh', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
        <img src="/hero.jpeg" alt="" className="hero-img" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,8,6,0.88) 0%, rgba(10,8,6,0.55) 35%, rgba(10,8,6,0.1) 100%)' }} />
        <div className="hero-text" style={{ position: 'relative', zIndex: 1, padding: '2rem 1.5rem 2.5rem', maxWidth: '560px', width: '100%' }}>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.58rem', letterSpacing: '0.4em', color: '#c9a96e', marginBottom: '0.75rem' }}>
            {t('heroTagline')}
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.7rem, 5vw, 3rem)', color: 'white', fontWeight: 400, lineHeight: '1.2', marginBottom: '1.25rem' }}>
            {t('heroTitle')}{' '}
            <span style={{ color: '#c9a96e' }}>{t('heroHighlight')}</span>
          </h1>
          <div className="hero-btns" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/catalogue?type=fixed" className="btn-gold" style={{ fontSize: '0.68rem', padding: '10px 18px' }}>{t('heroCtaSales')}</Link>
            <Link to="/catalogue?type=auction" style={{ border: '1px solid #c9a96e', color: '#c9a96e', padding: '10px 18px', textDecoration: 'none', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.68rem', letterSpacing: '0.1em', borderRadius: '2px' }}>
              {t('heroCtaAuctions')}
            </Link>
          </div>
        </div>
      </div>

      {/* Vente Exclusive */}
      <ExclusiveTeaser />

      {/* Lives */}
      <LivesHScroll />

      {/* Enchères */}
      <LiveRail />

      <HScrollSection
        label={t('sectionOngoing')}
        title={t('featuredAuctions')}
        link="/catalogue?type=auction"
        items={auctions}
        loading={loading}
        seeAll={t('seeAll')}
        seeMore={t('seeMore')}
      />

      {/* Sélection Femme */}
      <HScrollSection
        label={t('sectionSelection')}
        title={t('womenSection')}
        link="/catalogue?category=women"
        items={women}
        loading={loading}
        seeAll={t('seeAll')}
        seeMore={t('seeMore')}
      />

      {/* Sélection Homme */}
      <HScrollSection
        label={t('sectionSelection')}
        title={t('menSection')}
        link="/catalogue?category=men"
        items={men}
        loading={loading}
        seeAll={t('seeAll')}
        seeMore={t('seeMore')}
      />

      {/* Sacs */}
      <HScrollSection
        label={t('sectionTrend')}
        title={t('bagsSection')}
        link="/catalogue?category=bags"
        items={bags}
        loading={loading}
        seeAll={t('seeAll')}
        seeMore={t('seeMore')}
      />

      {/* Comment acheter */}
      <div style={{ padding: '2rem 1rem 1.5rem', backgroundColor: '#faf7f4' }}>
        <div className="comment-acheter-inner">
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '1rem' }}>{t('howToBuy')}</h2>
        <div className="comment-acheter-links" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            { icon: ShoppingBag, title: t('buyGuide').toUpperCase(), desc: t('buyGuideDesc') },
            { icon: Gavel, title: t('faqLabel'), desc: t('faqDesc') },
            { icon: Shield, title: t('authenticity'), desc: t('authenticityDesc') },
          ].map(({ icon: Icon, title, desc }, i) => (
            <Link
              key={title}
              to={i === 0 ? '/comment-acheter' : i === 1 ? '/faq' : '/pro'}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', textDecoration: 'none', borderBottom: i < 2 ? '1px solid #f0ece6' : 'none' }}
            >
              <div style={{ width: '40px', height: '40px', backgroundColor: '#f8f4ef', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color="#c9a96e" />
              </div>
              <div>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#1a1a1a', marginBottom: '2px' }}>{title}</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e' }}>{desc}</p>
              </div>
              <ChevronRight size={16} color="#c9a96e" style={{ marginLeft: 'auto' }} />
            </Link>
          ))}
        </div>
        </div>
      </div>

      {/* Trust */}
      <div style={{ padding: '1.5rem 1rem 7rem', backgroundColor: '#1a1a1a' }}>
        <div className="trust-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { icon: Shield, t1: t('verifiedSellers'), t2: t('siretChecked') },
            { icon: Truck, t1: t('shippingIncluded'), t2: t('realTimeTracking') },
            { icon: Gavel, t1: t('secureAuctions'), t2: t('securePayment') },
            { icon: ShoppingBag, t1: t('returns14'), t2: t('euRights') },
          ].map(({ icon: Icon, t1, t2 }) => (
            <div key={t1} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icon size={18} color="#c9a96e" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: 'white', fontWeight: 600 }}>{t1}</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', color: '#9e8e7e' }}>{t2}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
