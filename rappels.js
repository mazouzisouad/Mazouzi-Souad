/* =====================================================================
   RAPPELS D'EXAMEN — prévenir les élèves la veille de leur examen
   Message : date et heure de l'examen, centre, heure et lieu du rendez-vous,
   moniteur, documents à apporter, équipement obligatoire.
   Envoi en un clic par SMS, WhatsApp ou e-mail ; l'appli retient qui a été prévenu.
   ===================================================================== */
'use strict';

const RAPPEL_DEFAUT = {
  avanceMin: 45, // rendez-vous X minutes avant l'heure de l'examen
  lieuDefaut: '', // vide = l'adresse de l'auto-école de l'élève
  documents: {
    exam_plateau: "Pièce d'identité originale en cours de validité (carte d'identité, passeport ou titre de séjour)\nConvocation à l'examen\nLivret d'apprentissage",
    exam_circulation: "Pièce d'identité originale en cours de validité (carte d'identité, passeport ou titre de séjour)\nConvocation à l'examen\nLivret d'apprentissage",
  },
  equipement: 'Casque homologué\nGants certifiés CE\nBlouson ou veste à manches longues\nPantalon résistant ou combinaison\nBottes ou chaussures montantes',
  lecons: true, // rappeler aussi les leçons (pas seulement les examens)
  messageLecon: "En cas d'empêchement, prévenez-nous au plus vite (toute leçon non décommandée 48 h à l'avance est due).",
};
const rappelLecons = () => rappelCfg().lecons !== false;

const rappelCfg = () => DB.settings.rappel;

function heureRdv(s) {
  return s.rdvHeure || fromMin(Math.max(0, toMin(s.debut) - (Number(rappelCfg().avanceMin) || 0)));
}
function lieuRdv(s, e) {
  if (s.rdvLieu) return s.rdvLieu;
  if (rappelCfg().lieuDefaut) return rappelCfg().lieuDefaut;
  const ec = ecoleDe(agenceDe(e));
  return [ec.nom, [ec.adresse, ec.cp, ec.ville].filter(Boolean).join(' ')].filter(Boolean).join(', ');
}
const liste = (txt) => String(txt || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => `- ${l}`).join('\n');

