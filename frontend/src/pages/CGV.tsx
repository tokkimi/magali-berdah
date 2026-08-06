export default function CGV() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '0.5rem' }}>Conditions Générales de Vente</h1>
      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#9e8e7e', marginBottom: '3rem' }}>Dernière mise à jour : Janvier 2025 · Version internationale</p>

      {[
        {
          title: '1. Identification de la société',
          content: `Magali Berdah (ci-après "la Société") est une société française dont le siège social est situé en France. La plateforme magaliberdah.com (ci-après "la Plateforme") est exploitée par la Société et permet la mise en relation entre acheteurs et vendeurs professionnels de mode de luxe.

Contact : contact@magaliberdah.com`
        },
        {
          title: '2. Objet et champ d\'application',
          content: `Les présentes Conditions Générales de Vente (CGV) s'appliquent à toutes les transactions effectuées sur la Plateforme, quelle que soit la nationalité de l'acheteur ou du vendeur.

Les présentes CGV prévalent sur tout autre document. Tout achat implique l'acceptation sans réserve des présentes CGV.`
        },
        {
          title: '3. Articles mis en vente',
          content: `3.1 Vente à prix fixe : L'acheteur acquiert l'article au prix affiché, frais de livraison inclus.

3.2 Enchères : Les articles peuvent être mis aux enchères avec un prix de départ et, le cas échéant, un prix de réserve minimum. L'enchérisseur s'engage à honorer son offre si elle est la plus haute à la clôture de l'enchère.

3.3 Les vendeurs professionnels certifiés sont seuls responsables de la description et de l'état des articles mis en vente.`
        },
        {
          title: '4. Prix et paiement',
          content: `4.1 Tous les prix sont affichés en euros (€) TTC, frais de livraison inclus sauf mention contraire.

4.2 Pour les acheteurs hors zone euro, les conversions de devises sont indicatives. Le paiement est effectué en euros.

4.3 La Société se réserve le droit de modifier les prix à tout moment. Les prix affichés au moment de la commande sont ceux applicables.

4.4 Les modes de paiement acceptés sont : carte bancaire (Visa, Mastercard), PayPal et virement bancaire pour les montants supérieurs à 5 000 €.`
        },
        {
          title: '5. Livraison',
          content: `5.1 Les frais de livraison sont inclus dans le prix affiché. La livraison est organisée par le vendeur professionnel.

5.2 Les délais de livraison varient selon la destination : France (2-5 jours ouvrés), Europe (5-10 jours ouvrés), International (10-21 jours ouvrés).

5.3 Pour les livraisons hors Union Européenne, des droits de douane et taxes locales peuvent s'appliquer, à la charge de l'acheteur.

5.4 La Société décline toute responsabilité pour les retards liés aux douanes ou transporteurs.`
        },
        {
          title: '6. Droit de rétractation',
          content: `6.1 Conformément à la directive européenne 2011/83/UE et au Code de la consommation français, tout acheteur résidant dans l'Union Européenne dispose d'un délai de 14 jours calendaires pour exercer son droit de rétractation sur les achats à prix fixe, sans avoir à motiver sa décision.

6.2 Le droit de rétractation ne s'applique pas aux achats effectués aux enchères (Article L.221-28 du Code de la consommation).

6.3 Pour exercer ce droit, l'acheteur doit notifier sa décision par email à contact@magaliberdah.com dans le délai imparti.

6.4 Les frais de retour sont à la charge de l'acheteur, sauf si l'article ne correspond pas à sa description.`
        },
        {
          title: '7. Authentification et garantie',
          content: `7.1 La Société vérifie les vendeurs professionnels mais ne peut pas garantir l'authenticité de chaque article. Il appartient à l'acheteur de demander les certificats d'authenticité appropriés.

7.2 En cas d'article manifestement contrefait, l'acheteur dispose de 30 jours pour en informer la Société et obtenir un remboursement complet.`
        },
        {
          title: '8. Commissions et frais',
          content: `8.1 Pour les boutiques sans abonnement : commission de 20% sur chaque vente.
8.2 Pour les boutiques Premium (abonnement 129€/mois) : commission de 5% sur chaque vente.
8.3 L'abonnement Premium est sans engagement et peut être résilié à tout moment avec effet à la fin de la période en cours.`
        },
        {
          title: '9. Droit applicable et juridiction',
          content: `Les présentes CGV sont soumises au droit français. En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, les tribunaux français seront seuls compétents.

Pour les consommateurs européens, la Commission européenne met à disposition une plateforme de règlement en ligne des litiges (RLL) accessible à : https://ec.europa.eu/consumers/odr`
        },
        {
          title: '10. Protection des données personnelles (RGPD)',
          content: `Conformément au Règlement Général sur la Protection des Données (RGPD), les données personnelles des utilisateurs sont traitées conformément à notre Politique de Confidentialité disponible sur la Plateforme.

Les utilisateurs disposent d'un droit d'accès, de rectification, d'effacement, de portabilité et d'opposition aux données les concernant, exerçable à : contact@magaliberdah.com`
        },
      ].map(section => (
        <div key={section.title} style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e8d5b7' }}>
            {section.title}
          </h2>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#444', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
            {section.content}
          </p>
        </div>
      ))}
    </div>
  );
}
