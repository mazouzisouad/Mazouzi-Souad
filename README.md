# Moto Planning — gestion moto pour auto-écoles

Application web (fonctionne sur ordinateur, tablette et téléphone) pour gérer la formation moto
de plusieurs auto-écoles avec deux moniteurs (ou plus).

## Fonctions

**📅 Planning (comme AGX)**
- Grille horaire : vue **Jour** (une colonne par moniteur) ou **Semaine** (un moniteur).
- Cliquer sur une case vide → choisir **Plateau** (max 5) ou **Circulation** (max 3), la durée, puis taper le nom des élèves.
- Cliquer sur une leçon → ajouter un élève, noter les présences (présent / absent / excusé), déplacer, copier à la semaine suivante.
- Blocage automatique : leçon complète, moniteur ou élève déjà pris à la même heure.
- Chaque élève a une pastille de couleur selon son **agence d'inscription**.

**👤 Élèves** — fiche simple (onglets Leçons / Compte / Infos), agence d'inscription, heures faites, reste dû.

**💶 Paiements** — factures numérotées, encaissements (CB, espèces, chèque, CPF…), élèves qui doivent de l'argent.

**📤 Envoi** — carte de rendez-vous et facture en PDF, par partage téléphone (mail, WhatsApp…), e-mail, SMS, ou impression.

## Utilisation

Ouvrir `index.html` dans un navigateur, ou mieux : héberger le dossier (GitHub Pages, Netlify…)
puis, sur le téléphone, « Ajouter à l'écran d'accueil » pour l'utiliser comme une appli (fonctionne hors connexion).

Pour essayer : **Paramètres → Charger des données de démonstration**.
Ensuite, dans Paramètres : « Mon auto-école » (nom, SIRET, TVA… pour les factures), vos agences et vos moniteurs.

## Important : où sont les données ?

Les données sont enregistrées **dans le navigateur de l'appareil utilisé**. Elles ne sont pas partagées
automatiquement entre plusieurs téléphones. Utilisez **Paramètres → Sauvegarder (fichier)** régulièrement,
et **Restaurer** pour transférer les données sur un autre appareil.
Pour que les deux moniteurs voient le même planning en temps réel, il faudra ajouter une base de données
en ligne (étape suivante possible).

## Technique

HTML/CSS/JavaScript sans installation. PDF générés avec [jsPDF](https://github.com/parallax/jsPDF) (licence MIT, inclus dans `vendor/`).
