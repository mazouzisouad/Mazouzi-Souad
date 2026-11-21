/* =====================================================================
   ENVOI AUTOMATIQUE D'E-MAILS (carte de RDV, facture, contrat, rappels)
   L'appli dépose l'e-mail (et son PDF) dans la collection « mail » de
   Firestore ; l'extension officielle Firebase « Trigger Email » l'envoie
   aussitôt depuis la boîte de l'auto-école et indique s'il est bien parti.
   ===================================================================== */
'use strict';

const emailAutoPret = () => !!(Cloud.actif && Cloud.role === 'admin' && DB.settings.emailAuto && DB.settings.emailAuto.actif && DB.settings.emailAuto.expediteur);

const texteEnHtml = (t) => `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#0f172a">${esc(t).replace(/\n/g, '<br>')}</div>`;

// Dépose l'e-mail et attend le résultat de l'envoi (45 s maximum)
async function envoyerEmailAuto({ to, subject, text, ecole, pj }) {
  const cfg = DB.settings.emailAuto;
  const nom = String((ecole && ecole.nom) || DB.entreprise.nom || '').replace(/["<>]/g, '');
  const docMail = {
    to: [to],
    from: nom ? `"${nom}" <${cfg.expediteur}>` : cfg.expediteur,
    message: {
      subject,
      text,
      html: texteEnHtml(text),
      attachments: pj ? [{ filename: pj.nom, content: pj.base64, encoding: 'base64', contentType: 'application/pdf' }] : [],
    },
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
  if (!Cloud.actif || Cloud.role !== 'admin') return '';
  const c = DB.settings.emailAuto || {};
  return `
    <div class="card">
      <h2>📧 Envoi automatique des e-mails</h2>
      <p class="muted small">Un seul bouton « Envoyer » : la carte de RDV, la facture ou le contrat part tout seul par e-mail, avec le PDF en pièce jointe. Nécessite l'extension Firebase « Trigger Email » (voir le guide).</p>
      <form id="email-form" class="form-grid" onsubmit="return false">
        <label class="field full"><span>Adresse qui envoie les e-mails (celle configurée dans l'extension)</span><input name="expediteur" type="email" value="${esc(c.expediteur || '')}" placeholder="ex : smilepermisparis@gmail.com"></label>
        <label class="row small" style="gap:8px"><input type="checkbox" name="actif" style="width:auto" ${c.actif ? 'checked' : ''}> Activer l'envoi automatique</label>
      </form>
      <p class="muted small">Le nom affiché est celui de l'auto-école de l'élève ; les réponses arrivent sur l'e-mail de cette auto-école.</p>
      <div class="row" style="justify-content:flex-end;gap:8px">
        <button class="btn" data-action="emailTest">📨 M'envoyer un e-mail de test</button>
        <button class="btn primary" data-action="emailSave">Enregistrer</button>
      </div>
    </div>`;
}

const EMAIL_ACTIONS = {
  emailSave() {
    const f = formData($('#email-form'));
    DB.settings.emailAuto = { actif: !!f.actif, expediteur: (f.expediteur || '').toLowerCase() };
    if (DB.settings.emailAuto.actif && !DB.settings.emailAuto.expediteur) return toast("Indiquez l'adresse qui envoie les e-mails", true);
    save(); render(); toast('Réglage enregistré');
  },
  async emailTest() {
    if (!emailAutoPret()) return toast("Activez d'abord l'envoi automatique et enregistrez", true);
    const to = Cloud.user.email;
    toast('Envoi du test en cours…');
    const r = await envoyerEmailAuto({ to, subject: 'Test Moto Planning', text: "Ceci est un e-mail de test : l'envoi automatique fonctionne 👍", ecole: null });
    const m = messageResultat(r, to);
    toast(m.txt, !m.ok);
  },
};
