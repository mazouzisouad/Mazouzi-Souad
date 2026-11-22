// Page « merci » des auto-écoles : renvoie les codes du lot payé (créés une seule fois).
import { stripe, json, traiterLot } from './_lib/serveur.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { erreur: 'Méthode non autorisée' });
  try {
    const id = new URL(req.url, 'http://x').searchParams.get('session_id') || '';
    if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return json(res, 400, { erreur: 'Commande introuvable.' });
    const session = await stripe().checkout.sessions.retrieve(id);
    if (session.metadata?.type !== 'lot') return json(res, 404, { erreur: 'Commande introuvable.' });
    if (session.payment_status !== 'paid') return json(res, 202, { statut: 'en_attente' });
    const r = await traiterLot(session);
    return json(res, 200, { statut: 'paye', ...r });
  } catch (e) {
    console.error(e);
    return json(res, 500, { erreur: 'Codes indisponibles pour le moment. Ils vous sont aussi envoyés par e-mail.' });
  }
}
