// Achat d'un lot de codes par une auto-école (sans compte) : crée le paiement Stripe.
import { stripe, urlDuSite, json, lireJson, LOTS, DEVISE } from './_lib/serveur.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { erreur: 'Méthode non autorisée' });
  try {
    const corps = await lireJson(req);
    const lot = LOTS[corps.lot];
    if (!lot) return json(res, 400, { erreur: 'Lot inconnu.' });
    if (corps.cgv !== true) return json(res, 400, { erreur: 'Merci d’accepter les conditions de vente.' });
    const site = urlDuSite(req);
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      locale: 'fr',
      metadata: { type: 'lot', lot: corps.lot },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: DEVISE,
          unit_amount: lot.centimes,
          product_data: {
            name: `Lot de ${lot.quantite} codes Code Ludique`,
            description: `${lot.quantite} codes d’accès complet de 3 mois pour vos élèves (usage unique, à activer dans les 24 mois).`,
          },
        },
      }],
      custom_fields: [{ key: 'auto_ecole', label: { type: 'custom', custom: 'Nom de l’auto-école' }, type: 'text' }],
      invoice_creation: { enabled: true }, // facture pour la comptabilité de l'auto-école
      billing_address_collection: 'required',
      success_url: `${site}/auto-ecoles/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/auto-ecoles?paiement=annule`,
    });
    return json(res, 200, { url: session.url });
  } catch (e) {
    console.error(e);
    return json(res, 500, { erreur: 'Impossible de créer le paiement pour le moment.' });
  }
}
