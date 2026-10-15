import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { api } from '../lib/api';
import { useT, useStore } from '../lib/store';
import ItemCard from '../components/ItemCard';
import { filterStaticItems } from '../lib/staticItems';
import { getSharedItems } from '../lib/marketplace';

const BRANDS = ['Hermès', 'Chanel', 'Dior', 'Louis Vuitton', 'Gucci', 'Prada', 'Cartier', 'Balenciaga', 'Saint Laurent', 'Valentino', 'Celine', 'Givenchy', 'Bottega Veneta', 'Loewe', 'Fendi', 'Burberry', 'Versace', 'Max Mara', 'Armani'];

export default function Catalogue() {
  const t = useT();
  const lang = useStore(s => s.lang);
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const type = params.get('type') || '';
  const category = params.get('category') || '';
  const brand = params.get('brand') || '';
  const search = params.get('search') || '';
  const sort = params.get('sort') || 'created_at';
  const page = parseInt(params.get('page') || '1');
  const limit = 20;

  useEffect(() => {
    api.get('/categories').then(d => setCategories(d.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    const fallback = filterStaticItems({ type, category, brand, search, limit, offset: (page - 1) * limit, sort });
    setItems(fallback.items);
    setTotal(fallback.total);
    setLoading(false);
    getSharedItems({ type, category })
      .then(shared => {
        if (!active) return;
        const fallback = filterStaticItems({ type, category, brand, search, limit: 1000, offset: 0, sort });
        let combined = [...new Map([...fallback.items, ...shared].map(item => [item.id, item])).values()].filter(item => item.status === 'active');
        if (brand) combined = combined.filter(i => i.brand?.toLowerCase().includes(brand.toLowerCase()));
        if (search) { const s = search.toLowerCase(); combined = combined.filter(i => `${i.title} ${i.brand} ${i.description}`.toLowerCase().includes(s)); }
        if (sort === 'price_asc') combined.sort((a, b) => (a.fixed_price || a.current_bid || a.auction_start_price || 0) - (b.fixed_price || b.current_bid || b.auction_start_price || 0));
        if (sort === 'price_desc') combined.sort((a, b) => (b.fixed_price || b.current_bid || b.auction_start_price || 0) - (a.fixed_price || a.current_bid || a.auction_start_price || 0));
        setTotal(combined.length);
        setItems(combined.slice((page - 1) * limit, page * limit));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [type, category, brand, search, sort, page]);

  const setParam = (k: string, v: string) => {
    const p = new URLSearchParams(params);
    if (v) p.set(k, v); else p.delete(k);
    p.delete('page');
    setParams(p);
  };

  const rootCats = categories.filter(c => !c.parent_id);
  const subCats = categories.filter(c => c.parent_id === category || (!category && c.parent_id));

  const activeFilters = [
    type && { key: 'type', label: type === 'auction' ? t('auctions') : t('sales'), val: type },
    brand && { key: 'brand', label: brand, val: brand },
    category && { key: 'category', label: (lang === 'en' ? categories.find(c => c.id === category)?.name_en : categories.find(c => c.id === category)?.name_fr) || category, val: category },
  ].filter(Boolean) as { key: string; label: string; val: string }[];

  const pageTitle = type === 'auction' ? 'ENCHÈRES' : type === 'fixed' ? 'VENTE DIRECTE' : search ? `"${search}"` : 'CATALOGUE';

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Page header — centré YSL */}
      <div style={{ textAlign: 'center', padding: '2rem 1rem 1rem', paddingTop: 'calc(44px + 1.5rem)' }}>
        <h1 style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.22em', color: '#1a1a1a', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
          {pageTitle}
        </h1>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.12em', color: '#999' }}>
          {total} {total !== 1 ? 'articles' : 'article'}
        </p>
      </div>

      {/* Filtres en ligne */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '2rem' }}>
        {['', 'fixed', 'auction'].map(v => (
          <button key={v} onClick={() => setParam('type', v)}
            style={{ padding: '8px 14px', background: 'none', border: 'none', borderBottom: type === v ? '1.5px solid #1a1a1a' : '1.5px solid transparent', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: type === v ? '#1a1a1a' : '#bbb', fontWeight: type === v ? 600 : 400 }}>
            {v === '' ? 'TOUT' : v === 'fixed' ? 'VENTE' : 'ENCHÈRES'}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <select value={sort} onChange={e => setParam('sort', e.target.value)}
          style={{ border: 'none', padding: '8px 12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.58rem', letterSpacing: '0.1em', color: '#999', backgroundColor: 'white', cursor: 'pointer', textTransform: 'uppercase', WebkitAppearance: 'none', appearance: 'none' }}>
          <option value="created_at">RÉCENTS</option>
          <option value="price_asc">PRIX ↑</option>
          <option value="price_desc">PRIX ↓</option>
          <option value="ending">FIN ENCHÈRE</option>
        </select>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#999', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', letterSpacing: '0.1em' }}>CHARGEMENT…</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', letterSpacing: '0.15em', color: '#999', textTransform: 'uppercase' }}>AUCUN ARTICLE TROUVÉ</p>
          </div>
        ) : (
          <>
            <style>{`
              .catalogue-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
              .catalogue-grid > *:nth-child(4n+1) { grid-column: 1 / -1; }
              @media (min-width: 768px) { .catalogue-grid { gap: 16px; } }
            `}</style>
            <div className="catalogue-grid">
              {items.map(item => <ItemCard key={item.id} item={item} />)}
            </div>

            {total > limit && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem', paddingBottom: '3rem' }}>
                {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 3).map(p => (
                  <button key={p} onClick={() => setParam('page', String(p))}
                    style={{ width: '36px', height: '36px', border: '1px solid', borderColor: p === page ? '#1a1a1a' : '#e0e0e0', backgroundColor: p === page ? '#1a1a1a' : 'white', color: p === page ? 'white' : '#1a1a1a', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem' }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
