# Moto Planning — gestion moto pour auto-écoles

Application web (fonctionne sur ordinateur, tablette et téléphone) pour gérer la formation moto
de plusieurs auto-écoles avec deux moniteurs (ou plus).

## Fonctions

**📅 Planning**
- Vue semaine, filtre par moniteur, couleur par moniteur.
- Séances **plateau** (max **5** élèves) et **circulation** (max **3** élèves) — les limites se changent dans Paramètres.
- Plusieurs élèves de plusieurs auto-écoles sur la même séance.
- Blocage automatique : séance pleine, moniteur déjà occupé, élève déjà inscrit au même moment.
- Présence par élève : prévu / présent / absent (dû) / excusé.
- Dupliquer une séance à la semaine suivante.

**👤 Fiches élèves**
- Identité, coordonnées, auto-école, formation (A2, A, passerelle, 125…), NEPH, date du code, heures prévues, équipement, notes.
- Heures plateau / circulation effectuées, heures à venir, historique des séances, factures, paiements, solde.

**💶 Paiements**
- Factures numérotées automatiquement **par auto-école** (ex. `CEN-2026-0001`), avec TVA, au nom de l'auto-école de l'élève.
- Facturation des leçons effectuées en un clic + catalogue de prestations (frais de dossier, accompagnement examen, forfaits…).
- Encaissements (CB, espèces, chèque, virement, CPF…), statut payé / partiel / impayé, soldes élèves, récap mensuel par mode de paiement.

**📤 Envoi (comme sur AGX)**
- **Carte de rendez-vous** (PDF format carte) avec tous les prochains RDV de l'élève.
- **Facture** en PDF.
- Envoi par : partage du PDF depuis le téléphone (Gmail, WhatsApp, Messages…), e-mail, SMS, WhatsApp, téléchargement ou impression.

## Utilisation

Ouvrir `index.html` dans un navigateur, ou mieux : héberger le dossier (GitHub Pages, Netlify…)
puis, sur le téléphone, « Ajouter à l'écran d'accueil » pour l'utiliser comme une appli (fonctionne hors connexion).

Pour essayer : **Paramètres → Charger des données de démonstration**.
Ensuite : Paramètres → renseigner vos auto-écoles (nom, adresse, SIRET, préfixe de facture, TVA) et vos moniteurs.

## Important : où sont les données ?

Les données sont enregistrées **dans le navigateur de l'appareil utilisé**. Elles ne sont pas partagées
automatiquement entre plusieurs téléphones. Utilisez **Paramètres → Sauvegarder (fichier)** régulièrement,
et **Restaurer** pour transférer les données sur un autre appareil.
Pour que les deux moniteurs voient le même planning en temps réel, il faudra ajouter une base de données
en ligne (étape suivante possible).

## Technique

HTML/CSS/JavaScript sans installation. PDF générés avec [jsPDF](https://github.com/parallax/jsPDF) (licence MIT, inclus dans `vendor/`).
