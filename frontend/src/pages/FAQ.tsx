import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    cat: 'Achats & Enchères',
    items: [
      {
        q: "Comment fonctionne une enchère ?",
        a: "Chaque article en enchère affiche un prix de départ et une durée. Vous placez votre offre, et si quelqu'un surenchérit, vous êtes notifié. La personne avec l'offre la plus haute à la fin du compte à rebours remporte l'article."
      },
      {
        q: "Ma carte est-elle débitée immédiatement quand j'enchéris ?",
        a: "Non. Votre carte est uniquement pré-autorisée (empreinte bancaire) pour vérifier qu'elle est valide. Le débit réel n'intervient que si vous remportez l'enchère."
      },
      {
        q: "Puis-je annuler une offre ?",
        a: "Non. Toute offre placée est ferme et définitive. Enchérissez uniquement si vous êtes prêt à acheter au prix proposé."
      },
      {
        q: "Qu'est-ce que la Vente Exclusive ?",
        a: "La Vente Exclusive est une sélection de pièces d'exception disponibles pour une durée limitée, souvent quelques heures. Les prix sont fixes, sans enchère. Soyez rapide — une fois le stock épuisé, c'est terminé."
      },
    ]
  },
  {
    cat: 'Authenticité & Qualité',
    items: [
      {
        q: "Comment garantissez-vous l'authenticité des articles ?",
        a: "Chaque article est inspecté par notre équipe avant mise en vente : coutures, numéros de série, matériaux, finitions, packaging. Les sacs et accessoires sont également vérifiés via Entrupy, technologie d'authentification par IA reconnue mondialement."
      },
      {
        q: "Les photos correspondent-elles vraiment aux articles ?",
        a: "Oui. Toutes les photos sont prises par nos soins et montrent l'article réel — état, couleur, détails. La description précise l'état de la pièce (neuf, très bon état, bon état). En cas de doute, contactez-nous avant d'enchérir."
      },
      {
        q: "Et si l'article reçu ne correspond pas à la description ?",
        a: "Contactez-nous immédiatement à contact@vendyys.com avec des photos. Si l'article ne correspond pas, nous prenons en charge les frais de retour et vous remboursons intégralement."
      },
    ]
  },
  {
    cat: 'Compte & Sécurité',
    items: [
      {
        q: "Comment créer un compte ?",
        a: "Cliquez sur 'S'inscrire' en haut à droite. Entrez votre prénom, nom, e-mail et un mot de passe. C'est gratuit et sans abonnement."
      },
      {
        q: "Mes données personnelles sont-elles protégées ?",
        a: "Oui. Conformément au RGPD, vos données ne sont jamais revendues à des tiers. Vous pouvez demander la suppression de votre compte à tout moment en écrivant à contact@vendyys.com."
      },
      {
        q: "Que se passe-t-il si je ne paie pas après avoir remporté une enchère ?",
        a: "Toute enchère remportée non payée est signalée comme incident. Au 1er incident : avertissement + 7 jours de suspension. Au 2e : 30 jours de suspension. Au 3e : bannissement définitif et blocage de l'adresse e-mail. Des poursuites peuvent être engagées pour escroquerie (Code pénal, art. 313-1)."
      },
    ]
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #f0ece6' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '1rem' }}
      >
        <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#1a1a1a', fontWeight: 500, lineHeight: 1.4 }}>{q}</span>
        <ChevronDown size={16} color="#c9a96e" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>
      {open && (
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#5a5a5a', lineHeight: 1.75, paddingBottom: '1rem' }}>
          {a}
        </p>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'calc(44px + 1.5rem) 1.25rem 6rem' }}>
      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.35em', color: '#c9a96e', marginBottom: '0.5rem' }}>AIDE</p>
      <h1 style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 400, color: '#1a1a1a', marginBottom: '0.5rem' }}>
        Questions fréquentes
      </h1>
      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#9e8e7e', marginBottom: '2.5rem', lineHeight: 1.7 }}>
        Toutes les réponses sur les achats, enchères, livraisons et l'authenticité des pièces.
      </p>

      {faqs.map(section => (
        <div key={section.cat} style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', color: '#c9a96e', marginBottom: '0.25rem', paddingBottom: '0.5rem', borderBottom: '2px solid #c9a96e', display: 'inline-block' }}>
            {section.cat.toUpperCase()}
          </h2>
          <div style={{ marginTop: '0.25rem' }}>
            {section.items.map(item => <FaqItem key={item.q} q={item.q} a={item.a} />)}
          </div>
        </div>
      ))}

      <div style={{ backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', marginTop: '2rem' }}>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '1rem', color: 'white', marginBottom: '0.5rem' }}>Vous n'avez pas trouvé votre réponse ?</p>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', marginBottom: '1rem' }}>
          Écrivez-nous à <a href="mailto:contact@vendyys.com" style={{ color: '#c9a96e' }}>contact@vendyys.com</a>
        </p>
        <Link to="/comment-acheter" style={{ border: '1px solid #c9a96e', color: '#c9a96e', padding: '10px 20px', textDecoration: 'none', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', letterSpacing: '0.1em', borderRadius: '2px' }}>
          GUIDE D'ACHAT COMPLET
        </Link>
      </div>
    </div>
  );
}
