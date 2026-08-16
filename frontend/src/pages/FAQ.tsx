import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    cat: 'Achats & Enchères',
    items: [
      {
        q: 'Comment fonctionne une enchère ?',
        a: "Chaque article en enchère affiche un prix de départ et une date de fin. Vous proposez un montant supérieur à l'offre actuelle. Si quelqu'un surenchérit, vous recevez une notification. À la fin du compte à rebours, le plus offrant remporte la pièce et une commande est créée automatiquement."
      },
      {
        q: 'Que se passe-t-il si je remporte une enchère ?',
        a: "Vous êtes notifié par e-mail et une commande est créée automatiquement à votre nom. Le montant de votre offre est votre prix d'achat. La livraison est incluse. Vous pouvez suivre l'envoi directement depuis votre espace commandes."
      },
      {
        q: "Mon offre a été surpassée, que faire ?",
        a: "Vous recevez une notification en temps réel. Retournez sur la page de l'article pour placer une nouvelle offre. Vous n'êtes débité que si vous remportez l'enchère — aucun frais si vous perdez."
      },
      {
        q: "Puis-je annuler une enchère ?",
        a: "Non. Conformément aux CGV, toute offre placée est ferme et irrévocable. En enchérissant, vous vous engagez contractuellement à payer si vous remportez la vente. C'est pourquoi un écran de confirmation s'affiche avant chaque offre."
      },
      {
        q: "Qu'est-ce que la Vente Exclusive ?",
        a: "La Vente Exclusive est une sélection de pièces rares proposées sur une fenêtre horaire limitée — souvent quelques heures seulement. Ces articles ne sont pas disponibles en dehors de cette période. Activez les notifications pour ne pas manquer l'ouverture."
      },
      {
        q: "Comment acheter à prix fixe ?",
        a: "Sur les articles affichant un prix fixe, cliquez sur 'Acheter maintenant'. Un récapitulatif s'affiche avant de confirmer. Le paiement est sécurisé et la livraison incluse."
      },
    ]
  },
  {
    cat: 'Livraison & Retours',
    items: [
      {
        q: 'La livraison est-elle vraiment incluse ?',
        a: "Oui, toujours. Le prix affiché inclut les frais de livraison vers la France métropolitaine. Pour les livraisons internationales, des frais supplémentaires peuvent s'appliquer — ils sont indiqués au moment de la commande."
      },
      {
        q: 'Combien de temps pour recevoir ma commande ?',
        a: "Votre colis est expédié sous 48h après confirmation du paiement. La livraison prend ensuite 2 à 5 jours ouvrés en France. Vous recevrez un numéro de suivi par e-mail dès l'expédition."
      },
      {
        q: 'Puis-je retourner un article ?',
        a: "Oui. Conformément à la Directive européenne 2011/83/UE, vous disposez de 14 jours calendaires à compter de la réception pour exercer votre droit de rétractation, sans justification. Les frais de retour sont à votre charge sauf si l'article ne correspond pas à la description."
      },
    ]
  },
  {
    cat: 'Authenticité & Qualité',
    items: [
      {
        q: "Comment garantissez-vous l'authenticité des pièces ?",
        a: "Chaque article est sélectionné et authentifié personnellement par Magali Berdah avant d'être mis en ligne. Il n'y a pas de vendeurs tiers sur la plateforme — toutes les pièces proviennent directement de la boutique officielle Magali Berdah."
      },
      {
        q: "Les photos correspondent-elles vraiment aux articles ?",
        a: "Oui. Toutes les photos sont prises par nos soins et montrent l'article réel — état, couleur, détails. La description précise l'état de la pièce (neuf, très bon état, bon état). En cas de doute, contactez-nous avant d'enchérir."
      },
      {
        q: "Et si l'article reçu ne correspond pas à la description ?",
        a: "Contactez-nous immédiatement à contact@magaliberdah.com avec des photos. Si l'article ne correspond pas, nous prenons en charge les frais de retour et vous remboursons intégralement."
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
        a: "Oui. Conformément au RGPD, vos données ne sont jamais revendues à des tiers. Vous pouvez demander la suppression de votre compte à tout moment en écrivant à contact@magaliberdah.com."
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
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2.5rem 1.25rem 6rem' }}>
      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.35em', color: '#c9a96e', marginBottom: '0.5rem' }}>AIDE</p>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 400, color: '#1a1a1a', marginBottom: '0.5rem' }}>
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
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: 'white', marginBottom: '0.5rem' }}>Vous n'avez pas trouvé votre réponse ?</p>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', marginBottom: '1rem' }}>
          Écrivez-nous à <a href="mailto:contact@magaliberdah.com" style={{ color: '#c9a96e' }}>contact@magaliberdah.com</a>
        </p>
        <Link to="/comment-acheter" style={{ border: '1px solid #c9a96e', color: '#c9a96e', padding: '10px 20px', textDecoration: 'none', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', letterSpacing: '0.1em', borderRadius: '2px' }}>
          GUIDE D'ACHAT COMPLET
        </Link>
      </div>
    </div>
  );
}
