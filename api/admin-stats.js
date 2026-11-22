// Tableau de bord interne : réservé aux adresses e-mail listées dans ADMIN_EMAILS.
import { supabaseAdmin, utilisateurConnecte, json } from './_lib/serveur.js';
import { EMPREINTES_CODES } from './_lib/codes.js';

export function estAdmin(user) {
  const liste = (process.env.ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return !!(user && user.email && user.email_confirmed_at && liste.includes(user.email.toLowerCase()));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { erreur: 'Méthode non autorisée' });
  try {
    const user = await utilisateurConnecte(req);
    if (!user) return json(res, 401, { erreur: 'Non connecté' });
    if (!estAdmin(user)) return json(res, 403, { erreur: 'Accès réservé' });
    const { data, error } = await supabaseAdmin().rpc('stats_admin');
    if (error) throw new Error(error.message);
    return json(res, 200, { ...data, codes_total: EMPREINTES_CODES.length });
  } catch (e) {
    console.error(e);
    return json(res, 500, { erreur: 'Statistiques indisponibles' });
  }
}
