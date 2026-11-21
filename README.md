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

## Places d'examen réservées

Dès la réservation sur RdvPermis, l'agence place l'examen au planning avec le **nombre de places réservées**
(sans les noms). L'examen affiche « 3 places à attribuer » ; les noms se mettent plus tard
(onglet **Élèves → Examens à venir** ; les élèves en attente de repassage sont proposés en premier).

## Planning partagé en ligne

Pour que les agences et les moniteurs voient **le même planning en direct**, l'appli utilise Firebase
(gratuit). Mise en place pas à pas : voir **[FIREBASE.md](FIREBASE.md)**.

- Connexion par e-mail + mot de passe ; seuls les e-mails listés dans `firestore.rules` ont accès.
- Fonctionne hors connexion : les changements partent dès que le réseau revient.
- Numéros de facture sans doublon, même si deux agences facturent au même moment.

Sans Firebase, l'appli fonctionne seule sur un appareil (données dans le navigateur ;
Paramètres → Sauvegarder / Restaurer pour les transférer).

## Technique

HTML/CSS/JavaScript sans installation. PDF générés avec [jsPDF](https://github.com/parallax/jsPDF) (licence MIT) ; synchronisation avec le SDK Firebase (Apache 2.0). Les deux sont inclus dans `vendor/`.
