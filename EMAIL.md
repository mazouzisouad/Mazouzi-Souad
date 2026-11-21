# Envoi automatique des e-mails (≈ 20 minutes)

Avec ça, un seul bouton **« 📧 Envoyer par e-mail (PDF joint) »** : la carte de rendez-vous, la facture,
le contrat ou le rappel d'examen part tout seul, avec le PDF en pièce jointe.

L'envoi passe par l'extension officielle de Firebase **« Trigger Email from Firestore »**
et par la boîte **Gmail de l'auto-école**.

## 1. Passer Firebase en formule « Blaze » (paiement à l'usage)

Les extensions demandent cette formule. Pour une auto-école, l'usage reste dans la partie gratuite
(ou quelques centimes par mois).

1. Console Firebase → en bas à gauche **« Spark – Mettre à niveau »** → **Blaze** → ajoutez une carte bancaire.
2. Conseillé : créez une **alerte de budget** (par exemple 5 €) pour être prévenu au moindre coût.

## 2. Créer un « mot de passe d'application » Gmail

1. Sur **myaccount.google.com** (compte Gmail qui enverra les e-mails) → **Sécurité**.
2. Activez la **Validation en deux étapes** si ce n'est pas déjà fait.
3. Cherchez **« Mots de passe des applications »** → créez-en un nommé `Moto Planning`.
4. Google affiche un mot de passe de 16 lettres : **gardez-le pour l'étape 3** (ne le donnez à personne).

## 3. Installer l'extension

1. Console Firebase → **Extensions** (dans la loupe, tapez « Extensions ») → cherchez **« Trigger Email from Firestore »** → **Installer**.
2. Réglages à remplir :
   - **Cloud Functions location** : `europe-west1`
   - **Firestore Instance ID** : `(default)` · **Firestore location** : celle de votre base (`europe-west9`)
   - **Authentication Type** : `UsernamePassword`
   - **SMTP connection URI** : `smtps://VOTRE.ADRESSE@gmail.com@smtp.gmail.com:465`
   - **SMTP password** : le mot de passe d'application de 16 lettres
   - **Email documents collection** : `mail`
   - **Default FROM address** : `VOTRE.ADRESSE@gmail.com`
   - le reste : laissez les valeurs proposées
3. **Installer l'extension** (quelques minutes).

## 4. Activer dans l'appli

**Paramètres → 📧 Envoi automatique des e-mails** → adresse : `VOTRE.ADRESSE@gmail.com` →
cochez **Activer** → **Enregistrer** → **« M'envoyer un e-mail de test »**.

Le nom affiché à l'élève est celui de **son** auto-école, et ses réponses arrivent sur l'e-mail de cette auto-école.
