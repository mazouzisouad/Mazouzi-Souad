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
};

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

function texteRappel(s, eleveId) {
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

// Élèves à prévenir pour les examens d'une date
function rappelsDu(dateISO) {
  const out = [];
  for (const s of DB.seances.filter((x) => isExam(x.type) && x.date === dateISO).sort((a, b) => a.debut.localeCompare(b.debut))) {
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
  return reste
    ? `<div class="alert warn row between" style="margin-bottom:10px"><span>🔔 <strong>Examens demain : ${reste} élève${reste > 1 ? 's' : ''} à prévenir</strong> (heure et lieu du rendez-vous, moniteur, documents, équipement).</span>
        <button class="btn primary" data-action="openRappels" data-date="${demain}">Prévenir les élèves</button></div>`
    : `<div class="alert info row between" style="margin-bottom:10px"><span>✅ Examens demain : tous les élèves ont été prévenus.</span>
        <button class="btn small" data-action="openRappels" data-date="${demain}">Voir</button></div>`;
}

let rappelsOuverts = { date: null, seanceId: null };

function openRappels(date, seanceId) {
  rappelsOuverts = { date, seanceId };
  let list = rappelsDu(date);
  if (seanceId) list = list.filter((r) => r.s.id === seanceId);
  const jour = parseISO(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  openModal({
    title: `🔔 Rappels d'examen — ${esc(jour)}`,
    wide: true,
    body: `
      <div class="row" style="margin-bottom:10px"><span class="small">Examens du</span>
        <input type="date" value="${date}" data-on-change="rappelDate" style="width:auto"></div>
      ${list.length ? list.map((r, i) => {
        const tel = r.e.tel || ''; const mail = r.e.email || '';
        return `<div class="card rappel ${r.p.rappel ? 'envoye' : ''}" style="margin-bottom:10px">
          <div class="row between">
            <div><strong>${esc(eleveNom(r.e))}</strong> ${agenceBadge(agenceDe(r.e))}
              <div class="small muted">${TYPES[r.s.type].label} à ${r.s.debut}${r.s.lieu ? ' · ' + esc(r.s.lieu) : ''} · RDV ${heureRdv(r.s)} · ${esc(moniteurNom(byId('moniteurs', r.s.moniteurId)))}</div></div>
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
      }).join('') : '<div class="empty">Aucun élève inscrit à un examen ce jour-là.</div>'}
      <p class="muted small">Le contenu (documents, équipement, heure du rendez-vous) se règle dans Paramètres → Rappels d'examen. Pour un examen précis, l'heure et le lieu du rendez-vous se changent dans l'examen.</p>`,
    foot: '<button class="btn" data-action="closeModal">Fermer</button>',
  });
  openRappels.list = list;
}

function viewParamRappels() {
  const r = rappelCfg();
  return `
    <div class="card">
      <h2>🔔 Rappels d'examen</h2>
      <p class="muted small">La veille d'un examen, le planning affiche les élèves à prévenir. Le message reprend ces informations.</p>
      <form id="rappel-form" class="form-grid" onsubmit="return false">
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
      else if (d.via === 'mail') window.location.href = `mailto:${encodeURIComponent(e.email)}?subject=${encodeURIComponent(`Rappel : votre examen moto ${r.s.type === 'exam_plateau' ? 'plateau' : 'circulation'} du ${fmtDate(r.s.date)} - ${ec.nom}`)}&body=${encodeURIComponent(msg)}`;
      else if (d.via === 'copie') { await navigator.clipboard.writeText(msg); toast('Message copié'); }
    } catch (err) { return toast('Impossible : ' + err.message, true); }
    if (d.via !== 'copie') RAPPEL_ACTIONS.rappelMarquer(d);
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
    save(); render(); toast('Rappels enregistrés');
  },
};
