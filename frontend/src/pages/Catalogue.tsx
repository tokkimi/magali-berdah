import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, ChevronDown, X } from 'lucide-react';
import { api } from '../lib/api';
import { useT, useStore } from '../lib/store';
import ItemCard from '../components/ItemCard';
import { filterStaticItems } from '../lib/staticItems';

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
    setLoading(true);
    const q = new URLSearchParams({ limit: String(limit), offset: String((page - 1) * limit), sort });
    if (type) q.set('type', type);
    if (category) q.set('category', category);
    if (brand) q.set('brand', brand);
    if (search) q.set('search', search);
    api.get(`/items?${q}`)
      .then(d => {
        const apiItems = d.items || [];
        if (apiItems.length > 0) {
          setItems(apiItems);
          setTotal(d.total || 0);
        } else {
          const fallback = filterStaticItems({ type, category, brand, search, limit, offset: (page - 1) * limit, sort });
          setItems(fallback.items);
          setTotal(fallback.total);
        }
      })
      .catch(() => {
        const fallback = filterStaticItems({ type, category, brand, search, limit, offset: (page - 1) * limit, sort });
        setItems(fallback.items);
        setTotal(fallback.total);
      })
      .finally(() => setLoading(false));
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

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '0.5rem' }}>
          {type === 'auction' ? t('auctions') : type === 'fixed' ? t('sales') : search ? `${t('allItems')} "${search}"` : 'Catalogue'}
        </h1>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#9e8e7e' }}>
          {total} {total !== 1 ? t('resultsPlural') : t('results')}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Sidebar filters */}
        <aside style={{ width: '220px', flexShrink: 0 }} className="hidden md:block">
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#9e8e7e', marginBottom: '1rem' }}>{t('typeLabel')}</p>
            {['', 'fixed', 'auction'].map(v => (
              <button key={v} onClick={() => setParam('type', v)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: type === v ? '#c9a96e' : '#1a1a1a', fontWeight: type === v ? 600 : 400 }}>
                {v === '' ? t('allTypes') : v === 'fixed' ? t('sales') : t('auctions')}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#9e8e7e', marginBottom: '1rem' }}>{t('categoriesLabel')}</p>
            {rootCats.map(cat => (
              <div key={cat.id}>
                <button onClick={() => setParam('category', category === cat.id ? '' : cat.id)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: category === cat.id ? '#c9a96e' : '#1a1a1a', fontWeight: category === cat.id ? 600 : 400 }}>
                  {lang === 'en' ? cat.name_en : cat.name_fr}
                </button>
                {category === cat.id && categories.filter(c => c.parent_id === cat.id).map(sub => (
                  <button key={sub.id} onClick={() => setParam('category', sub.id)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '4px 0 4px 12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: category === sub.id ? '#c9a96e' : '#666' }}>
                    {lang === 'en' ? sub.name_en : sub.name_fr}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#9e8e7e', marginBottom: '1rem' }}>{t('brandsLabel')}</p>
            {BRANDS.map(b => (
              <button key={b} onClick={() => setParam('brand', brand === b ? '' : b)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '4px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: brand === b ? '#c9a96e' : '#1a1a1a', fontWeight: brand === b ? 600 : 400 }}>
                {b}
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div style={{ flex: 1 }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {activeFilters.map(f => (
                <span key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f8f4ef', padding: '4px 10px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', border: '1px solid #e8d5b7' }}>
                  {f.label}
                  <button onClick={() => setParam(f.key, '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9e8e7e', display: 'flex' }}><X size={12} /></button>
                </span>
              ))}
            </div>
            <select value={sort} onChange={e => setParam('sort', e.target.value)}
              style={{ border: '1px solid #e8d5b7', padding: '6px 12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#1a1a1a', backgroundColor: 'white' }}>
              <option value="created_at">{t('newest')}</option>
              <option value="price_asc">{t('priceLow')}</option>
              <option value="price_desc">{t('priceHigh')}</option>
              <option value="views">{t('mostViewed')}</option>
              <option value="ending">{t('endingSoon')}</option>
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#9e8e7e', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>{t('loading')}</div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', color: '#9e8e7e', marginBottom: '0.5rem' }}>{t('noItemsFound')}</p>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#9e8e7e' }}>{t('tryOtherFilters')}</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {items.map(item => <ItemCard key={item.id} item={item} />)}
              </div>

              {/* Pagination */}
              {total > limit && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                  {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 3).map(p => (
                    <button key={p} onClick={() => setParam('page', String(p))}
                      style={{ width: '36px', height: '36px', border: '1px solid', borderColor: p === page ? '#c9a96e' : '#e8d5b7', backgroundColor: p === page ? '#c9a96e' : 'white', color: p === page ? 'white' : '#1a1a1a', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem' }}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
