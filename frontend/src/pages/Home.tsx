import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ShoppingBag, Gavel, Shield, Truck } from 'lucide-react';
import { api } from '../lib/api';
import { useT } from '../lib/store';
import ItemCard from '../components/ItemCard';
import { filterStaticItems } from '../lib/staticItems';

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
        <div className="hscroll" style={{ display: 'flex', gap: '10px', width: 'max-content' }}>
          {loading
            ? [1,2,3,4].map(i => <SkeletonCard key={i} />)
            : items.map(item => (
                <div key={item.id} style={{ flexShrink: 0, width: '158px' }}>
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
      api.get('/items?type=auction&limit=8'),
      api.get('/items?category=women&limit=8'),
      api.get('/items?category=men&limit=8'),
      api.get('/items?category=bags&limit=8'),
    ]).then(([a, w, m, b]) => {
      const aItems = a.status === 'fulfilled' ? (a.value.items || []) : [];
      const wItems = w.status === 'fulfilled' ? (w.value.items || []) : [];
      const mItems = m.status === 'fulfilled' ? (m.value.items || []) : [];
      const bItems = b.status === 'fulfilled' ? (b.value.items || []) : [];

      // Use static fallback if API returns nothing
      setAuctions(aItems.length > 0 ? aItems : filterStaticItems({ type: 'auction', limit: 8 }).items);
      setWomen(wItems.length > 0 ? wItems : filterStaticItems({ category: 'women', limit: 8 }).items);
      setMen(mItems.length > 0 ? mItems : filterStaticItems({ category: 'men', limit: 8 }).items);
      setBags(bItems.length > 0 ? bItems : filterStaticItems({ category: 'bags', limit: 8 }).items);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ backgroundColor: '#faf7f4' }}>
      <style>{`
        @keyframes shimmer{0%{background-position:400% 0}100%{background-position:-400% 0}}
        .hero-img { object-fit: cover; object-position: center 25%; }
        @media (min-width: 768px) {
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
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/catalogue?type=fixed" className="btn-gold" style={{ fontSize: '0.68rem', padding: '10px 18px' }}>{t('heroCtaSales')}</Link>
            <Link to="/catalogue?type=auction" style={{ border: '1px solid #c9a96e', color: '#c9a96e', padding: '10px 18px', textDecoration: 'none', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.68rem', letterSpacing: '0.1em', borderRadius: '2px' }}>
              {t('heroCtaAuctions')}
            </Link>
          </div>
        </div>
      </div>

      {/* Enchères */}
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
