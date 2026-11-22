// Suppression du compte (droit à l'effacement, RGPD art. 17).
// Supprime le compte, l'accès et la progression. Les paiements sont conservés sans lien
// avec le compte (obligation comptable de 10 ans).
import { supabaseAdmin, utilisateurConnecte, json } from './_lib/serveur.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { erreur: 'Méthode non autorisée' });
  try {
    const user = await utilisateurConnecte(req);
    if (!user) return json(res, 401, { erreur: 'Non connecté' });
    const { error } = await supabaseAdmin().auth.admin.deleteUser(user.id);
    if (error) throw error;
    return json(res, 200, { supprime: true });
  } catch (e) {
    console.error(e);
    return json(res, 500, { erreur: 'Suppression impossible, contactez-nous.' });
  }
}
