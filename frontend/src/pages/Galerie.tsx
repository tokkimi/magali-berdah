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
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 5vw 6rem' }}>
      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.55rem', letterSpacing: '0.35em', color: '#c9a96e', marginBottom: '6px' }}>MAGALI BERDAH</p>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 400, color: '#1a1a1a', marginBottom: '0.25rem' }}>La Galerie</h1>
      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#9e8e7e', marginBottom: '2.5rem' }}>
        La sélection complète — sacs et accessoires de luxe de seconde main.
      </p>

      {loading && items.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ aspectRatio: '3/4', backgroundColor: '#f2f2f0', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : (
        <>
          <style>{`
            .galerie-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
            @media (min-width: 768px) { .galerie-grid { grid-template-columns: repeat(4, 1fr); gap: 3px; } }
            @media (min-width: 1100px) { .galerie-grid { grid-template-columns: repeat(5, 1fr); gap: 4px; } }
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
  );
}
