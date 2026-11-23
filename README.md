# Go Moto — gestion moto pour auto-écoles

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
Avec l'extension Firebase « Trigger Email », **envoi automatique par e-mail en un clic, PDF joint** (voir [EMAIL.md](EMAIL.md)).

## Utilisation

Ouvrir `index.html` dans un navigateur, ou mieux : héberger le dossier (GitHub Pages, Netlify…)
puis, sur le téléphone, « Ajouter à l'écran d'accueil » pour l'utiliser comme une appli (fonctionne hors connexion).

Pour essayer : **Paramètres → Charger des données de démonstration**.
Ensuite, dans Paramètres : « Mon auto-école » (nom, SIRET, TVA… pour les factures), vos agences et vos moniteurs.

- **Déplacer une leçon** : attrapez-la à la souris et lâchez-la ailleurs (autre heure, autre jour en vue
  semaine, autre moniteur). Sur tablette : appuyez un instant sur la leçon, puis faites-la glisser.
  L'heure s'aligne au quart d'heure ; si le moniteur ou un élève est déjà pris, le cadre devient rouge et la
  leçon ne bouge pas. Bouton « Annuler » dans le message qui confirme le déplacement.
- **Vue semaine** : « 👥 Tous les moniteurs » affiche chaque jour avec une colonne par moniteur.

## Contrats et signature électronique

- **Paramètres → Auto-écoles** : chaque auto-école a sa propre identité (nom, SIRET, agrément, assurance, garantie financière, médiateur).
  Sur les contrats, factures et cartes de RDV, **seule l'auto-école où l'élève est inscrit** apparaît.
- **Paramètres → Contrats** : modèles de contrat avec des champs automatiques (élève, auto-école, tarifs…), et pour chaque auto-école
  **sa signature et son tampon** (photo), ajoutés automatiquement sur les contrats de ses élèves.
- Le modèle fourni suit la structure du contrat type officiel des écoles de conduite et les mentions de l'article R.213-3 du Code de la route.
  Le modèle fourni est indicatif : vérifiez-le ou collez le texte de votre contrat habituel.
