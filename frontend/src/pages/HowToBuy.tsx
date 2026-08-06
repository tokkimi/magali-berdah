import { Link } from 'react-router-dom';
import { Search, UserCheck, CreditCard, Package, MessageCircle, RotateCcw } from 'lucide-react';

const steps = [
  {
    icon: Search,
    num: '01',
    title: 'Parcourez le catalogue',
    text: 'Explorez nos sélections par catégorie (Femme, Homme, Sacs, Accessoires) ou utilisez la recherche. Filtrez par marque, prix, taille ou état. Chaque pièce vient d\'une boutique professionnelle vérifiée.'
  },
  {
    icon: UserCheck,
    num: '02',
    title: 'Créez votre compte',
    text: 'Inscrivez-vous gratuitement avec votre adresse e-mail. Votre compte vous permet de suivre vos achats et enchères, de sauvegarder vos favoris et de contacter les vendeurs.'
  },
  {
    icon: CreditCard,
    num: '03',
    title: 'Achetez ou enchérissez',
    text: 'Deux façons d\'acheter : prix fixe (achat immédiat) ou enchères (proposez un montant avant la fin du compte à rebours). Pour les enchères, vous êtes notifié si vous êtes surpassé. Le plus offrant remporte la pièce.'
  },
  {
    icon: Package,
    num: '04',
    title: 'Livraison suivie',
    text: 'La livraison est toujours incluse dans le prix affiché. Le vendeur prépare votre colis et vous communique le numéro de suivi via la messagerie de commande. Délai moyen : 3 à 5 jours ouvrés.'
  },
  {
    icon: MessageCircle,
    num: '05',
    title: 'Messagerie avec le vendeur',
    text: 'Après votre achat, un chat direct s\'ouvre avec la boutique. Posez vos questions sur l\'emballage, le suivi ou l\'état de la pièce. Le vendeur a l\'obligation de répondre sous 48h.'
  },
  {
    icon: RotateCcw,
    num: '06',
    title: 'Droit de retour 14 jours',
    text: 'Conformément au droit européen (Directive 2011/83/UE), vous disposez de 14 jours pour retourner votre achat sans justification. Les frais de retour sont à votre charge sauf défaut de conformité.'
  },
];

export default function HowToBuy() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2.5rem 1.25rem 6rem' }}>
      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.35em', color: '#c9a96e', marginBottom: '0.5rem' }}>GUIDE</p>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 400, color: '#1a1a1a', marginBottom: '0.5rem' }}>Comment acheter</h1>
      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#9e8e7e', marginBottom: '3rem', lineHeight: 1.7 }}>
        Tout ce qu'il faut savoir pour acheter ou enchérir sur Magali Berdah en toute confiance.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.num} style={{ display: 'flex', gap: '1.25rem', paddingBottom: '2rem', marginBottom: '2rem', borderBottom: i < steps.length - 1 ? '1px solid #f0ece6' : 'none' }}>
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '44px', height: '44px', backgroundColor: '#f8f4ef', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color="#c9a96e" />
                </div>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.7rem', color: '#e8d5b7' }}>{step.num}</span>
              </div>
              <div>
                <h2 style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                  {step.title}
                </h2>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#5a5a5a', lineHeight: 1.75 }}>
                  {step.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div style={{ backgroundColor: '#f8f4ef', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', marginTop: '1rem' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#1a1a1a', marginBottom: '1rem' }}>
          Prêt(e) à découvrir nos pièces ?
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/catalogue" className="btn-gold" style={{ fontSize: '0.7rem' }}>EXPLORER LE CATALOGUE</Link>
          <Link to="/faq" style={{ border: '1px solid #c9a96e', color: '#c9a96e', padding: '10px 18px', textDecoration: 'none', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', letterSpacing: '0.1em', borderRadius: '2px' }}>
            VOIR LA FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
