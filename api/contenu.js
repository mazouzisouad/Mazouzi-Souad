// Envoie les questions et fiches payantes, uniquement à un élève connecté dont l'accès est actif.
// La vérification se fait ici, côté serveur : la page ne contient pas ce contenu.
import { supabaseAdmin, utilisateurConnecte, json } from './_lib/serveur.js';
import { QUESTIONS_PREMIUM, FICHES_PREMIUM } from './_lib/contenu-premium.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { erreur: 'Méthode non autorisée' });
  try {
    const user = await utilisateurConnecte(req);
    if (!user) return json(res, 401, { erreur: 'Non connecté' });
    const { data, error } = await supabaseAdmin()
      .from('acces').select('expire_le').eq('user_id', user.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data || new Date(data.expire_le) <= new Date()) {
      return json(res, 403, { erreur: 'Accès complet non actif' });
    }
    res.setHeader('Vary', 'Authorization');
    return json(res, 200, { questions: QUESTIONS_PREMIUM, fiches: FICHES_PREMIUM });
  } catch (e) {
    console.error(e);
    return json(res, 500, { erreur: 'Contenu indisponible pour le moment.' });
  }
}
