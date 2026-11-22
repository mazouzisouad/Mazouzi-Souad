// Webhook Stripe : débloque automatiquement l'accès quand le paiement est confirmé.
// À déclarer dans Stripe > Développeurs > Webhooks : https://VOTRE-SITE/api/stripe-webhook
// Événements : checkout.session.completed, checkout.session.async_payment_succeeded
import { stripe, env, json, lireCorpsBrut, traiterSessionPayee } from './_lib/serveur.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { erreur: 'Méthode non autorisée' });

  let evenement;
  try {
    const brut = await lireCorpsBrut(req); // corps brut obligatoire pour vérifier la signature
    evenement = stripe().webhooks.constructEvent(brut, req.headers['stripe-signature'], env('STRIPE_WEBHOOK_SECRET'));
  } catch (e) {
    console.error('Signature webhook invalide :', e.message);
    return json(res, 400, { erreur: 'Signature invalide' });
  }

  try {
    if (evenement.type === 'checkout.session.completed' ||
        evenement.type === 'checkout.session.async_payment_succeeded') {
      const fin = await traiterSessionPayee(evenement.data.object);
      if (fin) console.log(`Accès débloqué jusqu'au ${fin} (session ${evenement.data.object.id})`);
    }
    return json(res, 200, { recu: true });
  } catch (e) {
    console.error(e);
    return json(res, 500, { erreur: 'Traitement impossible' }); // Stripe réessaiera
  }
}
