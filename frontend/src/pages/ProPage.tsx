import { Link } from 'react-router-dom';
import { Check, Star, Shield, TrendingUp } from 'lucide-react';
import { useStore } from '../lib/store';

export default function ProPage() {
  const { user } = useStore();

  return (
    <div>
      {/* Hero */}
      <div style={{ backgroundColor: '#1a1a1a', padding: '6rem 2rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.4em', color: '#c9a96e', marginBottom: '1rem' }}>ESPACE PROFESSIONNEL</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'white', fontWeight: 400, marginBottom: '1.5rem' }}>
          Vendez vos pièces de luxe<br />sur Magali Berdah
        </h1>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '1rem', color: '#9e8e7e', maxWidth: '500px', margin: '0 auto 2.5rem', lineHeight: '1.7' }}>
          Rejoignez notre réseau de boutiques professionnelles et touchez des clients passionnés de mode de luxe dans le monde entier.
        </p>
        {user?.role === 'pro' ? (
          <Link to="/boutique" className="btn-gold">ACCÉDER À MON ESPACE</Link>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="#abonnement" className="btn-gold">DÉCOUVRIR NOS OFFRES</a>
          </div>
        )}
      </div>

      {/* Benefits */}
      <div style={{ padding: '5rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
          {[
            { icon: Shield, title: 'Boutique vérifiée', text: 'Profil professionnel certifié avec badge de confiance visible par tous les acheteurs.' },
            { icon: TrendingUp, title: 'Visibilité maximale', text: 'Vos articles apparaissent dans le catalogue et peuvent être mis en avant sur la home.' },
            { icon: Star, title: 'Commission réduite', text: 'Jusqu\'à 5% de commission avec l\'abonnement Premium, contre 20% en plan gratuit.' },
            { icon: Check, title: 'Outils complets', text: 'Tableau de bord, messagerie, gestion des enchères, portefeuille et statistiques.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ width: '60px', height: '60px', backgroundColor: '#f8f4ef', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Icon size={24} color="#c9a96e" />
              </div>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 400, marginBottom: '0.75rem', color: '#1a1a1a' }}>{title}</h3>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#9e8e7e', lineHeight: '1.7' }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div id="abonnement" style={{ backgroundColor: '#f8f4ef', padding: '4rem 1.25rem' }}>
        <style>{`
          @media (min-width: 640px) { .pricing-grid { grid-template-columns: 1fr 1fr !important; } }
        `}</style>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.4em', color: '#c9a96e', marginBottom: '0.75rem' }}>NOS OFFRES</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a' }}>Choisissez votre plan</h2>
        </div>
        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
          {[
            {
              name: 'GRATUIT', price: '0 €', period: '', color: '#1a1a1a',
              features: ['10 articles maximum', '20% de commission', 'Profil boutique', 'Messagerie acheteur', 'Ventes & enchères'],
              cta: 'Commencer gratuitement', ctaLink: '/inscription?role=pro', primary: false
            },
            {
              name: 'PREMIUM', price: '129 €', period: '/mois', color: '#c9a96e',
              features: ['Articles illimités', '5% de commission seulement', 'Bannière + photo de profil', 'Mise en avant prioritaire', 'Statistiques avancées', 'Support dédié', 'Badge Premium'],
              cta: 'Démarrer Premium', ctaLink: '/boutique/abonnement', primary: true
            },
          ].map(plan => (
            <div key={plan.name} style={{ backgroundColor: 'white', border: `2px solid ${plan.primary ? '#c9a96e' : '#e8d5b7'}`, padding: '2rem 1.5rem', position: 'relative' }}>
              {plan.primary && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#c9a96e', color: 'white', padding: '4px 20px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em' }}>RECOMMANDÉ</div>
              )}
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.25em', color: plan.color, marginBottom: '1rem' }}>{plan.name}</p>
              <div style={{ marginBottom: '2rem' }}>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '3rem', color: '#1a1a1a' }}>{plan.price}</span>
                <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#9e8e7e' }}>{plan.period}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Check size={14} color="#c9a96e" />
                    <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#1a1a1a' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link to={user ? (plan.primary ? '/boutique/abonnement' : '/boutique') : '/inscription?role=pro'}
                className={plan.primary ? 'btn-gold' : 'btn-outline'} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                {user ? plan.cta : 'S\'inscrire'}
              </Link>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: '2rem', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e' }}>
          Sans engagement · Annulable à tout moment · Paiement sécurisé
        </p>
      </div>
    </div>
  );
}
