const sections = [
  ['1. Objet et acceptation', `Les présentes conditions générales encadrent les ventes à prix fixe et les ventes aux enchères proposées sur le site Magali Berdah. Avant toute commande, le client peut les consulter, les télécharger et les accepter. La version applicable est celle présentée au moment de la commande.`],
  ['2. Identité et contact', `Le service client est joignable à contact@magaliberdah.com. Les informations légales complètes de l’exploitant (dénomination, forme juridique, siège, immatriculation et numéro de TVA le cas échéant) doivent également figurer dans les mentions légales du site et sur les documents de commande.`],
  ['3. Produits, seconde main et authenticité', `Les caractéristiques essentielles, photographies, dimensions, état, défauts connus et accessoires inclus sont indiqués sur chaque fiche. Les articles de seconde main peuvent présenter des traces d’usage décrites avant l’achat. Toute information déterminante connue doit être communiquée au client. La vente de contrefaçons est strictement interdite.`],
  ['4. Prix et frais', `Les prix sont affichés en euros, toutes taxes comprises lorsque la TVA est applicable. Les frais de livraison, taxes, droits de douane éventuels et tout autre coût obligatoire sont indiqués avant la validation définitive. Le prix dû est celui affiché dans le récapitulatif de commande.`],
  ['5. Commande et paiement', `Le client vérifie son panier, son adresse, le prix total et le moyen de paiement avant de confirmer une commande comportant une obligation de paiement. Une confirmation récapitulative est adressée sur un support durable. La commande peut être refusée en cas de fraude suspectée, d’indisponibilité ou d’incident de paiement, avec remboursement des sommes encaissées.`],
  ['6. Enchères', `Chaque enchère engage son auteur selon les règles affichées avant participation. Le prix de départ, l’heure de clôture, les éventuels paliers et conditions particulières sont présentés clairement. Le régime du droit de rétractation dépend de la nature juridique exacte de la vente et des exceptions prévues par le Code de la consommation ; aucune exclusion générale ne peut être appliquée au-delà de la loi.`],
  ['7. Livraison et transfert des risques', `Le délai ou la date de livraison est communiqué avant la commande. À défaut d’indication particulière, la livraison intervient au plus tard dans le délai légal. Le client doit signaler rapidement toute perte, avarie ou non-conformité, sans que cela limite ses garanties légales. Pour un consommateur, le risque est transféré lors de la prise de possession physique du bien, sauf transporteur choisi indépendamment par lui.`],
  ['8. Droit de rétractation', `Lorsque le droit de rétractation s’applique, le consommateur dispose de quatorze jours à compter de la réception du bien pour notifier sa décision sans justification. Il retourne ensuite le bien dans le délai légal, complet et dans l’état permettant sa vérification. Les frais directs de retour sont à sa charge uniquement si cela lui a été annoncé avant la commande. Le remboursement intervient selon les délais et modalités prévus par la loi. Un formulaire type doit rester facilement accessible.`],
  ['9. Garanties légales', `Le consommateur bénéficie de la garantie légale de conformité et de la garantie des vices cachés dans les conditions prévues par le Code de la consommation et le Code civil. Ces garanties sont indépendantes de toute garantie commerciale. Une clause contractuelle ne peut ni les supprimer ni les réduire.`],
  ['10. Réclamations et médiation', `Toute réclamation peut être envoyée à contact@magaliberdah.com avec le numéro de commande et les justificatifs utiles. Après une réclamation écrite restée sans solution, le consommateur peut saisir gratuitement le médiateur de la consommation dont les coordonnées doivent être communiquées dans les mentions légales et les documents contractuels. Il conserve également le droit de saisir la juridiction compétente.`],
  ['11. Données personnelles', `Les données sont traitées pour la gestion des comptes, commandes, paiements, livraisons, sécurité et obligations légales. Les droits d’accès, rectification, effacement, limitation, opposition et portabilité s’exercent à contact@magaliberdah.com, dans les limites prévues par le RGPD. Les détails figurent dans la politique de confidentialité.`],
  ['12. Droit applicable', `Les présentes conditions sont soumises au droit français, sans priver le consommateur des dispositions impératives plus protectrices de son pays de résidence lorsque celles-ci s’appliquent. Si une clause est déclarée invalide, les autres restent applicables.`],
];

export default function CGV() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(2rem,6vw,4rem) 1rem' }}>
      <p style={{ color: '#c9a96e', font: '700 11px Helvetica Neue, Arial', letterSpacing: '.18em' }}>INFORMATIONS CONTRACTUELLES</p>
      <h1 style={{ font: '400 clamp(1.8rem,5vw,2.6rem) Georgia, serif', margin: '.5rem 0' }}>Conditions générales de vente</h1>
      <p style={{ color: '#777', font: '13px Helvetica Neue, Arial', marginBottom: 32 }}>Dernière mise à jour : 9 août 2026</p>
      <div style={{ padding: 16, background: '#fff8e8', border: '1px solid #e8d5b7', marginBottom: 32, font: '13px/1.6 Helvetica Neue, Arial' }}>
        Ces conditions doivent être complétées par les mentions légales de l’exploitant et l’identité du médiateur de la consommation avant l’ouverture définitive des paiements.
      </div>
      {sections.map(([title, content]) => <section key={title} style={{ marginBottom: 30 }}>
        <h2 style={{ font: '400 19px Georgia, serif', paddingBottom: 10, borderBottom: '1px solid #e8d5b7', marginBottom: 12 }}>{title}</h2>
        <p style={{ color: '#444', font: '14px/1.8 Helvetica Neue, Arial' }}>{content}</p>
      </section>)}
    </div>
  );
}
