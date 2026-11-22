# Code de la route en ligne

Site d'entraînement au code de la route avec :

- **comptes élèves** par e-mail et mot de passe (confirmation par e-mail, mot de passe oublié) ;
- **paiement Stripe de 9,90 € pour 3 mois**, paiement unique sans abonnement ;
- **déblocage automatique** de l'accès complet dès que le paiement est confirmé ;
- **progression sauvegardée en ligne** et retrouvée sur tous les appareils ;
- **conditions générales de vente**, **politique de confidentialité** et **mentions légales** ;
- export des données et suppression du compte (RGPD).

Technologies : Supabase (comptes + base de données), Stripe (paiement), Vercel (hébergement).

## Organisation des fichiers

| Fichier | Rôle |
|---|---|
| `public/index.html` | **L'appli d'entraînement** (page temporaire à remplacer par votre fichier) |
| `public/js/acces.js` | Comptes, accès payant, sauvegarde automatique de la progression |
| `public/connexion.html`, `compte.html`, `merci.html`, `reinitialiser.html` | Pages élève |
| `public/cgv.html`, `confidentialite.html`, `mentions-legales.html` | Pages légales |
| `api/creer-paiement.js` | Crée le paiement Stripe |
| `api/stripe-webhook.js` | Reçoit la confirmation de Stripe et débloque l'accès |
| `api/verifier-paiement.js` | Débloque l'accès tout de suite au retour du paiement |
| `api/supprimer-compte.js` | Suppression du compte |
| `supabase/schema.sql` | Tables et règles de sécurité |
| `supabase/nettoyage.sql` | Suppression des comptes inactifs depuis 3 ans |

## Brancher votre appli (une seule page HTML)

1. Remplacez `public/index.html` par votre fichier.
2. Ajoutez dans `<head>`, **avant** vos propres scripts :
   ```html
   <script src="/api/config"></script>
   <script src="/vendor/supabase.js"></script>
   <script src="/js/acces.js"></script>
   ```
   Si votre appli enregistre déjà sa progression dans `localStorage`, rien d'autre à faire :
   elle est sauvegardée en ligne et restaurée sur les autres appareils automatiquement.
3. Avant d'ouvrir un contenu payant :
   ```js
   if (!CodeAcces.exigerPremium()) return; // affiche « Contenu réservé » et propose de payer
   ```
4. Ajoutez des liens vers `/compte`, `/cgv`, `/confidentialite` et `/mentions-legales` (par exemple en bas de page).
   Un petit bouton « Se connecter / Accès complet » apparaît aussi en bas à droite.

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
   événements `checkout.session.completed` et `checkout.session.async_payment_succeeded`.
   Notez le *secret de signature* (`whsec_…`).
3. **Paramètres → E-mails clients** : activez l'envoi du **reçu pour les paiements réussis**.
4. **Paramètres → Informations publiques** : nom, e-mail du support, lien vers vos CGV.

### 3. Vercel
1. **Add New → Project** → importez ce dépôt GitHub (Framework : *Other*, laissez le reste par défaut).
2. **Settings → Environment Variables** : ajoutez les 6 variables de `.env.example`.
3. Déployez. Branchez votre nom de domaine dans **Settings → Domains**, puis mettez à jour `SITE_URL`,
   l'URL Supabase et le webhook Stripe avec ce domaine.

### 4. Essai complet
Avec les clés de test Stripe : créez un compte, payez avec la carte `4242 4242 4242 4242`
(date future, n'importe quel code), vérifiez que l'accès est débloqué, puis passez aux clés *live*.

### 5. Pages légales
Remplacez tous les passages surlignés en jaune `[…]` dans `public/cgv.html`, `public/confidentialite.html`
et `public/mentions-legales.html` (nom, adresse, SIRET, TVA, **médiateur de la consommation**, qui est obligatoire).
Ces textes sont un modèle sérieux mais ne remplacent pas l'avis d'un juriste.

## Tests

```bash
npm install
npm test
```

## À savoir

- **Protection du contenu** : si toutes les questions sont écrites dans le fichier HTML, une personne
  qui s'y connaît peut les lire dans le code source sans payer. Pour une vraie protection, les questions
  payantes doivent être servies par le serveur aux seuls élèves ayant payé (adaptation possible une fois
  l'appli branchée).
- La clé `service_role` et les clés Stripe restent côté serveur : elles ne sont jamais envoyées au navigateur.
