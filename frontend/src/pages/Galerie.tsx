import { useState, useEffect } from 'react';
import ItemCard from '../components/ItemCard';
import { filterStaticItems } from '../lib/staticItems';
import { getSharedItems } from '../lib/marketplace';

export default function Galerie() {
  const [items, setItems] = useState<any[]>(() => filterStaticItems({ limit: 20 }).items);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getSharedItems({ limit: 40 })
      .then(shared => {
        if (!active) return;
        const merged = [...new Map(
          [...filterStaticItems({ limit: 100 }).items, ...shared].map(i => [i.id, i])
        ).values()].filter(i => i.status === 'active');
        setItems(merged);
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', padding: '2.5rem 1rem 1.5rem', borderBottom: '1px solid #e8e8e8', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: 'clamp(1rem, 5vw, 1.4rem)', fontWeight: 700, letterSpacing: '0.22em', color: '#1a1a1a', textTransform: 'uppercase', marginBottom: '0.4rem' }}>LA GALERIE</h1>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.12em', color: '#999' }}>
          Sacs &amp; accessoires de luxe
        </p>
      </div>
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px 4rem' }}>

      {loading && items.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ aspectRatio: '3/4', backgroundColor: '#f2f2f0', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : (
        <>
          <style>{`
            .galerie-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
            .galerie-grid > *:nth-child(4n+1) { grid-column: 1 / -1; }
            @media (min-width: 768px) { .galerie-grid { gap: 14px; } }
          `}</style>
          <div className="galerie-grid">
            {items.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
          {!loading && items.length === 0 && (
            <p style={{ textAlign: 'center', color: '#9e8e7e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', padding: '4rem 0' }}>
              La galerie sera bientôt disponible.
            </p>
          )}
        </>
      )}
    </div>
    </div>
  );
}
