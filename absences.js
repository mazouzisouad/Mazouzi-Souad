/* =====================================================================
   ABSENCES DES MONITEURS — congés, maladie, formation, rendez-vous…
   Une absence couvre un ou plusieurs jours, en journée entière ou sur des heures.
   Elle apparaît grisée dans le planning et empêche d'y placer une leçon.
   Les absences sont rangées dans la fiche du moniteur (m.absences).
   ===================================================================== */
'use strict';

const MOTIFS_ABSENCE = { conge: '🌴 Congé', maladie: '🤒 Maladie', formation: '📚 Formation', rdv: '📅 Rendez-vous', autre: '⛔ Absent' };
const absencesDe = (m) => (m && Array.isArray(m.absences) ? m.absences : []);
const libelleAbsence = (a) => MOTIFS_ABSENCE[a.motif] || MOTIFS_ABSENCE.autre;
const finAbsence = (a) => a.au || a.du;

// Absences d'un moniteur un jour donné, en minutes depuis minuit
function absencesLe(monId, date) {
  return absencesDe(byId('moniteurs', monId))
    .filter((a) => a.du <= date && date <= finAbsence(a))
    .map((a) => ({ a, debut: a.journee ? 0 : toMin(a.debut), fin: a.journee ? 24 * 60 : toMin(a.fin) }));
}
// Absence qui chevauche un créneau (minutes), ou null
function absenceSur(monId, date, debut, fin) {
  return absencesLe(monId, date).find((x) => x.debut < fin && debut < x.fin) || null;
}
function periodeAbsence(a) {
  const jours = a.du === finAbsence(a) ? `le ${fmtDate(a.du)}` : `du ${fmtDate(a.du)} au ${fmtDate(finAbsence(a))}`;
  return a.journee ? jours : `${jours}, de ${a.debut} à ${a.fin}`;
}
function messageAbsence(monId, x) {
  const motif = libelleAbsence(x.a).replace(/^\S+\s/, '').toLowerCase();
  return `${moniteurNom(byId('moniteurs', monId))} est absent (${motif}${x.a.journee ? '' : ` de ${x.a.debut} à ${x.a.fin}`}) : choisissez un autre moniteur ou un autre horaire.`;
}
// Nombre de jours d'un mois (AAAA-MM) où le moniteur a une absence
function joursAbsence(m, mois) {
  const jours = new Set();
  for (const a of absencesDe(m)) {
    for (let d = a.du; d <= finAbsence(a); d = addDays(d, 1)) { if (d.startsWith(mois)) jours.add(d); if (jours.size > 400) break; }
  }
  return jours.size;
}

// Bandes grisées dans une colonne du planning
function blocsAbsence(c, hMin, hMax) {
  return absencesLe(c.mon, c.date).map(({ a, debut, fin }) => {
    const d = Math.max(debut, hMin), f = Math.min(fin, hMax);
    if (f <= d) return '';
    const action = estMoniteur() ? '' : `data-action="editAbsence" data-mon="${c.mon}" data-id="${a.id}"`;
    return `<div class="ag-absence ${a.motif || 'autre'}" style="top:${((d - hMin) / 30) * ROW_H}px;height:${((f - d) / 30) * ROW_H}px" ${action} title="${esc(libelleAbsence(a) + (a.note ? ' · ' + a.note : ''))}">
      <span>${esc(libelleAbsence(a))}${a.note ? `<small> · ${esc(a.note)}</small>` : ''}</span></div>`;
  }).join('');
}

// Leçons du moniteur pendant une absence
function leconsPendant(monId, abs) {
  return DB.seances.filter((s) => {
    if (s.moniteurId !== monId || s.date < abs.du || s.date > finAbsence(abs)) return false;
    if (abs.journee) return true;
    return toMin(s.debut) < toMin(abs.fin) && toMin(abs.debut) < toMin(s.fin);
  }).sort((x, y) => (x.date + x.debut).localeCompare(y.date + y.debut));
}

