// Crée une session Stripe Checkout (9,90 € pour 3 mois) pour l'élève connecté.
import { stripe, utilisateurConnecte, urlDuSite, json, lireJson,
         PRIX_CENTIMES, DEVISE, LIBELLE_OFFRE } from './_lib/serveur.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { erreur: 'Méthode non autorisée' });
  try {
    const user = await utilisateurConnecte(req);
    if (!user) return json(res, 401, { erreur: 'Connectez-vous pour acheter l’accès.' });

    const corps = await lireJson(req);
    if (corps.cgv !== true || corps.renonciation !== true) {
      return json(res, 400, { erreur: 'Merci d’accepter les conditions de vente et l’exécution immédiate.' });
    }

    const site = urlDuSite(req);
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      locale: 'fr',
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { user_id: user.id, renonciation_le: new Date().toISOString() },
      payment_intent_data: {
        metadata: { user_id: user.id },
        // Figure sur le reçu Stripe envoyé par e-mail (confirmation sur support durable, art. L221-13)
        description: 'Accès complet 3 mois – exécution immédiate demandée et renonciation au droit de rétractation (art. L221-28 13° C. conso.)',
      },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: DEVISE,
          unit_amount: PRIX_CENTIMES,
          product_data: {
            name: LIBELLE_OFFRE,
            description: 'Toutes les questions et séries, progression sauvegardée. Sans renouvellement automatique.',
          },
        },
      }],
      custom_text: {
        submit: {
          message: 'Accès immédiat après paiement. Vous avez demandé l’exécution immédiate et renoncé à votre droit de rétractation (art. L221-28 13° du Code de la consommation).',
        },
      },
      success_url: `${site}/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/compte?paiement=annule`,
    });
    return json(res, 200, { url: session.url });
  } catch (e) {
    console.error(e);
    return json(res, 500, { erreur: 'Impossible de créer le paiement pour le moment.' });
  }
}
