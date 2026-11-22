# Code Ludique

Site d'entraînement au code de la route avec :

- **comptes élèves** par e-mail et mot de passe (confirmation par e-mail, mot de passe oublié) ;
- **paiement Stripe de 9,90 € pour 3 mois**, paiement unique sans abonnement ;
- **codes d'accès** remis par l'auto-école (3 mois, usage unique, liés au compte) ;
- **252 questions** et 10 fiches de cours ; **gratuit** : 60 questions (15 par thème), 4 fiches et 1 examen blanc ;
- **séries de jours d'affilée et 11 badges** à débloquer ;
- **rappels par e-mail** : inactivité depuis 3 jours (si l'élève l'a accepté), fin d'accès dans 7 jours, accès terminé ;
- **écran « Passer le code »** : niveau de l'élève, étapes (NEPH, 30 €, réservation, jour J), liens vers les
  5 centres agréés listés par service-public.gouv.fr (La Poste, SGS/Objectif Code, Dekra, Pearson Vue/Point Code,
  Bureau Veritas/Code'n Go) et compte à rebours jusqu'à la date d'examen. La réservation se fait sur le site du centre :
  aucun centre ne propose de réservation intégrable dans une autre appli ;
- **appli installable** sur téléphone (icône sur l'écran d'accueil, plein écran, questions gratuites utilisables hors connexion) ;
- **tableau de bord interne** (`/admin`) : total encaissé, paiements, élèves ayant payé, ventes par mois, codes, remboursements ;
- **déblocage automatique** de l'accès complet dès que le paiement est confirmé ;
- **progression sauvegardée en ligne** et retrouvée sur tous les appareils ;
- **conditions générales de vente**, **politique de confidentialité** et **mentions légales** ;
- export des données et suppression du compte (RGPD).

Technologies : Supabase (comptes + base de données), Stripe (paiement), Vercel (hébergement).

## Organisation des fichiers

| Fichier | Rôle |
|---|---|
| `public/index.html` | **L'appli Code Ludique** (questions et design d'origine) |
| `public/js/acces.js` | Comptes, accès payant, sauvegarde automatique de la progression |
| `public/connexion.html`, `compte.html`, `merci.html`, `reinitialiser.html` | Pages élève |
| `public/cgv.html`, `confidentialite.html`, `mentions-legales.html` | Pages légales |
| `api/creer-paiement.js` | Crée le paiement Stripe |
| `api/stripe-webhook.js` | Reçoit la confirmation de Stripe et débloque l'accès |
| `api/verifier-paiement.js` | Débloque l'accès tout de suite au retour du paiement |
| `api/activer-code.js` + `api/_lib/codes.js` | Activation des codes d'accès |
| `api/contenu.js` + `api/_lib/contenu-premium.js` | Questions et fiches payantes, envoyées aux seuls élèves dont l'accès est actif |
| `api/rappels.js` + `api/_lib/emails.js` | Rappels par e-mail, envoyés chaque jour à 16 h UTC (Vercel Cron) |
| `api/desinscription.js` | Lien « Ne plus recevoir de rappels » des e-mails |
| `api/admin-stats.js` + `public/admin.html` | Tableau de bord interne |
| `api/supprimer-compte.js` | Suppression du compte |
| `public/manifest.webmanifest`, `public/sw.js`, `public/icons/` | Appli installable (nom, icônes, fonctionnement hors connexion) |
| `supabase/schema.sql` | Tables et règles de sécurité |
| `supabase/nettoyage.sql` | Suppression des comptes inactifs depuis 3 ans |

## Ce qui a changé dans l'appli

Questions, fiches et design d'origine sont conservés ; le contenu gratuit a été élargi à 60 questions, 4 fiches et 1 examen blanc. Ajouts :

- **le contenu payant n'est plus dans la page** : les 47 questions et 8 fiches payantes sont sur le serveur
  (`api/_lib/contenu-premium.js`) et ne sont envoyées qu'aux élèves connectés dont l'accès est actif ;

- 3 scripts dans `<head>` : comptes, accès payant, sauvegarde en ligne de la progression
  (la clé `code-ludique-v1` du navigateur est recopiée dans le compte et restaurée sur les autres appareils) ;
- l'accès complet vient du compte (et non plus de l'appareil) ;
- « Acheter » ouvre le paiement Stripe après les deux cases obligatoires (CGV + renonciation au droit de rétractation) ;
- « Activer mon code » vérifie le code sur le serveur : il est lié au compte et ne sert qu'une fois ;
- un bouton « Se connecter / Mon compte » dans le bandeau bleu, et les liens légaux en bas des écrans.

**Modifier les questions** :
- questions et fiches **gratuites** : dans `public/index.html` (comme avant) ;
- questions et fiches **payantes** : dans `api/_lib/contenu-premium.js`. Dans `index.html`, chaque question payante
  est remplacée par un emplacement `{t:'Thème', p:1}` qui garde sa place dans la liste.
- Pour **ajouter** une question payante, ajoutez un emplacement **à la fin** de la liste `Q` dans `index.html`
  et la question sous le même numéro dans `contenu-premium.js`. Ne supprimez pas et ne réordonnez pas les questions
  existantes : la progression des élèves est enregistrée par numéro de question.
- `npm test` vérifie que les deux fichiers concordent et qu'aucun texte payant n'est resté dans la page.

**Codes d'accès** : la liste des empreintes est dans `api/_lib/codes.js` (les codes en clair ne sont pas dans le dépôt).
Pour ajouter des codes, ajoutez leurs empreintes à cette liste. Les élèves qui avaient déjà activé un code dans l'ancienne
version doivent le ressaisir une fois connectés (il est encore valable puisqu'il n'a jamais été enregistré sur le serveur).