function texteRappelLecon(s, eleveId) {
  const e = byId('eleves', eleveId);
  const ec = ecoleDe(agenceDe(e));
  const m = byId('moniteurs', s.moniteurId);
  const hz = horaireDe(s, eleveId);
  const jour = s.date === addDays(todayISO(), 1) ? 'demain' : 'le';
  const date = parseISO(s.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const mode = modeDe(s, eleveId);
  const quoi = isBlanc(s.type) || mode === 'blanc' ? `un examen blanc ${baseDe(s.type)}`
    : mode === 'evaluation' ? 'votre évaluation de départ'
    : `une leçon de moto ${baseDe(s.type) === 'plateau' ? 'plateau' : 'circulation'}${mode === 'prepa' ? ' (préparation à l\'examen)' : ''}`;
  const message = rappelCfg().messageLecon ?? RAPPEL_DEFAUT.messageLecon;
  return `Bonjour ${e.prenom},

Rappel : vous avez ${jour} ${date} ${quoi}, de ${hz.debut.replace(':', 'h')} à ${hz.fin.replace(':', 'h')}.

📍 Lieu : ${s.lieu || lieuRdv(s, e)}
🏍️ Moniteur : ${moniteurNom(m)}

🧥 Pensez à votre équipement :
${liste(rappelCfg().equipement)}
${message ? `\n${message}\n` : ''}
À ${jour === 'demain' ? 'demain' : 'bientôt'} !
${ec.nom}${ec.tel ? ' - ' + ec.tel : ''}`;
}
const sujetRappel = (r) => {
  const ec = ecoleDe(agenceDe(r.e));
  if (isExam(r.s.type)) return `Rappel : votre examen moto ${r.s.type === 'exam_plateau' ? 'plateau' : 'circulation'} du ${fmtDate(r.s.date)} - ${ec.nom}`;
  return `Rappel : votre leçon de moto du ${fmtDate(r.s.date)} à ${horaireDe(r.s, r.e.id).debut.replace(':', 'h')} - ${ec.nom}`;
};

function texteRappel(s, eleveId) {
  if (!isExam(s.type)) return texteRappelLecon(s, eleveId);
  const e = byId('eleves', eleveId);
  const ec = ecoleDe(agenceDe(e));
  const m = byId('moniteurs', s.moniteurId);
  const jour = s.date === addDays(todayISO(), 1) ? 'demain' : 'le';
  const date = parseISO(s.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const epreuve = s.type === 'exam_plateau' ? 'plateau (hors circulation)' : 'circulation';
  return `Bonjour ${e.prenom},

Rappel : vous passez ${jour} ${date} votre examen moto ${epreuve}, à ${s.debut}.${s.lieu ? `\n🏁 Lieu de l'examen : ${s.lieu}` : ''}

📍 Rendez-vous à ${heureRdv(s)} : ${lieuRdv(s, e)}
🏍️ Moniteur : ${moniteurNom(m)}

📄 Documents à apporter :
${liste(rappelCfg().documents[s.type])}

🧥 Équipement obligatoire :
${liste(rappelCfg().equipement)}

Merci d'être à l'heure. Bonne chance !
${ec.nom}${ec.tel ? ' - ' + ec.tel : ''}`;
}

// Élèves à prévenir pour les examens (et les leçons) d'une date
function rappelsDu(dateISO) {
  const out = [];
  for (const s of DB.seances.filter((x) => (isExam(x.type) || rappelLecons()) && x.date === dateISO).sort((a, b) => (isExam(b.type) - isExam(a.type)) || a.debut.localeCompare(b.debut))) {
    for (const p of s.eleves) {
      if (p.statut !== 'prevu') continue;
      const e = byId('eleves', p.eleveId);
      if (e) out.push({ s, p, e });
    }
  }
  return out;
}

// Bandeau du planning : examens de demain
function bandeauRappels() {
  const demain = addDays(todayISO(), 1);
  const list = rappelsDu(demain);
  if (!list.length) return '';
  const reste = list.filter((r) => !r.p.rappel).length;
  const quoi = list.some((r) => isExam(r.s.type)) ? (list.some((r) => !isExam(r.s.type)) ? 'Leçons et examens demain' : 'Examens demain') : 'Leçons demain';
  return reste
    ? `<div class="alert warn row between" style="margin-bottom:10px"><span>🔔 <strong>${quoi} : ${reste} élève${reste > 1 ? 's' : ''} à prévenir</strong> (heure, lieu, moniteur, équipement).</span>
        <button class="btn primary" data-action="openRappels" data-date="${demain}">Prévenir les élèves</button></div>`
    : `<div class="alert info row between" style="margin-bottom:10px"><span>✅ ${quoi} : tous les élèves ont été prévenus.</span>
        <button class="btn small" data-action="openRappels" data-date="${demain}">Voir</button></div>`;
}

let rappelsOuverts = { date: null, seanceId: null };

function openRappels(date, seanceId) {
  rappelsOuverts = { date, seanceId };
  let list = rappelsDu(date);
  if (seanceId) list = list.filter((r) => r.s.id === seanceId);
  const jour = parseISO(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  openModal({
    title: `🔔 Rappels — ${esc(jour)}`,
    wide: true,
    body: `
      <div class="row" style="margin-bottom:10px"><span class="small">${rappelLecons() ? 'Leçons et examens du' : 'Examens du'}</span>
        <input type="date" value="${date}" data-on-change="rappelDate" style="width:auto"></div>
      ${list.length ? list.map((r, i) => {
        const tel = r.e.tel || ''; const mail = r.e.email || '';
        return `<div class="card rappel ${r.p.rappel ? 'envoye' : ''}" style="margin-bottom:10px">
          <div class="row between">
            <div><strong>${esc(eleveNom(r.e))}</strong> ${agenceBadge(agenceDe(r.e))}
              <div class="small muted">${isExam(r.s.type) ? `${TYPES[r.s.type].label} à ${r.s.debut}${r.s.lieu ? ' · ' + esc(r.s.lieu) : ''} · RDV ${heureRdv(r.s)}` : `${TYPES[r.s.type].label}${modeDe(r.s, r.e.id) !== 'lecon' ? ' · ' + MODES_ELEVE[modeDe(r.s, r.e.id)] : ''} · ${horaireDe(r.s, r.e.id).debut}–${horaireDe(r.s, r.e.id).fin}`} · ${esc(moniteurNom(byId('moniteurs', r.s.moniteurId)))}</div></div>
            ${r.p.rappel ? `<span class="badge ok">✅ Prévenu le ${fmtDateHeure(r.p.rappel)}</span>` : '<span class="badge warn">À prévenir</span>'}
          </div>
          <details style="margin-top:8px"><summary class="small muted">Voir / modifier le message</summary>
            <textarea id="rp-msg-${i}" style="min-height:230px;margin-top:6px">${esc(texteRappel(r.s, r.e.id))}</textarea></details>
          <div class="row" style="margin-top:8px">
            <button class="btn small" data-action="rappelEnvoyer" data-via="sms" data-i="${i}" ${tel ? '' : 'disabled title="Pas de téléphone"'}>💬 SMS</button>
            <button class="btn small" data-action="rappelEnvoyer" data-via="wa" data-i="${i}" ${tel ? '' : 'disabled title="Pas de téléphone"'}>🟢 WhatsApp</button>
            <button class="btn small" data-action="rappelEnvoyer" data-via="mail" data-i="${i}" ${mail ? '' : 'disabled title="Pas d\'e-mail"'}>✉️ E-mail</button>
            <button class="btn small" data-action="rappelEnvoyer" data-via="copie" data-i="${i}">📋 Copier</button>
            ${r.p.rappel ? '' : `<button class="btn small ghost" data-action="rappelMarquer" data-i="${i}">Marquer comme prévenu</button>`}
          </div>
        </div>`;
      }).join('') : `<div class="empty">${rappelLecons() ? 'Aucune leçon ni examen ce jour-là.' : 'Aucun élève inscrit à un examen ce jour-là.'}</div>`}
      ${emailAutoPret() && list.some((r) => !r.p.rappel && r.e.email) ? `<div class="row" style="justify-content:flex-end;margin-bottom:8px"><button class="btn primary" data-action="rappelsTousMail">📧 Envoyer tous les rappels par e-mail (${list.filter((r) => !r.p.rappel && r.e.email).length})</button></div>` : ''}
      <p class="muted small">Le contenu (documents, équipement, message des leçons, heure du rendez-vous) se règle dans Paramètres → Rappels. Pour un examen précis, l'heure et le lieu du rendez-vous se changent dans l'examen.</p>`,
    foot: '<button class="btn" data-action="closeModal">Fermer</button>',
  });
  openRappels.list = list;
}

function viewParamRappels() {
  const r = rappelCfg();
  return `
    <div class="card">
      <h2>🔔 Rappels (leçons et examens)</h2>
      <p class="muted small">La veille, le planning affiche les élèves à prévenir. Le message reprend ces informations.</p>
      <form id="rappel-form" class="form-grid" onsubmit="return false">
        <label class="field full row" style="gap:8px;flex-direction:row;align-items:center"><input type="checkbox" name="lecons" style="width:auto" ${r.lecons !== false ? 'checked' : ''}> Rappeler aussi les <strong>leçons</strong> (pas seulement les examens)</label>
        <label class="field full"><span>Message ajouté aux rappels de leçon</span><textarea name="messageLecon">${esc(r.messageLecon ?? RAPPEL_DEFAUT.messageLecon)}</textarea></label>
        <label class="field"><span>Rendez-vous combien de minutes avant l'examen</span><input type="number" min="0" step="5" name="avanceMin" value="${r.avanceMin}"></label>
        <label class="field"><span>Lieu de rendez-vous par défaut</span><input name="lieuDefaut" value="${esc(r.lieuDefaut)}" placeholder="vide = adresse de l'auto-école de l'élève"></label>
        <label class="field full"><span>Documents à apporter — examen plateau (un par ligne)</span><textarea name="docP">${esc(r.documents.exam_plateau)}</textarea></label>
        <label class="field full"><span>Documents à apporter — examen circulation (un par ligne)</span><textarea name="docC">${esc(r.documents.exam_circulation)}</textarea></label>
        <label class="field full"><span>Équipement obligatoire (un par ligne)</span><textarea name="equipement">${esc(r.equipement)}</textarea></label>
      </form>
      <div class="row" style="margin-top:10px;justify-content:flex-end"><button class="btn primary" data-action="saveRappels">Enregistrer</button></div>
    </div>`;
}

const RAPPEL_ACTIONS = {
  openRappels(d) { openRappels(d.date || addDays(todayISO(), 1), d.seance || null); },
  rappelDate(d, el) { if (el.value) openRappels(el.value, null); },
  rappelsSeance() {
    readDraft();
    if (!draft.id) return toast('Placez d\'abord l\'examen sur le planning', true);
    openRappels(draft.date, draft.id);
  },
  async rappelEnvoyer(d) {
    const r = openRappels.list[+d.i];
    const msg = $(`#rp-msg-${d.i}`).value;
    const e = r.e;
    const ec = ecoleDe(agenceDe(e));
    try {
      if (d.via === 'sms') window.location.href = `sms:${encodeURIComponent(e.tel)}${/iPhone|iPad|Mac/i.test(navigator.userAgent) ? '&' : '?'}body=${encodeURIComponent(msg)}`;
      else if (d.via === 'wa') window.open(`https://wa.me/${phoneIntl(e.tel)}?text=${encodeURIComponent(msg)}`, '_blank');
      else if (d.via === 'mail' && emailAutoPret()) {
        toast('Envoi en cours…');
        const res = await envoyerEmailAuto({ to: e.email, subject: sujetRappel(r), text: msg, ecole: ec });
        const m = messageResultat(res, e.email);
        toast(m.txt, !m.ok);
        if (!m.ok) return;
      } else if (d.via === 'mail') window.location.href = `mailto:${encodeURIComponent(e.email)}?subject=${encodeURIComponent(sujetRappel(r))}&body=${encodeURIComponent(msg)}`;
      else if (d.via === 'copie') { await navigator.clipboard.writeText(msg); toast('Message copié'); }
    } catch (err) { return toast('Impossible : ' + err.message, true); }
    if (d.via !== 'copie') RAPPEL_ACTIONS.rappelMarquer(d);
  },
  async rappelsTousMail() {
    const list = openRappels.list.map((r, i) => ({ r, i })).filter(({ r }) => !r.p.rappel && r.e.email);
    if (!confirm(`Envoyer le rappel par e-mail à ${list.length} élève(s) ?`)) return;
    toast('Envoi en cours…');
    let ok = 0; let ko = 0;
    for (const { r, i } of list) {
      const ec = ecoleDe(agenceDe(r.e));
      const msg = $(`#rp-msg-${i}`)?.value || texteRappel(r.s, r.e.id);
      const res = await envoyerEmailAuto({ to: r.e.email, subject: sujetRappel(r), text: msg, ecole: ec });
      if (res.etat === 'erreur') { ko++; continue; }
      ok++;
      const s = byId('seances', r.s.id); const p = s && s.eleves.find((x) => x.eleveId === r.e.id);
      if (p) p.rappel = new Date().toISOString();
    }
    save(); render();
    openRappels(rappelsOuverts.date, rappelsOuverts.seanceId);
    toast(ko ? `${ok} envoyé(s), ${ko} en erreur` : `${ok} rappel(s) envoyé(s) par e-mail ✅`, !!ko);
  },
  rappelMarquer(d) {
    const r = openRappels.list[+d.i];
    const s = byId('seances', r.s.id);
    const p = s && s.eleves.find((x) => x.eleveId === r.e.id);
    if (!p) return;
    p.rappel = new Date().toISOString();
    save(); render();
    setTimeout(() => openRappels(rappelsOuverts.date, rappelsOuverts.seanceId), 300);
  },
  saveRappels() {
    const f = formData($('#rappel-form'));
    const r = rappelCfg();
    r.avanceMin = Math.max(0, parseInt(f.avanceMin, 10) || 0);
    r.lieuDefaut = f.lieuDefaut;
    r.documents = { exam_plateau: f.docP, exam_circulation: f.docC };
    r.equipement = f.equipement;
    r.lecons = $('#rappel-form [name=lecons]').checked;
    r.messageLecon = f.messageLecon;
    save(); render(); toast('Rappels enregistrés');
  },
};