- **Fiche élève → Contrats → Nouveau contrat** : le contrat est rempli tout seul, modifiable avant signature.
- Le modèle fourni prévoit l'examen blanc obligatoire avant chaque épreuve, 4 à 6 h de préparation, le 1er accompagnement offert et les frais de repassage (100 € plateau, 150 € circulation) — réglables dans Paramètres.
- **✍️ Signer sur place** : l'élève (ou son représentant légal) coche « lu et approuvé » et signe au doigt sur le téléphone / la tablette.
- **📲 Signer à distance** : l'appli crée un lien unique (envoi par WhatsApp, SMS ou e-mail). L'élève ouvre son contrat sur son
  téléphone, sans compte, coche « lu et approuvé », écrit son nom et signe au doigt. Le contrat revient tout seul dans l'appli,
  signé (avec la signature et le tampon de l'auto-école), et le PDF porte la mention « signé électroniquement à distance le … ».
  Le lien ne sert qu'une fois, expire au bout de 30 jours et est annulé si on modifie le texte du contrat.
  À activer une fois dans Firebase : voir [FIREBASE.md](FIREBASE.md), « Signature des contrats à distance ».
- Le contrat signé (date et heure de signature) est envoyé en PDF par e-mail, WhatsApp…

## Rappels d'examen (la veille)

La veille d'un examen, le planning affiche « 🔔 Examens demain : N élèves à prévenir ».
Un clic par élève envoie (SMS, WhatsApp ou e-mail) un message complet : date, heure et lieu de l'examen,
**heure et lieu du rendez-vous**, **moniteur**, **documents à apporter** et **équipement obligatoire**.
L'appli retient qui a été prévenu. Réglages : Paramètres → Rappels d'examen ; heure / lieu du rendez-vous
modifiables pour chaque examen.

## Examen blanc → prêts pour l'examen → préparation

- Dans le planning : « 📝 Examen blanc plateau / circulation », résultat **Validé ✅** (aucune faute éliminatoire) ou **Non validé ❌**.
- **Élèves → Prêts pour l'examen** : les élèves qui ont validé leur examen blanc, avec un bouton pour les inscrire à l'examen.
- **« 🎯 Prépa examen »** : à choisir élève par élève dans la leçon (sans choix, l'élève est en leçon normale) ;
  l'étiquette s'affiche à côté de son nom dans le planning et sur sa fiche.
- Pour chaque élève inscrit : ses **heures de préparation** (leçons 🎯 faites + prévues entre l'examen blanc et l'examen,
  4 à 6 h, réglable), en rouge s'il en manque.
- Après un échec à l'examen, la liste des repassages indique si l'examen blanc est à refaire.

**Horaire par élève** : dans une leçon plus longue qu'1h, chaque élève a un menu ⏱ « Toute la leçon » ou un créneau
(ex. 9h → 10h). Un élève mis en 🧭 Évaluation passe tout seul sur la 1re heure. Le planning affiche l'icône et l'heure
courte à côté du nom (« 🧭 9-10 ») ; la carte de RDV, la facture et le compte d'heures suivent cet horaire, et l'élève
est libre en dehors (on peut le placer dans une autre leçon). Le moniteur reste payé pour toute la leçon.

**Examen blanc et prépa par élève dans une leçon** : dans une leçon plateau ou circulation, chaque élève a
3 boutons « Leçon / 📝 Examen blanc / 🎯 Prépa ». On peut donc avoir, avec le même moniteur et à la même heure,
des élèves en leçon normale, d'autres en examen blanc (Validé / Non validé) et d'autres en préparation.
Les examens blancs validés comptent pour « Prêts pour l'examen », les heures de prépa pour le compteur de prépa,
et la facture indique « Examen blanc » ou « (préparation examen) » pour l'élève concerné.

## Forfait et reste à payer (fiche élève → Compte)

- Chaque élève peut avoir un **forfait** (ex. « Forfait 20h A2 », 950 € pour 20 h, soit 47,50 € l'heure),
  choisi à l'inscription ou dans l'onglet Compte.
- **Paiement libre** : l'élève règle quand il veut, du montant qu'il veut. Chaque règlement lui donne droit à
  des heures (prix du forfait ÷ heures incluses) ; on lui pose des leçons à hauteur de ce qu'il a payé.
- La fiche montre les heures **payées et posées**, les heures **posées non payées** (montant à encaisser),
  celles **payées mais pas encore posées**, et le **reste à payer sur le forfait**.
- En plaçant une leçon, un message prévient si l'élève n'a pas payé assez pour ces heures (sans bloquer).
- Au-delà des heures du forfait : tarif horaire. Sans forfait : tout au tarif horaire.
- Examens (accompagnement / repassage) et lignes ajoutées à la main sur une facture s'ajoutent.
- Paramètres → Prestations : indiquez les heures incluses pour chaque forfait.

## Importer des élèves (AGX / HarMobil', Excel, CSV)

Élèves → « 📥 Importer des élèves » :
- **AGX / HarMobil'** : imprimez la liste « Statistiques élèves » en PDF et déposez le fichier. L'appli lit
  nom, prénom, civilité, NEPH, adresse, téléphone, permis, date d'inscription, date de naissance et e-mail
  (le solde d'AGX n'est pas repris).
- **Excel** : copiez le tableau (avec la ligne des titres : Nom, Prénom, Téléphone…) et collez-le.
- **CSV** : déposez le fichier.
On choisit l'auto-école des élèves, on vérifie le tableau ; les élèves déjà présents (même NEPH, téléphone,
e-mail ou nom) sont repérés et décochés. Le lecteur de PDF (pdf.js, licence Apache 2.0) est dans vendor/pdfjs.

## Importer un planning Google Agenda

Planning → « 📥 Importer Google Agenda ». Dans Google Agenda (ordinateur) : ⚙️ Paramètres → Importer et exporter
→ Exporter, puis déposer le .zip (ou le .ics). On choisit le moniteur (ex. Jean-Yves) et la période.
- 1 rendez-vous = 1 élève ; même horaire + même type = une seule leçon avec plusieurs élèves.
- Le titre donne l'élève (retrouvé parmi les élèves importés d'AGX), le type (plateau, circu, prépa, exam blanc,
  évaluation) et l'auto-école (family's/épinay, creil, compiègne, french, smile, tremblay).
- « Off », « NE PAS REMPLIR », journées entières et rendez-vous sans mot de leçon sont mis de côté.
- Tableau de vérification : élève reconnu, à créer (avec son auto-école) ou à ne pas importer ; type modifiable.
- Réimporter le même fichier ne crée rien en double.

**Évaluation de départ** : dans une leçon, bouton « 🧭 Évaluation » par élève ; hors forfait, prix fixe
(50 € par défaut, Paramètres → Leçons & tarifs).

## 📊 Récap du mois (direction)

- **Moniteurs** : heures faites, heures encore prévues dans le mois, taux horaire (Paramètres → Moniteurs),
  montant dû, « Marquer payé » ; détail : temps par auto-école et liste des leçons.