function openAbsences(monId, editId) {
  const m = byId('moniteurs', monId); if (!m) return;
  const a = editId ? absencesDe(m).find((x) => x.id === editId) : null;
  const v = a || { du: UI.date || todayISO(), au: '', journee: true, debut: '08:00', fin: '12:00', motif: 'conge', note: '' };
  const depuis = addDays(todayISO(), -60);
  const liste = absencesDe(m).filter((x) => finAbsence(x) >= depuis).sort((x, y) => x.du.localeCompare(y.du));
  openModal({
    title: `🌴 Absences — ${esc(moniteurNom(m))}`,
    body: `
      ${liste.length ? `<div class="abs-liste">${liste.map((x) => `<div class="chip-row ${x.id === editId ? 'on' : ''}">
          <span class="name">${esc(libelleAbsence(x))} <span class="muted small">${esc(periodeAbsence(x))}${x.note ? ' · ' + esc(x.note) : ''}</span></span>
          ${x.id === editId ? '<span class="badge info">en cours de modification</span>' : `<button class="btn small" data-action="editAbsence" data-mon="${monId}" data-id="${x.id}">Modifier</button>`}</div>`).join('')}</div>`
        : '<p class="muted small">Aucune absence prévue pour ce moniteur.</p>'}
      <h3 style="margin:14px 0 6px">${a ? "Modifier l'absence" : 'Ajouter une absence'}</h3>
      <form id="abs-form" class="form-grid" onsubmit="return false">
        <label class="field"><span>Motif</span><select name="motif">${Object.entries(MOTIFS_ABSENCE).map(([k, l]) => `<option value="${k}" ${v.motif === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label class="field"><span>Précision (facultatif)</span><input name="note" value="${esc(v.note || '')}" placeholder="ex : vacances, dentiste…"></label>
        <label class="field"><span>Du</span><input type="date" name="du" value="${v.du}" required data-on-change="absDu"></label>
        <label class="field"><span>Au (inclus)</span><input type="date" name="au" value="${finAbsence(v)}"></label>
        <label class="field full abs-jour"><input type="checkbox" name="journee" ${v.journee ? 'checked' : ''} data-on-change="absJournee"> Toute la journée</label>
        <label class="field abs-h" ${v.journee ? 'hidden' : ''}><span>De</span><input type="time" step="900" name="debut" value="${v.debut || '08:00'}"></label>
        <label class="field abs-h" ${v.journee ? 'hidden' : ''}><span>À</span><input type="time" step="900" name="fin" value="${v.fin || '12:00'}"></label>
      </form>`,
    foot: `${a ? `<div class="left"><button class="btn danger" data-action="supprAbsence" data-mon="${monId}" data-id="${a.id}">Supprimer</button></div>` : ''}
      <button class="btn" data-action="closeModal">Fermer</button>
      <button class="btn primary" data-action="saveAbsence" data-mon="${monId}" data-id="${a ? a.id : ''}">Enregistrer</button>`,
  });
}

const ABSENCE_ACTIONS = {
  absencesMoniteur(d) { openAbsences(d.id); },
  editAbsence(d) { if (!estMoniteur()) openAbsences(d.mon, d.id); },
  absDu(d, el) { const au = $('#abs-form [name=au]'); if (!au.value || au.value < el.value) au.value = el.value; },
  absJournee(d, el) { $$('#abs-form .abs-h').forEach((x) => { x.hidden = el.checked; }); },
  saveAbsence(d) {
    const m = byId('moniteurs', d.mon); if (!m) return;
    const f = formData($('#abs-form'));
    const journee = $('#abs-form [name=journee]').checked;
    if (!f.du) return toast('Indiquez le premier jour de l\'absence.', true);
    const au = f.au && f.au >= f.du ? f.au : f.du;
    if (!journee && !(f.debut && f.fin && f.debut < f.fin)) return toast("L'heure de fin doit être après l'heure de début.", true);
    const abs = { id: d.id || uid(), motif: f.motif || 'autre', note: f.note || '', du: f.du, au, journee };
    if (!journee) { abs.debut = f.debut; abs.fin = f.fin; }
    const lecons = leconsPendant(m.id, abs);
    if (lecons.length && !confirm(`Attention : ${lecons.length} leçon${lecons.length > 1 ? 's' : ''} de ${moniteurNom(m)} ${lecons.length > 1 ? 'sont prévues' : 'est prévue'} pendant cette absence :\n${lecons.slice(0, 6).map((s) => `- ${fmtDate(s.date)} ${s.debut}-${s.fin} (${TYPES[s.type].short})`).join('\n')}${lecons.length > 6 ? '\n…' : ''}\n\nEnregistrer quand même ? Pensez à les déplacer ou à changer de moniteur.`)) return;
    m.absences = absencesDe(m).filter((x) => x.id !== abs.id).concat(abs);
    save(); closeModal(); render(); toast(`Absence enregistrée : ${moniteurNom(m)}, ${periodeAbsence(abs)}`);
  },
  supprAbsence(d) {
    const m = byId('moniteurs', d.mon); if (!m) return;
    if (!confirm('Supprimer cette absence ?')) return;
    m.absences = absencesDe(m).filter((x) => x.id !== d.id);
    save(); openAbsences(m.id); render(); toast('Absence supprimée');
  },
};
