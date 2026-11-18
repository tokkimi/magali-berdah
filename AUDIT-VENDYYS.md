# VENDYY’S — revue du site web

Revue de la branche web au commit 4950a87. Le dépôt contient une application Next.js historique et une application Vite dans `frontend/`. La configuration Vercel à la racine construit cette dernière.

| Parcours | Constat | Suite |
| --- | --- | --- |
| Informations juridiques | La politique se résumait à un paragraphe. Les CGV décrivaient une préautorisation et un débit automatique absents du parcours inspecté. | Quatre pages reliées au pied de page. Compléter l’identité de l’éditeur, du vendeur et du responsable de traitement, l’adresse et le numéro de téléphone, l’immatriculation, le capital et la TVA selon le statut, la direction de publication, l’hébergeur et le médiateur. |
| Commande | Les deux fonctions de checkout renvoient 503. Le prix et la disponibilité doivent être confirmés côté serveur avant paiement. | Réserver l’article de façon atomique, ouvrir une session Stripe avec un prix de référence serveur, traiter les événements signés de manière idempotente, réconcilier la commande et envoyer la confirmation sur support durable. Vérifier les conditions de livraison, de retour et les garanties selon l’identité et le statut du vendeur. |
| Enchères | Le dépôt contient un script SQL pour la publication planifiée et les impayés. Son exécution en production reste à vérifier. L’interface promettait une préautorisation absente du parcours inspecté. | Vérifier le modèle juridique de la vente, la clôture côté serveur, le paiement du gagnant et le traitement des impayés sur un environnement de test. |
| Soumissions et espace client | Des flux utilisent le stockage du navigateur, notamment la soumission et certaines données affichées dans le profil. | Vérifier la transmission à l’administration, la persistance entre appareils et l’origine des commandes, soldes et statuts. |
| Confidentialité | La bannière enregistre un choix local. Le code inspecté ne montre pas de liaison de ce choix avec un chargement conditionnel de traceurs. | Recenser les traceurs réellement chargés et leurs finalités, puis vérifier l’application du choix, son retrait, les destinataires, les durées de conservation et les éventuels transferts. |
| Mise en ligne | La capture identifie le projet et ses domaines. Le connecteur Vercel renvoie 404 sur le projet et le déploiement inspectés. | Vérifier la configuration et le commit en production avec l’accès Vercel du projet. |

## Points de contrôle par parcours

| Zone | Vérification et priorité |
| --- | --- |
| Navigation publique | Les liens sociaux sans destination ont été retirés. Tester l’accès direct aux quatre adresses juridiques, leur lecture sur mobile et le retour depuis l’inscription ou le paiement. Vérifier les liens vers le support, le catalogue, les lives et la soumission. |
| Catalogue et fiches | Le catalogue mélange des données statiques et des données partagées. Contrôler la cohérence entre galerie, recherche, fiche et administration, la date de publication, l’état du stock, les visuels et les justificatifs d’authentification. Tester les articles supprimés ou indisponibles. |
| Comptes | Supabase gère connexion et inscription. Vérifier l’activation par e-mail, la récupération du mot de passe, le changement d’adresse, la suppression de compte et les permissions par rôle. Tester la déconnexion et l’ouverture sur un autre navigateur. |
| Commande | Tester prix, stock, livraison et récapitulatif, consentement aux CGV, confirmation, paiement annulé, webhook répété, remboursement et suivi. Les deux points d’entrée checkout doivent afficher le même état de disponibilité. |
| Enchères | Tester enchères concurrentes, date de clôture, montant minimal, compte suspendu, attribution du lot et passage au règlement. Les statuts et les impayés doivent reposer sur des données côté serveur. |
| Administration | Certains écrans utilisent Supabase, d’autres l’API historique ou les données du navigateur. Vérifier les imports, les rôles, les permissions des tables et de stockage, les erreurs de mise à jour, les médias, la planification, les commandes et la concordance des statistiques. |
| Espace professionnel | Les fiches et certaines actions disposent d’un mode démo local. Vérifier création et modification d’article, abonnement, commandes, messages et suivi avec des comptes dédiés. |
| Communication | Vérifier que formulaires, support, newsletter, reçus et suivi aboutissent aux bons destinataires. Tester désinscription, rebond et réception avant ouverture. |
| SEO et accessibilité | Métadonnées propres aux quatre pages juridiques. Vérifier côté production le sitemap, les URL canoniques des articles, le statut des URL inconnues, le contraste, la navigation clavier, le focus des modales et les lecteurs d’écran. |
| Performance et exploitation | La compilation signale un bundle principal supérieur à 500 kB avant compression. Mesurer l’accueil et les fiches sur mobile, tester le chargement vidéo, vérifier les journaux Vercel, les alertes, les sauvegardes et un retour de version. |

Références à vérifier au moment de finaliser les textes et le parcours de commande : [Service Public — commerce en ligne](https://entreprendre.service-public.gouv.fr/vosdroits/F23455) et [médiation de la consommation](https://entreprendre.service-public.gouv.fr/vosdroits/F33338).

La revue couvre le code du site web. Les scénarios avec compte, base de production, fournisseur de paiement et livraison restent à exécuter dans un environnement accessible. Aucun audit Claude n’a été identifié sous ce nom dans les fichiers et l’historique examinés.