- **Auto-écoles** : élèves vus, heures plateau / circulation de leurs élèves, temps moniteur (durée de chaque
  leçon partagée selon le nombre d'élèves de chaque auto-école) et son coût, examens, examens blancs,
  évaluations, encaissements du mois.
- **Export Excel** (CSV) : moniteurs, temps par auto-école, auto-écoles, détail des leçons.
Les taux et montants ne sont jamais envoyés aux moniteurs.

## Factures par auto-école, export comptable, réussite, places libres

- **Numérotation des factures par auto-école** (Paramètres → Facturation, case cochée par défaut) : chaque
  auto-école a sa suite (ex. TRE-2026-0001, SMI-2026-0001). Début et dernier numéro : ✏️ sur l'auto-école.
  En ligne, le numéro est réservé par une transaction : deux postes ne peuvent pas prendre le même.
- **Export comptable** (Paiements → ⬇️ Export comptable) : par mois, pour chaque auto-école, factures
  (HT, TVA, TTC, payé, statut) et encaissements (mode, référence, facture), avec totaux.
- **Réussite aux examens** (Récap) : taux plateau / circulation, 1er passage, absents, par auto-école et par
  moniteur accompagnateur ; ce mois, l'année ou 12 derniers mois.
- **Places libres** : dans une leçon à venir avec de la place (ou quand un élève est excusé), l'appli propose
  les élèves qui ont des heures payées pas encore posées.

## Fiche de suivi

Pour chaque élève, un historique de suivi pédagogique : après une leçon, le moniteur (ou la direction) choisit
un avis en 1 clic (😊 Bien / 😐 Moyen / 😟 À revoir), coche les points travaillés (plateau ou circulation)
et ajoute un commentaire. Depuis le planning (bouton « 📋 Suivi » à côté de chaque élève) ou la fiche élève
(onglet « 📋 Suivi »). Les moniteurs lisent tout le suivi et modifient seulement leurs propres commentaires.

## 🏍️ Motos — le garage

Onglet « 🏍️ Motos » :
- **Une tuile par moto** (ou grandes cartes, bouton « Affichage ») : la toucher ouvre sa grande carte. Quand on change une moto de lieu, elle roule jusqu’à sa nouvelle place sur le plan. Dessin animé à sa couleur (ou sa photo : ✏️ → 📷), plaque, auto-école
  à qui elle appartient (🏷️), lieu où elle est (avec « ↩︎ à rendre » si elle est garée dans une autre
  auto-école), jauge d'essence, compteur, consommation. Touchez la moto : le pilote monte et elle part.
- **Boutons par auto-école** pour n'afficher que ses motos.
- **Plan « Où sont les motos ? »** : chaque lieu (auto-écoles, piste, moniteurs, garage, ailleurs) a ses
  places ; touchez une moto puis un lieu, elle s'y gare. Mini-jauge d'essence sur chaque moto garée.
- **⛽ Plein** : « Chercher les stations autour de moi » (position du téléphone + prix officiels du jour,
  data.economie.gouv.fr), le moniteur choisit la station, tape le montant, les litres se calculent ;
  il peut les corriger. Case « Plein complet » quand le réservoir est rempli jusqu'au bout.
- **Jauge** : estimation à partir des pleins (litres ajoutés, plein complet = 100 %), de la taille du
  réservoir et des km notés. Elle est d'autant plus juste que les moniteurs notent le compteur.
- Les moniteurs notent leurs pleins et déplacent les motos ; seule la direction ajoute ou modifie une moto.

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

## 📆 Dates d'examen (appli séparée)

Petite appli à part, dans le dossier [`examens/`](examens/) : adresse `…/Mazouzi-Souad/examens/`.
- Connexion avec les **mêmes comptes que Go Moto** (comptes direction / secrétariat). Rien n'est visible sans connexion.
- Pour chaque examen : élève, accompagnateur (Towfiq, Manel, Monim, Selim, Walid, Selma), lieu (Gennevilliers, Noisy, Bobigny), date et commentaire.
- **Paiement W** (gérant 1) et **Paiement B** (gérant 2) : un toucher = payé, avec la date du jour.
- Sur téléphone : ouvrir l'adresse → « Ajouter à l'écran d'accueil ».
- Données dans Firebase, collection `dates_examen` (déjà couverte par la règle « Direction : tout »).

## Technique

HTML/CSS/JavaScript sans installation. PDF générés avec [jsPDF](https://github.com/parallax/jsPDF) (licence MIT) ; synchronisation avec le SDK Firebase (Apache 2.0). Les deux sont inclus dans `vendor/`.
