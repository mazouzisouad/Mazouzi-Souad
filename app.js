/* =====================================================================
   Moto Planning — gestion moto pour auto-écoles
   Planning multi-élèves (plateau / circulation), fiches élèves,
   facturation, paiements, carte de rendez-vous et factures en PDF.
   Données enregistrées localement dans le navigateur (localStorage).
   ===================================================================== */
'use strict';

const STORAGE_KEY = 'motoplanning_v1';

const TYPES = {
  plateau: { label: 'Plateau', short: 'Plateau' },
  circulation: { label: 'Circulation', short: 'Circu' },
};
const STATUTS_PRESENCE = {
  prevu: 'Prévu',
  present: 'Présent',
  absent: 'Absent (dû)',
  excuse: 'Excusé',
};
const STATUTS_ELEVE = {
  en_cours: 'En formation',
  examen: 'En examen',
  obtenu: 'Permis obtenu',
  pause: 'En pause',
  abandon: 'Abandon',
};
const FORMATIONS = ['A2', 'A', 'Passerelle A2 → A', 'Formation 125 cm³ (7h)', 'AM (cyclo)', 'Autre'];
const MODES_PAIEMENT = ['CB', 'Espèces', 'Chèque', 'Virement', 'CPF', 'France Travail', 'Autre'];

/* ---------------------------------------------------------------------
   Utilitaires
   --------------------------------------------------------------------- */
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const eur = (n) => round2(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
// Pour le PDF : espace insécable remplacé (les polices PDF standards ne l'affichent pas toujours)
const eurPdf = (n) => round2(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/[  ]/g, ' ') + ' EUR';
const pad = (n) => String(n).padStart(2, '0');

function toISODate(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function parseISO(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function todayISO() { return toISODate(new Date()); }
function addDays(iso, n) { const d = parseISO(iso); d.setDate(d.getDate() + n); return toISODate(d); }
function mondayOf(iso) { const d = parseISO(iso); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return toISODate(d); }
function fmtDate(iso) { if (!iso) return ''; const d = parseISO(iso); return d.toLocaleDateString('fr-FR'); }
function fmtDateLong(iso) { const d = parseISO(iso); return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
function fmtDayHead(iso) { const d = parseISO(iso); return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }); }
function toMin(hhmm) { const [h, m] = (hhmm || '0:0').split(':').map(Number); return h * 60 + m; }
function durH(s) { return Math.max(0, (toMin(s.fin) - toMin(s.debut)) / 60); }
function fmtH(h) { const hh = Math.floor(h); const mm = Math.round((h - hh) * 60); return mm ? `${hh}h${pad(mm)}` : `${hh}h`; }
function overlaps(a, b) { return a.date === b.date && toMin(a.debut) < toMin(b.fin) && toMin(b.debut) < toMin(a.fin); }

function toast(msg, bad = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast' + (bad ? ' bad' : '');
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; }, 3000);
}

/* ---------------------------------------------------------------------
   Données
   --------------------------------------------------------------------- */
function defaultState() {
  return {
    version: 1,
    settings: {
      capacite: { circulation: 3, plateau: 5 },
      tarifHeure: { plateau: 45, circulation: 50 },
      heureDebut: '08:00',
      dureeDefaut: { plateau: 120, circulation: 120 },
      conditionsRdv: "Toute leçon non décommandée au moins 48 heures à l'avance sera due, sauf motif légitime justifié.",
      mentionsFacture: "Paiement à réception. En cas de retard de paiement, indemnité forfaitaire pour frais de recouvrement : 40 €.",
    },
    ecoles: [
      { id: uid(), nom: 'Auto-école 1', adresse: '', cp: '', ville: '', tel: '', email: '', siret: '', agrement: '', prefixe: 'AE1', compteur: 0, tva: 20, lieuPlateau: '' },
    ],
    moniteurs: [
      { id: uid(), prenom: 'Moniteur', nom: '1', tel: '', couleur: '#f97316' },
      { id: uid(), prenom: 'Moniteur', nom: '2', tel: '', couleur: '#0ea5e9' },
    ],
    prestations: [
      { id: uid(), libelle: "Frais d'inscription / dossier", prix: 80 },
      { id: uid(), libelle: 'Accompagnement examen plateau', prix: 90 },
      { id: uid(), libelle: 'Accompagnement examen circulation', prix: 120 },
      { id: uid(), libelle: 'Forfait 20h A2', prix: 950 },
      { id: uid(), libelle: 'Formation passerelle A2 → A (7h)', prix: 350 },
      { id: uid(), libelle: 'Location équipement', prix: 15 },
    ],
    eleves: [],
    seances: [],
    factures: [],
    paiements: [],
  };
}

let DB = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch (e) { console.error(e); }
  return defaultState();
}
function migrate(db) {
  const def = defaultState();
  db.settings = Object.assign({}, def.settings, db.settings || {});
  db.settings.capacite = Object.assign({}, def.settings.capacite, db.settings.capacite || {});
  db.settings.tarifHeure = Object.assign({}, def.settings.tarifHeure, db.settings.tarifHeure || {});
  db.settings.dureeDefaut = Object.assign({}, def.settings.dureeDefaut, db.settings.dureeDefaut || {});
  for (const k of ['ecoles', 'moniteurs', 'prestations', 'eleves', 'seances', 'factures', 'paiements']) db[k] = db[k] || [];
  return db;
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(DB)); }
  catch (e) { toast("Impossible d'enregistrer : " + e.message, true); }
}

const byId = (list, id) => DB[list].find((x) => x.id === id);
const eleveNom = (e) => (e ? `${e.prenom} ${e.nom}`.trim() : '—');
const moniteurNom = (m) => (m ? `${m.prenom} ${m.nom}`.trim() : '—');

function factureTotaux(f) {
  const ttc = round2(f.lignes.reduce((s, l) => s + (Number(l.qte) || 0) * (Number(l.pu) || 0), 0));
  const taux = Number(f.tva) || 0;
  const ht = round2(ttc / (1 + taux / 100));
  return { ttc, ht, tva: round2(ttc - ht), taux };
}
function facturePaye(f) { return round2(DB.paiements.filter((p) => p.factureId === f.id).reduce((s, p) => s + Number(p.montant || 0), 0)); }
function factureStatut(f) {
  const { ttc } = factureTotaux(f);
  const p = facturePaye(f);
  if (p >= ttc - 0.005) return { key: 'ok', label: 'Payée' };
  if (p > 0) return { key: 'warn', label: 'Partielle' };
  return { key: 'bad', label: 'Impayée' };
}
function eleveFinances(eid) {
  const facture = round2(DB.factures.filter((f) => f.eleveId === eid).reduce((s, f) => s + factureTotaux(f).ttc, 0));
  const paye = round2(DB.paiements.filter((p) => p.eleveId === eid).reduce((s, p) => s + Number(p.montant || 0), 0));
  return { facture, paye, solde: round2(facture - paye) };
}
function eleveSeances(eid) {
  return DB.seances
    .filter((s) => s.eleves.some((p) => p.eleveId === eid))
    .sort((a, b) => (a.date + a.debut).localeCompare(b.date + b.debut));
}
function eleveHeures(eid) {
  const res = { plateau: 0, circulation: 0, aVenir: 0 };
  const now = todayISO();
  for (const s of eleveSeances(eid)) {
    const p = s.eleves.find((x) => x.eleveId === eid);
    if (p.statut === 'present') res[s.type] += durH(s);
    else if (p.statut === 'prevu' && s.date >= now) res.aVenir += durH(s);
  }
  return res;
}
// Participations facturables pas encore facturées
function nonFactures(eid) {
  const out = [];
  for (const s of eleveSeances(eid)) {
    const p = s.eleves.find((x) => x.eleveId === eid);
    if (!p.factureId && p.statut !== 'excuse') out.push({ seance: s, part: p });
  }
  return out;
}

/* ---------------------------------------------------------------------
   Navigation
   --------------------------------------------------------------------- */
const UI = {
  view: 'planning',
  weekStart: mondayOf(todayISO()),
  filtreMoniteur: '',
  filtreEcole: '',
  rechercheEleve: '',
  filtreStatutEleve: 'actifs',
  eleveOuvert: null,
  ongletPaiements: 'factures',
};

function go(view, opts = {}) {
  UI.view = view;
  Object.assign(UI, opts);
  $$('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  render();
  window.scrollTo(0, 0);
}
$('#tabs').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-view]');
  if (b) go(b.dataset.view, b.dataset.view === 'eleves' ? { eleveOuvert: null } : {});
});

function render() {
  const v = $('#view');
  if (UI.view === 'planning') v.innerHTML = viewPlanning();
  else if (UI.view === 'eleves') v.innerHTML = UI.eleveOuvert ? viewFiche(UI.eleveOuvert) : viewEleves();
  else if (UI.view === 'paiements') v.innerHTML = viewPaiements();
  else if (UI.view === 'parametres') v.innerHTML = viewParametres();
}

/* Actions déclaratives : data-action="nom" data-id="..." */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.action];
  if (fn) { e.preventDefault(); fn(el.dataset, el, e); }
});
document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-on-input]');
  if (el && ACTIONS[el.dataset.onInput]) ACTIONS[el.dataset.onInput](el.dataset, el, e);
});
document.addEventListener('change', (e) => {
  const el = e.target.closest('[data-on-change]');
  if (el && ACTIONS[el.dataset.onChange]) ACTIONS[el.dataset.onChange](el.dataset, el, e);
});

/* ---------------------------------------------------------------------
   Vue PLANNING
   --------------------------------------------------------------------- */
