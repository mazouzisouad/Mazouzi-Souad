/* =====================================================================
   ENVOI AUTOMATIQUE D'E-MAILS (carte de RDV, facture, contrat, rappels)

   Méthode recommandée : un petit programme Google Apps Script installé sur
   la boîte Gmail d'envoi (gratuit, ~100 e-mails/jour). L'appli lui envoie
   l'e-mail et le PDF ; il l'envoie depuis Gmail et répond « ok » ou l'erreur.

   (Ancienne méthode, toujours gérée : extension Firebase « Trigger Email »,
   que Google arrête le 31 mars 2027.)
   ===================================================================== */
'use strict';

const cfgEmail = () => DB.settings.emailAuto || {};
const modeEmail = () => (cfgEmail().mode === 'extension' ? 'extension' : 'script');

function emailAutoPret() {
  const c = cfgEmail();
  if (!c.actif) return false;
  if (Cloud.enabled && !(Cloud.actif && Cloud.role === 'admin')) return false;
  if (modeEmail() === 'script') return !!(c.url && c.cle);
  return !!(Cloud.actif && c.expediteur);
}

const texteEnHtml = (t) => `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#0f172a">${esc(t).replace(/\n/g, '<br>')}</div>`;

// Code du programme Apps Script, avec la clé secrète de l'appli
function codeAppsScript(cle) {
  return `// Go Moto — envoi des e-mails (à coller dans script.google.com)
const CLE = '${cle}';

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.cle !== CLE) return reponse({ ok: false, erreur: 'clé invalide' });
    const options = { name: d.nom || 'Go Moto', htmlBody: d.html };
    if (d.replyTo) options.replyTo = d.replyTo;
    if (d.pj) options.attachments = [Utilities.newBlob(Utilities.base64Decode(d.pj.base64), d.pj.type || 'application/pdf', d.pj.nom)];
    GmailApp.sendEmail(d.to, d.sujet, d.texte, options);
    return reponse({ ok: true, restant: MailApp.getRemainingDailyQuota() });
  } catch (err) {
    return reponse({ ok: false, erreur: String(err) });
  }
}

function reponse(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// À exécuter une fois (bouton ▶ Exécuter) pour autoriser l'envoi depuis Gmail
function autoriser() {
  GmailApp.getInboxUnreadCount();
  Logger.log('Autorisation OK, quota restant aujourd\\'hui : ' + MailApp.getRemainingDailyQuota());
}
`;
}

