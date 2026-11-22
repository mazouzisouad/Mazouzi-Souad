// Active un code d'accès pour l'élève connecté : 3 mois d'accès complet, code à usage unique.
import { supabaseAdmin, utilisateurConnecte, json, lireJson } from './_lib/serveur.js';
import { EMPREINTES_CODES, cyrb53, normaliserCode } from './_lib/codes.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { erreur: 'Méthode non autorisée' });
  try {
    const user = await utilisateurConnecte(req);
    if (!user) return json(res, 401, { erreur: 'Connecte-toi pour activer ton code.' });
    const code = normaliserCode((await lireJson(req)).code);
    const empreinte = code.length >= 4 && code.length <= 64 ? cyrb53(code) : -1;
    if (!EMPREINTES_CODES.includes(empreinte)) {
      // code acheté par une auto-école (CL-XXXX-XXXX)
      if (/^CL-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
        const { data, error } = await supabaseAdmin().rpc('activer_code_ecole', { p_code: code, p_user_id: user.id });
        if (!error) return json(res, 200, { expire_le: data });
        if (/deja_utilise/.test(error.message)) return json(res, 409, { erreur: 'Ce code a déjà été utilisé ou n’est plus valable.' });
        if (!/inconnu/.test(error.message)) throw new Error(error.message);
      }
      return json(res, 400, { erreur: 'Code incorrect. Vérifie les majuscules et le tiret.' });
    }
    const { data, error } = await supabaseAdmin().rpc('activer_code', {
      p_empreinte: empreinte, p_user_id: user.id,
    });
    if (error) {
      if (/deja_utilise/.test(error.message)) return json(res, 409, { erreur: 'Ce code a déjà été utilisé.' });
      throw new Error(error.message);
    }
    return json(res, 200, { expire_le: data });
  } catch (e) {
    console.error(e);
    return json(res, 500, { erreur: 'Activation impossible pour le moment.' });
  }
}
