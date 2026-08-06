import { useStore } from '../../lib/store';
import { api } from '../../lib/api';
import { Check, Star } from 'lucide-react';
import { useState } from 'react';

export default function ProSubscription() {
  const { shop } = useStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const subscribe = async () => {
    setLoading(true);
    try {
      await api.post('/shops/me/subscribe');
      setSuccess(true);
      window.location.reload();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', padding: '0 0 4rem' }}>
      <style>{`@media(max-width:640px){.sub-grid{grid-template-columns:1fr !important;}}`}</style>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '0.5rem' }}>Abonnement</h1>
      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#9e8e7e', marginBottom: '2rem' }}>
        Statut actuel : {shop?.subscription_active ? <span style={{ color: '#c9a96e', fontWeight: 600 }}>★ Premium actif</span> : 'Plan gratuit'}
      </p>

      <div className="sub-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Free */}
        <div style={{ border: '1px solid #e8d5b7', padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px' }}>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#9e8e7e', marginBottom: '0.5rem' }}>PLAN GRATUIT</p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', color: '#1a1a1a', marginBottom: '0.25rem' }}>0 €</p>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', marginBottom: '2rem' }}>Sans engagement</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {[
              '10 articles maximum',
              '20% de commission',
              'Profil boutique basique',
              'Messagerie incluse',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="#c9a96e" />
                <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#1a1a1a' }}>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#9e8e7e', textAlign: 'center' }}>
            {!shop?.subscription_active ? '✓ Plan actuel' : ''}
          </div>
        </div>

        {/* Premium */}
        <div style={{ border: '2px solid #c9a96e', padding: '1.5rem', backgroundColor: 'white', position: 'relative', borderRadius: '8px' }}>
          <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#c9a96e', color: 'white', padding: '4px 20px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em' }}>
            RECOMMANDÉ
          </div>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#c9a96e', marginBottom: '0.5rem' }}>PLAN PREMIUM</p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', color: '#1a1a1a', marginBottom: '0.25rem' }}>129 €</p>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', marginBottom: '2rem' }}>par mois · sans engagement</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {[
              'Articles illimités',
              '5% de commission seulement',
              'Bannière + photo de profil',
              'Mise en avant prioritaire',
              'Statistiques avancées',
              'Support dédié',
              'Badge Premium',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={14} color="#c9a96e" fill="#c9a96e" />
                <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#1a1a1a' }}>{f}</span>
              </div>
            ))}
          </div>
          {shop?.subscription_active ? (
            <div style={{ textAlign: 'center', color: '#2e7d32', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem' }}>✓ Abonnement actif</div>
          ) : (
            <button onClick={subscribe} disabled={loading} className="btn-gold" style={{ width: '100%' }}>
              {loading ? 'Activation...' : success ? '✓ Activé !' : "S'ABONNER MAINTENANT"}
            </button>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: '#f8f4ef', border: '1px solid #e8d5b7', padding: '1.5rem', marginTop: '2rem' }}>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#9e8e7e', lineHeight: '1.7' }}>
          <strong style={{ color: '#1a1a1a' }}>Note :</strong> Le paiement de l'abonnement est simulé dans cette démo. En production, l'intégration Stripe permettra un paiement sécurisé par carte bancaire. L'abonnement se renouvelle automatiquement chaque mois et peut être annulé à tout moment.
        </p>
      </div>
    </div>
  );
}
