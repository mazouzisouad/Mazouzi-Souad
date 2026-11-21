# Moto Planning — gestion moto pour auto-écoles

Application web (fonctionne sur ordinateur, tablette et téléphone) pour gérer la formation moto
de plusieurs auto-écoles avec deux moniteurs (ou plus).

## Fonctions

**📅 Planning (comme AGX)**
- Grille horaire : vue **Jour** (une colonne par moniteur) ou **Semaine** (un moniteur).
- Cliquer sur une case vide → choisir **Plateau** (max 5) ou **Circulation** (max 3), la durée, puis taper le nom des élèves.
- Cliquer sur une leçon → ajouter un élève, noter les présences (présent / absent / excusé), déplacer, copier à la semaine suivante.
- Blocage automatique : leçon complète, moniteur ou élève déjà pris à la même heure.
- **Examens** : « Examen plateau » et « Examen circulation » (accompagnement) avec les élèves présentés, le centre d'examen et le résultat (admis / ajourné / absent). Admis à la circulation → permis obtenu.
- **En attente de repassage** (onglet dans Élèves) : élèves ajournés ou absents à un examen, avec l'épreuve à repasser (plateau ou circulation), le numéro de passage et un bouton pour programmer le repassage.
- **Import RdvPermis** (bouton « 📥 Importer des examens » dans le planning) : coller l'e-mail de confirmation ou la liste des candidats RdvPermis → l'appli retrouve les élèves, la date, l'heure, l'épreuve et le centre, et place les examens au planning après vérification.
- Chaque élève a une pastille de couleur selon son **agence d'inscription**.

**👤 Élèves** — fiche simple (onglets Leçons / Compte / Infos), agence d'inscription, heures faites, reste dû.

**💶 Paiements** — factures numérotées, encaissements (CB, espèces, chèque, CPF…), élèves qui doivent de l'argent.

**📤 Envoi** — carte de rendez-vous et facture en PDF, par partage téléphone (mail, WhatsApp…), e-mail, SMS, ou impression.

## Utilisation

Ouvrir `index.html` dans un navigateur, ou mieux : héberger le dossier (GitHub Pages, Netlify…)
puis, sur le téléphone, « Ajouter à l'écran d'accueil » pour l'utiliser comme une appli (fonctionne hors connexion).

Pour essayer : **Paramètres → Charger des données de démonstration**.
Ensuite, dans Paramètres : « Mon auto-école » (nom, SIRET, TVA… pour les factures), vos agences et vos moniteurs.

## Contrats et signature électronique

- **Paramètres → Auto-écoles** : chaque auto-école a sa propre identité (nom, SIRET, agrément, assurance, garantie financière, médiateur).
  Sur les contrats, factures et cartes de RDV, **seule l'auto-école où l'élève est inscrit** apparaît.
- **Paramètres → Contrats** : modèles de contrat avec des champs automatiques (élève, auto-école, tarifs…), et pour chaque auto-école
  **sa signature et son tampon** (photo), ajoutés automatiquement sur les contrats de ses élèves.
- Le modèle fourni suit la structure du contrat type officiel des écoles de conduite et les mentions de l'article R.213-3 du Code de la route.
  Le modèle fourni est indicatif : vérifiez-le ou collez le texte de votre contrat habituel.
- **Fiche élève → Contrats → Nouveau contrat** : le contrat est rempli tout seul, modifiable avant signature.
- Le modèle fourni prévoit l'examen blanc obligatoire avant chaque épreuve, 4 à 6 h de préparation, le 1er accompagnement offert et les frais de repassage (100 € plateau, 150 € circulation) — réglables dans Paramètres.
- **Faire signer** : l'élève (ou son représentant légal) coche « lu et approuvé » et signe au doigt sur le téléphone / la tablette.
- Le contrat signé (date et heure de signature) est envoyé en PDF par e-mail, WhatsApp…

## Rappels d'examen (la veille)

La veille d'un examen, le planning affiche « 🔔 Examens demain : N élèves à prévenir ».
Un clic par élève envoie (SMS, WhatsApp ou e-mail) un message complet : date, heure et lieu de l'examen,
**heure et lieu du rendez-vous**, **moniteur**, **documents à apporter** et **équipement obligatoire**.
L'appli retient qui a été prévenu. Réglages : Paramètres → Rappels d'examen ; heure / lieu du rendez-vous
modifiables pour chaque examen.

## Fiche de suivi

Pour chaque élève, un historique de suivi pédagogique : après une leçon, le moniteur (ou la direction) choisit
un avis en 1 clic (😊 Bien / 😐 Moyen / 😟 À revoir), coche les points travaillés (plateau ou circulation)
et ajoute un commentaire. Depuis le planning (bouton « 📋 Suivi » à côté de chaque élève) ou la fiche élève
(onglet « 📋 Suivi »). Les moniteurs lisent tout le suivi et modifient seulement leurs propres commentaires.

## Places d'examen réservées

Dès la réservation sur RdvPermis, l'agence place l'examen au planning avec le **nombre de places réservées**
(sans les noms). L'examen affiche « 3 places à attribuer » ; les noms se mettent plus tard
(onglet **Élèves → Examens à venir** ; les élèves en attente de repassage sont proposés en premier).

## Planning partagé en ligne

Pour que les agences et les moniteurs voient **le même planning en direct**, l'appli utilise Firebase
(gratuit). Mise en place pas à pas : voir **[FIREBASE.md](FIREBASE.md)**.

- Connexion par e-mail + mot de passe. Deux niveaux d'accès, protégés par les règles Firebase :
  **direction / secrétariat** (tout) et **moniteur** (uniquement son planning : élèves, présences, résultats —
  ni paiements, ni factures, ni contrats, ni fiches, ni paramètres).
- Les accès se donnent et se retirent dans l'appli : **Paramètres → Accès à l'appli** (création du compte comprise).
- Se déconnecter efface les données gardées sur l'appareil.
- Fonctionne hors connexion : les changements partent dès que le réseau revient.
- Numéros de facture sans doublon, même si deux agences facturent au même moment.

Sans Firebase, l'appli fonctionne seule sur un appareil (données dans le navigateur ;
Paramètres → Sauvegarder / Restaurer pour les transférer).

## Technique

HTML/CSS/JavaScript sans installation. PDF générés avec [jsPDF](https://github.com/parallax/jsPDF) (licence MIT) ; synchronisation avec le SDK Firebase (Apache 2.0). Les deux sont inclus dans `vendor/`.
