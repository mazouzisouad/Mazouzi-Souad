// Appelée par la page « merci » : vérifie la session auprès de Stripe et débloque l'accès
// tout de suite, sans attendre le webhook (qui reste la source de secours).
import { stripe, utilisateurConnecte, json, traiterSessionPayee } from './_lib/serveur.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { erreur: 'Méthode non autorisée' });
  try {
    const user = await utilisateurConnecte(req);
    if (!user) return json(res, 401, { erreur: 'Non connecté' });
    const id = new URL(req.url, 'http://x').searchParams.get('session_id') || '';
    if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return json(res, 400, { erreur: 'Session invalide' });

    const session = await stripe().checkout.sessions.retrieve(id);
    const proprietaire = session.metadata?.user_id || session.client_reference_id;
    if (proprietaire !== user.id) return json(res, 403, { erreur: 'Ce paiement ne correspond pas à ce compte.' });
    if (session.payment_status !== 'paid') return json(res, 202, { statut: 'en_attente' });

    const fin = await traiterSessionPayee(session);
    return json(res, 200, { statut: 'paye', expire_le: fin });
  } catch (e) {
    console.error(e);
    return json(res, 500, { erreur: 'Vérification impossible' });
  }
}
