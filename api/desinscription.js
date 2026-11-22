// Désinscription des rappels en un clic (lien en bas de chaque e-mail).
import { supabaseAdmin } from './_lib/serveur.js';

function page(res, statut, titre, texte) {
  res.statusCode = statut;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>${titre} – Code Ludique</title><link rel="stylesheet" href="/css/site.css"></head>
<body><main><div class="carte etroit" style="margin-top:40px"><h1>${titre}</h1><p>${texte}</p>
<a class="bouton" href="/compte">Mon compte</a></div></main></body></html>`);
}

export default async function handler(req, res) {
  const jeton = new URL(req.url, 'http://x').searchParams.get('jeton') || '';
  if (!/^[0-9a-f-]{36}$/i.test(jeton)) return page(res, 400, 'Lien invalide', 'Ce lien de désinscription n’est pas valide.');
  try {
    const { data, error } = await supabaseAdmin().rpc('desinscrire', { p_jeton: jeton });
    if (error) throw new Error(error.message);
    if (!data) return page(res, 404, 'Lien invalide', 'Ce lien de désinscription n’est plus valide.');
    if (req.method === 'POST') { res.statusCode = 200; return res.end('OK'); } // désinscription en un clic (messageries)
    return page(res, 200, 'C’est noté', 'Tu ne recevras plus de rappels par e-mail. Tu peux les réactiver à tout moment depuis « Mon compte ».');
  } catch (e) {
    console.error(e);
    return page(res, 500, 'Erreur', 'Désinscription impossible pour le moment. Réessaie plus tard ou écris-nous.');
  }
}
