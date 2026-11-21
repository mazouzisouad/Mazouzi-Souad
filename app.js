/* =====================================================================
   Moto Planning — planning moto multi-agences
   Planning en grille (comme AGX) : cliquer sur un créneau pour placer
   une leçon plateau (max 5) ou circulation (max 3), fiches élèves
   rattachées à une agence, factures, paiements, carte de RDV en PDF.
   Données enregistrées localement dans le navigateur (localStorage).
   ===================================================================== */
'use strict';

const STORAGE_KEY = 'motoplanning_v1';

const TYPES = {
  plateau: { label: 'Plateau', short: 'Plateau' },
  circulation: { label: 'Circulation', short: 'Circu' },
  exam_plateau: { label: 'Examen plateau', short: '🎓 Exam plateau', exam: true },
  exam_circulation: { label: 'Examen circulation', short: '🎓 Exam circu', exam: true },
};
const isExam = (type) => !!TYPES[type]?.exam;
const STATUTS_PRESENCE = { prevu: 'Prévu', present: 'Présent', absent: 'Absent (dû)', excuse: 'Excusé' };
const STATUTS_EXAMEN = { prevu: 'Prévu', admis: 'Admis ✅', ajourne: 'Ajourné ❌', absent: 'Absent' };
const statutsPour = (type) => (isExam(type) ? STATUTS_EXAMEN : STATUTS_PRESENCE);
const statutLabel = (type, st) => statutsPour(type)[st] || st;
const STATUTS_ELEVE = { en_cours: 'En formation', obtenu: 'Permis obtenu', abandon: 'Abandon' };
const FORMATIONS = ['A2', 'A', 'Passerelle A2 → A', 'Formation 125 cm³', 'Autre'];
const MODES_PAIEMENT = ['CB', 'Espèces', 'Chèque', 'Virement', 'CPF', 'Autre'];
const COULEURS_AGENCE = ['#f97316', '#16a34a', '#db2777', '#0891b2', '#ca8a04', '#7c3aed'];
const DUREES = [60, 90, 120, 150, 180, 240];

// Grille du planning
const ROW_H = 24; // hauteur (px) d'un créneau de 30 min

