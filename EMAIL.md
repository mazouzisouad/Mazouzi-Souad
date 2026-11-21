# Envoi automatique des e-mails (≈ 10 minutes, gratuit)

Un seul bouton **« 📧 Envoyer par e-mail (PDF joint) »** : la carte de rendez-vous, la facture, le contrat ou le
rappel d'examen part tout seul, avec le PDF en pièce jointe. L'élève voit le nom de **son** auto-école, et ses
réponses arrivent sur l'e-mail de son auto-école.

L'envoi passe par un petit programme **Google Apps Script** installé sur une boîte Gmail dédiée
(par exemple `rdvpermismoto@gmail.com`). Gratuit, environ **100 e-mails par jour**.

## 1. Copier le programme
Dans l'appli : **Paramètres → 📧 Envoi automatique des e-mails → « 📋 Copier le programme »**.
(Le programme contient une clé secrète propre à votre appli.)

## 2. Le coller dans Google Apps Script
1. Connectez-vous avec la **boîte d'envoi** (ex. `rdvpermismoto@gmail.com`) et ouvrez **script.google.com**.
2. **Nouveau projet** → effacez le texte présent → **collez** le programme → 💾 **Enregistrer**.
3. En haut, choisissez la fonction **`autoriser`** → **▶ Exécuter** → **Examiner les autorisations** →
   choisissez le compte → **Paramètres avancés** → **Accéder à … (non sécurisé)** → **Autoriser**.
   (Ce message est normal : c'est votre propre programme.)

## 3. Le publier
1. **Déployer → Nouveau déploiement** → roue dentée → **Application Web**.
2. **Exécuter en tant que : Moi** · **Qui a accès : Tout le monde** → **Déployer**.
3. Copiez l'**URL de l'application Web** (elle se termine par `/exec`).

## 4. L'activer dans l'appli
**Paramètres → 📧 Envoi automatique** → collez l'URL → cochez **Activer** → **Enregistrer** →
**« M'envoyer un e-mail de test »**.

> Si vous modifiez un jour le programme, refaites **Déployer → Gérer les déploiements → ✏️ → Nouvelle version**
> pour que la modification soit prise en compte (l'URL ne change pas).
