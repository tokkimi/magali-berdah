import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const LAST_UPDATE = '16 août 2026';
const CONTACT_EMAIL = 'contact@magaliberdah.com';
const SITE_URL = 'https://magali-berdah.vercel.app';

const SECTIONS = [
  {
    title: '1. Identification de l\'opérateur et mentions légales',
    content: `La plateforme Magali Berdah (ci-après « la Plateforme ») est exploitée par [RAISON SOCIALE — à compléter], dont le siège social est situé [ADRESSE], immatriculée au Registre du Commerce et des Sociétés sous le numéro [SIREN], numéro de TVA intracommunautaire : [TVA].

Directeur de la publication : Magali Berdah.
Hébergeur : Vercel Inc., 340 Pine Street, Suite 700, San Francisco, CA 94104, USA.

Service client : ${CONTACT_EMAIL} — Réponse garantie sous 48 heures ouvrées.

Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, ces informations doivent être complétées avant l'ouverture définitive des paiements.`,
  },
  {
    title: '2. Objet et champ d\'application',
    content: `Les présentes Conditions Générales de Vente (CGV) régissent l'ensemble des transactions effectuées sur la Plateforme, qu'il s'agisse de ventes à prix fixe ou de ventes aux enchères, conformément aux dispositions du Code de la consommation (articles L.111-1 et suivants) et du Code civil.

Toute commande ou participation à une enchère implique l'acceptation pleine et entière des présentes CGV. La version applicable est celle en vigueur au jour de la transaction, consultable à tout moment sur ${SITE_URL}/cgv et conservée sur support durable lors de la validation de commande.

Les présentes CGV s'appliquent aux relations entre la Plateforme et tout acheteur ou enchérisseur, personne physique agissant en qualité de consommateur au sens de l'article préliminaire du Code de la consommation.`,
  },
  {
    title: '3. Articles, second main et authenticité',
    content: `Chaque fiche article présente, avant tout achat ou enchère, les caractéristiques essentielles du bien : désignation, marque, catégorie, état (neuf, excellent, très bon, bon ou correct), photographies sous différents angles, dimensions, défauts connus et accessoires inclus ou exclus.

Les articles de seconde main peuvent présenter des traces d'usage normales, décrites et photographiées sur la fiche. L'acheteur reconnaît avoir pris connaissance de ces informations avant toute transaction.

La Plateforme garantit l'authenticité de chaque article proposé. La vente de contrefaçons est strictement interdite et constitue une infraction pénale. Tout article dont l'authenticité serait contestée après livraison fait l'objet d'une expertise contradictoire ; en cas de contrefaçon avérée, l'acheteur est intégralement remboursé.

Conformément à l'article L.111-1 du Code de la consommation, les informations essentielles sont communiquées avant la conclusion du contrat.`,
  },
  {
    title: '4. Prix, frais et taxes',
    content: `Les prix sont affichés en euros (€), toutes taxes comprises (TTC) lorsque la TVA est applicable, pour les articles neufs. Les articles de seconde main entre particuliers peuvent relever d'un régime fiscal distinct.

Les frais de livraison, inclus dans le prix affiché sauf mention contraire, sont précisés avant la validation définitive. Aucun frais supplémentaire non annoncé ne peut être facturé.

Le prix définitif est celui affiché dans le récapitulatif de commande présenté immédiatement avant la validation. Pour les enchères, le prix final est le montant de l'offre gagnante.

La Plateforme se réserve le droit de modifier ses prix à tout moment. Les articles sont facturés sur la base des tarifs en vigueur au moment de la validation de la commande ou de la clôture de l'enchère.`,
  },
  {
    title: '5. Inscription et compte utilisateur',
    content: `La participation à toute enchère et la passation de toute commande sont réservées aux utilisateurs inscrits disposant d'un compte actif et vérifié sur la Plateforme, conformément à l'article L.221-14 du Code de la consommation.

Lors de l'inscription, l'utilisateur fournit des informations exactes, complètes et à jour. Il est responsable de la confidentialité de ses identifiants et de toutes les actions effectuées depuis son compte.

La Plateforme se réserve le droit de suspendre ou supprimer tout compte en cas de non-respect des présentes CGV, de fraude suspectée ou d'informations inexactes.`,
  },
  {
    title: '6. Ventes aux enchères — règles et engagement',
    content: `**6.1 Nature juridique.** Les enchères organisées sur la Plateforme constituent des ventes aux enchères de gré à gré (et non des ventes aux enchères publiques au sens de l'article L.321-1 du Code de commerce). Le droit de rétractation prévu à l'article L.221-18 du Code de la consommation s'applique dans les conditions légales.

**6.2 Participation.** Toute participation nécessite : (i) un compte utilisateur actif et vérifié, (ii) un moyen de paiement valide enregistré et pré-autorisé, (iii) l'acceptation des règles spécifiques à chaque enchère affichées sur la fiche article.

**6.3 Pré-autorisation de la carte bancaire.** Lorsqu'un utilisateur place une enchère, sa carte bancaire fait l'objet d'une pré-autorisation (empreinte) du montant de l'offre, conformément aux bonnes pratiques de la profession. Cette pré-autorisation n'est pas un débit effectif : elle constitue une réservation des fonds pour la durée de l'enchère. En cas d'enchère perdante, la pré-autorisation est annulée sans frais dans un délai de 7 jours ouvrés. En cas d'enchère gagnante, le débit est effectué automatiquement à la clôture de l'enchère.

**6.4 Prix de départ et prix de réserve.** Chaque enchère comporte un prix de départ visible. Un prix de réserve (plancher confidentiel) peut être fixé ; si aucune offre n'atteint ce prix de réserve à la clôture, la vente est annulée et les éventuelles pré-autorisations sont levées. Le vendeur et l'acheteur en sont informés dans les 24 heures.

**6.5 Engagement de l'enchérisseur.** Toute offre placée constitue un engagement ferme et irrévocable d'acheter l'article au montant proposé si cette offre est la plus haute à la clôture. L'enchérisseur gagnant doit finaliser son paiement dans les 24 heures suivant la notification de gain. À défaut, la Plateforme peut annuler la transaction, facturer des frais d'annulation et exclure temporairement l'utilisateur.

**6.6 Surenchère.** En cas de surenchère, la nouvelle offre supplante automatiquement la précédente. L'enchérisseur supplanté en est notifié par email et/ou notification dans l'application.

**6.7 Clôture et notification.** À l'heure de clôture, l'enchère est définitivement fermée. L'enchérisseur gagnant et le vendeur reçoivent une confirmation sur support durable.

**6.8 Vente exclusive quotidienne.** Les articles de la sélection exclusive sont mis aux enchères pendant une fenêtre horaire limitée définie chaque jour. En dehors de cette fenêtre, les articles ne sont pas accessibles. Cette exclusivité est une caractéristique commerciale, sans incidence sur les droits légaux de l'acheteur.`,
  },
  {
    title: '7. Modalités de paiement',
    content: `Les paiements sont sécurisés. Les moyens de paiement acceptés sont : carte bancaire (Visa, Mastercard, American Express), et le solde de la cagnotte Magali Berdah (portefeuille en ligne).

Pour les enchères, le débit est automatique à la clôture de l'enchère gagnée. Pour les ventes à prix fixe, le débit intervient lors de la validation de la commande.

Un paiement mixte (cagnotte + carte) est possible dans la limite du solde disponible. Le solde de la cagnotte ne peut être utilisé qu'à hauteur du montant effectivement disponible.

En cas d'échec de paiement, la Plateforme en informe l'acheteur par email. L'acheteur dispose de 24 heures pour régulariser la situation, faute de quoi la transaction peut être annulée.

Aucune donnée bancaire n'est conservée sur les serveurs de la Plateforme. Les transactions sont traitées par un prestataire de paiement agréé (Stripe Inc. ou équivalent), certifié PCI DSS.`,
  },
  {
    title: '8. Livraison et transfert des risques',
    content: `La livraison est incluse dans le prix affiché, sauf mention contraire sur la fiche article. Les délais indicatifs sont précisés avant la validation de commande.

Conformément à l'article L.216-1 du Code de la consommation, le vendeur s'engage à livrer le bien dans le délai annoncé, et au plus tard dans les 30 jours suivant la conclusion du contrat.

Le transfert des risques intervient lors de la prise de possession physique du bien par le consommateur (article L.216-4 du Code de la consommation). Tout dommage survenu pendant le transport est à la charge de la Plateforme, sauf si le transporteur a été choisi par le consommateur indépendamment.

Dès réception, l'acheteur est invité à vérifier le colis en présence du transporteur et à signaler toute anomalie dans les meilleurs délais.`,
  },
  {
    title: '9. Droit de rétractation',
    content: `Conformément aux articles L.221-18 et suivants du Code de la consommation, le consommateur dispose d'un délai de 14 jours à compter de la réception du bien pour exercer son droit de rétractation, sans justification ni pénalités.

Pour exercer ce droit, l'acheteur notifie sa décision à ${CONTACT_EMAIL} en indiquant son numéro de commande. Il peut utiliser le formulaire type de rétractation ci-dessous. L'article est retourné complet, dans son état d'origine, dans un délai de 14 jours suivant la notification.

Les frais de retour sont à la charge du consommateur sauf s'il n'en a pas été informé avant la commande, auquel cas ils restent à la charge de la Plateforme.

Le remboursement est effectué dans les 14 jours suivant la réception de l'article ou la preuve d'expédition, par le même moyen de paiement que celui utilisé lors de l'achat.

**Formulaire type de rétractation :**
À l'attention de ${CONTACT_EMAIL} — Je, soussigné(e), notifie par la présente ma rétractation du contrat portant sur la commande n° [numéro], reçue le [date de réception]. Nom, prénom, adresse, date et signature.`,
  },
  {
    title: '10. Garanties légales',
    content: `Conformément aux articles L.217-4 et suivants du Code de la consommation et aux articles 1641 et suivants du Code civil, l'acheteur bénéficie de :

• **Garantie légale de conformité** : 2 ans à compter de la délivrance du bien pour les biens neufs ; 1 an pour les biens d'occasion. Durant ce délai, l'acheteur peut choisir entre la réparation, le remplacement ou, si ces solutions sont impossibles, le remboursement.

• **Garantie des vices cachés** : action possible dans les 2 ans à compter de la découverte du vice, permettant de choisir entre la restitution du prix (résolution de la vente) et un remboursement partiel (réduction du prix).

Ces garanties légales s'appliquent indépendamment de toute garantie commerciale éventuellement proposée. Aucune clause ne peut les exclure ou les réduire.`,
  },
  {
    title: '11. Réclamations et médiation consumériste',
    content: `Toute réclamation doit être adressée à ${CONTACT_EMAIL} avec le numéro de commande et les justificatifs utiles. La Plateforme s'engage à répondre dans les 48 heures ouvrées.

Conformément à l'article L.612-1 du Code de la consommation, en cas de litige non résolu dans un délai de 60 jours, le consommateur peut recourir gratuitement à un médiateur de la consommation :

[MÉDIATEUR — à désigner avant l'ouverture des paiements. Exemples : Médiateur de la consommation FEVAD, CM2C, ou tout médiateur référencé sur https://www.economie.gouv.fr/mediation-conso]

Le consommateur peut également recourir à la plateforme européenne de règlement en ligne des litiges : https://ec.europa.eu/consumers/odr

Ces recours n'empêchent pas le consommateur de saisir la juridiction compétente.`,
  },
  {
    title: '12. Données personnelles (RGPD)',
    content: `La Plateforme traite vos données personnelles pour : la gestion des comptes, le traitement des commandes, la gestion des paiements, la livraison, la lutte contre la fraude, la communication commerciale (avec votre consentement) et le respect des obligations légales.

Responsable du traitement : [RAISON SOCIALE], ${CONTACT_EMAIL}.

Vos droits (accès, rectification, effacement, limitation, opposition, portabilité) s'exercent à ${CONTACT_EMAIL}. En cas de désaccord, vous pouvez saisir la CNIL (www.cnil.fr).

Les données sont conservées pendant la durée nécessaire à l'exécution du contrat, augmentée des délais légaux de prescription. Elles ne sont jamais revendues à des tiers à des fins commerciales.

Détail complet dans notre Politique de confidentialité.`,
  },
  {
    title: '13. Droit applicable et juridiction compétente',
    content: `Les présentes CGV sont soumises au droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable dans un délai de 30 jours.

Le consommateur ayant sa résidence habituelle dans un État membre de l'Union européenne bénéficie des dispositions protectrices impératives de son pays de résidence.

À défaut d'accord amiable et après épuisement de la médiation, le litige sera soumis à la juridiction compétente selon les règles du Code de procédure civile. Pour les litiges de consommation, le tribunal du lieu de résidence du consommateur est compétent.

Si une clause est déclarée nulle ou inapplicable, les autres clauses restent en vigueur.`,
  },
];