/* ---------------------------------------------------------------------
   Utilitaires
   --------------------------------------------------------------------- */
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const eur = (n) => round2(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
const eurPdf = (n) => round2(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/[  ]/g, ' ') + ' EUR';
const pad = (n) => String(n).padStart(2, '0');

function toISODate(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function parseISO(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function todayISO() { return toISODate(new Date()); }
function addDays(iso, n) { const d = parseISO(iso); d.setDate(d.getDate() + n); return toISODate(d); }
function mondayOf(iso) { const d = parseISO(iso); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return toISODate(d); }
function fmtDate(iso) { return iso ? parseISO(iso).toLocaleDateString('fr-FR') : ''; }
function fmtDayHead(iso) { return parseISO(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }); }
function fmtDayLong(iso) { return parseISO(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
function toMin(hhmm) { const [h, m] = (hhmm || '0:0').split(':').map(Number); return h * 60 + m; }
function fromMin(m) { return `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`; }
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
    version: 2,
    settings: {
      capacite: { circulation: 3, plateau: 5, exam_plateau: 8, exam_circulation: 3 },
      tarifHeure: { plateau: 45, circulation: 50 },
      tarifExamen: { exam_plateau: 90, exam_circulation: 120 },
      dureeDefaut: { plateau: 120, circulation: 120, exam_plateau: 180, exam_circulation: 180 },
      heureMin: '07:00',
      heureMax: '20:00',
      conditionsRdv: "Toute leçon non décommandée au moins 48 heures à l'avance sera due, sauf motif légitime justifié.",
      mentionsFacture: 'Paiement à réception. En cas de retard de paiement, indemnité forfaitaire pour frais de recouvrement : 40 €.',
    },
    entreprise: { nom: 'Mon auto-école', adresse: '', cp: '', ville: '', tel: '', email: '', siret: '', agrement: '', prefixe: 'F', compteur: 0, tva: 20 },
    agences: [{ id: uid(), nom: 'Agence 1', adresse: '', cp: '', ville: '', tel: '', couleur: COULEURS_AGENCE[0] }],
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
  // v1 -> v2 : les « auto-écoles » deviennent des agences d'une même entreprise
  if (db.ecoles && !db.agences) {
    const e0 = db.ecoles[0] || {};
    db.entreprise = { nom: e0.nom || def.entreprise.nom, adresse: e0.adresse || '', cp: e0.cp || '', ville: e0.ville || '', tel: e0.tel || '', email: e0.email || '', siret: e0.siret || '', agrement: e0.agrement || '', prefixe: e0.prefixe || 'F', compteur: db.ecoles.reduce((m, e) => Math.max(m, Number(e.compteur) || 0), 0), tva: e0.tva ?? 20 };
    db.agences = db.ecoles.map((e, i) => ({ id: e.id, nom: e.nom, adresse: e.adresse || '', cp: e.cp || '', ville: e.ville || '', tel: e.tel || '', couleur: COULEURS_AGENCE[i % COULEURS_AGENCE.length] }));
    for (const el of db.eleves || []) { el.agenceId = el.ecoleId; delete el.ecoleId; }
    for (const f of db.factures || []) { f.agenceId = f.ecoleId; delete f.ecoleId; }
    delete db.ecoles;
  }
  db.version = 2;
  db.settings = Object.assign({}, def.settings, db.settings || {});
  for (const k of ['capacite', 'tarifHeure', 'tarifExamen', 'dureeDefaut']) db.settings[k] = Object.assign({}, def.settings[k], db.settings[k] || {});
  db.entreprise = Object.assign({}, def.entreprise, db.entreprise || {});
  for (const k of ['agences', 'moniteurs', 'prestations', 'eleves', 'seances', 'factures', 'paiements']) db[k] = db[k] || [];
  if (!db.agences.length) db.agences = def.agences;
  for (const e of db.eleves) if (!STATUTS_ELEVE[e.statut]) e.statut = 'en_cours';
  return db;
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(DB)); }
  catch (e) { toast("Impossible d'enregistrer : " + e.message, true); }
}

const byId = (list, id) => DB[list].find((x) => x.id === id);
const triNom = (a, b) => `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, 'fr');
const eleveNom = (e) => (e ? `${e.prenom} ${e.nom}`.trim() : '—');
const eleveCourt = (e) => (e ? `${e.prenom} ${(e.nom || '').charAt(0).toUpperCase()}.` : '—');
const moniteurNom = (m) => (m ? `${m.prenom} ${m.nom}`.trim() : '—');
const agenceDe = (e) => (e ? byId('agences', e.agenceId) : null);
const agenceBadge = (a) => (a ? `<span class="badge agence" style="--c:${esc(a.couleur)}">${esc(a.nom)}</span>` : '');

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
    if (p.statut === 'present' && !isExam(s.type)) res[s.type] += durH(s);
    else if (p.statut === 'prevu' && s.date >= now) res.aVenir += durH(s);
  }
  return res;
}
// Résumé des examens d'un élève (admis / prochain / ajourné)
function eleveExamens(eid) {
  const out = {};
  for (const t of ['exam_plateau', 'exam_circulation']) {
    const list = eleveSeances(eid).filter((s) => s.type === t);
    const st = (s) => s.eleves.find((p) => p.eleveId === eid).statut;
    const admis = list.find((s) => st(s) === 'admis');
    const prevu = list.find((s) => s.date >= todayISO() && st(s) === 'prevu');
    const nbAjourne = list.filter((s) => st(s) === 'ajourne').length;
    if (admis) out[t] = { cls: 'ok', txt: `Admis le ${fmtDate(admis.date)}` };
    else if (prevu) out[t] = { cls: 'warn', txt: `Le ${fmtDate(prevu.date)} à ${prevu.debut}` };
    else if (nbAjourne) out[t] = { cls: 'bad', txt: `Ajourné${nbAjourne > 1 ? ` (${nbAjourne} fois)` : ''}` };
    else out[t] = { cls: '', txt: '—' };
  }
  return out;
}
function nonFactures(eid) {
  const out = [];
  for (const s of eleveSeances(eid)) {
    const p = s.eleves.find((x) => x.eleveId === eid);
    if (!p.factureId && p.statut !== 'excuse') out.push({ seance: s, part: p });
  }
  return out;
}
function rdvAVenir(eleveId) {
  const now = todayISO();
  return eleveSeances(eleveId).filter((s) => s.date >= now && s.eleves.find((p) => p.eleveId === eleveId).statut === 'prevu');
}

/* ---------------------------------------------------------------------
   Navigation
   --------------------------------------------------------------------- */
const UI = {
  view: 'planning',
  mode: 'jour', // 'jour' : colonnes = moniteurs ; 'semaine' : colonnes = jours (1 moniteur)
  date: todayISO(),
  moniteurSemaine: null,
  rechercheEleve: '',
  filtreAgence: '',
  voirAnciens: false,
  eleveOuvert: null,
  ongletFiche: 'lecons',
  ongletPaiements: 'factures',
  moisEnc: todayISO().slice(0, 7),
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
   PLANNING (grille horaire, comme AGX)
   --------------------------------------------------------------------- */
function viewPlanning() {
  if (!UI.moniteurSemaine || !byId('moniteurs', UI.moniteurSemaine)) UI.moniteurSemaine = DB.moniteurs[0]?.id || null;
  const semaine = UI.mode === 'semaine';
  const lundi = mondayOf(UI.date);

  let cols;
  if (semaine) {
    cols = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(lundi, i);
      return { date: d, mon: UI.moniteurSemaine, titre: fmtDayHead(d), today: d === todayISO() };
    });
  } else {
    cols = DB.moniteurs.map((m) => ({ date: UI.date, mon: m.id, titre: moniteurNom(m), couleur: m.couleur }));
  }

  const titre = semaine
    ? `Semaine du ${parseISO(lundi).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au ${parseISO(addDays(lundi, 6)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
    : fmtDayLong(UI.date);

  return `
  <div class="toolbar">
    <div class="seg">
      <button class="${!semaine ? 'on' : ''}" data-action="setMode" data-m="jour">Jour</button>
      <button class="${semaine ? 'on' : ''}" data-action="setMode" data-m="semaine">Semaine</button>
    </div>
    <button class="btn" data-action="navPrev" aria-label="Précédent">◀</button>
    <button class="btn" data-action="navToday">Aujourd'hui</button>
    <button class="btn" data-action="navNext" aria-label="Suivant">▶</button>
    <input type="date" value="${UI.date}" data-on-change="navPick" style="width:auto">
    <h1 class="cap">${esc(titre)}</h1>
  </div>
  ${semaine ? `<div class="seg" style="margin-bottom:10px">
      ${DB.moniteurs.map((m) => `<button class="${UI.moniteurSemaine === m.id ? 'on' : ''}" data-action="setMonSemaine" data-id="${m.id}"><span class="dot" style="background:${esc(m.couleur)}"></span>${esc(moniteurNom(m))}</button>`).join('')}
    </div>` : ''}
  ${DB.moniteurs.length ? agendaGrid(cols) : '<div class="card empty">Ajoutez vos moniteurs dans Paramètres.</div>'}
  <p class="muted small" style="margin-top:8px">Cliquez sur une case vide pour placer une leçon ou un examen · Cliquez dessus pour ajouter un élève, noter les présences ou les résultats.
  &nbsp; ${DB.agences.length > 1 ? DB.agences.map((a) => `<span class="dot" style="background:${esc(a.couleur)}"></span>${esc(a.nom)}`).join(' &nbsp; ') : ''}</p>`;
}

function agendaGrid(cols) {
  const hMin = toMin(DB.settings.heureMin);
  const hMax = toMin(DB.settings.heureMax);
  const nSlots = Math.ceil((hMax - hMin) / 30);
  const H = nSlots * ROW_H;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const times = [];
  for (let t = hMin; t < hMax; t += 60) times.push(`<div class="ag-time" style="height:${ROW_H * 2}px">${pad(Math.floor(t / 60))}h</div>`);

  return `
  <div class="agenda-wrap" id="agenda">
    <div class="agenda" style="--cols:${cols.length}">
      <div class="ag-corner"></div>
      ${cols.map((c) => {
        const ss = DB.seances.filter((s) => s.date === c.date && s.moniteurId === c.mon);
        const h = ss.reduce((n, s) => n + durH(s), 0);
        return `<div class="ag-colhead ${c.today ? 'today' : ''}">
          ${c.couleur ? `<span class="dot" style="background:${esc(c.couleur)}"></span>` : ''}<strong class="cap">${esc(c.titre)}</strong>
          <div class="muted small">${ss.length ? `${ss.length} leçon${ss.length > 1 ? 's' : ''} · ${fmtH(h)}` : '—'}</div>
        </div>`;
      }).join('')}
      <div class="ag-times">${times.join('')}</div>
      ${cols.map((c) => {
        let slots = '';
        for (let i = 0; i < nSlots; i++) {
          const t = fromMin(hMin + i * 30);
          slots += `<div class="ag-slot ${i % 2 ? 'half' : ''}" style="height:${ROW_H}px" data-action="slot" data-date="${c.date}" data-mon="${c.mon}" data-t="${t}"></div>`;
        }
        const blocks = DB.seances
          .filter((s) => s.date === c.date && s.moniteurId === c.mon)
          .map((s) => blocSeance(s, hMin)).join('');
        const line = c.date === todayISO() && nowMin >= hMin && nowMin <= hMax
          ? `<div class="ag-now" style="top:${((nowMin - hMin) / 30) * ROW_H}px"></div>` : '';
        return `<div class="ag-col" style="height:${H}px">${slots}${blocks}${line}</div>`;
      }).join('')}
    </div>
  </div>`;
}

function blocSeance(s, hMin) {
  const top = ((toMin(s.debut) - hMin) / 30) * ROW_H;
  const height = Math.max(ROW_H, ((toMin(s.fin) - toMin(s.debut)) / 30) * ROW_H) - 2;
  const cap = DB.settings.capacite[s.type];
  const n = s.eleves.length;
  const noms = s.eleves.map((p) => {
    const e = byId('eleves', p.eleveId);
    const a = agenceDe(e);
    const barre = p.statut === 'absent' || p.statut === 'excuse';
    const res = p.statut === 'admis' ? ' ✅' : p.statut === 'ajourne' ? ' ❌' : '';
    return `<div class="ag-el ${barre ? 'abs' : ''}"><span class="dot" style="background:${esc(a?.couleur || '#94a3b8')}"></span>${esc(eleveCourt(e))}${res}</div>`;
  }).join('');
  return `
  <div class="ag-bloc ${s.type}" style="top:${top + 1}px;height:${height}px" data-action="editSeance" data-id="${s.id}">
    <div class="ag-bloc-top"><span>${s.debut} ${TYPES[s.type].short}</span><span class="fill ${n >= cap ? 'full' : 'free'}">${n}/${cap}</span></div>
    <div class="ag-els">${noms}</div>
    ${isExam(s.type) && s.lieu ? `<div class="ag-lieu">📍 ${esc(s.lieu)}</div>` : ''}
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
   Placer / modifier une leçon
   --------------------------------------------------------------------- */
let draft = null;

function openSeance(seance) {
  draft = JSON.parse(JSON.stringify(seance));
  const isNew = !draft.id;
  const m = byId('moniteurs', draft.moniteurId);
  openModal({
    title: isNew ? 'Placer sur le planning' : (isExam(draft.type) ? 'Examen' : 'Leçon'),
    body: `
      <div class="row" style="margin-bottom:12px">
        <input type="date" id="s-date" value="${draft.date}" style="width:auto">
        <input type="time" id="s-debut" value="${draft.debut}" step="900" style="width:auto">
        <select id="s-mon" style="width:auto">
          ${DB.moniteurs.map((x) => `<option value="${x.id}" ${x.id === m?.id ? 'selected' : ''}>${esc(moniteurNom(x))}</option>`).join('')}
        </select>
      </div>
      <div class="lbl">Type</div>
      <div class="seg big types" id="s-type">
        ${Object.entries(TYPES).map(([k, t]) => `<button data-action="setType" data-t="${k}" class="${draft.type === k ? 'on' : ''} ${k}">${t.exam ? '🎓 ' : ''}${t.label}<small>${t.exam ? 'accompagnement · ' : ''}max ${DB.settings.capacite[k]}</small></button>`).join('')}
      </div>
      <div id="s-lieu-wrap">
        <div class="lbl">Centre d'examen</div>
        <input id="s-lieu" value="${esc(draft.lieu || '')}" placeholder="Ex : centre d'examen de …" list="lieux-exam">
        <datalist id="lieux-exam">${[...new Set(DB.seances.filter((x) => isExam(x.type)).map((x) => x.lieu).filter(Boolean))].map((l) => `<option value="${esc(l)}">`).join('')}</datalist>
      </div>
      <div class="lbl">Durée</div>
      <div class="seg" id="s-duree"></div>
      <div class="lbl row between"><span>Élèves <span id="s-cap" class="fill"></span></span></div>
      <div id="s-eleves" class="chips"></div>
      <div id="s-picker">
        <input id="s-search" placeholder="🔍 Tapez le nom de l'élève…" autocomplete="off" data-on-input="searchEleve">
        <div id="s-results" class="results"></div>
      </div>
      <div id="s-errors" style="margin-top:10px"></div>`,
    foot: `
      ${!isNew ? `<div class="left"><button class="btn danger" data-action="deleteSeance">Supprimer</button><button class="btn" data-action="duplicateSeance" title="Même leçon la semaine suivante">Copier à +7 j</button></div>` : ''}
      <button class="btn" data-action="closeModal">Annuler</button>
      <button class="btn primary" data-action="saveSeance">${isNew ? 'Placer sur le planning' : 'Enregistrer'}</button>`,
    onMount: (mod) => {
      ['#s-date', '#s-debut', '#s-mon'].forEach((sel) => $(sel, mod).addEventListener('change', () => { readDraft(); refreshDraft(); }));
      refreshDraft();
      if (isNew) setTimeout(() => $('#s-search')?.focus(), 50);
    },
  });
}

function readDraft() {
  const dur = toMin(draft.fin) - toMin(draft.debut);
  draft.date = $('#s-date').value;
  draft.debut = $('#s-debut').value || draft.debut;
  draft.fin = fromMin(toMin(draft.debut) + dur);
  draft.moniteurId = $('#s-mon').value;
  if (isExam(draft.type) && $('#s-lieu')) draft.lieu = $('#s-lieu').value.trim();
}

function refreshDraft() {
  const cap = DB.settings.capacite[draft.type];
  const n = draft.eleves.length;
  const dur = toMin(draft.fin) - toMin(draft.debut);
  $$('#s-type button').forEach((b) => b.classList.toggle('on', b.dataset.t === draft.type));
  $('#s-lieu-wrap').hidden = !isExam(draft.type);
  $('#s-duree').innerHTML = DUREES.map((d) => `<button data-action="setDuree" data-d="${d}" class="${d === dur ? 'on' : ''}">${fmtH(d / 60)}</button>`).join('')
    + `<span class="muted small" style="align-self:center;margin-left:8px">${draft.debut} → ${draft.fin}</span>`;
  const capEl = $('#s-cap');
  capEl.textContent = `${n}/${cap}`;
  capEl.className = 'fill ' + (n >= cap ? 'full' : 'free');

  $('#s-eleves').innerHTML = n ? draft.eleves.map((p, i) => {
    const e = byId('eleves', p.eleveId);
    const a = agenceDe(e);
    return `<div class="chip-row">
      <span class="dot" style="background:${esc(a?.couleur || '#94a3b8')}"></span>
      <span class="name">${esc(eleveNom(e))} <span class="muted small">${esc(a?.nom || '')}</span></span>
      <select data-on-change="setPresence" data-i="${i}" class="presence ${p.statut}">
        ${Object.entries(statutsPour(draft.type)).map(([k, l]) => `<option value="${k}" ${p.statut === k ? 'selected' : ''}>${l}</option>`).join('')}
      </select>
      <button class="btn small ghost" data-action="removeEleve" data-i="${i}" title="Retirer">✕</button>
    </div>`;
  }).join('') : '<div class="muted small">Aucun élève pour l\'instant.</div>';

  $('#s-picker').hidden = n >= cap;
  renderResults();

  const { errors } = seanceConflicts(draft);
  $('#s-errors').innerHTML = errors.map((e) => `<div class="alert bad">⛔ ${esc(e)}</div>`).join('');
}

function renderResults() {
  const box = $('#s-results');
  if (!box) return;
  const q = ($('#s-search')?.value || '').trim().toLowerCase();
  const inscrits = new Set(draft.eleves.map((p) => p.eleveId));
  const occupes = new Set();
  for (const o of DB.seances) if (o.id !== draft.id && overlaps(o, draft)) o.eleves.forEach((p) => occupes.add(p.eleveId));
  let list = DB.eleves.filter((e) => e.statut === 'en_cours' && !inscrits.has(e.id));
  if (q) list = list.filter((e) => `${e.nom} ${e.prenom} ${e.prenom} ${e.nom} ${e.tel}`.toLowerCase().includes(q));
  list.sort(triNom);
  if (!q && list.length > 6) list = list.slice(0, 6);
  else list = list.slice(0, 12);
  box.innerHTML = list.map((e) => {
    const a = agenceDe(e);
    const busy = occupes.has(e.id);
    return `<button class="result" data-action="pickEleve" data-id="${e.id}" ${busy ? 'disabled title="Déjà en leçon à cette heure"' : ''}>
      <span class="dot" style="background:${esc(a?.couleur || '#94a3b8')}"></span>
      <strong>${esc(e.nom.toUpperCase())}</strong> ${esc(e.prenom)}
      <span class="muted small">${esc(a?.nom || '')}${busy ? ' · déjà pris' : ''}</span>
    </button>`;
  }).join('') + `<button class="result add" data-action="quickEleve">＋ Nouvel élève${q ? ` « ${esc(q)} »` : ''}</button>`;
}

function seanceConflicts(s) {
  const errors = [];
  const cap = DB.settings.capacite[s.type];
  if (!s.date) errors.push('Choisissez une date.');
  if (s.eleves.length > cap) errors.push(`${s.eleves.length} élèves pour ${cap} places maximum en ${TYPES[s.type].label.toLowerCase()}.`);
  for (const o of DB.seances.filter((x) => x.id !== s.id && overlaps(x, s))) {
    if (o.moniteurId === s.moniteurId) errors.push(`${moniteurNom(byId('moniteurs', s.moniteurId))} a déjà une leçon de ${o.debut} à ${o.fin}.`);
    for (const p of s.eleves) {
      if (o.eleves.some((x) => x.eleveId === p.eleveId)) errors.push(`${eleveNom(byId('eleves', p.eleveId))} est déjà en leçon de ${o.debut} à ${o.fin}.`);
    }
  }
  return { errors };
}

/* ---------------------------------------------------------------------
   ÉLÈVES
   --------------------------------------------------------------------- */
function viewEleves() {
  const q = UI.rechercheEleve.toLowerCase();
  const list = DB.eleves
    .filter((e) => UI.voirAnciens || e.statut === 'en_cours')
    .filter((e) => !UI.filtreAgence || e.agenceId === UI.filtreAgence)
    .filter((e) => !q || `${e.nom} ${e.prenom} ${e.prenom} ${e.nom} ${e.tel}`.toLowerCase().includes(q))
    .sort(triNom);

  return `
  <div class="toolbar">
    <h1>Élèves</h1>
    <div class="spacer"></div>
    <input type="search" placeholder="🔍 Rechercher" value="${esc(UI.rechercheEleve)}" data-on-input="rechercheEleve" style="max-width:220px" id="search-eleve">
    ${agenceSelect(UI.filtreAgence, 'filtreAgence')}
    <button class="btn primary" data-action="newEleve">+ Nouvel élève</button>
  </div>
  ${list.length ? `
  <div class="table-wrap"><table>
    <thead><tr><th>Élève</th><th>Agence</th><th>Téléphone</th><th>Prochaine leçon</th><th class="num">Reste dû</th></tr></thead>
    <tbody>
    ${list.map((e) => {
      const fin = eleveFinances(e.id);
      const next = rdvAVenir(e.id)[0];
      return `<tr class="clickable" data-action="openFiche" data-id="${e.id}">
        <td><strong>${esc(e.nom.toUpperCase())}</strong> ${esc(e.prenom)}${e.statut !== 'en_cours' ? ` <span class="badge">${esc(STATUTS_ELEVE[e.statut])}</span>` : ''}</td>
        <td>${agenceBadge(agenceDe(e))}</td>
        <td>${esc(e.tel || '')}</td>
        <td>${next ? `${fmtDate(next.date)} ${next.debut} · ${TYPES[next.type].short}` : '<span class="muted">—</span>'}</td>
        <td class="num">${fin.solde > 0 ? `<span class="badge bad">${eur(fin.solde)}</span>` : '<span class="muted">—</span>'}</td>
      </tr>`;
    }).join('')}
    </tbody></table></div>` : `<div class="card empty">Aucun élève. <br><br><button class="btn primary" data-action="newEleve">+ Ajouter un élève</button></div>`}
  <label class="row small muted" style="margin-top:10px;gap:6px"><input type="checkbox" style="width:auto" data-on-change="voirAnciens" ${UI.voirAnciens ? 'checked' : ''}> Afficher aussi les anciens élèves (permis obtenu, abandon)</label>`;
}

function agenceSelect(val, handler, withAll = true) {
  if (DB.agences.length < 2 && withAll) return '';
  return `<select data-on-change="${handler}" style="width:auto">
    ${withAll ? '<option value="">Toutes les agences</option>' : ''}
    ${DB.agences.map((a) => `<option value="${a.id}" ${val === a.id ? 'selected' : ''}>${esc(a.nom)}</option>`).join('')}
  </select>`;
}

function viewFiche(id) {
  const e = byId('eleves', id);
  if (!e) { UI.eleveOuvert = null; return viewEleves(); }
  const a = agenceDe(e);
  const h = eleveHeures(id);
  const fin = eleveFinances(id);
  const ex = eleveExamens(id);
  const o = UI.ongletFiche;

  let contenu = '';
  if (o === 'lecons') {
    const ss = eleveSeances(id).slice().reverse();
    contenu = ss.length ? `<div class="table-wrap"><table>
      <thead><tr><th>Date</th><th>Heure</th><th>Type</th><th>Moniteur</th><th>Présence / résultat</th></tr></thead>
      <tbody>${ss.map((s) => {
        const p = s.eleves.find((x) => x.eleveId === id);
        const cls = { present: 'ok', admis: 'ok', absent: 'bad', ajourne: 'bad', excuse: 'warn', prevu: '' }[p.statut];
        return `<tr class="clickable" data-action="editSeance" data-id="${s.id}">
          <td>${fmtDate(s.date)}</td><td>${s.debut}–${s.fin}</td>
          <td><span class="badge ${s.type}">${TYPES[s.type].short}</span></td>
          <td>${esc(moniteurNom(byId('moniteurs', s.moniteurId)))}</td>
          <td><span class="badge ${cls}">${statutLabel(s.type, p.statut)}</span></td></tr>`;
      }).join('')}</tbody></table></div>` : '<div class="empty">Aucune leçon. Placez-la depuis le planning.</div>';
  } else if (o === 'compte') {
    const factures = DB.factures.filter((f) => f.eleveId === id).sort((x, y) => y.date.localeCompare(x.date));
    const paiements = DB.paiements.filter((p) => p.eleveId === id).sort((x, y) => y.date.localeCompare(x.date));
    contenu = `
      <div class="row" style="margin-bottom:10px">
        <button class="btn" data-action="newFacture" data-eleve="${id}">🧾 Faire une facture</button>
        <button class="btn" data-action="newPaiement" data-eleve="${id}">💶 Encaisser</button>
      </div>
      <h3>Factures</h3>${factures.length ? facturesTable(factures, false) : '<p class="muted">Aucune facture.</p>'}
      <h3 style="margin-top:14px">Paiements</h3>${paiements.length ? paiementsTable(paiements, false) : '<p class="muted">Aucun paiement.</p>'}`;
  } else {
    contenu = `<dl class="kv">
      <dt>Agence</dt><dd>${esc(a?.nom || '—')}</dd>
      <dt>Formation</dt><dd>${esc(e.formation || '—')}</dd>
      <dt>Téléphone</dt><dd>${e.tel ? `<a href="tel:${esc(e.tel)}">${esc(e.tel)}</a>` : '—'}</dd>
      <dt>E-mail</dt><dd>${e.email ? `<a href="mailto:${esc(e.email)}">${esc(e.email)}</a>` : '—'}</dd>
      <dt>Adresse</dt><dd>${esc([e.adresse, [e.cp, e.ville].filter(Boolean).join(' ')].filter(Boolean).join(', ') || '—')}</dd>
      <dt>Naissance</dt><dd>${e.naissance ? fmtDate(e.naissance) : '—'}</dd>
      <dt>N° NEPH</dt><dd>${esc(e.neph || '—')}</dd>
      <dt>Code obtenu le</dt><dd>${e.code ? fmtDate(e.code) : '—'}</dd>
      <dt>Statut</dt><dd>${esc(STATUTS_ELEVE[e.statut] || '')}</dd>
      <dt>Notes</dt><dd>${esc(e.notes || '—').replace(/\n/g, '<br>')}</dd>
    </dl>
    <button class="btn" style="margin-top:12px" data-action="editEleve" data-id="${id}">✏️ Modifier</button>`;
  }

  return `
  <div class="toolbar">
    <button class="btn" data-action="backEleves">◀ Élèves</button>
  </div>
  <div class="card">
    <div class="fiche-head">
      <div>
        <h1>${esc(e.prenom)} ${esc(e.nom.toUpperCase())}</h1>
        <div class="row" style="margin-top:4px">${agenceBadge(a)} <span class="muted">${esc(e.formation || '')}</span>
          ${e.tel ? `<a class="muted" href="tel:${esc(e.tel)}">📞 ${esc(e.tel)}</a>` : ''}</div>
      </div>
      <div class="row">
        <button class="btn" data-action="carteRdv" data-id="${id}">📇 Carte de RDV</button>
        <button class="btn" data-action="editEleve" data-id="${id}">✏️</button>
      </div>
    </div>
    <div class="mini-stats">
      <div><span>Plateau</span><strong>${fmtH(h.plateau)}</strong></div>
      <div><span>Circulation</span><strong>${fmtH(h.circulation)}</strong></div>
      <div><span>À venir</span><strong>${fmtH(h.aVenir)}</strong></div>
      <div><span>Examen plateau</span><strong class="exam-res ${ex.exam_plateau.cls}">${ex.exam_plateau.txt}</strong></div>
      <div><span>Examen circulation</span><strong class="exam-res ${ex.exam_circulation.cls}">${ex.exam_circulation.txt}</strong></div>
      <div><span>Reste dû</span><strong style="color:${fin.solde > 0 ? 'var(--bad)' : 'var(--ok)'}">${eur(Math.max(0, fin.solde))}</strong></div>
    </div>
    <div class="seg" style="margin:14px 0 12px">
      <button class="${o === 'lecons' ? 'on' : ''}" data-action="ongletFiche" data-o="lecons">Leçons</button>
      <button class="${o === 'compte' ? 'on' : ''}" data-action="ongletFiche" data-o="compte">Compte</button>
      <button class="${o === 'infos' ? 'on' : ''}" data-action="ongletFiche" data-o="infos">Infos</button>
    </div>
    ${contenu}
  </div>`;
}

function openEleve(eleve, { onSaved, onCancel } = {}) {
  const isNew = !eleve.id;
  const e = eleve;
  openModal({
    title: isNew ? 'Nouvel élève' : 'Modifier l\'élève',
    body: `
    <form id="eleve-form" class="form-grid" onsubmit="return false">
      <label class="field"><span>Nom *</span><input name="nom" value="${esc(e.nom || '')}" required></label>
      <label class="field"><span>Prénom *</span><input name="prenom" value="${esc(e.prenom || '')}" required></label>
      <label class="field"><span>Agence d'inscription *</span>
        <select name="agenceId">${DB.agences.map((x) => `<option value="${x.id}" ${e.agenceId === x.id ? 'selected' : ''}>${esc(x.nom)}</option>`).join('')}</select></label>
      <label class="field"><span>Formation</span>
        <select name="formation">${FORMATIONS.map((x) => `<option ${e.formation === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></label>
      <label class="field"><span>Téléphone</span><input name="tel" type="tel" value="${esc(e.tel || '')}"></label>
      <label class="field"><span>E-mail</span><input name="email" type="email" value="${esc(e.email || '')}"></label>
      <details class="full" ${isNew ? '' : 'open'}>
        <summary class="muted">Plus d'informations (adresse, NEPH, code…)</summary>
        <div class="form-grid" style="margin-top:10px">
          <label class="field full"><span>Adresse</span><input name="adresse" value="${esc(e.adresse || '')}"></label>
          <label class="field"><span>Code postal</span><input name="cp" value="${esc(e.cp || '')}"></label>
          <label class="field"><span>Ville</span><input name="ville" value="${esc(e.ville || '')}"></label>
          <label class="field"><span>Date de naissance</span><input name="naissance" type="date" value="${esc(e.naissance || '')}"></label>
          <label class="field"><span>N° NEPH</span><input name="neph" value="${esc(e.neph || '')}"></label>
          <label class="field"><span>Code obtenu le</span><input name="code" type="date" value="${esc(e.code || '')}"></label>
          <label class="field"><span>Statut</span>
            <select name="statut">${Object.entries(STATUTS_ELEVE).map(([k, l]) => `<option value="${k}" ${(e.statut || 'en_cours') === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
          <label class="field full"><span>Notes</span><textarea name="notes">${esc(e.notes || '')}</textarea></label>
        </div>
      </details>
    </form>`,
    foot: `
      ${!isNew ? `<div class="left"><button class="btn danger" data-action="deleteEleve" data-id="${e.id}">Supprimer</button></div>` : ''}
      <button class="btn" id="cancel-eleve">Annuler</button>
      <button class="btn primary" id="save-eleve">Enregistrer</button>`,
    onMount: (m) => {
      $('#cancel-eleve', m).addEventListener('click', () => { closeModal(); if (onCancel) onCancel(); });
      $('#save-eleve', m).addEventListener('click', () => {
        const form = $('#eleve-form');
        if (!form.reportValidity()) return;
        const data = formData(form);
        let target;
        if (isNew) { target = { id: uid(), inscription: todayISO(), ...data }; DB.eleves.push(target); }
        else { target = byId('eleves', e.id); Object.assign(target, data); }
        save();
        closeModal();
        toast('Élève enregistré');
        if (onSaved) onSaved(target); else { if (isNew) { UI.eleveOuvert = target.id; UI.ongletFiche = 'lecons'; } render(); }
      });
    },
  });
}

/* ---------------------------------------------------------------------
   PAIEMENTS
   --------------------------------------------------------------------- */
function facturesTable(list, withEleve = true) {
  return `<div class="table-wrap"><table>
    <thead><tr><th>N°</th><th>Date</th>${withEleve ? '<th>Élève</th>' : ''}<th class="num">Montant</th><th>Statut</th><th></th></tr></thead>
    <tbody>${list.map((f) => {
      const t = factureTotaux(f);
      const st = factureStatut(f);
      return `<tr class="clickable" data-action="editFacture" data-id="${f.id}">
        <td><strong>${esc(f.numero)}</strong></td>
        <td>${fmtDate(f.date)}</td>
        ${withEleve ? `<td>${esc(eleveNom(byId('eleves', f.eleveId)))}</td>` : ''}
        <td class="num">${eur(t.ttc)}</td>
        <td><span class="badge ${st.key}">${st.label}</span></td>
        <td class="num"><button class="btn small" data-action="sendFacture" data-id="${f.id}" title="Envoyer">📤 Envoyer</button></td>
      </tr>`;
    }).join('')}</tbody></table></div>`;
}

function paiementsTable(list, withEleve = true) {
  return `<div class="table-wrap"><table>
    <thead><tr><th>Date</th>${withEleve ? '<th>Élève</th>' : ''}<th>Mode</th><th class="num">Montant</th></tr></thead>
    <tbody>${list.map((p) => `
      <tr class="clickable" data-action="editPaiement" data-id="${p.id}">
        <td>${fmtDate(p.date)}</td>
        ${withEleve ? `<td>${esc(eleveNom(byId('eleves', p.eleveId)))}</td>` : ''}
        <td>${esc(p.mode)}${p.reference ? ` <span class="muted small">${esc(p.reference)}</span>` : ''}</td>
        <td class="num"><strong>${eur(p.montant)}</strong></td>
      </tr>`).join('')}</tbody></table></div>`;
}

function viewPaiements() {
  const okAgence = (eid) => !UI.filtreAgence || byId('eleves', eid)?.agenceId === UI.filtreAgence;
  const factures = DB.factures.filter((f) => okAgence(f.eleveId)).sort((a, b) => (b.date + b.numero).localeCompare(a.date + a.numero));
  const paiements = DB.paiements.filter((p) => okAgence(p.eleveId)).sort((a, b) => b.date.localeCompare(a.date));
  const encMois = paiements.filter((p) => p.date.startsWith(todayISO().slice(0, 7))).reduce((s, p) => s + Number(p.montant || 0), 0);
  const impayes = factures.reduce((s, f) => s + Math.max(0, factureTotaux(f).ttc - facturePaye(f)), 0);
  const o = UI.ongletPaiements;

  let contenu = '';
  if (o === 'factures') contenu = factures.length ? facturesTable(factures) : '<div class="card empty">Aucune facture.</div>';
  else if (o === 'encaissements') {
    const duMois = paiements.filter((p) => p.date.startsWith(UI.moisEnc));
    const parMode = {};
    for (const p of duMois) parMode[p.mode] = (parMode[p.mode] || 0) + Number(p.montant || 0);
    contenu = `
      <div class="row" style="margin-bottom:10px">
        <input type="month" value="${UI.moisEnc}" data-on-change="moisEnc" style="width:auto">
        <strong>Total : ${eur(duMois.reduce((s, p) => s + Number(p.montant || 0), 0))}</strong>
        <span class="muted small">${Object.entries(parMode).map(([k, v]) => `${esc(k)} ${eur(v)}`).join(' · ')}</span>
      </div>
      ${duMois.length ? paiementsTable(duMois) : '<div class="card empty">Aucun paiement ce mois-ci.</div>'}`;
  } else {
    const rows = DB.eleves.filter((e) => !UI.filtreAgence || e.agenceId === UI.filtreAgence)
      .map((e) => ({ e, f: eleveFinances(e.id), nf: nonFactures(e.id).filter((x) => x.part.statut !== 'prevu').length }))
      .filter((r) => r.f.solde > 0 || r.nf > 0)
      .sort((a, b) => b.f.solde - a.f.solde);
    contenu = rows.length ? `<div class="table-wrap"><table>
      <thead><tr><th>Élève</th><th>Agence</th><th class="num">Reste dû</th><th class="num">Leçons pas encore facturées</th></tr></thead>
      <tbody>${rows.map(({ e, f, nf }) => `
        <tr class="clickable" data-action="openFicheCompte" data-id="${e.id}">
          <td><strong>${esc(e.nom.toUpperCase())}</strong> ${esc(e.prenom)}</td>
          <td>${agenceBadge(agenceDe(e))}</td>
          <td class="num">${f.solde > 0 ? `<span class="badge bad">${eur(f.solde)}</span>` : '—'}</td>
          <td class="num">${nf || '—'}</td>
        </tr>`).join('')}</tbody></table></div>` : '<div class="card empty">Tout est à jour 👍</div>';
  }

  return `
  <div class="toolbar">
    <h1>Paiements</h1>
    <div class="spacer"></div>
    ${agenceSelect(UI.filtreAgence, 'filtreAgence')}
    <button class="btn" data-action="newFacture">🧾 Facture</button>
    <button class="btn primary" data-action="newPaiement">💶 Encaisser</button>
  </div>
  <div class="mini-stats card" style="margin-bottom:14px">
    <div><span>Encaissé ce mois</span><strong>${eur(encMois)}</strong></div>
    <div><span>Reste à encaisser</span><strong style="color:var(--bad)">${eur(impayes)}</strong></div>
  </div>
  <div class="seg" style="margin-bottom:12px">
    <button class="${o === 'factures' ? 'on' : ''}" data-action="ongletPaiements" data-o="factures">Factures</button>
    <button class="${o === 'encaissements' ? 'on' : ''}" data-action="ongletPaiements" data-o="encaissements">Encaissements</button>
    <button class="${o === 'aregler' ? 'on' : ''}" data-action="ongletPaiements" data-o="aregler">À régler</button>
  </div>
  ${contenu}`;
}

/* ---------------------------------------------------------------------
   Factures
   --------------------------------------------------------------------- */
let draftFacture = null;

function ligneSeance(s, eleveId) {
  const p = s.eleves.find((x) => x.eleveId === eleveId);
  if (isExam(s.type)) {
    return { libelle: `Accompagnement ${TYPES[s.type].label.toLowerCase()} du ${fmtDate(s.date)}${s.lieu ? ' - ' + s.lieu : ''}`, qte: 1, pu: DB.settings.tarifExamen[s.type] || 0, seanceId: s.id };
  }
  return {
    libelle: `Leçon ${TYPES[s.type].label.toLowerCase()} du ${fmtDate(s.date)} ${s.debut}-${s.fin}${p?.statut === 'absent' ? ' (absence non excusée)' : ''}`,
    qte: round2(durH(s)),
    pu: DB.settings.tarifHeure[s.type] || 0,
    seanceId: s.id,
  };
}

function openFacture(f) {
  const isNew = !f.id;
  draftFacture = JSON.parse(JSON.stringify(f));
  const eleve = byId('eleves', draftFacture.eleveId);
  const dispo = draftFacture.eleveId ? nonFactures(draftFacture.eleveId).filter((x) => !draftFacture.lignes.some((l) => l.seanceId === x.seance.id)) : [];

  openModal({
    title: isNew ? 'Nouvelle facture' : `Facture ${esc(f.numero)}`,
    wide: true,
    body: `
    <form id="facture-form" class="form-grid" onsubmit="return false">
      <label class="field"><span>Élève</span>
        <select name="eleveId" data-on-change="factureEleve" ${isNew ? '' : 'disabled'}>
          <option value="">— Choisir —</option>
          ${DB.eleves.slice().sort(triNom).map((e) => `<option value="${e.id}" ${draftFacture.eleveId === e.id ? 'selected' : ''}>${esc(e.nom.toUpperCase())} ${esc(e.prenom)}</option>`).join('')}
        </select></label>
      <label class="field"><span>Date</span><input type="date" name="date" value="${draftFacture.date}"></label>
    </form>
    <h3 style="margin-top:14px">Lignes</h3>
    <div class="table-wrap lines-table"><table>
      <thead><tr><th>Désignation</th><th class="num" style="width:80px">Qté</th><th class="num" style="width:110px">Prix TTC</th><th class="num" style="width:100px">Total</th><th style="width:40px"></th></tr></thead>
      <tbody id="lignes"></tbody>
      <tfoot><tr><td colspan="3" class="right"><strong>Total TTC</strong></td><td class="num"><strong id="total-ttc"></strong></td><td></td></tr></tfoot>
    </table></div>
    <select id="add-presta" style="max-width:340px;margin-top:8px">
      <option value="">+ Ajouter une ligne…</option>
      ${DB.prestations.map((p) => `<option value="${p.id}">${esc(p.libelle)} — ${eur(p.prix)}</option>`).join('')}
      <option value="__plateau">Heure plateau — ${eur(DB.settings.tarifHeure.plateau)}</option>
      <option value="__circulation">Heure circulation — ${eur(DB.settings.tarifHeure.circulation)}</option>
      <option value="__libre">Ligne libre</option>
    </select>
    ${dispo.length ? `
      <h3 style="margin-top:14px">Autres leçons de ${esc(eleveNom(eleve))} pas encore facturées</h3>
      <div class="check-list" id="dispo-lecons">
        ${dispo.map((x) => `<label><input type="checkbox" value="${x.seance.id}">
          ${fmtDate(x.seance.date)} ${x.seance.debut} · ${TYPES[x.seance.type].short} · ${fmtH(durH(x.seance))} · <span class="muted">${statutLabel(x.seance.type, x.part.statut)}</span></label>`).join('')}
      </div>
      <button class="btn small" style="margin-top:6px" data-action="factureAddLecons">Ajouter les leçons cochées</button>` : ''}
    `,
    foot: `
      ${!isNew ? `<div class="left"><button class="btn danger" data-action="deleteFacture" data-id="${f.id}">Supprimer</button></div>` : ''}
      <button class="btn" data-action="closeModal">Annuler</button>
      ${!isNew ? `<button class="btn" data-action="sendFacture" data-id="${f.id}">📤 Envoyer</button>` : ''}
      <button class="btn primary" data-action="saveFacture">${isNew ? 'Créer et envoyer' : 'Enregistrer'}</button>`,
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
  $('#lignes').innerHTML = draftFacture.lignes.length ? draftFacture.lignes.map((l, i) => `
    <tr>
      <td><input data-on-input="ligneEdit" data-i="${i}" data-k="libelle" value="${esc(l.libelle)}"></td>
      <td><input data-on-input="ligneEdit" data-i="${i}" data-k="qte" type="number" step="0.25" min="0" value="${l.qte}" class="right"></td>
      <td><input data-on-input="ligneEdit" data-i="${i}" data-k="pu" type="number" step="0.01" value="${l.pu}" class="right"></td>
      <td class="num" id="lt-${i}">${eur(l.qte * l.pu)}</td>
      <td><button class="btn small ghost" data-action="ligneDel" data-i="${i}">✕</button></td>
    </tr>`).join('') : '<tr><td colspan="5" class="muted">Aucune ligne.</td></tr>';
  updateTotalFacture();
}
function updateTotalFacture() {
  $('#total-ttc').textContent = eur(draftFacture.lignes.reduce((s, l) => s + (Number(l.qte) || 0) * (Number(l.pu) || 0), 0));
}

function saveFacture() {
  const form = formData($('#facture-form'));
  const isNew = !draftFacture.id;
  if (isNew) draftFacture.eleveId = form.eleveId;
  draftFacture.date = form.date || todayISO();
  draftFacture.lignes = draftFacture.lignes.map((l) => ({ ...l, qte: Number(l.qte) || 0, pu: Number(l.pu) || 0 }));
  if (!draftFacture.eleveId) return toast("Choisissez l'élève", true);
  if (!draftFacture.lignes.length) return toast('Ajoutez au moins une ligne', true);

  let f;
  if (isNew) {
    const ent = DB.entreprise;
    ent.compteur = (Number(ent.compteur) || 0) + 1;
    draftFacture.id = uid();
    draftFacture.numero = `${ent.prefixe || 'F'}-${draftFacture.date.slice(0, 4)}-${String(ent.compteur).padStart(4, '0')}`;
    draftFacture.tva = Number(ent.tva) || 0;
    draftFacture.agenceId = byId('eleves', draftFacture.eleveId)?.agenceId || '';
    DB.factures.push(draftFacture);
    f = draftFacture;
  } else {
    f = byId('factures', draftFacture.id);
    Object.assign(f, draftFacture);
  }
  for (const s of DB.seances) for (const p of s.eleves) if (p.factureId === f.id) delete p.factureId;
  for (const l of f.lignes) {
    const p = l.seanceId && byId('seances', l.seanceId)?.eleves.find((x) => x.eleveId === f.eleveId);
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
  const premiereDue = (eid) => facturesDe(eid).filter((f) => factureStatut(f).key !== 'ok').sort((a, b) => a.date.localeCompare(b.date))[0];
  const optsFactures = (eid, sel) => `<option value="">— Aucune (acompte) —</option>` + facturesDe(eid).map((f) => {
    const reste = factureTotaux(f).ttc - facturePaye(f);
    return `<option value="${f.id}" ${sel === f.id ? 'selected' : ''}>${esc(f.numero)} — reste ${eur(Math.max(0, reste))}</option>`;
  }).join('');

  openModal({
    title: isNew ? 'Encaisser un paiement' : 'Paiement',
    body: `
    <form id="paiement-form" class="form-grid" onsubmit="return false">
      <label class="field full"><span>Élève *</span>
        <select name="eleveId" id="pay-eleve" required>
          <option value="">— Choisir —</option>
          ${DB.eleves.slice().sort(triNom).map((e) => `<option value="${e.id}" ${p.eleveId === e.id ? 'selected' : ''}>${esc(e.nom.toUpperCase())} ${esc(e.prenom)}</option>`).join('')}
        </select></label>
      <label class="field"><span>Montant (€) *</span><input type="number" name="montant" step="0.01" min="0.01" value="${p.montant ?? ''}" required id="pay-montant"></label>
      <label class="field"><span>Mode</span>
        <select name="mode">${MODES_PAIEMENT.map((m) => `<option ${p.mode === m ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
      <label class="field"><span>Date</span><input type="date" name="date" value="${p.date || todayISO()}" required></label>
      <label class="field"><span>Pour la facture</span>
        <select name="factureId" id="pay-facture">${optsFactures(p.eleveId, p.factureId)}</select></label>
      <label class="field full"><span>Référence (n° de chèque…)</span><input name="reference" value="${esc(p.reference || '')}"></label>
    </form>`,
    foot: `
      ${!isNew ? `<div class="left"><button class="btn danger" data-action="deletePaiement" data-id="${p.id}">Supprimer</button></div>` : ''}
      <button class="btn" data-action="closeModal">Annuler</button>
      <button class="btn primary" id="save-paiement">Enregistrer</button>`,
    onMount: (m) => {
      const fillReste = () => {
        const f = byId('factures', $('#pay-facture').value);
        if (f) $('#pay-montant').value = round2(Math.max(0, factureTotaux(f).ttc - facturePaye(f)));
      };
      const preselect = (eid) => {
        $('#pay-facture').innerHTML = optsFactures(eid, '');
        const due = premiereDue(eid);
        if (due) { $('#pay-facture').value = due.id; fillReste(); }
      };
      $('#pay-eleve', m).addEventListener('change', (ev) => preselect(ev.target.value));
      $('#pay-facture', m).addEventListener('change', fillReste);
      if (isNew && p.eleveId) preselect(p.eleveId);
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
  return String(s ?? '').replace(/[  ]/g, ' ').replace(/→/g, '->').replace(/[’]/g, "'").replace(/[“”]/g, '"').replace(/³/g, '3');
}

function buildFacturePdf(f) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const ent = DB.entreprise;
  const e = byId('eleves', f.eleveId);
  const ag = byId('agences', f.agenceId) || agenceDe(e);
  const t = factureTotaux(f);
  const paye = facturePaye(f);
  const W = 210, M = 18;

  doc.setFillColor(249, 115, 22); doc.rect(0, 0, W, 6, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.text(pdfText(ent.nom), M, 20);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  const lignesEnt = [
    ent.adresse, [ent.cp, ent.ville].filter(Boolean).join(' '),
    [ent.tel && 'Tél. ' + ent.tel, ent.email].filter(Boolean).join(' - '),
    ent.siret && 'SIRET ' + ent.siret, ent.agrement && 'Agrément ' + ent.agrement,
    ag && 'Agence : ' + ag.nom,
  ].filter(Boolean);
  lignesEnt.forEach((l, i) => doc.text(pdfText(l), M, 25 + i * 4.2));

  doc.setFont('helvetica', 'bold'); doc.setFontSize(22);
  doc.text('FACTURE', W - M, 22, { align: 'right' });
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text(pdfText(`N° ${f.numero}`), W - M, 29, { align: 'right' });
  doc.text(`Date : ${fmtDate(f.date)}`, W - M, 34, { align: 'right' });

  const cy = 54;
  doc.setDrawColor(226, 232, 240); doc.setFillColor(248, 250, 252);
  doc.roundedRect(W - M - 85, cy, 85, 30, 2, 2, 'FD');
  doc.setFontSize(8); doc.setTextColor(100, 116, 139); doc.text('FACTURÉ À', W - M - 81, cy + 6);
  doc.setTextColor(15, 23, 42); doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text(pdfText(e ? `${e.prenom} ${e.nom.toUpperCase()}` : ''), W - M - 81, cy + 12);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  [e?.adresse, [e?.cp, e?.ville].filter(Boolean).join(' '), e?.email, e?.neph && 'NEPH ' + e.neph]
    .filter(Boolean).forEach((l, i) => doc.text(pdfText(l), W - M - 81, cy + 17 + i * 4));

  let y = 96;
  doc.setFillColor(30, 41, 59); doc.rect(M, y - 5, W - 2 * M, 8, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
  doc.text('Désignation', M + 2, y); doc.text('Qté', 130, y, { align: 'right' });
  doc.text('PU TTC', 165, y, { align: 'right' }); doc.text('Total TTC', W - M - 2, y, { align: 'right' });
  doc.setTextColor(15, 23, 42); doc.setFont('helvetica', 'normal');
  y += 9;
  for (const l of f.lignes) {
    const wrapped = doc.splitTextToSize(pdfText(l.libelle), 105);
    if (y + wrapped.length * 4.5 > 255) { doc.addPage(); y = 20; }
    doc.text(wrapped, M + 2, y);
    doc.text(String(l.qte).replace('.', ','), 130, y, { align: 'right' });
    doc.text(eurPdf(l.pu), 165, y, { align: 'right' });
    doc.text(eurPdf(l.qte * l.pu), W - M - 2, y, { align: 'right' });
    y += wrapped.length * 4.5 + 2;
    doc.setDrawColor(226, 232, 240); doc.line(M, y - 3, W - M, y - 3);
  }

  y += 4;
  if (y > 240) { doc.addPage(); y = 20; }
  const tx = 125;
  const lineTot = (label, val, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(bold ? 11 : 9.5);
    doc.text(pdfText(label), tx, y); doc.text(val, W - M - 2, y, { align: 'right' }); y += bold ? 7 : 5.5;
  };
  if (t.taux > 0) { lineTot('Total HT', eurPdf(t.ht)); lineTot(`TVA ${String(t.taux).replace('.', ',')} %`, eurPdf(t.tva)); }
  doc.setFillColor(255, 237, 213); doc.rect(tx - 3, y - 5, W - M - tx + 3, 8, 'F');
  lineTot('Total TTC', eurPdf(t.ttc), true);
  if (paye > 0) { lineTot('Déjà réglé', '- ' + eurPdf(paye)); lineTot('Reste à payer', eurPdf(Math.max(0, t.ttc - paye)), true); }
  if (t.taux === 0) { doc.setFontSize(8.5); doc.setFont('helvetica', 'italic'); doc.text('TVA non applicable, art. 293 B du CGI', M, y); y += 5; }

  const pays = DB.paiements.filter((p) => p.factureId === f.id).sort((a, b) => a.date.localeCompare(b.date));
  if (pays.length) {
    y += 4; doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.text('Règlements reçus', M, y); y += 5;
    doc.setFont('helvetica', 'normal');
    pays.forEach((p) => { doc.text(pdfText(`${fmtDate(p.date)} - ${p.mode}${p.reference ? ' (' + p.reference + ')' : ''} : ${eurPdf(p.montant)}`), M, y); y += 4.5; });
  }

  doc.setFontSize(7.5); doc.setTextColor(100, 116, 139); doc.setFont('helvetica', 'normal');
  const foot = doc.splitTextToSize(pdfText(DB.settings.mentionsFacture || ''), W - 2 * M);
  doc.text(foot, W / 2, 285 - foot.length * 3.5, { align: 'center' });
  doc.text(pdfText([ent.nom, ent.siret && 'SIRET ' + ent.siret].filter(Boolean).join(' - ')), W / 2, 289, { align: 'center' });
  return doc;
}

function buildCarteRdvPdf(eleveId, seances) {
  const { jsPDF } = window.jspdf;
  const e = byId('eleves', eleveId);
  const ent = DB.entreprise;
  const ag = agenceDe(e);
  const doc = new jsPDF({ unit: 'mm', format: [148, 105], orientation: 'landscape' });
  const W = 148, H = 105, M = 8;
  const perPage = 7;
  const pages = Math.max(1, Math.ceil(seances.length / perPage));
  const coord = [ag?.tel || ent.tel, [ag?.adresse || ent.adresse, ag?.cp || ent.cp, ag?.ville || ent.ville].filter(Boolean).join(' ')].filter(Boolean);
  for (let pg = 0; pg < pages; pg++) {
    if (pg > 0) doc.addPage([148, 105], 'landscape');
    doc.setFillColor(30, 41, 59); doc.rect(0, 0, W, 20, 'F');
    doc.setFillColor(249, 115, 22); doc.rect(0, 20, W, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.text(pdfText(ent.nom + (ag && DB.agences.length > 1 ? ' - ' + ag.nom : '')), M, 9);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
    doc.text(pdfText(coord.join('  -  ')), M, 15);
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
    doc.text('DATE', M + 2, y); doc.text('HORAIRE', M + 52, y); doc.text('TYPE', M + 75, y); doc.text('MONITEUR', M + 96, y);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    y += 6;
    const chunk = seances.slice(pg * perPage, (pg + 1) * perPage);
    if (!chunk.length) doc.text('Aucun rendez-vous programmé.', M + 2, y);
    for (const s of chunk) {
      const d = parseISO(s.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
      doc.setFont('helvetica', 'bold'); doc.text(pdfText(d), M + 2, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${s.debut} - ${s.fin}`, M + 52, y);
      doc.text(pdfText(isExam(s.type) ? 'Examen ' + (s.type === 'exam_plateau' ? 'plateau' : 'circu') : TYPES[s.type].label), M + 75, y);
      doc.text(pdfText(moniteurNom(byId('moniteurs', s.moniteurId))), M + 96, y);
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

function texteCarteRdv(eleveId, seances) {
  const e = byId('eleves', eleveId);
  const ent = DB.entreprise;
  const ag = agenceDe(e);
  const lignes = seances.map((s) => `- ${parseISO(s.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} de ${s.debut} à ${s.fin} : ${TYPES[s.type].label}${s.lieu ? ' (' + s.lieu + ')' : ''}`);
  return `Bonjour ${e.prenom},\n\nVoici vos prochains rendez-vous moto :\n${lignes.join('\n') || '(aucun)'}\n\n${DB.settings.conditionsRdv}\n\n${ent.nom}${ag && DB.agences.length > 1 ? ' - ' + ag.nom : ''}${(ag?.tel || ent.tel) ? ' - ' + (ag?.tel || ent.tel) : ''}`;
}

/* ---------------------------------------------------------------------
   Envoi (partage, e-mail, SMS, WhatsApp, téléchargement)
   --------------------------------------------------------------------- */
function phoneIntl(tel) {
  const t = String(tel || '').replace(/[^\d+]/g, '');
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
      <p class="muted small">Pour : <strong>${esc(eleveNom(eleve))}</strong>${email ? ' · ' + esc(email) : ''}${tel ? ' · ' + esc(tel) : ''}</p>
      <div class="send-options">
        ${canShareFile ? '<button class="btn primary" data-send="share">📲 Envoyer le PDF (mail, WhatsApp…)</button>' : ''}
        <button class="btn" data-send="mail" ${email ? '' : 'disabled title="Pas d\'e-mail sur la fiche"'}>✉️ Par e-mail</button>
        <button class="btn" data-send="sms" ${tel ? '' : 'disabled title="Pas de téléphone sur la fiche"'}>💬 Par SMS</button>
        <button class="btn" data-send="wa" ${tel ? '' : 'disabled title="Pas de téléphone sur la fiche"'}>🟢 Par WhatsApp</button>
        <button class="btn" data-send="download">⬇️ Télécharger le PDF</button>
        <button class="btn" data-send="open">🖨️ Imprimer</button>
      </div>`,
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
  const ent = DB.entreprise;
  const t = factureTotaux(f);
  const reste = Math.max(0, t.ttc - facturePaye(f));
  const text = `Bonjour ${e?.prenom || ''},\n\nVeuillez trouver ci-joint votre facture n° ${f.numero} du ${fmtDate(f.date)} d'un montant de ${eur(t.ttc)}${reste === 0 ? ' (réglée, merci)' : reste < t.ttc ? ` (reste à payer : ${eur(reste)})` : ''}.\n\nCordialement,\n${ent.nom}${ent.tel ? '\n' + ent.tel : ''}`;
  openSendDialog({
    title: `Envoyer la facture ${esc(f.numero)}`,
    doc: buildFacturePdf(f),
    filename: `Facture-${f.numero}.pdf`,
    eleve: e,
    subject: `Facture ${f.numero} - ${ent.nom}`,
    text,
  });
}

function sendCarteRdv(eleveId) {
  const e = byId('eleves', eleveId);
  const seances = rdvAVenir(eleveId);
  openSendDialog({
    title: 'Envoyer la carte de RDV',
    doc: buildCarteRdvPdf(eleveId, seances),
    filename: `Carte-RDV-${e.nom}-${e.prenom}.pdf`.replace(/\s+/g, '_'),
    eleve: e,
    subject: `Vos rendez-vous moto - ${DB.entreprise.nom}`,
    text: texteCarteRdv(eleveId, seances),
    extraBody: seances.length
      ? `<div class="alert info">${seances.length} rendez-vous à venir sur la carte.</div>`
      : '<div class="alert warn">Aucun rendez-vous à venir pour cet élève.</div>',
  });
}

/* ---------------------------------------------------------------------
   PARAMÈTRES
   --------------------------------------------------------------------- */
function viewParametres() {
  const s = DB.settings;
  const ent = DB.entreprise;
  const ligne = (contenu, action, id) => `<div class="chip-row">${contenu}<button class="btn small" data-action="${action}" data-id="${id}">Modifier</button></div>`;
  return `
  <div class="toolbar"><h1>Paramètres</h1></div>
  <div class="grid cols-2">
    <div class="card">
      <h2>Mon auto-école</h2>
      <p class="muted small">Apparaît sur les factures et les cartes de RDV.</p>
      ${ligne(`<span class="name">${esc(ent.nom)} <span class="muted small">· factures ${esc(ent.prefixe)}-AAAA-#### · TVA ${ent.tva}%</span></span>`, 'editEntreprise', '')}
    </div>
    <div class="card">
      <h2>Agences</h2>
      <p class="muted small">Chaque élève est rattaché à son agence d'inscription.</p>
      ${DB.agences.map((a) => ligne(`<span class="dot" style="background:${esc(a.couleur)}"></span><span class="name">${esc(a.nom)} <span class="muted small">${esc(a.ville || '')}</span></span>`, 'editAgence', a.id)).join('')}
      <button class="btn" data-action="editAgence">+ Ajouter une agence</button>
    </div>
    <div class="card">
      <h2>Moniteurs</h2>
      ${DB.moniteurs.map((m) => ligne(`<span class="dot" style="background:${esc(m.couleur)}"></span><span class="name">${esc(moniteurNom(m))}</span>`, 'editMoniteur', m.id)).join('')}
      <button class="btn" data-action="editMoniteur">+ Ajouter un moniteur</button>
    </div>
    <div class="card">
      <h2>Leçons & tarifs</h2>
      <form id="settings-form" class="form-grid" onsubmit="return false">
        <label class="field"><span>Max élèves circulation</span><input type="number" min="1" name="capCirc" value="${s.capacite.circulation}"></label>
        <label class="field"><span>Max élèves plateau</span><input type="number" min="1" name="capPlateau" value="${s.capacite.plateau}"></label>
        <label class="field"><span>Prix heure circulation (€)</span><input type="number" step="0.01" name="tarifCirc" value="${s.tarifHeure.circulation}"></label>
        <label class="field"><span>Prix heure plateau (€)</span><input type="number" step="0.01" name="tarifPlateau" value="${s.tarifHeure.plateau}"></label>
        <label class="field"><span>Max élèves examen plateau</span><input type="number" min="1" name="capExP" value="${s.capacite.exam_plateau}"></label>
        <label class="field"><span>Max élèves examen circulation</span><input type="number" min="1" name="capExC" value="${s.capacite.exam_circulation}"></label>
        <label class="field"><span>Prix accompagnement examen plateau (€)</span><input type="number" step="0.01" name="tarifExP" value="${s.tarifExamen.exam_plateau}"></label>
        <label class="field"><span>Prix accompagnement examen circulation (€)</span><input type="number" step="0.01" name="tarifExC" value="${s.tarifExamen.exam_circulation}"></label>
        <label class="field"><span>Planning de</span><input type="time" step="1800" name="heureMin" value="${s.heureMin}"></label>
        <label class="field"><span>à</span><input type="time" step="1800" name="heureMax" value="${s.heureMax}"></label>
        <label class="field full"><span>Texte en bas de la carte de RDV</span><textarea name="conditionsRdv">${esc(s.conditionsRdv)}</textarea></label>
        <label class="field full"><span>Texte en bas des factures</span><textarea name="mentionsFacture">${esc(s.mentionsFacture)}</textarea></label>
      </form>
      <div class="row" style="margin-top:10px;justify-content:flex-end"><button class="btn primary" data-action="saveSettings">Enregistrer</button></div>
    </div>
    <div class="card">
      <h2>Prestations (pour les factures)</h2>
      ${DB.prestations.map((p) => ligne(`<span class="name">${esc(p.libelle)}</span><strong>${eur(p.prix)}</strong>`, 'editPrestation', p.id)).join('')}
      <button class="btn" data-action="editPrestation">+ Ajouter</button>
    </div>
    <div class="card">
      <h2>Sauvegarde</h2>
      <p class="muted small">Les données sont gardées sur cet appareil. Faites une sauvegarde régulièrement.</p>
      <div class="row">
        <button class="btn primary" data-action="exportData">⬇️ Sauvegarder</button>
        <label class="btn">⬆️ Restaurer<input type="file" accept="application/json,.json" hidden data-on-change="importData"></label>
        <button class="btn" data-action="loadDemo">Données de démo</button>
        <button class="btn danger" data-action="resetData">Tout effacer</button>
      </div>
    </div>
  </div>`;
}

function openSimpleForm({ title, fields, values = {}, onSave, onDelete }) {
  openModal({
    title,
    body: `<form id="simple-form" class="form-grid" onsubmit="return false">
      ${fields.map((f) => `<label class="field ${f.full ? 'full' : ''}"><span>${esc(f.label)}</span>
        <input name="${f.name}" type="${f.type || 'text'}" ${f.step ? `step="${f.step}"` : ''} ${f.required ? 'required' : ''} value="${esc(values[f.name] ?? '')}">
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
  db.entreprise = { nom: 'Auto-école Démo', adresse: '12 rue de la République', cp: '69001', ville: 'Lyon', tel: '04 78 00 00 01', email: 'contact@exemple.fr', siret: '123 456 789 00011', agrement: 'E 01 069 0001 0', prefixe: 'F', compteur: 0, tva: 20 };
  db.agences = [
    { id: 'ag1', nom: 'Agence Centre', adresse: '12 rue de la République', cp: '69001', ville: 'Lyon', tel: '04 78 00 00 01', couleur: COULEURS_AGENCE[0] },
    { id: 'ag2', nom: 'Agence Gare', adresse: '3 place de la Gare', cp: '69003', ville: 'Lyon', tel: '04 78 00 00 02', couleur: COULEURS_AGENCE[1] },
    { id: 'ag3', nom: 'Agence Nord', adresse: '8 av. du Parc', cp: '69009', ville: 'Lyon', tel: '04 78 00 00 03', couleur: COULEURS_AGENCE[2] },
  ];
  db.moniteurs = [
    { id: 'm1', prenom: 'Karim', nom: 'B.', tel: '', couleur: '#f97316' },
    { id: 'm2', prenom: 'Julie', nom: 'D.', tel: '', couleur: '#0ea5e9' },
  ];
  const noms = [['Martin', 'Lucas'], ['Bernard', 'Emma'], ['Petit', 'Nathan'], ['Durand', 'Léa'], ['Leroy', 'Hugo'], ['Moreau', 'Chloé'], ['Simon', 'Louis'], ['Laurent', 'Inès'], ['Michel', 'Adam'], ['Garcia', 'Sarah']];
  db.eleves = noms.map(([nom, prenom], i) => ({
    id: 'el' + i, nom, prenom, agenceId: ['ag1', 'ag2', 'ag3'][i % 3], formation: i === 8 ? 'Passerelle A2 → A' : 'A2',
    tel: `06 12 34 56 ${pad(10 + i)}`, email: `${prenom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}.${nom.toLowerCase()}@exemple.fr`,
    adresse: `${i + 4} avenue des Lilas`, cp: '69007', ville: 'Lyon', inscription: addDays(todayISO(), -60), neph: `1234567890${pad(i)}`, statut: 'en_cours', notes: '',
  }));
  const t = todayISO();
  const add = (off, debut, fin, type, mid, eleves) => {
    const date = addDays(t, off);
    db.seances.push({ id: uid(), date, debut, fin, type, moniteurId: mid, lieu: '', eleves: eleves.map((e) => ({ eleveId: 'el' + e, statut: date < t ? 'present' : 'prevu' })) });
  };
  add(-7, '08:00', '10:00', 'plateau', 'm1', [0, 1, 2, 3, 4]);
  add(-7, '10:00', '12:00', 'circulation', 'm2', [5, 6, 7]);
  add(-3, '14:00', '16:00', 'circulation', 'm1', [0, 1]);
  add(0, '08:00', '10:00', 'plateau', 'm1', [0, 2, 4, 6, 8]);
  add(0, '08:00', '10:00', 'circulation', 'm2', [1, 3, 5]);
  add(0, '10:30', '12:30', 'circulation', 'm1', [7, 9]);
  add(0, '14:00', '16:00', 'plateau', 'm2', [2, 3, 7]);
  add(0, '16:00', '17:30', 'circulation', 'm1', [4]);
  add(1, '09:00', '11:00', 'plateau', 'm1', [4, 5, 9]);
  add(1, '13:30', '15:30', 'circulation', 'm2', [6, 8]);
  add(2, '08:00', '10:00', 'plateau', 'm1', [0, 1, 2, 3]);
  add(3, '10:00', '12:00', 'circulation', 'm2', [4, 5, 7]);
  add(-2, '08:00', '11:00', 'exam_plateau', 'm2', [5, 6, 7]);
  add(4, '13:00', '16:00', 'exam_circulation', 'm1', [0, 3]);
  db.seances[db.seances.length - 2].lieu = "Centre d'examen Lyon Sud";
  db.seances[db.seances.length - 2].eleves.forEach((p, i) => { p.statut = i === 1 ? 'ajourne' : 'admis'; });
  db.seances[db.seances.length - 1].lieu = "Centre d'examen Lyon Sud";
  return db;
}

/* ---------------------------------------------------------------------
   Actions
   --------------------------------------------------------------------- */
const ACTIONS = {
  closeModal,

  /* Navigation planning */
  setMode(d) { UI.mode = d.m; render(); },
  setMonSemaine(d) { UI.moniteurSemaine = d.id; render(); },
  navPrev() { UI.date = addDays(UI.date, UI.mode === 'semaine' ? -7 : -1); render(); },
  navNext() { UI.date = addDays(UI.date, UI.mode === 'semaine' ? 7 : 1); render(); },
  navToday() { UI.date = todayISO(); render(); },
  navPick(d, el) { if (el.value) { UI.date = el.value; render(); } },

  /* Placer une leçon */
  slot(d) {
    const type = 'circulation';
    const dur = DB.settings.dureeDefaut[type] || 120;
    openSeance({ type, date: d.date, debut: d.t, fin: fromMin(toMin(d.t) + dur), moniteurId: d.mon, lieu: '', eleves: [] });
  },
  editSeance(d) { const s = byId('seances', d.id); if (s) openSeance(s); },
  setType(d) {
    readDraft();
    const avant = draft.type;
    draft.type = d.t;
    for (const p of draft.eleves) if (!statutsPour(draft.type)[p.statut]) p.statut = 'prevu';
    if (!draft.id && isExam(avant) !== isExam(draft.type)) draft.fin = fromMin(toMin(draft.debut) + (DB.settings.dureeDefaut[draft.type] || 120));
    refreshDraft();
  },
  setDuree(d) { draft.fin = fromMin(toMin(draft.debut) + Number(d.d)); refreshDraft(); },
  searchEleve() { renderResults(); },
  pickEleve(d) {
    if (draft.eleves.length >= DB.settings.capacite[draft.type]) return toast('Leçon complète', true);
    draft.eleves.push({ eleveId: d.id, statut: 'prevu' });
    $('#s-search').value = '';
    refreshDraft();
    $('#s-search')?.focus();
  },
  removeEleve(d) {
    const p = draft.eleves[+d.i];
    if (p.factureId && !confirm('Cette leçon est déjà facturée pour cet élève. La retirer quand même ?')) return;
    draft.eleves.splice(+d.i, 1);
    refreshDraft();
  },
  setPresence(d, el) { draft.eleves[+d.i].statut = el.value; el.className = 'presence ' + el.value; },
  quickEleve() {
    readDraft();
    const snapshot = draft;
    const q = ($('#s-search')?.value || '').trim();
    const [nom, ...rest] = q.split(/\s+/);
    openEleve({ nom: nom || '', prenom: rest.join(' '), agenceId: DB.agences[0]?.id, formation: 'A2', statut: 'en_cours' }, {
      onSaved: (e) => {
        if (snapshot.eleves.length < DB.settings.capacite[snapshot.type]) snapshot.eleves.push({ eleveId: e.id, statut: 'prevu' });
        openSeance(snapshot);
      },
      onCancel: () => openSeance(snapshot),
    });
  },
  saveSeance() {
    readDraft();
    const { errors } = seanceConflicts(draft);
    if (errors.length) { refreshDraft(); return toast(errors[0], true); }
    if (!draft.eleves.length && !confirm('Aucun élève : placer quand même ce créneau ?')) return;
    // Admis à l'examen circulation → permis obtenu
    if (draft.type === 'exam_circulation') {
      const recus = draft.eleves.filter((p) => p.statut === 'admis').map((p) => byId('eleves', p.eleveId)).filter((e) => e && e.statut !== 'obtenu');
      recus.forEach((e) => { e.statut = 'obtenu'; });
      if (recus.length) setTimeout(() => toast(`🎉 Permis obtenu : ${recus.map(eleveNom).join(', ')}`), 600);
    }
    if (draft.id) Object.assign(byId('seances', draft.id), draft);
    else { draft.id = uid(); DB.seances.push(draft); }
    save(); closeModal(); render(); toast('Leçon enregistrée');
  },
  deleteSeance() {
    if (draft.eleves.some((p) => p.factureId)) return toast('Impossible : cette leçon est déjà facturée.', true);
    if (!confirm('Supprimer cette leçon ?')) return;
    DB.seances = DB.seances.filter((s) => s.id !== draft.id);
    save(); closeModal(); render(); toast('Leçon supprimée');
  },
  duplicateSeance() {
    readDraft();
    const copy = JSON.parse(JSON.stringify(draft));
    copy.id = undefined;
    copy.date = addDays(copy.date, 7);
    copy.eleves = copy.eleves.map((p) => ({ eleveId: p.eleveId, statut: 'prevu' }));
    openSeance(copy);
    toast('Copie prête : vérifiez puis validez');
  },

  /* Élèves */
  rechercheEleve(d, el) {
    UI.rechercheEleve = el.value;
    const pos = el.selectionStart;
    render();
    const inp = $('#search-eleve'); inp.focus(); inp.setSelectionRange(pos, pos);
  },
  filtreAgence(d, el) { UI.filtreAgence = el.value; render(); },
  voirAnciens(d, el) { UI.voirAnciens = el.checked; render(); },
  newEleve() { openEleve({ agenceId: UI.filtreAgence || DB.agences[0]?.id, formation: 'A2', statut: 'en_cours' }); },
  editEleve(d) { openEleve(byId('eleves', d.id)); },
  openFiche(d) { go('eleves', { eleveOuvert: d.id, ongletFiche: 'lecons' }); },
  openFicheCompte(d) { go('eleves', { eleveOuvert: d.id, ongletFiche: 'compte' }); },
  ongletFiche(d) { UI.ongletFiche = d.o; render(); },
  backEleves() { UI.eleveOuvert = null; render(); },
  deleteEleve(d) {
    const id = d.id;
    if (DB.factures.some((f) => f.eleveId === id) || DB.paiements.some((p) => p.eleveId === id)) {
      return toast('Cet élève a des factures ou paiements : mettez-le plutôt en « Permis obtenu » ou « Abandon ».', true);
    }
    if (!confirm('Supprimer cet élève et le retirer de ses leçons ?')) return;
    DB.eleves = DB.eleves.filter((e) => e.id !== id);
    for (const s of DB.seances) s.eleves = s.eleves.filter((p) => p.eleveId !== id);
    UI.eleveOuvert = null;
    save(); closeModal(); render(); toast('Élève supprimé');
  },
  carteRdv(d) { sendCarteRdv(d.id); },

  /* Factures */
  newFacture(d) {
    const eleve = d.eleve ? byId('eleves', d.eleve) : null;
    const f = { eleveId: eleve?.id || '', date: todayISO(), lignes: [] };
    if (eleve) for (const x of nonFactures(eleve.id)) if (x.part.statut !== 'prevu') f.lignes.push(ligneSeance(x.seance, eleve.id));
    openFacture(f);
  },
  factureEleve(d, el) {
    const e = byId('eleves', el.value);
    draftFacture.eleveId = el.value;
    draftFacture.date = $('[name=date]').value;
    draftFacture.lignes = draftFacture.lignes.filter((l) => !l.seanceId);
    if (e) for (const x of nonFactures(e.id)) if (x.part.statut !== 'prevu') draftFacture.lignes.push(ligneSeance(x.seance, e.id));
    openFacture(draftFacture);
  },
  factureAddLecons() {
    for (const i of $$('#dispo-lecons input:checked')) draftFacture.lignes.push(ligneSeance(byId('seances', i.value), draftFacture.eleveId));
    draftFacture.date = $('[name=date]').value;
    openFacture(draftFacture);
  },
  ligneEdit(d, el) {
    const l = draftFacture.lignes[+d.i];
    l[d.k] = el.value;
    $('#lt-' + d.i).textContent = eur((Number(l.qte) || 0) * (Number(l.pu) || 0));
    updateTotalFacture();
  },
  ligneDel(d) { draftFacture.lignes.splice(+d.i, 1); renderLignes(); },
  saveFacture,
  editFacture(d) { openFacture(byId('factures', d.id)); },
  sendFacture(d, el, ev) { ev.stopPropagation(); sendFacture(d.id); },
  deleteFacture(d) {
    const f = byId('factures', d.id);
    if (DB.paiements.some((p) => p.factureId === f.id)) return toast('Des paiements sont liés à cette facture : supprimez-les d\'abord.', true);
    if (!confirm(`Supprimer la facture ${f.numero} ?`)) return;
    for (const s of DB.seances) for (const p of s.eleves) if (p.factureId === f.id) delete p.factureId;
    DB.factures = DB.factures.filter((x) => x.id !== f.id);
    save(); closeModal(); render(); toast('Facture supprimée');
  },

  /* Paiements */
  ongletPaiements(d) { UI.ongletPaiements = d.o; render(); },
  moisEnc(d, el) { if (el.value) { UI.moisEnc = el.value; render(); } },
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
    s.capacite.exam_plateau = Math.max(1, parseInt(f.capExP, 10) || 8);
    s.capacite.exam_circulation = Math.max(1, parseInt(f.capExC, 10) || 3);
    s.tarifExamen.exam_plateau = Number(f.tarifExP) || 0;
    s.tarifExamen.exam_circulation = Number(f.tarifExC) || 0;
    if (f.heureMin && f.heureMax && toMin(f.heureMax) > toMin(f.heureMin)) { s.heureMin = f.heureMin; s.heureMax = f.heureMax; }
    s.conditionsRdv = f.conditionsRdv;
    s.mentionsFacture = f.mentionsFacture;
    save(); render(); toast('Paramètres enregistrés');
  },
  editEntreprise() {
    openSimpleForm({
      title: 'Mon auto-école',
      values: DB.entreprise,
      fields: [
        { name: 'nom', label: 'Nom *', required: true, full: true },
        { name: 'adresse', label: 'Adresse', full: true },
        { name: 'cp', label: 'Code postal' }, { name: 'ville', label: 'Ville' },
        { name: 'tel', label: 'Téléphone', type: 'tel' }, { name: 'email', label: 'E-mail', type: 'email' },
        { name: 'siret', label: 'SIRET' }, { name: 'agrement', label: 'N° agrément' },
        { name: 'prefixe', label: 'Début des n° de facture *', required: true },
        { name: 'compteur', label: 'Dernier n° de facture utilisé', type: 'number' },
        { name: 'tva', label: 'TVA % (0 si non assujetti)', type: 'number', step: '0.1' },
      ],
      onSave: (data) => {
        data.compteur = parseInt(data.compteur, 10) || 0;
        data.tva = Number(data.tva) || 0;
        Object.assign(DB.entreprise, data);
      },
    });
  },
  editAgence(d) {
    const a = d.id ? byId('agences', d.id) : null;
    openSimpleForm({
      title: a ? "Modifier l'agence" : 'Nouvelle agence',
      values: a || { couleur: COULEURS_AGENCE[DB.agences.length % COULEURS_AGENCE.length] },
      fields: [
        { name: 'nom', label: 'Nom *', required: true, full: true },
        { name: 'adresse', label: 'Adresse', full: true },
        { name: 'cp', label: 'Code postal' }, { name: 'ville', label: 'Ville' },
        { name: 'tel', label: 'Téléphone', type: 'tel' }, { name: 'couleur', label: 'Couleur', type: 'color' },
      ],
      onSave: (data) => { if (a) Object.assign(a, data); else DB.agences.push({ id: uid(), ...data }); },
      onDelete: a && (() => {
        if (DB.agences.length < 2) { toast('Il faut au moins une agence.', true); return false; }
        if (DB.eleves.some((x) => x.agenceId === a.id)) { toast('Des élèves sont inscrits dans cette agence.', true); return false; }
        if (!confirm('Supprimer cette agence ?')) return false;
        DB.agences = DB.agences.filter((x) => x.id !== a.id); return true;
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
        { name: 'tel', label: 'Téléphone', type: 'tel' }, { name: 'couleur', label: 'Couleur', type: 'color' },
      ],
      onSave: (data) => { if (m) Object.assign(m, data); else DB.moniteurs.push({ id: uid(), ...data }); },
      onDelete: m && (() => {
        if (DB.seances.some((s) => s.moniteurId === m.id)) { toast('Ce moniteur a des leçons au planning.', true); return false; }
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
    downloadBlob(new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' }), `moto-planning-sauvegarde-${todayISO()}.json`);
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
    DB = demoData(); save(); go('planning', { date: todayISO(), mode: 'jour' }); toast('Données de démonstration chargées');
  },
  resetData() {
    if (!confirm('Effacer TOUTES les données ?')) return;
    if (!confirm('Vraiment tout effacer ? C\'est irréversible.')) return;
    DB = defaultState(); save(); go('planning'); toast('Données effacées');
  },
};

/* ---------------------------------------------------------------------
   Démarrage
   --------------------------------------------------------------------- */
render();
save(); // enregistre aussi les données converties depuis une ancienne version
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
