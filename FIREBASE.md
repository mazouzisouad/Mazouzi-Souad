# Mettre en place le planning partagé (≈ 15 minutes, gratuit)

Le planning partagé permet aux agences et aux moniteurs de voir **le même planning, en direct**,
sur ordinateur et téléphone. Il utilise Firebase (service de Google, gratuit pour cet usage).

## 1. Créer le projet Firebase

1. Allez sur <https://console.firebase.google.com> et connectez-vous avec le compte Google de l'auto-école.
2. **Ajouter un projet** → nom : `moto-planning` (par exemple) → Google Analytics : **désactivé** → Créer.

## 2. Activer la base de données

1. Menu de gauche : **Créer → Firestore Database** → **Créer une base de données**.
2. Emplacement : **europe-west9 (Paris)** ou **europe-west1** → Suivant.
3. Choisir **Mode production** → Créer.
4. Onglet **Règles** : effacez tout, collez le contenu du fichier [`firestore.rules`](firestore.rules),
   **remplacez les e-mails d'exemple par les vrais** (un par agence et par moniteur), puis **Publier**.

## 3. Activer la connexion par e-mail

1. Menu de gauche : **Créer → Authentication** → **Commencer**.
2. Onglet **Méthode de connexion** → **Adresse e-mail/Mot de passe** → Activer → Enregistrer.
3. Onglet **Utilisateurs** → **Ajouter un utilisateur** : créez le compte des **propriétaires** (les e-mails écrits
   dans les règles). Les autres accès (moniteurs, secrétariat) se créent ensuite directement dans l'appli :
   **Paramètres → Accès à l'appli**.
4. Onglet **Paramètres → Domaines autorisés** : ajoutez l'adresse où l'appli sera en ligne
   (par exemple `mazouzisouad.github.io`).

## 4. Récupérer la configuration

1. Roue dentée ⚙️ en haut à gauche → **Paramètres du projet**.
2. En bas : **Vos applications** → icône **`</>`** (Web) → nom : `moto-planning` → Enregistrer.
3. Copiez le bloc `const firebaseConfig = { ... };` qui s'affiche.

Ensuite, au choix :
- **le plus simple** : envoyez-moi ce bloc, je le mets dans `config.js` et tous les appareils seront connectés automatiquement ;
- ou dans l'appli : **Paramètres → Planning partagé en ligne** → collez le bloc → Activer (à faire sur chaque appareil).

> Ces informations ne sont pas secrètes : les données restent protégées par les comptes (e-mail + mot de passe)
> et par les règles de l'étape 2.

## 5. Première mise en service

Sur l'appareil qui contient déjà les bonnes données : connectez-vous → **« Envoyer mes données en ligne »**.
Les autres appareils n'ont plus qu'à se connecter.

## Mettre l'appli en ligne (GitHub Pages)

Sur GitHub : dépôt → **Settings → Pages** → Source : *Deploy from a branch* → choisir la branche de l'appli → `/ (root)` → Save.
L'adresse s'affiche après une minute (ex. `https://mazouzisouad.github.io/Mazouzi-Souad/`).
Sur téléphone : ouvrir l'adresse → menu du navigateur → **« Ajouter à l'écran d'accueil »**.

> GitHub Pages est gratuit pour un dépôt **public**. Si le dépôt est privé, il faut un abonnement GitHub payant,
> ou utiliser Firebase Hosting / Netlify (gratuits) — je peux vous guider.