function viewPlanning() {
  const days = Array.from({ length: 7 }, (_, i) => addDays(UI.weekStart, i));
  const end = days[6];
  const today = todayISO();
  const cap = DB.settings.capacite;
  const seances = DB.seances
    .filter((s) => s.date >= UI.weekStart && s.date <= end)
    .filter((s) => !UI.filtreMoniteur || s.moniteurId === UI.filtreMoniteur)
    .sort((a, b) => (a.date + a.debut).localeCompare(b.date + b.debut));

  const nbEleves = seances.reduce((n, s) => n + s.eleves.length, 0);
  const heuresMon = {};
  for (const s of seances) heuresMon[s.moniteurId] = (heuresMon[s.moniteurId] || 0) + durH(s);

  const d0 = parseISO(UI.weekStart);
  const titre = `Semaine du ${d0.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au ${parseISO(end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  return `
  <div class="toolbar">
    <button class="btn" data-action="weekPrev" aria-label="Semaine précédente">◀</button>
    <button class="btn" data-action="weekToday">Aujourd'hui</button>
    <button class="btn" data-action="weekNext" aria-label="Semaine suivante">▶</button>
    <input type="date" value="${UI.weekStart}" data-on-change="weekPick" style="width:auto">
    <h1 style="margin-left:6px">${esc(titre)}</h1>
    <div class="spacer"></div>
    <select data-on-change="filtreMoniteur" style="width:auto">
      <option value="">Tous les moniteurs</option>
      ${DB.moniteurs.map((m) => `<option value="${m.id}" ${UI.filtreMoniteur === m.id ? 'selected' : ''}>${esc(moniteurNom(m))}</option>`).join('')}
    </select>
    <button class="btn primary" data-action="newSeance">+ Nouvelle séance</button>
  </div>
  <div class="row between" style="margin-bottom:10px">
    <div class="legend">
      <span><span class="badge plateau">Plateau</span> max ${cap.plateau} élèves</span>
      <span><span class="badge circulation">Circulation</span> max ${cap.circulation} élèves</span>
      ${DB.moniteurs.map((m) => `<span><span class="dot" style="background:${esc(m.couleur)}"></span>${esc(moniteurNom(m))} : ${fmtH(heuresMon[m.id] || 0)}</span>`).join('')}
    </div>
    <div class="muted small">${seances.length} séance(s) · ${nbEleves} place(s) réservée(s)</div>
  </div>
  <div class="week">
    ${days.map((iso) => {
      const ds = seances.filter((s) => s.date === iso);
      return `
      <div class="day ${iso === today ? 'today' : ''} ${iso < today ? 'past' : ''}">
        <div class="day-head">
          <span class="d">${esc(fmtDayHead(iso))}</span>
          <button class="btn small ghost" data-action="newSeance" data-date="${iso}" title="Ajouter une séance">＋</button>
        </div>
        <div class="day-body">
          ${ds.length ? ds.map(seanceCard).join('') : '<div class="muted small" style="padding:6px">—</div>'}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function seanceCard(s) {
  const cap = DB.settings.capacite[s.type];
  const n = s.eleves.length;
  const m = byId('moniteurs', s.moniteurId);
  const fillCls = n >= cap ? 'full' : n < cap ? 'free' : '';
  const names = s.eleves.map((p) => {
    const e = byId('eleves', p.eleveId);
    const cls = p.statut === 'absent' || p.statut === 'excuse' ? 'abs' : '';
    const ecole = e ? byId('ecoles', e.ecoleId) : null;
    return `<span class="${cls}">${esc(eleveNom(e))}${ecole && DB.ecoles.length > 1 ? ` <span class="muted">(${esc(ecole.prefixe || ecole.nom)})</span>` : ''}</span>`;
  }).join(', ');
  return `
  <div class="seance ${s.type}" data-action="editSeance" data-id="${s.id}">
    <div class="top">
      <span class="h">${s.debut}–${s.fin}</span>
      <span class="fill ${fillCls}">${n}/${cap}</span>
    </div>
    <div class="row" style="gap:4px;margin-top:2px">
      <span class="badge ${s.type}">${TYPES[s.type].short}</span>
      <span class="mon"><span class="dot" style="background:${esc(m?.couleur || '#999')}"></span>${esc(moniteurNom(m))}</span>
    </div>
    <div class="names">${names || '<span class="muted">Aucun élève</span>'}</div>
    ${s.lieu ? `<div class="muted small">📍 ${esc(s.lieu)}</div>` : ''}
  </div>`;
}

/* ---------------------------------------------------------------------
   Modal générique
   --------------------------------------------------------------------- */
function openModal({ title, body, foot = '', wide = false, onMount }) {
  const root = $('#modal-root');
  root.innerHTML = `
  <div class="modal-backdrop">
    <div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">
      <div class="modal-head"><h2>${title}</h2><button class="btn ghost" data-action="closeModal" aria-label="Fermer">✕</button></div>
      <div class="modal-body">${body}</div>
      ${foot ? `<div class="modal-foot">${foot}</div>` : ''}
    </div>
  </div>`;
  const backdrop = $('.modal-backdrop', root);
  backdrop.addEventListener('mousedown', (e) => { if (e.target === backdrop) closeModal(); });
  if (onMount) onMount($('.modal', root));
}
function closeModal() { $('#modal-root').innerHTML = ''; }
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#modal-root').innerHTML) closeModal(); });

function formData(form) {
  const o = {};
  for (const [k, v] of new FormData(form).entries()) o[k] = typeof v === 'string' ? v.trim() : v;
  return o;
}

/* ---------------------------------------------------------------------
   Séances : création / édition
   --------------------------------------------------------------------- */
let draftSeance = null;

function openSeance(seance) {
  const isNew = !seance.id;
  draftSeance = JSON.parse(JSON.stringify(seance));
  openModal({
    title: isNew ? 'Nouvelle séance' : 'Modifier la séance',
    wide: true,
    body: `
      <form id="seance-form" class="form-grid" onsubmit="return false">
        <label class="field"><span>Type</span>
          <select name="type" data-on-change="seanceType">
            ${Object.entries(TYPES).map(([k, t]) => `<option value="${k}" ${draftSeance.type === k ? 'selected' : ''}>${t.label} (max ${DB.settings.capacite[k]})</option>`).join('')}
          </select></label>
        <label class="field"><span>Date</span><input type="date" name="date" value="${draftSeance.date}" required></label>
        <label class="field"><span>Début</span><input type="time" name="debut" value="${draftSeance.debut}" step="900" required data-on-change="seanceDebut"></label>
        <label class="field"><span>Fin</span><input type="time" name="fin" value="${draftSeance.fin}" step="900" required></label>
        <label class="field"><span>Moniteur</span>
          <select name="moniteurId">
            ${DB.moniteurs.map((m) => `<option value="${m.id}" ${draftSeance.moniteurId === m.id ? 'selected' : ''}>${esc(moniteurNom(m))}</option>`).join('')}
          </select></label>
        <label class="field"><span>Lieu / RDV</span><input name="lieu" value="${esc(draftSeance.lieu || '')}" placeholder="Ex : piste de ..., agence ..." list="lieux"></label>
        <datalist id="lieux">${[...new Set([...DB.seances.map((s) => s.lieu), ...DB.ecoles.map((e) => e.lieuPlateau)].filter(Boolean))].map((l) => `<option value="${esc(l)}">`).join('')}</datalist>
        <label class="field full"><span>Notes</span><input name="notes" value="${esc(draftSeance.notes || '')}"></label>
      </form>
      <hr>
      <div class="row between">
        <h3 style="margin:0">Élèves <span id="cap-info" class="fill"></span></h3>
        <div class="row" style="flex:1;justify-content:flex-end;min-width:260px">
          <select id="add-eleve" style="max-width:340px"></select>
          <button class="btn" data-action="seanceAddEleve">Ajouter</button>
          <button class="btn small" data-action="quickEleve" title="Créer un nouvel élève">+ Nouvel élève</button>
        </div>
      </div>
      <div id="participants" class="participants"></div>
      <div id="seance-errors" style="margin-top:10px"></div>`,
    foot: `
      <div class="left">
        ${!isNew ? `<button class="btn danger" data-action="deleteSeance">Supprimer</button>
        <button class="btn" data-action="duplicateSeance">Dupliquer (+7 jours)</button>` : ''}
      </div>
      <button class="btn" data-action="closeModal">Annuler</button>
      <button class="btn primary" data-action="saveSeance">Enregistrer</button>`,
    onMount: () => {
      renderParticipants();
      $('#seance-form').addEventListener('change', () => validateSeanceLive());
    },
  });
}

function readSeanceForm() {
  const f = formData($('#seance-form'));
  Object.assign(draftSeance, f);
}

function renderParticipants() {
  const cap = DB.settings.capacite[draftSeance.type];
  const n = draftSeance.eleves.length;
  const info = $('#cap-info');
  info.textContent = `${n}/${cap}`;
  info.className = 'fill ' + (n > cap ? 'full' : n === cap ? 'full' : 'free');

  $('#participants').innerHTML = draftSeance.eleves.length ? draftSeance.eleves.map((p, i) => {
    const e = byId('eleves', p.eleveId);
    const ecole = e && byId('ecoles', e.ecoleId);
    return `
    <div class="participant">
      <span class="name">${esc(eleveNom(e))} <span class="muted small">${esc(ecole?.nom || '')}${e?.formation ? ' · ' + esc(e.formation) : ''}</span></span>
      ${p.factureId ? '<span class="badge ok" title="Déjà facturé">Facturé</span>' : ''}
      <select data-on-change="seancePartStatut" data-i="${i}">
        ${Object.entries(STATUTS_PRESENCE).map(([k, l]) => `<option value="${k}" ${p.statut === k ? 'selected' : ''}>${l}</option>`).join('')}
      </select>
      <button class="btn small danger" data-action="seanceRemoveEleve" data-i="${i}" title="Retirer">✕</button>
    </div>`;
  }).join('') : '<div class="muted small">Aucun élève inscrit pour l\'instant.</div>';

  const inscrits = new Set(draftSeance.eleves.map((p) => p.eleveId));
  const dispo = DB.eleves
    .filter((e) => !inscrits.has(e.id) && !['obtenu', 'abandon'].includes(e.statut))
    .sort((a, b) => eleveNom(a).localeCompare(eleveNom(b)));
  $('#add-eleve').innerHTML = `<option value="">— Choisir un élève —</option>` + dispo.map((e) => {
    const ec = byId('ecoles', e.ecoleId);
    return `<option value="${e.id}">${esc(e.nom.toUpperCase())} ${esc(e.prenom)} — ${esc(ec?.nom || '')}</option>`;
  }).join('');
  $('#add-eleve').disabled = n >= cap;
  validateSeanceLive();
}

function seanceConflicts(s) {
  const errors = [];
  const warns = [];
  const cap = DB.settings.capacite[s.type];
  if (!s.date) errors.push('Choisissez une date.');
  if (toMin(s.fin) <= toMin(s.debut)) errors.push("L'heure de fin doit être après l'heure de début.");
  if (s.eleves.length > cap) errors.push(`Trop d'élèves : ${s.eleves.length} pour ${cap} places maximum en ${TYPES[s.type].label.toLowerCase()}.`);
  const others = DB.seances.filter((o) => o.id !== s.id && overlaps(o, s));
  for (const o of others) {
    if (o.moniteurId === s.moniteurId) {
      errors.push(`${moniteurNom(byId('moniteurs', s.moniteurId))} a déjà une séance ${TYPES[o.type].label.toLowerCase()} de ${o.debut} à ${o.fin} ce jour-là.`);
    }
    for (const p of s.eleves) {
      if (o.eleves.some((x) => x.eleveId === p.eleveId)) {
        errors.push(`${eleveNom(byId('eleves', p.eleveId))} est déjà inscrit(e) sur une autre séance de ${o.debut} à ${o.fin}.`);
      }
    }
  }
  if (s.eleves.length === 0) warns.push('Aucun élève inscrit (la séance sera enregistrée comme créneau libre).');
  return { errors, warns };
}

function validateSeanceLive() {
  readSeanceForm();
  const { errors, warns } = seanceConflicts(draftSeance);
  $('#seance-errors').innerHTML =
    errors.map((e) => `<div class="alert bad">⛔ ${esc(e)}</div>`).join('') +
    warns.map((e) => `<div class="alert warn">${esc(e)}</div>`).join('');
}

function defaultFin(debut, type) {
  const m = toMin(debut) + (DB.settings.dureeDefaut[type] || 120);
  return `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
}

/* ---------------------------------------------------------------------
   Vue ÉLÈVES
   --------------------------------------------------------------------- */
function viewEleves() {
  const q = UI.rechercheEleve.toLowerCase();
  const list = DB.eleves
    .filter((e) => !UI.filtreEcole || e.ecoleId === UI.filtreEcole)
    .filter((e) => {
      if (UI.filtreStatutEleve === 'actifs') return ['en_cours', 'examen', 'pause'].includes(e.statut);
      if (UI.filtreStatutEleve) return e.statut === UI.filtreStatutEleve;
      return true;
    })
    .filter((e) => !q || `${e.nom} ${e.prenom} ${e.tel} ${e.email} ${e.neph}`.toLowerCase().includes(q))
    .sort((a, b) => eleveNom(a).localeCompare(eleveNom(b)));

  return `
  <div class="toolbar">
    <h1>Élèves</h1>
    <div class="spacer"></div>
    <input type="search" placeholder="Rechercher (nom, tél, NEPH…)" value="${esc(UI.rechercheEleve)}" data-on-input="rechercheEleve" style="max-width:260px" id="search-eleve">
    <select data-on-change="filtreEcole" style="width:auto">
      <option value="">Toutes les auto-écoles</option>
      ${DB.ecoles.map((e) => `<option value="${e.id}" ${UI.filtreEcole === e.id ? 'selected' : ''}>${esc(e.nom)}</option>`).join('')}
    </select>
    <select data-on-change="filtreStatutEleve" style="width:auto">
      <option value="actifs" ${UI.filtreStatutEleve === 'actifs' ? 'selected' : ''}>Élèves actifs</option>
      <option value="" ${UI.filtreStatutEleve === '' ? 'selected' : ''}>Tous</option>
      ${Object.entries(STATUTS_ELEVE).map(([k, l]) => `<option value="${k}" ${UI.filtreStatutEleve === k ? 'selected' : ''}>${l}</option>`).join('')}
    </select>
    <button class="btn primary" data-action="newEleve">+ Nouvel élève</button>
  </div>
  ${list.length ? `
  <div class="table-wrap"><table>
    <thead><tr><th>Élève</th><th>Auto-école</th><th>Formation</th><th>Téléphone</th><th class="num">Plateau</th><th class="num">Circu</th><th>Prochain RDV</th><th class="num">Solde</th><th>Statut</th></tr></thead>
    <tbody>
    ${list.map((e) => {
      const h = eleveHeures(e.id);
      const fin = eleveFinances(e.id);
      const next = eleveSeances(e.id).find((s) => s.date >= todayISO() && s.eleves.find((p) => p.eleveId === e.id).statut === 'prevu');
      return `<tr class="clickable" data-action="openFiche" data-id="${e.id}">
        <td><strong>${esc(e.nom.toUpperCase())}</strong> ${esc(e.prenom)}</td>
        <td>${esc(byId('ecoles', e.ecoleId)?.nom || '—')}</td>
        <td>${esc(e.formation || '')}</td>
        <td>${esc(e.tel || '')}</td>
        <td class="num">${fmtH(h.plateau)}</td>
        <td class="num">${fmtH(h.circulation)}</td>
        <td>${next ? `${fmtDate(next.date)} ${next.debut} <span class="badge ${next.type}">${TYPES[next.type].short}</span>` : '<span class="muted">—</span>'}</td>
        <td class="num">${fin.solde > 0 ? `<span class="badge bad">${eur(fin.solde)} dû</span>` : fin.solde < 0 ? `<span class="badge ok">${eur(-fin.solde)} crédit</span>` : '<span class="muted">0</span>'}</td>
        <td><span class="badge">${esc(STATUTS_ELEVE[e.statut] || '')}</span></td>
      </tr>`;
    }).join('')}
    </tbody></table></div>` : `<div class="card empty">Aucun élève${q || UI.filtreEcole ? ' ne correspond à la recherche' : ''}. <br><br><button class="btn primary" data-action="newEleve">+ Ajouter un élève</button></div>`}`;
}

function viewFiche(id) {
  const e = byId('eleves', id);
  if (!e) { UI.eleveOuvert = null; return viewEleves(); }
  const ecole = byId('ecoles', e.ecoleId);
  const h = eleveHeures(id);
  const fin = eleveFinances(id);
  const seances = eleveSeances(id);
  const factures = DB.factures.filter((f) => f.eleveId === id).sort((a, b) => b.date.localeCompare(a.date));
  const paiements = DB.paiements.filter((p) => p.eleveId === id).sort((a, b) => b.date.localeCompare(a.date));
  const aFacturer = nonFactures(id).filter((x) => x.part.statut !== 'prevu').length;
  const today = todayISO();

  return `
  <div class="toolbar">
    <button class="btn" data-action="backEleves">◀ Élèves</button>
    <div class="spacer"></div>
    <button class="btn" data-action="carteRdv" data-id="${id}">📇 Carte de RDV</button>
    <button class="btn" data-action="newFacture" data-eleve="${id}">🧾 Facturer</button>
    <button class="btn" data-action="newPaiement" data-eleve="${id}">💶 Encaisser</button>
    <button class="btn primary" data-action="newSeance" data-eleve="${id}">+ Réserver une séance</button>
  </div>

  <div class="card" style="margin-bottom:14px">
    <div class="fiche-head">
      <div>
        <h1>${esc(e.prenom)} ${esc(e.nom.toUpperCase())}</h1>
        <div class="muted">${esc(ecole?.nom || '')} · ${esc(e.formation || '')} · <span class="badge">${esc(STATUTS_ELEVE[e.statut] || '')}</span></div>
      </div>
      <button class="btn" data-action="editEleve" data-id="${id}">✏️ Modifier la fiche</button>
    </div>
    <hr>
    <div class="grid cols-2">
      <dl class="kv">
        <dt>Téléphone</dt><dd>${e.tel ? `<a href="tel:${esc(e.tel)}">${esc(e.tel)}</a>` : '—'}</dd>
        <dt>E-mail</dt><dd>${e.email ? `<a href="mailto:${esc(e.email)}">${esc(e.email)}</a>` : '—'}</dd>
        <dt>Adresse</dt><dd>${esc([e.adresse, [e.cp, e.ville].filter(Boolean).join(' ')].filter(Boolean).join(', ') || '—')}</dd>
        <dt>Date de naissance</dt><dd>${e.naissance ? fmtDate(e.naissance) : '—'}</dd>
        <dt>Inscription</dt><dd>${e.inscription ? fmtDate(e.inscription) : '—'}</dd>
      </dl>
      <dl class="kv">
        <dt>N° NEPH</dt><dd>${esc(e.neph || '—')}</dd>
        <dt>Code (ETM/ETG)</dt><dd>${e.code ? fmtDate(e.code) : '—'}</dd>
        <dt>Heures prévues</dt><dd>${e.heuresPrevues ? esc(e.heuresPrevues) + ' h' : '—'}</dd>
        <dt>Équipement</dt><dd>${esc(e.equipement || '—')}</dd>
        <dt>Notes</dt><dd>${esc(e.notes || '—').replace(/\n/g, '<br>')}</dd>
      </dl>
    </div>
  </div>

  <div class="grid cols-4" style="margin-bottom:14px">
    <div class="stat"><div class="label">Plateau effectué</div><div class="value">${fmtH(h.plateau)}</div></div>
    <div class="stat"><div class="label">Circulation effectuée</div><div class="value">${fmtH(h.circulation)}</div></div>
    <div class="stat"><div class="label">Total / prévu</div><div class="value">${fmtH(h.plateau + h.circulation)}${e.heuresPrevues ? ` <span class="muted small">/ ${esc(e.heuresPrevues)}h</span>` : ''}</div></div>
    <div class="stat"><div class="label">À venir</div><div class="value">${fmtH(h.aVenir)}</div></div>
    <div class="stat"><div class="label">Facturé</div><div class="value">${eur(fin.facture)}</div></div>
    <div class="stat"><div class="label">Payé</div><div class="value">${eur(fin.paye)}</div></div>
    <div class="stat"><div class="label">${fin.solde >= 0 ? 'Reste dû' : 'Crédit élève'}</div><div class="value" style="color:${fin.solde > 0 ? 'var(--bad)' : 'var(--ok)'}">${eur(Math.abs(fin.solde))}</div></div>
    <div class="stat"><div class="label">Leçons à facturer</div><div class="value">${aFacturer}</div></div>
  </div>

  <div class="grid cols-2">
    <div class="card">
      <h2>Séances</h2>
      ${seances.length ? `<div class="table-wrap"><table>
        <thead><tr><th>Date</th><th>Horaire</th><th>Type</th><th>Moniteur</th><th>Présence</th></tr></thead>
        <tbody>${seances.slice().reverse().map((s) => {
          const p = s.eleves.find((x) => x.eleveId === id);
          const cls = p.statut === 'present' ? 'ok' : p.statut === 'absent' ? 'bad' : p.statut === 'excuse' ? 'warn' : '';
          return `<tr class="clickable" data-action="editSeance" data-id="${s.id}">
            <td>${fmtDate(s.date)}${s.date >= today ? ' <span class="badge">à venir</span>' : ''}</td>
            <td>${s.debut}–${s.fin}</td>
            <td><span class="badge ${s.type}">${TYPES[s.type].short}</span></td>
            <td>${esc(moniteurNom(byId('moniteurs', s.moniteurId)))}</td>
            <td><span class="badge ${cls}">${STATUTS_PRESENCE[p.statut]}</span>${p.factureId ? ' 🧾' : ''}</td>
          </tr>`;
        }).join('')}</tbody></table></div>` : '<div class="muted">Aucune séance.</div>'}
    </div>
    <div class="grid" style="align-content:start">
      <div class="card">
        <h2>Factures</h2>
        ${factures.length ? facturesTable(factures, false) : '<div class="muted">Aucune facture.</div>'}
      </div>
      <div class="card">
        <h2>Paiements</h2>
        ${paiements.length ? paiementsTable(paiements, false) : '<div class="muted">Aucun paiement.</div>'}
      </div>
    </div>
  </div>`;
}

function openEleve(eleve, { onSaved } = {}) {
  const isNew = !eleve.id;
  const e = eleve;
  openModal({
    title: isNew ? 'Nouvel élève' : 'Modifier la fiche élève',
    wide: true,
    body: `
    <form id="eleve-form" class="form-grid" onsubmit="return false">
      <label class="field"><span>Nom *</span><input name="nom" value="${esc(e.nom || '')}" required></label>
      <label class="field"><span>Prénom *</span><input name="prenom" value="${esc(e.prenom || '')}" required></label>
      <label class="field"><span>Auto-école *</span>
        <select name="ecoleId">${DB.ecoles.map((x) => `<option value="${x.id}" ${e.ecoleId === x.id ? 'selected' : ''}>${esc(x.nom)}</option>`).join('')}</select></label>
      <label class="field"><span>Formation</span>
        <select name="formation">${FORMATIONS.map((x) => `<option ${e.formation === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></label>
      <label class="field"><span>Téléphone</span><input name="tel" type="tel" value="${esc(e.tel || '')}"></label>
      <label class="field"><span>E-mail</span><input name="email" type="email" value="${esc(e.email || '')}"></label>
      <label class="field full"><span>Adresse</span><input name="adresse" value="${esc(e.adresse || '')}"></label>
      <label class="field"><span>Code postal</span><input name="cp" value="${esc(e.cp || '')}"></label>
      <label class="field"><span>Ville</span><input name="ville" value="${esc(e.ville || '')}"></label>
      <label class="field"><span>Date de naissance</span><input name="naissance" type="date" value="${esc(e.naissance || '')}"></label>
      <label class="field"><span>Date d'inscription</span><input name="inscription" type="date" value="${esc(e.inscription || todayISO())}"></label>
      <label class="field"><span>N° NEPH</span><input name="neph" value="${esc(e.neph || '')}"></label>
      <label class="field"><span>Code obtenu le</span><input name="code" type="date" value="${esc(e.code || '')}"></label>
      <label class="field"><span>Heures prévues</span><input name="heuresPrevues" type="number" min="0" step="1" value="${esc(e.heuresPrevues || '')}"></label>
      <label class="field"><span>Statut</span>
        <select name="statut">${Object.entries(STATUTS_ELEVE).map(([k, l]) => `<option value="${k}" ${(e.statut || 'en_cours') === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label class="field full"><span>Équipement (prêt casque, gants, taille…)</span><input name="equipement" value="${esc(e.equipement || '')}"></label>
      <label class="field full"><span>Notes / suivi pédagogique</span><textarea name="notes">${esc(e.notes || '')}</textarea></label>
    </form>`,
    foot: `
      ${!isNew ? `<div class="left"><button class="btn danger" data-action="deleteEleve" data-id="${e.id}">Supprimer l'élève</button></div>` : ''}
      <button class="btn" data-action="closeModal">Annuler</button>
      <button class="btn primary" id="save-eleve">Enregistrer</button>`,
    onMount: (m) => {
      $('#save-eleve', m).addEventListener('click', () => {
        const form = $('#eleve-form');
        if (!form.reportValidity()) return;
        const data = formData(form);
        let target;
        if (isNew) { target = { id: uid(), ...data }; DB.eleves.push(target); }
        else { target = byId('eleves', e.id); Object.assign(target, data); }
        save();
        closeModal();
        toast('Fiche élève enregistrée');
        if (onSaved) onSaved(target); else { if (isNew) UI.eleveOuvert = target.id; render(); }
      });
    },
  });
}

/* ---------------------------------------------------------------------
   Vue PAIEMENTS (factures + encaissements)
   --------------------------------------------------------------------- */
function facturesTable(list, withEleve = true) {
  return `<div class="table-wrap"><table>
    <thead><tr><th>N°</th><th>Date</th>${withEleve ? '<th>Élève</th><th>Auto-école</th>' : ''}<th class="num">Montant</th><th class="num">Reste</th><th>Statut</th><th></th></tr></thead>
    <tbody>${list.map((f) => {
      const t = factureTotaux(f);
      const st = factureStatut(f);
      return `<tr class="clickable" data-action="editFacture" data-id="${f.id}">
        <td><strong>${esc(f.numero)}</strong></td>
        <td>${fmtDate(f.date)}</td>
        ${withEleve ? `<td>${esc(eleveNom(byId('eleves', f.eleveId)))}</td><td>${esc(byId('ecoles', f.ecoleId)?.nom || '')}</td>` : ''}
        <td class="num">${eur(t.ttc)}</td>
        <td class="num">${eur(Math.max(0, t.ttc - facturePaye(f)))}</td>
        <td><span class="badge ${st.key}">${st.label}</span></td>
        <td class="num"><button class="btn small" data-action="sendFacture" data-id="${f.id}" title="Envoyer / télécharger">📤</button></td>
      </tr>`;
    }).join('')}</tbody></table></div>`;
}

function paiementsTable(list, withEleve = true) {
  return `<div class="table-wrap"><table>
    <thead><tr><th>Date</th>${withEleve ? '<th>Élève</th>' : ''}<th>Mode</th><th>Facture</th><th class="num">Montant</th></tr></thead>
    <tbody>${list.map((p) => `
      <tr class="clickable" data-action="editPaiement" data-id="${p.id}">
        <td>${fmtDate(p.date)}</td>
        ${withEleve ? `<td>${esc(eleveNom(byId('eleves', p.eleveId)))}</td>` : ''}
        <td>${esc(p.mode)}${p.reference ? ` <span class="muted small">${esc(p.reference)}</span>` : ''}</td>
        <td>${esc(byId('factures', p.factureId)?.numero || '—')}</td>
        <td class="num"><strong>${eur(p.montant)}</strong></td>
      </tr>`).join('')}</tbody></table></div>`;
}

function viewPaiements() {
  const ecoleOk = (eid) => !UI.filtreEcole || byId('eleves', eid)?.ecoleId === UI.filtreEcole;
  const factures = DB.factures.filter((f) => !UI.filtreEcole || f.ecoleId === UI.filtreEcole).sort((a, b) => (b.date + b.numero).localeCompare(a.date + a.numero));
  const paiements = DB.paiements.filter((p) => ecoleOk(p.eleveId)).sort((a, b) => b.date.localeCompare(a.date));

  const moisCourant = todayISO().slice(0, 7);
  const encMois = paiements.filter((p) => p.date.startsWith(moisCourant)).reduce((s, p) => s + Number(p.montant || 0), 0);
  const factMois = factures.filter((f) => f.date.startsWith(moisCourant)).reduce((s, f) => s + factureTotaux(f).ttc, 0);
  const impayes = factures.reduce((s, f) => s + Math.max(0, factureTotaux(f).ttc - facturePaye(f)), 0);
  let aFacturer = 0;
  for (const e of DB.eleves.filter((x) => !UI.filtreEcole || x.ecoleId === UI.filtreEcole)) {
    aFacturer += nonFactures(e.id).filter((x) => x.part.statut !== 'prevu').length;
  }

  // Récap mensuel par mode
  const parMois = {};
  for (const p of paiements) {
    const k = p.date.slice(0, 7);
    parMois[k] = parMois[k] || { total: 0 };
    parMois[k].total += Number(p.montant || 0);
    parMois[k][p.mode] = (parMois[k][p.mode] || 0) + Number(p.montant || 0);
  }
  const mois = Object.keys(parMois).sort().reverse();

  const ong = UI.ongletPaiements;
  return `
  <div class="toolbar">
    <h1>Paiements & factures</h1>
    <div class="spacer"></div>
    <select data-on-change="filtreEcole" style="width:auto">
      <option value="">Toutes les auto-écoles</option>
      ${DB.ecoles.map((e) => `<option value="${e.id}" ${UI.filtreEcole === e.id ? 'selected' : ''}>${esc(e.nom)}</option>`).join('')}
    </select>
    <button class="btn" data-action="newFacture">🧾 Nouvelle facture</button>
    <button class="btn primary" data-action="newPaiement">💶 Encaisser un paiement</button>
  </div>
  <div class="grid cols-4" style="margin-bottom:14px">
    <div class="stat"><div class="label">Encaissé ce mois</div><div class="value">${eur(encMois)}</div></div>
    <div class="stat"><div class="label">Facturé ce mois</div><div class="value">${eur(factMois)}</div></div>
    <div class="stat"><div class="label">Factures impayées</div><div class="value" style="color:var(--bad)">${eur(impayes)}</div></div>
    <div class="stat"><div class="label">Leçons à facturer</div><div class="value">${aFacturer}</div></div>
  </div>
  <div class="toolbar">
    <button class="btn ${ong === 'factures' ? 'dark' : ''}" data-action="ongletPaiements" data-o="factures">Factures (${factures.length})</button>
    <button class="btn ${ong === 'encaissements' ? 'dark' : ''}" data-action="ongletPaiements" data-o="encaissements">Encaissements (${paiements.length})</button>
    <button class="btn ${ong === 'soldes' ? 'dark' : ''}" data-action="ongletPaiements" data-o="soldes">Soldes élèves</button>
    <button class="btn ${ong === 'recap' ? 'dark' : ''}" data-action="ongletPaiements" data-o="recap">Récap mensuel</button>
  </div>
  ${ong === 'factures' ? (factures.length ? facturesTable(factures) : '<div class="card empty">Aucune facture.</div>') : ''}
  ${ong === 'encaissements' ? (paiements.length ? paiementsTable(paiements) : '<div class="card empty">Aucun paiement enregistré.</div>') : ''}
  ${ong === 'soldes' ? viewSoldes() : ''}
  ${ong === 'recap' ? (mois.length ? `<div class="table-wrap"><table>
    <thead><tr><th>Mois</th>${MODES_PAIEMENT.map((m) => `<th class="num">${m}</th>`).join('')}<th class="num">Total</th></tr></thead>
    <tbody>${mois.map((k) => `<tr><td><strong>${parseISO(k + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</strong></td>
      ${MODES_PAIEMENT.map((m) => `<td class="num">${parMois[k][m] ? eur(parMois[k][m]) : '<span class="muted">–</span>'}</td>`).join('')}
      <td class="num"><strong>${eur(parMois[k].total)}</strong></td></tr>`).join('')}</tbody></table></div>` : '<div class="card empty">Rien à afficher.</div>') : ''}`;
}

function viewSoldes() {
  const rows = DB.eleves
    .filter((e) => !UI.filtreEcole || e.ecoleId === UI.filtreEcole)
    .map((e) => ({ e, f: eleveFinances(e.id), nf: nonFactures(e.id).filter((x) => x.part.statut !== 'prevu').length }))
    .filter((r) => r.f.solde !== 0 || r.nf > 0)
    .sort((a, b) => b.f.solde - a.f.solde);
  if (!rows.length) return '<div class="card empty">Tous les comptes sont à jour 👍</div>';
  return `<div class="table-wrap"><table>
    <thead><tr><th>Élève</th><th>Auto-école</th><th class="num">Facturé</th><th class="num">Payé</th><th class="num">Solde</th><th class="num">Leçons à facturer</th></tr></thead>
    <tbody>${rows.map(({ e, f, nf }) => `
      <tr class="clickable" data-action="openFiche" data-id="${e.id}">
        <td><strong>${esc(e.nom.toUpperCase())}</strong> ${esc(e.prenom)}</td>
        <td>${esc(byId('ecoles', e.ecoleId)?.nom || '')}</td>
        <td class="num">${eur(f.facture)}</td><td class="num">${eur(f.paye)}</td>
        <td class="num">${f.solde > 0 ? `<span class="badge bad">${eur(f.solde)}</span>` : f.solde < 0 ? `<span class="badge ok">crédit ${eur(-f.solde)}</span>` : '0'}</td>
        <td class="num">${nf || ''}</td>
      </tr>`).join('')}</tbody></table></div>`;
}

/* ---------------------------------------------------------------------
   Factures
   --------------------------------------------------------------------- */
let draftFacture = null;

function ligneSeance(s, eleveId) {
  const h = durH(s);
  const p = s.eleves.find((x) => x.eleveId === eleveId);
  return {
    libelle: `Leçon ${TYPES[s.type].label.toLowerCase()} du ${fmtDate(s.date)} ${s.debut}-${s.fin}${p?.statut === 'absent' ? ' (absence non excusée)' : ''}`,
    qte: round2(h),
    pu: DB.settings.tarifHeure[s.type] || 0,
    seanceId: s.id,
  };
}

function openFacture(f) {
  const isNew = !f.id;
  draftFacture = JSON.parse(JSON.stringify(f));
  const eleve = byId('eleves', draftFacture.eleveId);
  // Leçons non facturées de l'élève (proposées à l'ajout)
  const dispo = draftFacture.eleveId ? nonFactures(draftFacture.eleveId).filter((x) => !draftFacture.lignes.some((l) => l.seanceId === x.seance.id)) : [];

  openModal({
    title: isNew ? 'Nouvelle facture' : `Facture ${esc(f.numero)}`,
    wide: true,
    body: `
    <form id="facture-form" class="form-grid" onsubmit="return false">
      <label class="field"><span>Élève</span>
        <select name="eleveId" data-on-change="factureEleve" ${isNew ? '' : 'disabled'}>
          <option value="">— Choisir —</option>
          ${DB.eleves.slice().sort((a, b) => eleveNom(a).localeCompare(eleveNom(b))).map((e) => `<option value="${e.id}" ${draftFacture.eleveId === e.id ? 'selected' : ''}>${esc(e.nom.toUpperCase())} ${esc(e.prenom)}</option>`).join('')}
        </select></label>
      <label class="field"><span>Auto-école émettrice</span>
        <select name="ecoleId" ${isNew ? '' : 'disabled'}>
          ${DB.ecoles.map((e) => `<option value="${e.id}" ${draftFacture.ecoleId === e.id ? 'selected' : ''}>${esc(e.nom)}</option>`).join('')}
        </select></label>
      <label class="field"><span>Date</span><input type="date" name="date" value="${draftFacture.date}"></label>
      <label class="field"><span>Échéance</span><input type="date" name="echeance" value="${draftFacture.echeance || ''}"></label>
    </form>
    ${!isNew ? '<div class="alert info small" style="margin-top:10px">Le numéro, l\'élève et l\'auto-école d\'une facture émise ne peuvent pas être modifiés.</div>' : ''}
    <hr>
    <h3>Lignes</h3>
    <div class="table-wrap lines-table"><table>
      <thead><tr><th>Désignation</th><th class="num" style="width:80px">Qté</th><th class="num" style="width:110px">PU TTC</th><th class="num" style="width:110px">Total</th><th style="width:40px"></th></tr></thead>
      <tbody id="lignes"></tbody>
      <tfoot><tr><td colspan="3" class="right"><strong>Total TTC</strong></td><td class="num"><strong id="total-ttc"></strong></td><td></td></tr></tfoot>
    </table></div>
    <div class="row" style="margin-top:8px">
      <select id="add-presta" style="max-width:320px">
        <option value="">+ Ajouter une prestation…</option>
        <option value="__libre">Ligne libre</option>
        ${DB.prestations.map((p) => `<option value="${p.id}">${esc(p.libelle)} — ${eur(p.prix)}</option>`).join('')}
        <option value="__plateau">Heure plateau — ${eur(DB.settings.tarifHeure.plateau)}</option>
        <option value="__circulation">Heure circulation — ${eur(DB.settings.tarifHeure.circulation)}</option>
      </select>
    </div>
    ${dispo.length ? `
      <hr>
      <h3>Leçons non facturées de ${esc(eleveNom(eleve))}</h3>
      <div class="check-list" id="dispo-lecons">
        ${dispo.map((x) => `<label><input type="checkbox" value="${x.seance.id}" ${x.part.statut !== 'prevu' ? 'checked' : ''}>
          ${fmtDate(x.seance.date)} ${x.seance.debut}-${x.seance.fin} · <span class="badge ${x.seance.type}">${TYPES[x.seance.type].short}</span> · ${fmtH(durH(x.seance))} · <span class="muted">${STATUTS_PRESENCE[x.part.statut]}</span></label>`).join('')}
      </div>
      <button class="btn small" style="margin-top:6px" data-action="factureAddLecons">Ajouter les leçons cochées</button>` : ''}
    <label class="field" style="margin-top:12px"><span>Note sur la facture (optionnel)</span><input id="facture-notes" value="${esc(draftFacture.notes || '')}"></label>
    `,
    foot: `
      <div class="left">
        ${!isNew ? `<button class="btn danger" data-action="deleteFacture" data-id="${f.id}">Supprimer</button>` : ''}
      </div>
      <button class="btn" data-action="closeModal">Annuler</button>
      ${!isNew ? `<button class="btn" data-action="sendFacture" data-id="${f.id}">📤 Envoyer</button>` : ''}
      <button class="btn primary" data-action="saveFacture">${isNew ? 'Créer la facture' : 'Enregistrer'}</button>`,
    onMount: (m) => {
      renderLignes();
      $('#add-presta', m).addEventListener('change', (ev) => {
        const v = ev.target.value;
        if (!v) return;
        if (v === '__libre') draftFacture.lignes.push({ libelle: '', qte: 1, pu: 0 });
        else if (v === '__plateau' || v === '__circulation') {
          const t = v.slice(2);
          draftFacture.lignes.push({ libelle: `Heure de conduite ${TYPES[t].label.toLowerCase()}`, qte: 1, pu: DB.settings.tarifHeure[t] });
        } else {
          const p = byId('prestations', v);
          draftFacture.lignes.push({ libelle: p.libelle, qte: 1, pu: p.prix });
        }
        ev.target.value = '';
        renderLignes();
      });
    },
  });
}

function renderLignes() {
  const tb = $('#lignes');
  tb.innerHTML = draftFacture.lignes.length ? draftFacture.lignes.map((l, i) => `
    <tr>
      <td><input data-on-input="ligneEdit" data-i="${i}" data-k="libelle" value="${esc(l.libelle)}"></td>
      <td><input data-on-input="ligneEdit" data-i="${i}" data-k="qte" type="number" step="0.25" min="0" value="${l.qte}" class="right"></td>
      <td><input data-on-input="ligneEdit" data-i="${i}" data-k="pu" type="number" step="0.01" value="${l.pu}" class="right"></td>
      <td class="num" id="lt-${i}">${eur(l.qte * l.pu)}</td>
      <td><button class="btn small danger" data-action="ligneDel" data-i="${i}">✕</button></td>
    </tr>`).join('') : '<tr><td colspan="5" class="muted">Aucune ligne. Ajoutez une prestation ou des leçons.</td></tr>';
  updateTotalFacture();
}
function updateTotalFacture() {
  const t = round2(draftFacture.lignes.reduce((s, l) => s + (Number(l.qte) || 0) * (Number(l.pu) || 0), 0));
  $('#total-ttc').textContent = eur(t);
}

function saveFacture() {
  const form = formData($('#facture-form'));
  const isNew = !draftFacture.id;
  if (isNew) {
    draftFacture.eleveId = form.eleveId;
    draftFacture.ecoleId = form.ecoleId;
  }
  draftFacture.date = form.date || todayISO();
  draftFacture.echeance = form.echeance || '';
  draftFacture.notes = $('#facture-notes').value.trim();
  draftFacture.lignes = draftFacture.lignes.map((l) => ({ ...l, qte: Number(l.qte) || 0, pu: Number(l.pu) || 0 }));
  if (!draftFacture.eleveId) return toast("Choisissez l'élève", true);
  if (!draftFacture.lignes.length) return toast('Ajoutez au moins une ligne', true);

  const ecole = byId('ecoles', draftFacture.ecoleId);
  let f;
  if (isNew) {
    ecole.compteur = (Number(ecole.compteur) || 0) + 1;
    const an = draftFacture.date.slice(0, 4);
    draftFacture.id = uid();
    draftFacture.numero = `${ecole.prefixe || 'F'}-${an}-${String(ecole.compteur).padStart(4, '0')}`;
    draftFacture.tva = Number(ecole.tva) || 0;
    DB.factures.push(draftFacture);
    f = draftFacture;
  } else {
    f = byId('factures', draftFacture.id);
    Object.assign(f, draftFacture);
  }
  // Liens séances <-> facture
  for (const s of DB.seances) for (const p of s.eleves) if (p.factureId === f.id) delete p.factureId;
  for (const l of f.lignes) {
    if (!l.seanceId) continue;
    const s = byId('seances', l.seanceId);
    const p = s?.eleves.find((x) => x.eleveId === f.eleveId);
    if (p) p.factureId = f.id;
  }
  save();
  closeModal();
  toast(`Facture ${f.numero} enregistrée`);
  render();
  if (isNew) sendFacture(f.id);
}

/* ---------------------------------------------------------------------
   Paiements
   --------------------------------------------------------------------- */
function openPaiement(p) {
  const isNew = !p.id;
  const facturesDe = (eid) => DB.factures.filter((f) => f.eleveId === eid);
  const optsFactures = (eid, sel) => `<option value="">— Sans facture (acompte) —</option>` + facturesDe(eid).map((f) => {
    const reste = factureTotaux(f).ttc - facturePaye(f);
    return `<option value="${f.id}" ${sel === f.id ? 'selected' : ''}>${esc(f.numero)} — reste ${eur(Math.max(0, reste))}</option>`;
  }).join('');

  openModal({
    title: isNew ? 'Encaisser un paiement' : 'Modifier le paiement',
    body: `
    <form id="paiement-form" class="form-grid" onsubmit="return false">
      <label class="field full"><span>Élève *</span>
        <select name="eleveId" id="pay-eleve" required>
          <option value="">— Choisir —</option>
          ${DB.eleves.slice().sort((a, b) => eleveNom(a).localeCompare(eleveNom(b))).map((e) => `<option value="${e.id}" ${p.eleveId === e.id ? 'selected' : ''}>${esc(e.nom.toUpperCase())} ${esc(e.prenom)} — ${esc(byId('ecoles', e.ecoleId)?.nom || '')}</option>`).join('')}
        </select></label>
      <label class="field full"><span>Facture réglée</span>
        <select name="factureId" id="pay-facture">${optsFactures(p.eleveId, p.factureId)}</select></label>
      <label class="field"><span>Date *</span><input type="date" name="date" value="${p.date || todayISO()}" required></label>
      <label class="field"><span>Montant (€) *</span><input type="number" name="montant" step="0.01" min="0.01" value="${p.montant ?? ''}" required id="pay-montant"></label>
      <label class="field"><span>Mode</span>
        <select name="mode">${MODES_PAIEMENT.map((m) => `<option ${p.mode === m ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
      <label class="field"><span>Référence (n° chèque…)</span><input name="reference" value="${esc(p.reference || '')}"></label>
      <label class="field full"><span>Notes</span><input name="notes" value="${esc(p.notes || '')}"></label>
    </form>`,
    foot: `
      ${!isNew ? `<div class="left"><button class="btn danger" data-action="deletePaiement" data-id="${p.id}">Supprimer</button></div>` : ''}
      <button class="btn" data-action="closeModal">Annuler</button>
      <button class="btn primary" id="save-paiement">Enregistrer</button>`,
    onMount: (m) => {
      const fillReste = () => {
        const f = byId('factures', $('#pay-facture').value);
        if (f && !$('#pay-montant').value) $('#pay-montant').value = round2(Math.max(0, factureTotaux(f).ttc - facturePaye(f)));
      };
      $('#pay-eleve', m).addEventListener('change', (ev) => {
        $('#pay-facture').innerHTML = optsFactures(ev.target.value, '');
        // présélectionne la plus ancienne facture non soldée
        const due = facturesDe(ev.target.value).filter((f) => factureStatut(f).key !== 'ok').sort((a, b) => a.date.localeCompare(b.date))[0];
        if (due) { $('#pay-facture').value = due.id; $('#pay-montant').value = ''; fillReste(); }
      });
      $('#pay-facture', m).addEventListener('change', () => { $('#pay-montant').value = ''; fillReste(); });
      if (isNew && p.eleveId) {
        const due = facturesDe(p.eleveId).filter((f) => factureStatut(f).key !== 'ok').sort((a, b) => a.date.localeCompare(b.date))[0];
        if (due && !p.factureId) $('#pay-facture').value = due.id;
        fillReste();
      }
      $('#save-paiement', m).addEventListener('click', () => {
        const form = $('#paiement-form');
        if (!form.reportValidity()) return;
        const data = formData(form);
        data.montant = round2(data.montant);
        if (isNew) DB.paiements.push({ id: uid(), ...data });
        else Object.assign(byId('paiements', p.id), data);
        save();
        closeModal();
        toast(`Paiement de ${eur(data.montant)} enregistré`);
        render();
      });
    },
  });
}

/* ---------------------------------------------------------------------
   PDF : facture & carte de rendez-vous
   --------------------------------------------------------------------- */
function pdfText(s) {
  // Les polices standard PDF (WinAnsi) ne gèrent pas certains caractères.
  return String(s ?? '').replace(/[  ]/g, ' ').replace(/→/g, '->').replace(/[’]/g, "'").replace(/[“”]/g, '"').replace(/³/g, '3');
}

function pdfEcoleHeader(doc, ecole, x, y) {
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.text(pdfText(ecole?.nom || ''), x, y);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  const lines = [
    ecole?.adresse,
    [ecole?.cp, ecole?.ville].filter(Boolean).join(' '),
    [ecole?.tel && 'Tél. ' + ecole.tel, ecole?.email].filter(Boolean).join(' - '),
    ecole?.siret && 'SIRET ' + ecole.siret,
    ecole?.agrement && 'Agrément ' + ecole.agrement,
  ].filter(Boolean);
  lines.forEach((l, i) => doc.text(pdfText(l), x, y + 5 + i * 4.2));
  return y + 5 + lines.length * 4.2;
}

function buildFacturePdf(f) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const ecole = byId('ecoles', f.ecoleId);
  const e = byId('eleves', f.eleveId);
  const t = factureTotaux(f);
  const paye = facturePaye(f);
  const W = 210, M = 18;

  doc.setFillColor(249, 115, 22); doc.rect(0, 0, W, 6, 'F');
  pdfEcoleHeader(doc, ecole, M, 20);

  doc.setFont('helvetica', 'bold'); doc.setFontSize(22);
  doc.text('FACTURE', W - M, 22, { align: 'right' });
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text(pdfText(`N° ${f.numero}`), W - M, 29, { align: 'right' });
  doc.text(`Date : ${fmtDate(f.date)}`, W - M, 34, { align: 'right' });
  if (f.echeance) doc.text(`Échéance : ${fmtDate(f.echeance)}`, W - M, 39, { align: 'right' });

  // Client
  const cy = 52;
  doc.setDrawColor(226, 232, 240); doc.setFillColor(248, 250, 252);
  doc.roundedRect(W - M - 85, cy, 85, 32, 2, 2, 'FD');
  doc.setFontSize(8); doc.setTextColor(100, 116, 139); doc.text('FACTURÉ À', W - M - 81, cy + 6);
  doc.setTextColor(15, 23, 42); doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text(pdfText(e ? `${e.prenom} ${e.nom.toUpperCase()}` : ''), W - M - 81, cy + 12);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  [e?.adresse, [e?.cp, e?.ville].filter(Boolean).join(' '), e?.email, e?.neph && 'NEPH ' + e.neph]
    .filter(Boolean).forEach((l, i) => doc.text(pdfText(l), W - M - 81, cy + 17 + i * 4));
  if (e?.formation) { doc.text(pdfText('Formation : ' + e.formation), M, cy + 12); }

  // Tableau
  let y = 96;
  const cols = { d: M, q: 130, pu: 155, tot: W - M };
  doc.setFillColor(30, 41, 59); doc.rect(M, y - 5, W - 2 * M, 8, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
  doc.text('Désignation', cols.d + 2, y); doc.text('Qté', cols.q, y, { align: 'right' });
  doc.text('PU TTC', cols.pu + 10, y, { align: 'right' }); doc.text('Total TTC', cols.tot - 2, y, { align: 'right' });
  doc.setTextColor(15, 23, 42); doc.setFont('helvetica', 'normal');
  y += 9;
  for (const l of f.lignes) {
    const wrapped = doc.splitTextToSize(pdfText(l.libelle), 105);
    if (y + wrapped.length * 4.5 > 255) { doc.addPage(); y = 20; }
    doc.text(wrapped, cols.d + 2, y);
    doc.text(String(l.qte).replace('.', ','), cols.q, y, { align: 'right' });
    doc.text(eurPdf(l.pu), cols.pu + 10, y, { align: 'right' });
    doc.text(eurPdf(l.qte * l.pu), cols.tot - 2, y, { align: 'right' });
    y += wrapped.length * 4.5 + 2;
    doc.setDrawColor(226, 232, 240); doc.line(M, y - 3, W - M, y - 3);
  }

  // Totaux
  y += 4;
  if (y > 240) { doc.addPage(); y = 20; }
  const tx = 125;
  const lineTot = (label, val, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(bold ? 11 : 9.5);
    doc.text(pdfText(label), tx, y); doc.text(val, W - M - 2, y, { align: 'right' }); y += bold ? 7 : 5.5;
  };
  if (t.taux > 0) {
    lineTot('Total HT', eurPdf(t.ht));
    lineTot(`TVA ${String(t.taux).replace('.', ',')} %`, eurPdf(t.tva));
  }
  doc.setFillColor(255, 237, 213); doc.rect(tx - 3, y - 5, W - M - tx + 3, 8, 'F');
  lineTot('Total TTC', eurPdf(t.ttc), true);
  if (paye > 0) {
    lineTot('Déjà réglé', '- ' + eurPdf(paye));
    lineTot('Reste à payer', eurPdf(Math.max(0, t.ttc - paye)), true);
  }
  if (t.taux === 0) { doc.setFontSize(8.5); doc.setFont('helvetica', 'italic'); doc.text('TVA non applicable, art. 293 B du CGI', M, y); y += 5; }

  // Paiements reçus
  const pays = DB.paiements.filter((p) => p.factureId === f.id).sort((a, b) => a.date.localeCompare(b.date));
  if (pays.length) {
    y += 4; doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.text('Règlements reçus', M, y); y += 5;
    doc.setFont('helvetica', 'normal');
    pays.forEach((p) => { doc.text(pdfText(`${fmtDate(p.date)} - ${p.mode}${p.reference ? ' (' + p.reference + ')' : ''} : ${eurPdf(p.montant)}`), M, y); y += 4.5; });
  }
  if (f.notes) { y += 4; doc.setFontSize(9); doc.text(doc.splitTextToSize(pdfText(f.notes), W - 2 * M), M, y); }

  // Pied de page
  doc.setFontSize(7.5); doc.setTextColor(100, 116, 139); doc.setFont('helvetica', 'normal');
  const foot = doc.splitTextToSize(pdfText(DB.settings.mentionsFacture || ''), W - 2 * M);
  doc.text(foot, W / 2, 285 - foot.length * 3.5, { align: 'center' });
  doc.text(pdfText([ecole?.nom, ecole?.siret && 'SIRET ' + ecole.siret].filter(Boolean).join(' - ')), W / 2, 289, { align: 'center' });
  return doc;
}

function buildCarteRdvPdf(eleveId, seances) {
  const { jsPDF } = window.jspdf;
  const e = byId('eleves', eleveId);
  const ecole = byId('ecoles', e.ecoleId);
  // Format carte A6 paysage (148 x 105 mm)
  const doc = new jsPDF({ unit: 'mm', format: [148, 105], orientation: 'landscape' });
  const W = 148, H = 105, M = 8;
  const perPage = 7;
  const pages = Math.max(1, Math.ceil(seances.length / perPage));
  for (let pg = 0; pg < pages; pg++) {
    if (pg > 0) doc.addPage([148, 105], 'landscape');
    doc.setFillColor(30, 41, 59); doc.rect(0, 0, W, 20, 'F');
    doc.setFillColor(249, 115, 22); doc.rect(0, 20, W, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.text(pdfText(ecole?.nom || ''), M, 9);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
    doc.text(pdfText([ecole?.tel && 'Tél. ' + ecole.tel, [ecole?.adresse, ecole?.cp, ecole?.ville].filter(Boolean).join(' ')].filter(Boolean).join('  -  ')), M, 15);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.text('CARTE DE RENDEZ-VOUS', W - M, 9, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text('Formation moto', W - M, 15, { align: 'right' });

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.text(pdfText(`${e.prenom} ${e.nom.toUpperCase()}`), M, 29);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text(pdfText([e.formation, e.neph && 'NEPH ' + e.neph].filter(Boolean).join('  -  ')), W - M, 29, { align: 'right' });

    let y = 37;
    doc.setFillColor(241, 245, 249); doc.rect(M, y - 4, W - 2 * M, 6, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
    doc.text('DATE', M + 2, y); doc.text('HORAIRE', M + 52, y); doc.text('TYPE', M + 75, y); doc.text('MONITEUR / LIEU', M + 96, y);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    y += 6;
    const chunk = seances.slice(pg * perPage, (pg + 1) * perPage);
    if (!chunk.length) { doc.text('Aucun rendez-vous programmé.', M + 2, y); }
    for (const s of chunk) {
      const d = parseISO(s.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
      doc.setFont('helvetica', 'bold'); doc.text(pdfText(d), M + 2, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${s.debut} - ${s.fin}`, M + 52, y);
      doc.text(TYPES[s.type].label, M + 75, y);
      const m = byId('moniteurs', s.moniteurId);
      doc.text(pdfText(doc.splitTextToSize(moniteurNom(m) + (s.lieu ? ' - ' + s.lieu : ''), W - M - (M + 96))[0]), M + 96, y);
      doc.setDrawColor(226, 232, 240); doc.line(M, y + 2, W - M, y + 2);
      y += 6.6;
    }
    doc.setFontSize(6.5); doc.setTextColor(100, 116, 139);
    const cond = doc.splitTextToSize(pdfText(DB.settings.conditionsRdv || ''), W - 2 * M);
    doc.text(cond, M, H - 4 - (cond.length - 1) * 2.8);
    if (pages > 1) doc.text(`${pg + 1}/${pages}`, W - M, H - 4, { align: 'right' });
  }
  return doc;
}

function rdvAVenir(eleveId) {
  const now = todayISO();
  return eleveSeances(eleveId).filter((s) => s.date >= now && s.eleves.find((p) => p.eleveId === eleveId).statut === 'prevu');
}

function texteCarteRdv(eleveId, seances) {
  const e = byId('eleves', eleveId);
  const ecole = byId('ecoles', e.ecoleId);
  const lignes = seances.map((s) => {
    const d = parseISO(s.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    return `- ${d} de ${s.debut} à ${s.fin} : ${TYPES[s.type].label}${s.lieu ? ' (' + s.lieu + ')' : ''}`;
  });
  return `Bonjour ${e.prenom},\n\nVoici vos prochains rendez-vous moto :\n${lignes.join('\n') || '(aucun)'}\n\n${DB.settings.conditionsRdv}\n\n${ecole?.nom || ''}${ecole?.tel ? ' - ' + ecole.tel : ''}`;
}

/* ---------------------------------------------------------------------
   Envoi (partage, e-mail, SMS, WhatsApp, téléchargement)
   --------------------------------------------------------------------- */
function phoneIntl(tel) {
  let t = String(tel || '').replace(/[^\d+]/g, '');
  if (t.startsWith('+')) return t.slice(1);
  if (t.startsWith('00')) return t.slice(2);
  if (t.startsWith('0')) return '33' + t.slice(1);
  return t;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function openSendDialog({ title, doc, filename, eleve, subject, text, extraBody = '' }) {
  const blob = doc.output('blob');
  const file = new File([blob], filename, { type: 'application/pdf' });
  const canShareFile = !!(navigator.canShare && navigator.canShare({ files: [file] }));
  const email = eleve?.email || '';
  const tel = eleve?.tel || '';
  const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  const sms = `sms:${encodeURIComponent(tel)}${/iPhone|iPad|Mac/i.test(navigator.userAgent) ? '&' : '?'}body=${encodeURIComponent(text)}`;
  const wa = `https://wa.me/${phoneIntl(tel)}?text=${encodeURIComponent(text)}`;

  openModal({
    title,
    body: `
      ${extraBody}
      <p class="muted small">Destinataire : <strong>${esc(eleveNom(eleve))}</strong>${email ? ' · ' + esc(email) : ''}${tel ? ' · ' + esc(tel) : ''}</p>
      <div class="send-options">
        ${canShareFile ? '<button class="btn primary" data-send="share">📲 Partager le PDF (mail, WhatsApp…)</button>' : ''}
        <button class="btn" data-send="mail" ${email ? '' : 'disabled title="Pas d\'e-mail sur la fiche"'}>✉️ E-mail (PDF téléchargé à joindre)</button>
        <button class="btn" data-send="sms" ${tel ? '' : 'disabled title="Pas de téléphone sur la fiche"'}>💬 SMS (texte)</button>
        <button class="btn" data-send="wa" ${tel ? '' : 'disabled title="Pas de téléphone sur la fiche"'}>🟢 WhatsApp (texte)</button>
        <button class="btn" data-send="download">⬇️ Télécharger le PDF</button>
        <button class="btn" data-send="open">🖨️ Ouvrir / imprimer</button>
      </div>
      <details style="margin-top:12px"><summary class="muted small">Aperçu du message</summary><pre style="white-space:pre-wrap;font-size:13px;background:#f8fafc;padding:10px;border-radius:8px">${esc(text)}</pre></details>`,
    foot: '<button class="btn" data-action="closeModal">Fermer</button>',
    onMount: (m) => {
      m.addEventListener('click', async (ev) => {
        const b = ev.target.closest('[data-send]');
        if (!b) return;
        const k = b.dataset.send;
        try {
          if (k === 'share') await navigator.share({ files: [file], title: subject, text });
          else if (k === 'mail') { downloadBlob(blob, filename); setTimeout(() => { window.location.href = mailto; }, 400); toast('PDF téléchargé : joignez-le à l\'e-mail'); }
          else if (k === 'sms') window.location.href = sms;
          else if (k === 'wa') window.open(wa, '_blank');
          else if (k === 'download') downloadBlob(blob, filename);
          else if (k === 'open') window.open(URL.createObjectURL(blob), '_blank');
        } catch (err) {
          if (err && err.name !== 'AbortError') toast('Envoi impossible : ' + err.message, true);
        }
      });
    },
  });
}

function sendFacture(id) {
  const f = byId('factures', id);
  const e = byId('eleves', f.eleveId);
  const ecole = byId('ecoles', f.ecoleId);
  const t = factureTotaux(f);
  const reste = Math.max(0, t.ttc - facturePaye(f));
  const text = `Bonjour ${e?.prenom || ''},\n\nVeuillez trouver ci-joint votre facture n° ${f.numero} du ${fmtDate(f.date)} d'un montant de ${eur(t.ttc)}${reste > 0 && reste < t.ttc ? ` (reste à payer : ${eur(reste)})` : reste === 0 ? ' (réglée, merci)' : ''}.\n\nCordialement,\n${ecole?.nom || ''}${ecole?.tel ? '\n' + ecole.tel : ''}`;
  openSendDialog({
    title: `Envoyer la facture ${esc(f.numero)}`,
    doc: buildFacturePdf(f),
    filename: `Facture-${f.numero}.pdf`,
    eleve: e,
    subject: `Facture ${f.numero} - ${ecole?.nom || ''}`,
    text,
  });
}

function sendCarteRdv(eleveId) {
  const e = byId('eleves', eleveId);
  const ecole = byId('ecoles', e.ecoleId);
  const seances = rdvAVenir(eleveId);
  openSendDialog({
    title: 'Carte de rendez-vous',
    doc: buildCarteRdvPdf(eleveId, seances),
    filename: `Carte-RDV-${e.nom}-${e.prenom}.pdf`.replace(/\s+/g, '_'),
    eleve: e,
    subject: `Vos rendez-vous moto - ${ecole?.nom || ''}`,
    text: texteCarteRdv(eleveId, seances),
    extraBody: seances.length
      ? `<div class="alert info">${seances.length} rendez-vous à venir inclus dans la carte.</div>`
      : '<div class="alert warn">Aucun rendez-vous à venir pour cet élève.</div>',
  });
}

/* ---------------------------------------------------------------------
   Vue PARAMÈTRES
   --------------------------------------------------------------------- */
function viewParametres() {
  const s = DB.settings;
  return `
  <div class="toolbar"><h1>Paramètres</h1></div>
  <div class="grid cols-2">
    <div class="card">
      <h2>Auto-écoles</h2>
      <p class="muted small">Chaque auto-école a ses coordonnées et sa propre numérotation de factures.</p>
      ${DB.ecoles.map((e) => `
        <div class="participant" style="margin-bottom:6px">
          <span class="name">${esc(e.nom)} <span class="muted small">· factures ${esc(e.prefixe)}-AAAA-#### (dernière : ${e.compteur || 0}) · TVA ${e.tva}%</span></span>
          <button class="btn small" data-action="editEcole" data-id="${e.id}">Modifier</button>
        </div>`).join('')}
      <button class="btn" data-action="editEcole">+ Ajouter une auto-école</button>
    </div>
    <div class="card">
      <h2>Moniteurs</h2>
      ${DB.moniteurs.map((m) => `
        <div class="participant" style="margin-bottom:6px">
          <span class="dot" style="background:${esc(m.couleur)}"></span>
          <span class="name">${esc(moniteurNom(m))} <span class="muted small">${esc(m.tel || '')}</span></span>
          <button class="btn small" data-action="editMoniteur" data-id="${m.id}">Modifier</button>
        </div>`).join('')}
      <button class="btn" data-action="editMoniteur">+ Ajouter un moniteur</button>
    </div>
    <div class="card">
      <h2>Séances & tarifs</h2>
      <form id="settings-form" class="form-grid" onsubmit="return false">
        <label class="field"><span>Max élèves circulation</span><input type="number" min="1" name="capCirc" value="${s.capacite.circulation}"></label>
        <label class="field"><span>Max élèves plateau</span><input type="number" min="1" name="capPlateau" value="${s.capacite.plateau}"></label>
        <label class="field"><span>Tarif heure circulation (€ TTC)</span><input type="number" step="0.01" name="tarifCirc" value="${s.tarifHeure.circulation}"></label>
        <label class="field"><span>Tarif heure plateau (€ TTC)</span><input type="number" step="0.01" name="tarifPlateau" value="${s.tarifHeure.plateau}"></label>
        <label class="field"><span>Durée par défaut circulation (min)</span><input type="number" step="15" name="dureeCirc" value="${s.dureeDefaut.circulation}"></label>
        <label class="field"><span>Durée par défaut plateau (min)</span><input type="number" step="15" name="dureePlateau" value="${s.dureeDefaut.plateau}"></label>
        <label class="field full"><span>Conditions sur la carte de RDV</span><textarea name="conditionsRdv">${esc(s.conditionsRdv)}</textarea></label>
        <label class="field full"><span>Mentions en bas de facture</span><textarea name="mentionsFacture">${esc(s.mentionsFacture)}</textarea></label>
      </form>
      <div class="row" style="margin-top:10px;justify-content:flex-end"><button class="btn primary" data-action="saveSettings">Enregistrer</button></div>
    </div>
    <div class="card">
      <h2>Prestations (catalogue facture)</h2>
      ${DB.prestations.map((p) => `
        <div class="participant" style="margin-bottom:6px">
          <span class="name">${esc(p.libelle)}</span><strong>${eur(p.prix)}</strong>
          <button class="btn small" data-action="editPrestation" data-id="${p.id}">Modifier</button>
        </div>`).join('')}
      <button class="btn" data-action="editPrestation">+ Ajouter une prestation</button>
    </div>
    <div class="card">
      <h2>Sauvegarde des données</h2>
      <p class="muted small">Les données sont enregistrées dans ce navigateur, sur cet appareil. Pensez à faire une sauvegarde régulière (fichier), et utilisez « Restaurer » pour les transférer sur un autre appareil.</p>
      <div class="row">
        <button class="btn primary" data-action="exportData">⬇️ Sauvegarder (fichier)</button>
        <label class="btn">⬆️ Restaurer<input type="file" accept="application/json,.json" hidden data-on-change="importData"></label>
        <button class="btn" data-action="loadDemo">Charger des données de démonstration</button>
        <button class="btn danger" data-action="resetData">Tout effacer</button>
      </div>
      <p class="muted small" style="margin-top:8px">${DB.eleves.length} élèves · ${DB.seances.length} séances · ${DB.factures.length} factures · ${DB.paiements.length} paiements</p>
    </div>
  </div>`;
}

function openSimpleForm({ title, fields, values = {}, onSave, onDelete }) {
  openModal({
    title,
    body: `<form id="simple-form" class="form-grid" onsubmit="return false">
      ${fields.map((f) => `<label class="field ${f.full ? 'full' : ''}"><span>${esc(f.label)}</span>
        ${f.type === 'textarea' ? `<textarea name="${f.name}">${esc(values[f.name] ?? '')}</textarea>`
          : `<input name="${f.name}" type="${f.type || 'text'}" ${f.step ? `step="${f.step}"` : ''} ${f.required ? 'required' : ''} value="${esc(values[f.name] ?? f.default ?? '')}">`}
      </label>`).join('')}
    </form>`,
    foot: `${onDelete ? '<div class="left"><button class="btn danger" id="sf-del">Supprimer</button></div>' : ''}
      <button class="btn" data-action="closeModal">Annuler</button>
      <button class="btn primary" id="sf-save">Enregistrer</button>`,
    onMount: (m) => {
      $('#sf-save', m).addEventListener('click', () => {
        const form = $('#simple-form');
        if (!form.reportValidity()) return;
        onSave(formData(form));
        save(); closeModal(); render(); toast('Enregistré');
      });
      if (onDelete) $('#sf-del', m).addEventListener('click', () => { if (onDelete()) { save(); closeModal(); render(); } });
    },
  });
}

/* ---------------------------------------------------------------------
   Données de démonstration
   --------------------------------------------------------------------- */
function demoData() {
  const db = defaultState();
  db.ecoles = [
    { id: 'ec1', nom: 'Auto-école Centre', adresse: '12 rue de la République', cp: '69001', ville: 'Lyon', tel: '04 78 00 00 01', email: 'centre@exemple.fr', siret: '123 456 789 00011', agrement: 'E 01 069 0001 0', prefixe: 'CEN', compteur: 0, tva: 20, lieuPlateau: 'Piste moto - ZI Nord' },
    { id: 'ec2', nom: 'Auto-école Gare', adresse: '3 place de la Gare', cp: '69003', ville: 'Lyon', tel: '04 78 00 00 02', email: 'gare@exemple.fr', siret: '987 654 321 00022', agrement: 'E 02 069 0002 0', prefixe: 'GAR', compteur: 0, tva: 20, lieuPlateau: 'Piste moto - ZI Nord' },
  ];
  db.moniteurs = [
    { id: 'm1', prenom: 'Karim', nom: 'B.', tel: '06 00 00 00 01', couleur: '#f97316' },
    { id: 'm2', prenom: 'Julie', nom: 'D.', tel: '06 00 00 00 02', couleur: '#0ea5e9' },
  ];
  const noms = [['Martin', 'Lucas'], ['Bernard', 'Emma'], ['Petit', 'Nathan'], ['Durand', 'Léa'], ['Leroy', 'Hugo'], ['Moreau', 'Chloé'], ['Simon', 'Louis'], ['Laurent', 'Inès'], ['Michel', 'Adam'], ['Garcia', 'Sarah']];
  db.eleves = noms.map(([nom, prenom], i) => ({
    id: 'el' + i, nom, prenom, ecoleId: i % 2 ? 'ec2' : 'ec1', formation: i === 8 ? 'Passerelle A2 → A' : 'A2',
    tel: `06 12 34 56 ${pad(10 + i)}`, email: `${prenom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}.${nom.toLowerCase()}@exemple.fr`,
    adresse: `${i + 4} avenue des Lilas`, cp: '69007', ville: 'Lyon', naissance: `${1995 + i}-0${(i % 9) + 1}-15`,
    inscription: addDays(todayISO(), -60 + i * 3), neph: `1234567890${pad(i)}`, code: addDays(todayISO(), -90), heuresPrevues: 20,
    statut: 'en_cours', equipement: i % 3 === 0 ? 'Prêt casque T.M' : '', notes: '',
  }));
  const mon = mondayOf(todayISO());
  const add = (dayOffset, debut, fin, type, mid, eleves, statut) => {
    const date = addDays(mon, dayOffset);
    const st = statut || (date < todayISO() ? 'present' : 'prevu');
    db.seances.push({ id: uid(), date, debut, fin, type, moniteurId: mid, lieu: type === 'plateau' ? 'Piste moto - ZI Nord' : 'Départ agence', notes: '', eleves: eleves.map((e) => ({ eleveId: 'el' + e, statut: st })) });
  };
  // semaine précédente
  add(-7, '08:00', '10:00', 'plateau', 'm1', [0, 1, 2, 3, 4]);
  add(-7, '10:00', '12:00', 'circulation', 'm2', [5, 6, 7]);
  add(-6, '14:00', '16:00', 'circulation', 'm1', [0, 1]);
  add(-5, '08:00', '10:00', 'plateau', 'm2', [5, 6, 7, 8]);
  // semaine courante
  add(0, '08:00', '10:00', 'plateau', 'm1', [0, 2, 4, 6, 8]);
  add(0, '08:00', '10:00', 'circulation', 'm2', [1, 3, 5]);
  add(1, '10:00', '12:00', 'circulation', 'm1', [0, 1, 9]);
  add(1, '14:00', '16:00', 'plateau', 'm2', [2, 3, 7]);
  add(2, '09:00', '11:00', 'plateau', 'm1', [4, 5, 9]);
  add(3, '13:30', '15:30', 'circulation', 'm2', [6, 8]);
  add(4, '08:00', '10:00', 'plateau', 'm1', [0, 1, 2, 3]);
  add(4, '10:30', '12:30', 'circulation', 'm2', [4, 5, 7]);
  add(5, '09:00', '11:00', 'circulation', 'm1', [2, 9]);
  add(7, '08:00', '10:00', 'plateau', 'm1', [0, 1, 2, 3, 4]);
  add(8, '14:00', '16:00', 'circulation', 'm2', [0, 5, 6]);
  return db;
}

/* ---------------------------------------------------------------------
   Actions
   --------------------------------------------------------------------- */
const ACTIONS = {
  closeModal,
  weekPrev() { UI.weekStart = addDays(UI.weekStart, -7); render(); },
  weekNext() { UI.weekStart = addDays(UI.weekStart, 7); render(); },
  weekToday() { UI.weekStart = mondayOf(todayISO()); render(); },
  weekPick(d, el) { if (el.value) { UI.weekStart = mondayOf(el.value); render(); } },
  filtreMoniteur(d, el) { UI.filtreMoniteur = el.value; render(); },
  filtreEcole(d, el) { UI.filtreEcole = el.value; render(); },
  filtreStatutEleve(d, el) { UI.filtreStatutEleve = el.value; render(); },
  rechercheEleve(d, el) {
    UI.rechercheEleve = el.value;
    const pos = el.selectionStart;
    render();
    const inp = $('#search-eleve'); inp.focus(); inp.setSelectionRange(pos, pos);
  },
  ongletPaiements(d) { UI.ongletPaiements = d.o; render(); },

  /* Séances */
  newSeance(d) {
    if (!DB.moniteurs.length) return toast('Ajoutez d\'abord un moniteur dans Paramètres', true);
    const type = 'circulation';
    const date = d.date || (UI.weekStart <= todayISO() && todayISO() <= addDays(UI.weekStart, 6) ? todayISO() : UI.weekStart);
    const debut = DB.settings.heureDebut || '08:00';
    openSeance({
      type, date, debut, fin: defaultFin(debut, type),
      moniteurId: UI.filtreMoniteur || DB.moniteurs[0].id, lieu: '', notes: '',
      eleves: d.eleve ? [{ eleveId: d.eleve, statut: 'prevu' }] : [],
    });
  },
  editSeance(d) { const s = byId('seances', d.id); if (s) openSeance(s); },
  seanceType(d, el) {
    readSeanceForm();
    draftSeance.fin = defaultFin(draftSeance.debut, draftSeance.type);
    $('[name=fin]').value = draftSeance.fin;
    const ecole = DB.ecoles.find((e) => e.lieuPlateau);
    if (draftSeance.type === 'plateau' && !$('[name=lieu]').value && ecole) $('[name=lieu]').value = ecole.lieuPlateau;
    renderParticipants();
  },
  seanceDebut() {
    readSeanceForm();
    $('[name=fin]').value = defaultFin(draftSeance.debut, draftSeance.type);
    validateSeanceLive();
  },
  seanceAddEleve() {
    const id = $('#add-eleve').value;
    if (!id) return;
    readSeanceForm();
    if (draftSeance.eleves.length >= DB.settings.capacite[draftSeance.type]) return toast('Séance complète', true);
    draftSeance.eleves.push({ eleveId: id, statut: 'prevu' });
    renderParticipants();
  },
  seanceRemoveEleve(d) {
    const p = draftSeance.eleves[+d.i];
    if (p.factureId && !confirm('Cette leçon est déjà facturée pour cet élève. La retirer quand même ?')) return;
    draftSeance.eleves.splice(+d.i, 1);
    renderParticipants();
  },
  seancePartStatut(d, el) { draftSeance.eleves[+d.i].statut = el.value; },
  quickEleve() {
    readSeanceForm();
    const snapshot = draftSeance;
    openEleve({ ecoleId: DB.ecoles[0]?.id, formation: 'A2', statut: 'en_cours' }, {
      onSaved: (e) => {
        if (snapshot.eleves.length < DB.settings.capacite[snapshot.type]) snapshot.eleves.push({ eleveId: e.id, statut: 'prevu' });
        openSeance(snapshot);
        render();
      },
    });
  },
  saveSeance() {
    if (!$('#seance-form').reportValidity()) return;
    readSeanceForm();
    const { errors } = seanceConflicts(draftSeance);
    if (errors.length) { validateSeanceLive(); return toast(errors[0], true); }
    if (draftSeance.id) Object.assign(byId('seances', draftSeance.id), draftSeance);
    else { draftSeance.id = uid(); DB.seances.push(draftSeance); }
    save(); closeModal(); render(); toast('Séance enregistrée');
  },
  deleteSeance() {
    if (draftSeance.eleves.some((p) => p.factureId)) return toast('Impossible : des élèves de cette séance sont déjà facturés.', true);
    if (!confirm('Supprimer cette séance ?')) return;
    DB.seances = DB.seances.filter((s) => s.id !== draftSeance.id);
    save(); closeModal(); render(); toast('Séance supprimée');
  },
  duplicateSeance() {
    readSeanceForm();
    const copy = JSON.parse(JSON.stringify(draftSeance));
    copy.id = undefined;
    copy.date = addDays(copy.date, 7);
    copy.eleves = copy.eleves.map((p) => ({ eleveId: p.eleveId, statut: 'prevu' }));
    openSeance(copy);
    toast('Copie prête : vérifiez puis enregistrez');
  },

  /* Élèves */
  newEleve() { openEleve({ ecoleId: UI.filtreEcole || DB.ecoles[0]?.id, formation: 'A2', statut: 'en_cours' }); },
  editEleve(d) { openEleve(byId('eleves', d.id)); },
  openFiche(d) { go('eleves', { eleveOuvert: d.id }); },
  backEleves() { UI.eleveOuvert = null; render(); },
  deleteEleve(d) {
    const id = d.id;
    if (DB.factures.some((f) => f.eleveId === id) || DB.paiements.some((p) => p.eleveId === id)) {
      return toast("Cet élève a des factures ou paiements : passez-le plutôt en statut « Abandon » ou « Permis obtenu ».", true);
    }
    if (!confirm('Supprimer définitivement cet élève et le retirer de ses séances ?')) return;
    DB.eleves = DB.eleves.filter((e) => e.id !== id);
    for (const s of DB.seances) s.eleves = s.eleves.filter((p) => p.eleveId !== id);
    UI.eleveOuvert = null;
    save(); closeModal(); render(); toast('Élève supprimé');
  },
  carteRdv(d) { sendCarteRdv(d.id); },

  /* Factures */
  newFacture(d) {
    if (!DB.ecoles.length) return toast("Ajoutez d'abord une auto-école", true);
    const eleve = d.eleve ? byId('eleves', d.eleve) : null;
    const f = { eleveId: eleve?.id || '', ecoleId: eleve?.ecoleId || DB.ecoles[0].id, date: todayISO(), echeance: '', lignes: [], notes: '' };
    if (eleve) {
      for (const x of nonFactures(eleve.id)) if (x.part.statut !== 'prevu') f.lignes.push(ligneSeance(x.seance, eleve.id));
    }
    openFacture(f);
  },
  factureEleve(d, el) {
    const e = byId('eleves', el.value);
    draftFacture.eleveId = el.value;
    if (e) draftFacture.ecoleId = e.ecoleId;
    draftFacture.lignes = draftFacture.lignes.filter((l) => !l.seanceId);
    if (e) for (const x of nonFactures(e.id)) if (x.part.statut !== 'prevu') draftFacture.lignes.push(ligneSeance(x.seance, e.id));
    draftFacture.date = $('[name=date]').value;
    openFacture(draftFacture);
  },
  factureAddLecons() {
    const ids = $$('#dispo-lecons input:checked').map((i) => i.value);
    for (const id of ids) draftFacture.lignes.push(ligneSeance(byId('seances', id), draftFacture.eleveId));
    const form = formData($('#facture-form'));
    draftFacture.date = form.date; draftFacture.echeance = form.echeance;
    draftFacture.notes = $('#facture-notes').value;
    openFacture(draftFacture);
  },
  ligneEdit(d, el) {
    const l = draftFacture.lignes[+d.i];
    l[d.k] = d.k === 'libelle' ? el.value : el.value;
    $('#lt-' + d.i).textContent = eur((Number(l.qte) || 0) * (Number(l.pu) || 0));
    updateTotalFacture();
  },
  ligneDel(d) { draftFacture.lignes.splice(+d.i, 1); renderLignes(); },
  saveFacture,
  editFacture(d, el, ev) { if (ev.target.closest('[data-action="sendFacture"]')) return; openFacture(byId('factures', d.id)); },
  sendFacture(d, el, ev) { ev.stopPropagation(); sendFacture(d.id); },
  deleteFacture(d) {
    const f = byId('factures', d.id);
    if (DB.paiements.some((p) => p.factureId === f.id)) return toast('Des paiements sont liés à cette facture : supprimez-les ou détachez-les d\'abord.', true);
    if (!confirm(`Supprimer la facture ${f.numero} ?\n(Pour la comptabilité, préférez une facture d'avoir si elle a déjà été envoyée.)`)) return;
    for (const s of DB.seances) for (const p of s.eleves) if (p.factureId === f.id) delete p.factureId;
    DB.factures = DB.factures.filter((x) => x.id !== f.id);
    save(); closeModal(); render(); toast('Facture supprimée');
  },

  /* Paiements */
  newPaiement(d) { openPaiement({ eleveId: d.eleve || '', mode: 'CB' }); },
  editPaiement(d) { openPaiement(byId('paiements', d.id)); },
  deletePaiement(d) {
    if (!confirm('Supprimer ce paiement ?')) return;
    DB.paiements = DB.paiements.filter((p) => p.id !== d.id);
    save(); closeModal(); render(); toast('Paiement supprimé');
  },

  /* Paramètres */
  saveSettings() {
    const f = formData($('#settings-form'));
    const s = DB.settings;
    s.capacite.circulation = Math.max(1, parseInt(f.capCirc, 10) || 3);
    s.capacite.plateau = Math.max(1, parseInt(f.capPlateau, 10) || 5);
    s.tarifHeure.circulation = Number(f.tarifCirc) || 0;
    s.tarifHeure.plateau = Number(f.tarifPlateau) || 0;
    s.dureeDefaut.circulation = parseInt(f.dureeCirc, 10) || 120;
    s.dureeDefaut.plateau = parseInt(f.dureePlateau, 10) || 120;
    s.conditionsRdv = f.conditionsRdv;
    s.mentionsFacture = f.mentionsFacture;
    save(); render(); toast('Paramètres enregistrés');
  },
  editEcole(d) {
    const e = d.id ? byId('ecoles', d.id) : null;
    openSimpleForm({
      title: e ? "Modifier l'auto-école" : 'Nouvelle auto-école',
      values: e || { tva: 20, compteur: 0 },
      fields: [
        { name: 'nom', label: 'Nom *', required: true, full: true },
        { name: 'adresse', label: 'Adresse', full: true },
        { name: 'cp', label: 'Code postal' }, { name: 'ville', label: 'Ville' },
        { name: 'tel', label: 'Téléphone', type: 'tel' }, { name: 'email', label: 'E-mail', type: 'email' },
        { name: 'siret', label: 'SIRET' }, { name: 'agrement', label: 'N° agrément' },
        { name: 'prefixe', label: 'Préfixe des factures *', required: true },
        { name: 'compteur', label: 'Dernier n° de facture utilisé', type: 'number' },
        { name: 'tva', label: 'Taux TVA % (0 si non assujetti)', type: 'number', step: '0.1' },
        { name: 'lieuPlateau', label: 'Lieu du plateau (par défaut)' },
      ],
      onSave: (data) => {
        data.compteur = parseInt(data.compteur, 10) || 0;
        data.tva = Number(data.tva) || 0;
        if (e) Object.assign(e, data); else DB.ecoles.push({ id: uid(), ...data });
      },
      onDelete: e && (() => {
        if (DB.eleves.some((x) => x.ecoleId === e.id) || DB.factures.some((f) => f.ecoleId === e.id)) { toast('Des élèves ou factures sont rattachés à cette auto-école.', true); return false; }
        if (!confirm('Supprimer cette auto-école ?')) return false;
        DB.ecoles = DB.ecoles.filter((x) => x.id !== e.id); return true;
      }),
    });
  },
  editMoniteur(d) {
    const m = d.id ? byId('moniteurs', d.id) : null;
    openSimpleForm({
      title: m ? 'Modifier le moniteur' : 'Nouveau moniteur',
      values: m || { couleur: '#22c55e' },
      fields: [
        { name: 'prenom', label: 'Prénom *', required: true }, { name: 'nom', label: 'Nom' },
        { name: 'tel', label: 'Téléphone', type: 'tel' }, { name: 'couleur', label: 'Couleur dans le planning', type: 'color' },
      ],
      onSave: (data) => { if (m) Object.assign(m, data); else DB.moniteurs.push({ id: uid(), ...data }); },
      onDelete: m && (() => {
        if (DB.seances.some((s) => s.moniteurId === m.id)) { toast('Ce moniteur a des séances au planning.', true); return false; }
        if (!confirm('Supprimer ce moniteur ?')) return false;
        DB.moniteurs = DB.moniteurs.filter((x) => x.id !== m.id); return true;
      }),
    });
  },
  editPrestation(d) {
    const p = d.id ? byId('prestations', d.id) : null;
    openSimpleForm({
      title: p ? 'Modifier la prestation' : 'Nouvelle prestation',
      values: p || {},
      fields: [{ name: 'libelle', label: 'Libellé *', required: true, full: true }, { name: 'prix', label: 'Prix TTC (€)', type: 'number', step: '0.01', required: true }],
      onSave: (data) => { data.prix = Number(data.prix) || 0; if (p) Object.assign(p, data); else DB.prestations.push({ id: uid(), ...data }); },
      onDelete: p && (() => { if (!confirm('Supprimer cette prestation ?')) return false; DB.prestations = DB.prestations.filter((x) => x.id !== p.id); return true; }),
    });
  },
  exportData() {
    const blob = new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `moto-planning-sauvegarde-${todayISO()}.json`);
  },
  importData(d, el) {
    const file = el.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.eleves || !data.seances) throw new Error('fichier non reconnu');
        if (!confirm('Remplacer toutes les données actuelles par celles de la sauvegarde ?')) return;
        DB = migrate(data); save(); render(); toast('Données restaurées');
      } catch (err) { toast('Restauration impossible : ' + err.message, true); }
    };
    reader.readAsText(file);
  },
  loadDemo() {
    if (DB.eleves.length && !confirm('Remplacer les données actuelles par des données de démonstration ?')) return;
    DB = demoData(); save(); go('planning'); toast('Données de démonstration chargées');
  },
  resetData() {
    if (!confirm('Effacer TOUTES les données (élèves, planning, factures, paiements) ?')) return;
    if (!confirm('Vraiment tout effacer ? Cette action est irréversible.')) return;
    DB = defaultState(); save(); go('planning'); toast('Données effacées');
  },
};

/* ---------------------------------------------------------------------
   Démarrage
   --------------------------------------------------------------------- */
render();
if (!localStorage.getItem(STORAGE_KEY)) save();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