async function envoyerEmailAuto({ to, subject, text, ecole, pj }) {
  const c = cfgEmail();
  const nom = String((ecole && ecole.nom) || DB.entreprise.nom || 'Go Moto').replace(/["<>]/g, '');
  if (modeEmail() === 'script') {
    try {
      const r = await fetch(c.url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // évite la vérification CORS préalable
        body: JSON.stringify({ cle: c.cle, to, sujet: subject, texte: text, html: texteEnHtml(text), nom, replyTo: (ecole && ecole.email) || '', pj: pj || null }),
        redirect: 'follow',
      });
      const d = await r.json();
      return d.ok ? { etat: 'ok', restant: d.restant } : { etat: 'erreur', erreur: d.erreur || 'erreur inconnue' };
    } catch (e) {
      return { etat: 'erreur', erreur: navigator.onLine ? 'le programme d\'envoi ne répond pas (vérifiez l\'adresse du programme)' : 'pas de connexion internet' };
    }
  }
  // Extension Firebase « Trigger Email »
  const docMail = {
    to: [to],
    from: `"${nom}" <${c.expediteur}>`,
    message: { subject, text, html: texteEnHtml(text), attachments: pj ? [{ filename: pj.nom, content: pj.base64, encoding: 'base64', contentType: pj.type || 'application/pdf' }] : [] },
    envoyePar: (Cloud.user && Cloud.user.email) || '',
    creeLe: new Date().toISOString(),
  };
  if (ecole && ecole.email) docMail.replyTo = ecole.email;
  const ref = await Cloud.fs.collection('mail').add(docMail);
  return new Promise((resolve) => {
    let unsub = () => {};
    const fin = (r) => { clearTimeout(t); unsub(); resolve(r); };
    const t = setTimeout(() => fin({ etat: 'attente' }), 45000);
    unsub = ref.onSnapshot((d) => {
      const del = d.data() && d.data().delivery;
      if (!del) return;
      if (del.state === 'SUCCESS') fin({ etat: 'ok' });
      else if (del.state === 'ERROR') fin({ etat: 'erreur', erreur: del.error || 'erreur inconnue' });
    }, () => fin({ etat: 'attente' }));
  });
}

function messageResultat(r, to) {
  if (r.etat === 'ok') return { ok: true, txt: `E-mail envoyé à ${to} ✅` };
  if (r.etat === 'erreur') return { ok: false, txt: `L'e-mail n'est pas parti : ${r.erreur}` };
  return { ok: true, txt: `E-mail en cours d'envoi à ${to}… (il partira dès que possible)` };
}

function viewParamEmail() {
  if (Cloud.enabled && !(Cloud.actif && Cloud.role === 'admin')) return '';
  const c = cfgEmail();
  const script = modeEmail() === 'script';
  return `
    <div class="card">
      <h2>📧 Envoi automatique des e-mails</h2>
      <p class="muted small">Un seul bouton « Envoyer » : la carte de RDV, la facture, le contrat ou le rappel part tout seul par e-mail, avec le PDF joint. L'élève voit le nom de <strong>son</strong> auto-école ; ses réponses arrivent sur l'e-mail de son auto-école.</p>
      ${script ? `
        <ol class="small etapes">
          <li>Connecté avec la boîte d'envoi (ex. rdvpermismoto@gmail.com), ouvrez <strong>script.google.com</strong> → <strong>Nouveau projet</strong>.</li>
          <li><button class="btn small" data-action="emailCopierScript">📋 Copier le programme</button> puis collez-le à la place du texte existant → 💾 Enregistrer.</li>
          <li>Choisissez la fonction <strong>autoriser</strong> → <strong>▶ Exécuter</strong> → autorisez l'accès (« Paramètres avancés » → « Accéder au projet »).</li>
          <li><strong>Déployer → Nouveau déploiement</strong> → type <strong>Application Web</strong> · Exécuter en tant que : <strong>Moi</strong> · Accès : <strong>Tout le monde</strong> → Déployer → copiez l'<strong>URL</strong>.</li>
          <li>Collez l'URL ci-dessous, cochez Activer, Enregistrer, puis faites le test.</li>
        </ol>` : ''}
      <form id="email-form" class="form-grid" onsubmit="return false">
        ${script
          ? `<label class="field full"><span>URL du programme d'envoi (se termine par /exec)</span><input name="url" value="${esc(c.url || '')}" placeholder="https://script.google.com/macros/s/…/exec"></label>`
          : `<label class="field full"><span>Adresse configurée dans l'extension Firebase</span><input name="expediteur" type="email" value="${esc(c.expediteur || '')}"></label>`}
        <label class="row small" style="gap:8px"><input type="checkbox" name="actif" style="width:auto" ${c.actif ? 'checked' : ''}> Activer l'envoi automatique</label>
      </form>
      <div class="row" style="justify-content:space-between;gap:8px;margin-top:8px">
        <button class="btn small ghost" data-action="emailMode">${script ? 'Utiliser plutôt l\'extension Firebase' : 'Utiliser plutôt Google Apps Script (recommandé)'}</button>
        <div class="row" style="gap:8px">
          <button class="btn" data-action="emailTest">📨 M'envoyer un e-mail de test</button>
          <button class="btn primary" data-action="emailSave">Enregistrer</button>
        </div>
      </div>
    </div>`;
}

function cleAleatoire() {
  const a = new Uint8Array(18);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
}

const EMAIL_ACTIONS = {
  emailSave() {
    const f = formData($('#email-form'));
    const c = Object.assign({}, cfgEmail());
    c.mode = modeEmail();
    c.actif = !!f.actif;
    if (c.mode === 'script') {
      c.url = (f.url || '').trim();
      if (c.actif && !/^https:\/\/script\.google(usercontent)?\.com\//.test(c.url)) return toast("Collez l'URL du programme (https://script.google.com/macros/s/…/exec)", true);
      if (!c.cle) c.cle = cleAleatoire();
    } else {
      c.expediteur = (f.expediteur || '').toLowerCase();
      if (c.actif && !c.expediteur) return toast("Indiquez l'adresse qui envoie les e-mails", true);
    }
    DB.settings.emailAuto = c;
    save(); render(); toast('Réglage enregistré');
  },
  emailMode() {
    const c = Object.assign({}, cfgEmail());
    c.mode = modeEmail() === 'script' ? 'extension' : 'script';
    DB.settings.emailAuto = c;
    save(); render();
  },
  async emailCopierScript() {
    const c = Object.assign({}, cfgEmail());
    if (!c.cle) { c.cle = cleAleatoire(); c.mode = 'script'; DB.settings.emailAuto = c; save(); }
    const code = codeAppsScript(c.cle);
    try { await navigator.clipboard.writeText(code); toast('Programme copié ✅ — collez-le dans script.google.com'); }
    catch (e) {
      openModal({
        title: 'Programme à copier',
        body: `<p class="small muted">Sélectionnez tout le texte ci-dessous, copiez-le, puis collez-le dans script.google.com.</p><textarea style="min-height:50vh;font-family:monospace;font-size:12px" readonly>${esc(code)}</textarea>`,
        foot: '<button class="btn" data-action="closeModal">Fermer</button>',
      });
    }
  },
  async emailTest() {
    if (!emailAutoPret()) return toast("Activez d'abord l'envoi automatique et enregistrez", true);
    const to = (Cloud.user && Cloud.user.email) || prompt('Adresse e-mail pour le test :');
    if (!to) return;
    toast('Envoi du test en cours…');
    const r = await envoyerEmailAuto({ to, subject: 'Test Go Moto', text: "Ceci est un e-mail de test : l'envoi automatique fonctionne 👍", ecole: null });
    const m = messageResultat(r, to);
    toast(m.txt + (r.restant != null ? ` (encore ${r.restant} envois possibles aujourd'hui)` : ''), !m.ok);
  },
};
