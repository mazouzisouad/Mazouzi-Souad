// Envoi des e-mails de rappel via Brevo (service français, offre gratuite : 300 e-mails/jour).
import { env } from './serveur.js';

const BLEU = '#2f6fd6', VERT = '#4aa03e', TEXTE = '#1f2a44', DOUX = '#6b7590';

function dateFr(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' });
}
function echapper(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// Contenu de chaque type de rappel
export function contenuRappel(r, site) {
  const compte = `${site}/compte`;
  if (r.type === 'inactivite') {
    const jours = Math.max(3, Math.floor((Date.now() - new Date(r.date_ref)) / 864e5));
    return {
      sujet: 'Ton code de la route t’attend',
      titre: `Ça fait ${jours} jours qu’on ne t’a pas vu !`,
      texte: 'Une série de 10 questions prend environ 4 minutes. S’entraîner un peu chaque jour, c’est le meilleur moyen d’arriver prêt le jour de l’examen.',
      bouton: 'Reprendre l’entraînement', lien: site,
    };
  }
  if (r.type === 'fin_acces') {
    return {
      sujet: `Ton accès complet se termine le ${dateFr(r.date_ref)}`,
      titre: `Plus que quelques jours d’accès complet`,
      texte: `Ton accès à toutes les questions et aux examens blancs se termine le ${dateFr(r.date_ref)}. Profite-en pour faire un examen blanc ! Si tu as besoin de plus de temps, tu peux prolonger de 3 mois pour 9,90 €, sans abonnement.`,
      bouton: 'Voir mon compte', lien: compte,
    };
  }
  return {
    sujet: 'Ton accès complet est terminé',
    titre: 'Ton accès complet est terminé',
    texte: 'Ta progression est conservée et les questions gratuites restent disponibles. Pour continuer avec toutes les questions et les examens blancs : 9,90 € pour 3 mois, sans abonnement.',
    bouton: 'Prolonger mon accès', lien: compte,
  };
}

export function contenuParrainage(site) {
  return {
    sujet: 'Merci ! Ton ami t’offre 1 mois de Code Ludique',
    titre: 'Ton parrainage a fonctionné 🎉',
    texte: 'Un ami s’est inscrit avec ton lien et a pris l’accès complet. Tu gagnes 1 mois d’accès complet en plus, déjà ajouté à ton compte. Continue à partager ton lien : chaque nouvel ami te rapporte un mois.',
    bouton: 'Voir mon compte', lien: `${site}/compte`,
  };
}

export function htmlRappel(c, lienDesinscription) {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f6f1ec;font-family:Nunito,Arial,sans-serif;color:${TEXTE}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1ec;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fffdfb;border-radius:22px;overflow:hidden">
<tr><td style="background:${BLEU};padding:20px 24px;color:#fff;font-size:22px;font-weight:900">Code Ludique</td></tr>
<tr><td style="padding:24px">
<h1 style="margin:0 0 12px;font-size:21px;line-height:1.3">${echapper(c.titre)}</h1>
<p style="margin:0 0 20px;font-size:16px;line-height:1.5">${echapper(c.texte)}</p>
<a href="${echapper(c.lien)}" style="display:inline-block;background:${VERT};color:#fff;text-decoration:none;font-weight:900;padding:13px 22px;border-radius:999px">${echapper(c.bouton)}</a>
</td></tr></table>
<p style="max-width:480px;font-size:12px;line-height:1.5;color:${DOUX};margin:16px auto 0">
Tu reçois cet e-mail parce que tu as un compte élève Code Ludique.
<a href="${echapper(lienDesinscription)}" style="color:${DOUX}">Ne plus recevoir de rappels</a>.</p>
</td></tr></table></body></html>`;
}

export function texteRappel(c, lienDesinscription) {
  return `${c.titre}\n\n${c.texte}\n\n${c.bouton} : ${c.lien}\n\n---\nNe plus recevoir de rappels : ${lienDesinscription}`;
}

export async function envoyerEmail({ a, sujet, html, texte, lienDesinscription }) {
  const url = process.env.BREVO_API_URL || 'https://api.brevo.com/v3/smtp/email';
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'api-key': env('BREVO_API_KEY'), 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: process.env.EMAIL_NOM || 'Code Ludique', email: env('EMAIL_EXPEDITEUR') },
      to: [{ email: a }],
      subject: sujet,
      htmlContent: html,
      textContent: texte,
      headers: {
        'List-Unsubscribe': `<${lienDesinscription}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }),
  });
  if (!r.ok) throw new Error(`Brevo ${r.status} : ${(await r.text()).slice(0, 200)}`);
}
