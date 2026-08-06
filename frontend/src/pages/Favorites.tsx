import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useStore } from '../lib/store';
import ItemCard from '../components/ItemCard';
import { STATIC_ITEMS } from '../lib/staticItems';

export default function Favorites() {
  const { user, favIds } = useStore();

  // favIds is the source of truth (localStorage-persisted in Zustand store)
  const favItems = STATIC_ITEMS.filter(item => favIds.has(item.id));

  if (!user) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem' }}>
        <Heart size={48} color="#e8d5b7" />
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 400, color: '#1a1a1a' }}>Vos favoris</h1>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#9e8e7e', textAlign: 'center' }}>
          Connectez-vous pour retrouver vos pièces favorites
        </p>
        <Link to="/" className="btn-gold" style={{ marginTop: '0.5rem' }}>SE CONNECTER</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem 6rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.55rem', letterSpacing: '0.35em', color: '#c9a96e', marginBottom: '4px' }}>MON COMPTE</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 400, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={20} color="#c9a96e" fill="#c9a96e" />
            Mes favoris
          </h1>
          {favItems.length > 0 && (
            <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e' }}>
              {favItems.length} pièce{favItems.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {favItems.length === 0 ? (
        <div style={{ minHeight: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center' }}>
          <div style={{ width: '70px', height: '70px', backgroundColor: '#f8f4ef', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={28} color="#e8d5b7" />
          </div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 400, color: '#1a1a1a' }}>
            Aucun favori pour l'instant
          </h2>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#9e8e7e', maxWidth: '280px' }}>
            Appuyez sur le cœur d'un article pour l'ajouter à votre liste
          </p>
          <Link to="/catalogue" className="btn-gold" style={{ marginTop: '0.5rem', fontSize: '0.7rem' }}>
            EXPLORER LE CATALOGUE
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {favItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e8d5b7', textAlign: 'center' }}>
            <Link to="/catalogue" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', letterSpacing: '0.1em', color: '#9e8e7e', textDecoration: 'none' }}>
              ← Continuer à explorer
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
