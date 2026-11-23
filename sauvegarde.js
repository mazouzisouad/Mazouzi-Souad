/* =====================================================================
   SAUVEGARDE AUTOMATIQUE — une copie de toutes les données chaque semaine
   Si l'envoi automatique d'e-mails est réglé (Paramètres → E-mails), la
   sauvegarde part toute seule par e-mail (fichier .json en pièce jointe).
   Sinon, le planning affiche chaque semaine un rappel pour la télécharger.
   Le fichier se recharge avec Paramètres → Sauvegarde → Restaurer.
   ===================================================================== */
'use strict';

const SEMAINE_MS = 7 * 86400000;
function cfgSauvegarde() {
  if (!DB.settings.sauvegarde || typeof DB.settings.sauvegarde !== 'object') DB.settings.sauvegarde = { actif: true, email: '', derniere: '' };
  return DB.settings.sauvegarde;
}
const nomSauvegarde = () => `go-moto-sauvegarde-${todayISO()}.json`;
const sauvegardeDue = () => { const d = cfgSauvegarde().derniere; return !d || Date.now() - new Date(d).getTime() > SEMAINE_MS; };
const directionIci = () => !Cloud.enabled || (Cloud.actif && Cloud.role === 'admin');
const emailSauvegarde = () => cfgSauvegarde().email || (Cloud.user && Cloud.user.email) || DB.entreprise.email || '';

// texte → base64 (UTF-8), par morceaux pour les gros fichiers
function enBase64(texte) {
  const o = new TextEncoder().encode(texte); let s = '';
  for (let i = 0; i < o.length; i += 0x8000) s += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000));
  return btoa(s);
}

function marquerSauvegarde(via, a) {
  const c = cfgSauvegarde();
  c.derniere = new Date().toISOString(); c.via = via; c.a = a || ''; delete c.erreur;
  save();
}

async function envoyerSauvegarde(manuel) {
  const to = emailSauvegarde();
  if (!to) { if (manuel) toast("Indiquez l'e-mail où envoyer la sauvegarde.", true); return false; }
  if (!emailAutoPret()) { if (manuel) toast("L'envoi automatique d'e-mails n'est pas réglé (Paramètres → E-mails). Utilisez « ⬇️ Sauvegarder ».", true); return false; }
  envoyerSauvegarde.enCours = true;
  try {
    const nb = { eleves: DB.eleves.length, lecons: DB.seances.length, paiements: DB.paiements.length, factures: DB.factures.length, contrats: DB.contrats.length };
    const r = await envoyerEmailAuto({
      to,
      subject: `Go Moto : sauvegarde du ${fmtDate(todayISO())}`,
      text: `Bonjour,\n\nVoici la sauvegarde ${manuel ? '' : 'automatique de la semaine '}de toutes les données de Go Moto :\n- ${nb.eleves} élèves\n- ${nb.lecons} leçons et examens\n- ${nb.paiements} paiements, ${nb.factures} factures\n- ${nb.contrats} contrats\n\nGardez cet e-mail. En cas de problème, la pièce jointe se recharge dans l'appli : Paramètres → Sauvegarde → ⬆️ Restaurer.\n\nGo Moto`,
      ecole: null,
      pj: { nom: nomSauvegarde(), base64: enBase64(JSON.stringify(DB)), type: 'application/json' },
    });
    if (r.etat === 'erreur') {
      cfgSauvegarde().erreur = r.erreur; save();
      if (manuel) toast("La sauvegarde n'est pas partie : " + r.erreur, true);
      return false;
    }
    marquerSauvegarde('email', to);
    if (manuel) toast(`Sauvegarde envoyée à ${to} ✅`);
    return true;
  } finally { envoyerSauvegarde.enCours = false; }
}

// Appelé à l'ouverture de l'appli et quand les données arrivent
function sauvegardeAuto() {
  const c = cfgSauvegarde();
  if (!directionIci() || c.actif === false || !sauvegardeDue() || envoyerSauvegarde.enCours) return;
  if (emailAutoPret() && emailSauvegarde()) envoyerSauvegarde(false).then((ok) => { if (ok) { toast('💾 Sauvegarde de la semaine envoyée par e-mail'); renderPlusTard(); } });
}

// Bandeau du planning quand la sauvegarde n'a pas pu partir toute seule
function bandeauSauvegarde() {
  const c = cfgSauvegarde();
  if (!directionIci() || c.actif === false || !sauvegardeDue()) return '';
  if (emailAutoPret() && emailSauvegarde() && !c.erreur) return ''; // elle part toute seule
  return `<div class="alert info row between" style="margin-bottom:10px"><span>💾 <strong>Sauvegarde de la semaine</strong> : gardez une copie de toutes les données${c.derniere ? ` (dernière le ${fmtDate(c.derniere.slice(0, 10))})` : ''}.</span>
    <button class="btn primary" data-action="exportData">⬇️ Télécharger la sauvegarde</button></div>`;
}

function blocParamSauvegarde() {
  const c = cfgSauvegarde();
  const auto = emailAutoPret();
  return `
    <div class="sauvegarde-auto">
      <label class="row" style="gap:8px"><input type="checkbox" style="width:auto" ${c.actif !== false ? 'checked' : ''} data-on-change="sauvegardeActif"> <strong>Sauvegarde automatique chaque semaine</strong></label>
      ${c.actif !== false ? `
        <label class="field" style="margin-top:8px"><span>Envoyer la sauvegarde à</span><input type="email" value="${esc(c.email || '')}" placeholder="${esc(emailSauvegarde() || 'votre e-mail')}" data-on-change="sauvegardeEmail"></label>
        <p class="small ${auto ? 'muted' : ''}" style="margin:6px 0">${auto
          ? `📧 Elle part toute seule par e-mail une fois par semaine, à l'ouverture de l'appli.`
          : `⚠️ L'envoi automatique d'e-mails n'est pas réglé (carte « E-mails » ci-dessus) : un rappel s'affichera chaque semaine dans le planning pour télécharger la sauvegarde.`}</p>
        <p class="small muted" style="margin:0">${c.derniere ? `Dernière sauvegarde : le ${fmtDateHeure(c.derniere)}${c.via === 'email' ? ` (envoyée à ${esc(c.a)})` : ' (téléchargée)'}.` : 'Pas encore de sauvegarde.'}${c.erreur ? ` <span class="txt-bad">Dernier envoi raté : ${esc(c.erreur)}</span>` : ''}</p>
        ${auto ? '<div class="row" style="margin-top:8px"><button class="btn" data-action="sauvegardeMaintenant">📧 Envoyer une sauvegarde maintenant</button></div>' : ''}` : ''}
    </div>`;
}

const SAUVEGARDE_ACTIONS = {
  sauvegardeActif(d, el) { cfgSauvegarde().actif = el.checked; save(); render(); },
  sauvegardeEmail(d, el) { cfgSauvegarde().email = el.value.trim(); save(); toast('E-mail de sauvegarde enregistré'); },
  async sauvegardeMaintenant() { toast('Envoi en cours…'); await envoyerSauvegarde(true); render(); },
};
