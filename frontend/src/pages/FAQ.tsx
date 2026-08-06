import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    cat: 'Achats & Enchères',
    items: [
      {
        q: 'Comment fonctionne une enchère ?',
        a: "Chaque article en enchère affiche un prix de départ et une date de fin. Vous proposez un montant supérieur à l'offre actuelle. Si quelqu'un surenchérit, vous recevez une notification. À la fin du compte à rebours, le plus offrant remporte la pièce et reçoit une commande automatiquement."
      },
      {
        q: 'Puis-je acheter au prix fixe et enchérir sur le même article ?',
        a: "Certains vendeurs activent les deux options. Si un prix fixe est disponible, vous pouvez acheter immédiatement et mettre fin aux enchères. Sinon, seule l'enchère est disponible jusqu'à la date de clôture."
      },
      {
        q: 'Que se passe-t-il si je remporte une enchère ?',
        a: "Vous êtes automatiquement notifié et une commande est créée. Le montant remporté est votre prix d'achat. La livraison est toujours incluse. Vous avez accès à la messagerie du vendeur pour coordonner l'envoi."
      },
      {
        q: "Mon offre a été surpassée, que faire ?",
        a: "Vous recevez une notification en temps réel. Retournez sur la page de l'article pour placer une nouvelle offre. Rien ne vous y oblige — vous n'êtes débité que si vous remportez l'enchère."
      },
    ]
  },
  {
    cat: 'Livraison & Retours',
    items: [
      {
        q: 'La livraison est-elle vraiment incluse ?',
        a: "Oui, toujours. Le prix affiché (fixe ou enchère) inclut les frais de livraison vers la France métropolitaine. Pour les livraisons internationales, des frais supplémentaires peuvent s'appliquer selon le vendeur."
      },
      {
        q: 'Combien de temps pour recevoir ma commande ?',
        a: "Dès que votre paiement est confirmé, le vendeur a 48h pour expédier. La livraison prend ensuite 2 à 5 jours ouvrés en France. Vous recevrez un numéro de suivi via la messagerie de commande."
      },
      {
        q: 'Puis-je retourner un article ?',
        a: "Oui. Conformément à la Directive européenne 2011/83/UE, vous disposez de 14 jours calendaires à compter de la réception pour exercer votre droit de rétractation, sans justification. Les frais de retour sont à votre charge sauf si l'article ne correspond pas à la description."
      },
    ]
  },
  {
    cat: 'Compte & Sécurité',
    items: [
      {
        q: "Comment créer un compte ?",
        a: "Cliquez sur 'S'inscrire' en haut à droite. Entrez votre nom, e-mail et un mot de passe sécurisé. C'est gratuit et sans abonnement pour les acheteurs."
      },
      {
        q: "Les vendeurs sont-ils vérifiés ?",
        a: "Tous les vendeurs professionnels fournissent leur SIRET lors de l'inscription. Notre équipe vérifie les informations et valide manuellement chaque boutique avant la première mise en ligne."
      },
      {
        q: "Mes données personnelles sont-elles protégées ?",
        a: "Oui. Conformément au RGPD, vos données ne sont jamais revendues à des tiers. Vous pouvez demander la suppression de votre compte à tout moment en écrivant à contact@magaliberdah.com."
      },
    ]
  },
  {
    cat: 'Vendre sur Magali Berdah',
    items: [
      {
        q: "Comment ouvrir ma boutique ?",
        a: "Cliquez sur 'Espace Pro' et inscrivez-vous avec votre SIRET. Après vérification (24-48h), vous pouvez publier jusqu'à 10 articles gratuitement avec une commission de 20%."
      },
      {
        q: "Qu'est-ce que l'abonnement Premium ?",
        a: "À 129€/mois, le Premium vous donne un nombre illimité d'articles et réduit la commission à 5%. Idéal si vous vendez régulièrement plus de 10 pièces par mois."
      },
      {
        q: "Comment suis-je payé ?",
        a: "Vos revenus (prix de vente - commission) sont crédités sur votre portefeuille Magali Berdah dès que la commande est marquée comme livrée. Vous pouvez ensuite demander un virement bancaire."
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
        Retrouvez toutes les réponses à vos questions sur les achats, livraisons et la vente.
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