## Mise en ligne

### 1. Supabase
1. Créez un projet sur supabase.com en choisissant une **région européenne** (Paris ou Francfort).
2. **SQL Editor** → collez et exécutez `supabase/schema.sql`.
3. **Database → Extensions** → activez `pg_cron`, puis exécutez `supabase/nettoyage.sql`
   (suppression des comptes inactifs depuis 3 ans, comme annoncé dans la politique de confidentialité).
4. **Authentication → URL Configuration** : *Site URL* = l'adresse de votre site ;
   *Redirect URLs* : ajoutez `https://votre-site.fr/**`.
5. **Authentication → Providers → Email** : laissez « Confirm email » activé, longueur minimale du mot de passe : 8.
6. **Authentication → SMTP Settings** : branchez un vrai service d'envoi d'e-mails (Brevo, Resend…).
   Sans cela, Supabase n'envoie que **quelques e-mails par heure**, ce qui bloque les inscriptions.
7. **Authentication → Email Templates** : traduisez les e-mails en français.
8. **Project Settings → API** : notez l'URL, la clé `anon` et la clé `service_role`.

### 2. Stripe
1. **Développeurs → Clés API** : notez la clé secrète (`sk_test_…` pour les essais, `sk_live_…` ensuite).
2. **Développeurs → Webhooks → Ajouter un endpoint** : `https://votre-site.fr/api/stripe-webhook`,
   événements `checkout.session.completed`, `checkout.session.async_payment_succeeded` et `charge.refunded`
   (un remboursement total fait depuis Stripe retire automatiquement les 3 mois et apparaît dans le tableau de bord).
   Notez le *secret de signature* (`whsec_…`).
3. **Paramètres → E-mails clients** : activez l'envoi du **reçu pour les paiements réussis**.
4. **Paramètres → Moyens de paiement** : vérifiez que **Cartes**, **Apple Pay** et **Google Pay** sont activés
   (ils le sont en général par défaut). Aucun code à changer : la page de paiement Stripe les propose automatiquement.
   Apple Pay n'apparaît que sur un appareil Apple (Safari) avec une carte enregistrée dans Wallet ;
   Google Pay sur Chrome/Android avec une carte enregistrée.
5. **Paramètres → Informations publiques** : nom, e-mail du support, lien vers vos CGV.

### 3. Brevo (rappels par e-mail)
1. Créez un compte gratuit sur brevo.com (300 e-mails par jour).
2. **Expéditeurs et domaines** : ajoutez votre nom de domaine et suivez les instructions (enregistrements DNS)
   pour que les e-mails ne tombent pas dans les spams. Vous pouvez utiliser le même service pour les e-mails
   de Supabase (Authentication → SMTP Settings).
3. **SMTP et API → Clés API** : créez une clé (`BREVO_API_KEY`).

### 4. Vercel
1. **Add New → Project** → importez ce dépôt GitHub (Framework : *Other*, laissez le reste par défaut).
2. **Settings → Environment Variables** : ajoutez toutes les variables de `.env.example`
   (dont `CRON_SECRET`, une longue chaîne au hasard, et `ADMIN_EMAILS`, votre adresse).
   L'envoi quotidien des rappels est déclaré dans `vercel.json` : Vercel le lance tout seul.
3. Déployez. Branchez votre nom de domaine dans **Settings → Domains**, puis mettez à jour `SITE_URL`,
   l'URL Supabase et le webhook Stripe avec ce domaine.

### 5. Essai complet
Avec les clés de test Stripe : créez un compte, ouvrez l'écran « Accès complet », payez avec la carte `4242 4242 4242 4242`
(date future, n'importe quel code), vérifiez que l'accès est débloqué, puis passez aux clés *live*.

### 6. Tableau de bord
Créez votre compte élève sur le site avec l'adresse mise dans `ADMIN_EMAILS`, confirmez-la, puis ouvrez
`https://votre-site.fr/admin`. Les autres comptes voient « Accès réservé ».

### 7. Pages légales
Remplacez tous les passages surlignés en jaune `[…]` dans `public/cgv.html`, `public/confidentialite.html`
et `public/mentions-legales.html` (nom, adresse, SIRET, TVA, **médiateur de la consommation**, qui est obligatoire).
Ces textes sont un modèle sérieux mais ne remplacent pas l'avis d'un juriste.

## Tests

```bash
npm install
npm test
```

## À savoir

- **Protection du contenu** : la page ne contient que le contenu gratuit. Le contenu payant est envoyé par le serveur
  après vérification de l'accès. Un élève qui a payé peut évidemment voir les questions qu'il a débloquées.
- La clé `service_role` et les clés Stripe restent côté serveur : elles ne sont jamais envoyées au navigateur.

## Appli installable

- **Android (Chrome)** : une carte « Installer l'appli » apparaît sur l'accueil ; un appui suffit.
- **iPhone (Safari)** : la carte explique « Partager → Sur l'écran d'accueil » (Apple ne permet pas de bouton d'installation).
- Hors connexion : l'appli s'ouvre, les questions gratuites et la progression restent disponibles ; la progression
  est envoyée en ligne au retour du réseau. Le contenu payant, le paiement et le compte demandent une connexion.
- Après une grosse mise à jour, changez `VERSION` en haut de `public/sw.js` pour forcer le renouvellement des fichiers
  gardés sur les téléphones.
