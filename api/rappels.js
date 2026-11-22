// Envoi quotidien des rappels (lancé automatiquement par Vercel Cron, voir vercel.json).
// Protégé par CRON_SECRET : Vercel envoie « Authorization: Bearer <CRON_SECRET> ».
import { supabaseAdmin, env, json, urlDuSite } from './_lib/serveur.js';
import { contenuRappel, htmlRappel, texteRappel, envoyerEmail } from './_lib/emails.js';

const MAX_PAR_PASSAGE = 250; // reste sous la limite gratuite de Brevo (300/jour)

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${env('CRON_SECRET')}`) return json(res, 401, { erreur: 'Non autorisé' });
  const db = supabaseAdmin();
  const site = urlDuSite(req);
  const bilan = { envoyes: 0, deja: 0, erreurs: 0 };
  try {
    const { data, error } = await db.rpc('rappels_a_envoyer');
    if (error) throw new Error(error.message);
    for (const r of (data || []).slice(0, MAX_PAR_PASSAGE)) {
      // on « réserve » le rappel : la clé primaire empêche tout doublon
      const { error: errRes } = await db.from('rappels_envoyes').insert({ user_id: r.user_id, type: r.type, cle: r.cle });
      if (errRes) { if (errRes.code === '23505') { bilan.deja++; continue; } throw new Error(errRes.message); }
      const lienDesinscription = `${site}/api/desinscription?jeton=${r.jeton}`;
      const c = contenuRappel(r, site);
      try {
        await envoyerEmail({ a: r.email, sujet: c.sujet, html: htmlRappel(c, lienDesinscription),
          texte: texteRappel(c, lienDesinscription), lienDesinscription });
        bilan.envoyes++;
      } catch (e) {
        console.error(`Rappel ${r.type} non envoyé :`, e.message);
        bilan.erreurs++;
        await db.from('rappels_envoyes').delete().match({ user_id: r.user_id, type: r.type, cle: r.cle });
      }
    }
    console.log('Rappels :', bilan);
    return json(res, 200, bilan);
  } catch (e) {
    console.error(e);
    return json(res, 500, { erreur: 'Envoi des rappels impossible', ...bilan });
  }
}
