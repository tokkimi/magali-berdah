import { Link } from 'react-router-dom';

export const legalLinks = [
  { label: 'Mentions légales', to: '/mentions-legales' },
  { label: 'Conditions générales de vente', to: '/cgv' },
  { label: 'Politique de confidentialité', to: '/confidentialite' },
  { label: 'Conditions d’utilisation', to: '/cgu' },
] as const;

const documents = {
  mentions: {
    title: 'Mentions légales',
    sections: [
      ['Édition du site', 'VENDYY’S est accessible à l’adresse www.vendyys.com. Contact : contact@vendyys.com. L’identité juridique de l’éditeur, ses coordonnées postales et téléphoniques, son immatriculation et le nom de la direction de la publication restent à confirmer.'],
      ['Hébergement', 'Le site est hébergé par Vercel Inc. Les coordonnées légales de l’hébergeur restent à confirmer.'],
      ['Signalement', 'Pour signaler un contenu, écrivez à contact@vendyys.com avec l’adresse de la page, le motif du signalement et vos coordonnées.'],
    ],
  },
  sales: {
    title: 'Conditions générales de vente',
    sections: [
      ['Vendeur et caractéristiques du bien', 'Avant toute commande, consultez l’identité et le statut du vendeur ainsi que les caractéristiques de l’article, son état et les accessoires inclus. Pour une pièce de seconde main, reportez-vous à la description et aux défauts indiqués sur sa fiche.'],
      ['Prix et paiement', 'L’achat à prix fixe peut se faire sans compte. Vérifiez le montant total en euros, les taxes et les frais applicables avant de payer. Le paiement se fait sur la page sécurisée du prestataire. Les moyens de paiement proposés dépendent de l’article et des options effectivement disponibles.'],
      ['Participation à une enchère', 'Consultez le montant minimal et l’heure de clôture affichés pour l’article. Un compte est requis pour participer. Avant de confirmer votre offre, vérifiez son montant et les modalités de règlement applicables si vous remportez l’enchère. Toute manipulation artificielle des offres est interdite.'],
      ['Livraison et réclamations', 'Les modalités, frais et délais de livraison doivent être communiqués avant la commande. Pour une question sur une commande ou une livraison, écrivez à contact@vendyys.com en joignant la référence de la commande.'],
      ['Rétractation', 'Pour un achat à distance auprès d’un professionnel, le consommateur dispose en principe de 14 jours à compter de la réception du bien pour notifier sa rétractation, sous réserve des exceptions prévues par la loi. Une déclaration dénuée d’ambiguïté peut être adressée au vendeur. Indiquez par exemple votre nom, votre adresse, le bien concerné et les dates de commande et de réception. Les informations relatives au retour et à ses frais doivent être communiquées avant la commande.'],
      ['Garanties et litiges', 'Les garanties légales applicables restent acquises, notamment la garantie légale de conformité pour les ventes aux consommateurs par un professionnel et la garantie des vices cachés. Après réclamation écrite préalable, le consommateur peut saisir le médiateur dont relève le vendeur professionnel. Les coordonnées du médiateur restent à confirmer.'],
    ],
  },
  privacy: {
    title: 'Politique de confidentialité',
    sections: [
      ['Responsable du traitement', 'L’identité et les coordonnées postales du responsable du traitement restent à confirmer. Pour exercer vos droits, écrivez à contact@vendyys.com.'],
      ['Données, finalités et bases légales', 'Les coordonnées, données de compte, offres et informations de commande servent à traiter les demandes, administrer le compte et exécuter les achats. Les justificatifs nécessaires à la comptabilité relèvent d’obligations légales. La sécurité du service et la lutte contre la fraude peuvent relever de l’intérêt légitime. Les communications facultatives soumises au consentement peuvent être arrêtées en retirant ce consentement.'],
      ['Destinataires', 'Selon le service utilisé, les données nécessaires peuvent être traitées par les personnes habilitées et les prestataires concernés, notamment Vercel pour l’hébergement, Supabase pour le compte et les données du service, Stripe pour le paiement et le transporteur pour la livraison. Les coordonnées bancaires sont saisies sur l’interface du prestataire de paiement.'],
      ['Conservation et transferts', 'Les données sont conservées selon la durée nécessaire à leur finalité et les obligations applicables. Les durées par catégorie de données, les pays de traitement et les garanties applicables aux éventuels transferts hors de l’Espace économique européen restent à confirmer.'],
      ['Stockage sur l’appareil et liens externes', 'Le site utilise le stockage du navigateur pour la session et des préférences comme la langue ou les favoris. Si vous ouvrez un service tiers, par exemple WhatsApp ou un service de paiement, ses règles de confidentialité s’appliquent à son propre traitement.'],
      ['Vos droits', 'Selon le traitement, vous pouvez demander l’accès à vos données, leur rectification, leur effacement, leur portabilité ou la limitation du traitement, vous y opposer et retirer un consentement. Vous pouvez déposer une réclamation auprès de la CNIL sur www.cnil.fr.'],
    ],
  },
  terms: {
    title: 'Conditions d’utilisation',
    sections: [
      ['Accès au service', 'VENDYY’S permet de consulter un catalogue de mode de seconde main, d’acheter les articles disponibles, de participer aux enchères ouvertes et de soumettre des articles. Les règles de vente figurent dans les CGV.'],
      ['Compte utilisateur', 'Renseignez des informations exactes, protégez vos identifiants et contactez VENDYY’S si vous constatez un usage non autorisé de votre compte.'],
      ['Soumissions et comportement', 'Soumettez uniquement des articles que vous êtes autorisé à proposer. Décrivez leur état avec exactitude et utilisez des photos que vous êtes autorisé à partager. La contrefaçon, l’usurpation d’identité et la manipulation des enchères sont interdites.'],
      ['Signalement et restriction d’accès', 'Signalez un article ou un comportement à contact@vendyys.com. En cas de fraude, d’abus ou d’atteinte à la sécurité, VENDYY’S peut restreindre l’accès au service. Vous pouvez contacter le support pour demander un réexamen.'],
    ],
  },
};

export default function LegalPage({ document }: { document: keyof typeof documents }) {
  const { title, sections } = documents[document];
  return (
    <main style={{ maxWidth: 800, margin: '3rem auto', padding: '0 1.25rem 3rem', lineHeight: 1.75 }}>
      <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)' }}>{title}</h1>
      <p>Version en cours de validation.</p>
      {sections.map(([heading, body]) => (
        <section key={heading} style={{ marginTop: '1.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{heading}</h2>
          <p>{body}</p>
        </section>
      ))}
      <nav aria-label="Documents juridiques" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.5rem', marginTop: '2rem' }}>
        {legalLinks.filter(({ label }) => label !== title).map(({ label, to }) => (
          <Link key={to} to={to} style={{ textDecoration: 'underline' }}>{label}</Link>
        ))}
      </nav>
    </main>
  );
}