function Section({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);
  const isFirstTime = title.startsWith('1.');

  useEffect(() => {
    if (isFirstTime) setOpen(true);
  }, [isFirstTime]);

  return (
    <section style={{ borderBottom: '1px solid #f0ece6' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '1rem' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', fontWeight: 400, color: '#1a1a1a', margin: 0 }}>{title}</h2>
        {open ? <ChevronUp size={18} color="#9e8e7e" style={{ flexShrink: 0 }} /> : <ChevronDown size={18} color="#9e8e7e" style={{ flexShrink: 0 }} />}
      </button>
      {open && (
        <div style={{ paddingBottom: '1.5rem' }}>
          {content.split('\n\n').map((para, i) => (
            <p key={i} style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: 'clamp(0.78rem, 2vw, 0.88rem)', color: '#444', lineHeight: 1.8, marginBottom: '0.9rem' }}
              dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function CGV() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(2rem, 6vw, 4rem) 1rem clamp(4rem, 8vw, 7rem)' }}>
      <p style={{ color: '#c9a96e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.25em', fontWeight: 700 }}>INFORMATIONS CONTRACTUELLES</p>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', fontWeight: 400, margin: '.5rem 0 0.5rem', color: '#1a1a1a' }}>Conditions Générales de Vente</h1>
      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#9e8e7e', marginBottom: '0.5rem' }}>Dernière mise à jour : {LAST_UPDATE}</p>
      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#9e8e7e', marginBottom: '2rem' }}>
        Conformes aux exigences de la <strong>DGCCRF</strong>, du <strong>Code de la consommation</strong> (L.111-1, L.221-1 et suivants) et du <strong>RGPD</strong>.
      </p>

      <div style={{ padding: '1rem 1.25rem', backgroundColor: '#fff8e8', border: '1px solid #e8d5b7', borderLeft: '4px solid #c9a96e', marginBottom: '2rem', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', lineHeight: 1.6, color: '#856404' }}>
        <strong>Note d'exploitation :</strong> Les champs entre crochets [ ] doivent être complétés avec les informations légales de l'opérateur et le médiateur désigné avant l'ouverture définitive des paiements réels.
      </div>

      <div>
        {SECTIONS.map(({ title, content }) => (
          <Section key={title} title={title} content={content} />
        ))}
      </div>

      <div style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: '#f8f4ef', border: '1px solid #e8d5b7', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#666', lineHeight: 1.7 }}>
        <p><strong>Formulaire de rétractation</strong> (article L.221-5 du Code de la consommation)</p>
        <p style={{ marginTop: '0.5rem' }}>À adresser à : {CONTACT_EMAIL}</p>
        <p>Je notifie ma rétractation du contrat portant sur la commande n° _______, reçue le _______.
        Nom et prénom : _______. Adresse : _______. Date : _______. Signature (si formulaire papier) : _______.</p>
      </div>
    </div>
  );
}
