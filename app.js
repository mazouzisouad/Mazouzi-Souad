/* =====================================================================
   Moto Planning — planning moto multi-agences
   Planning en grille (comme AGX) : cliquer sur un créneau pour placer
   une leçon plateau (max 5) ou circulation (max 3), fiches élèves
   rattachées à une agence, factures, paiements, carte de RDV en PDF.
   Données enregistrées localement dans le navigateur (localStorage).
   ===================================================================== */
'use strict';

const STORAGE_KEY = 'motoplanning_v1';
const APP_VERSION = '2026-11-22 · motos & essence';

const TYPES = {
  plateau: { label: 'Plateau', short: 'Plateau' },
  circulation: { label: 'Circulation', short: 'Circu' },
  blanc_plateau: { label: 'Examen blanc plateau', short: '📝 Blanc plateau', blanc: true },
  blanc_circulation: { label: 'Examen blanc circulation', short: '📝 Blanc circu', blanc: true },
  exam_plateau: { label: 'Examen plateau', short: '🎓 Exam plateau', exam: true },
  exam_circulation: { label: 'Examen circulation', short: '🎓 Exam circu', exam: true },
};
const isExam = (type) => !!TYPES[type]?.exam;
const isBlanc = (type) => !!TYPES[type]?.blanc;
const baseDe = (type) => (String(type || '').includes('plateau') ? 'plateau' : 'circulation');
const categorie = (type) => (isExam(type) ? 'exam' : isBlanc(type) ? 'blanc' : 'lecon');
// Capacité d'une séance : pour un examen, le nombre de places réservées sur RdvPermis s'il est renseigné ;
// un examen blanc suit la même limite que la leçon (plateau 5, circulation 3)
const capDe = (s) => (isExam(s.type) && Number(s.places) > 0 ? Number(s.places) : (DB.settings.capacite[s.type] ?? DB.settings.capacite[baseDe(s.type)]));
const dureeDe = (type) => DB.settings.dureeDefaut[type] || DB.settings.dureeDefaut[baseDe(type)] || 120;
const STATUTS_PRESENCE = { prevu: 'Prévu', present: 'Présent', absent: 'Absent (dû)', excuse: 'Excusé' };
const STATUTS_EXAMEN = { prevu: 'Prévu', admis: 'Admis ✅', ajourne: 'Ajourné ❌', absent: 'Absent' };
const STATUTS_BLANC = { prevu: 'Prévu', valide: 'Validé ✅', nonvalide: 'Non validé ❌', absent: 'Absent (dû)', excuse: 'Excusé' };
const statutsPour = (type) => (isExam(type) ? STATUTS_EXAMEN : isBlanc(type) ? STATUTS_BLANC : STATUTS_PRESENCE);
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
      tarifExamen: { exam_plateau: 0, exam_circulation: 0 }, // 1er accompagnement (0 = offert)
      fraisRepassage: { exam_plateau: 100, exam_circulation: 150 },
      heuresPrepa: { min: 4, max: 6 },
      rappel: JSON.parse(JSON.stringify(RAPPEL_DEFAUT)),
      dureeDefaut: { plateau: 120, circulation: 120, blanc_plateau: 60, blanc_circulation: 60, exam_plateau: 180, exam_circulation: 180 },
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
      { id: uid(), libelle: 'Frais de repassage examen plateau', prix: 100 },
      { id: uid(), libelle: 'Frais de repassage examen circulation', prix: 150 },
      { id: uid(), libelle: 'Forfait 20h A2', prix: 950 },
      { id: uid(), libelle: 'Formation passerelle A2 → A (7h)', prix: 350 },
    ],
    modeles: modelesParDefaut(),
    contrats: [],
    suivi: [],
    motos: [],
    pleins: [],
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
  // anciens réglages : 1er accompagnement payant (90 / 120 €) → désormais offert, repassages payants
  if (db.settings && !db.settings.fraisRepassage && db.settings.tarifExamen
      && db.settings.tarifExamen.exam_plateau === 90 && db.settings.tarifExamen.exam_circulation === 120) {
    db.settings.tarifExamen = { exam_plateau: 0, exam_circulation: 0 };
  }
  db.settings = Object.assign({}, def.settings, db.settings || {});
  for (const k of ['capacite', 'tarifHeure', 'tarifExamen', 'fraisRepassage', 'heuresPrepa', 'dureeDefaut', 'rappel']) db.settings[k] = Object.assign({}, def.settings[k], db.settings[k] || {});
  db.settings.rappel.documents = Object.assign({}, def.settings.rappel.documents, db.settings.rappel.documents || {});
  db.entreprise = Object.assign({}, def.entreprise, db.entreprise || {});
  for (const k of ['agences', 'moniteurs', 'prestations', 'eleves', 'seances', 'factures', 'paiements', 'contrats', 'suivi', 'motos', 'pleins']) db[k] = db[k] || [];
  // Couleurs demandées pour les auto-écoles (appliquées une seule fois ; modifiables ensuite dans Paramètres)
  if (db.settings && !db.settings.couleursAuto1 && Array.isArray(db.agences)) {
    for (const a of db.agences) {
      const n = String(a.nom || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      if (/tremblay/.test(n)) a.couleursPdf = 'bleuRose';
      else if (/famil/.test(n)) a.couleursPdf = 'vertGris';
      else if (/smile/.test(n)) a.couleursPdf = 'jaune';
    }
    db.settings.couleursAuto1 = true;
  }
  // Style moderne par défaut pour tout le monde (une fois ; « classique » reste possible ensuite)
  if (db.settings && !db.settings.designAuto1) { db.settings.designPdf = 'moderne'; db.settings.designAuto1 = true; }
  if (!Array.isArray(db.modeles)) db.modeles = modelesParDefaut();
  else majModelesFournis(db.modeles);
  if (!db.agences.length) db.agences = def.agences;
  for (const e of db.eleves) if (!STATUTS_ELEVE[e.statut]) e.statut = 'en_cours';
  return db;
}
function save() {
  if (Cloud.deconnexion) return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(DB)); }
  catch (e) { toast("Impossible d'enregistrer : " + e.message, true); }
  if (Cloud.actif) Cloud.push(DB).catch((e) => toast('Synchronisation impossible : ' + e.message, true));
}

const byId = (list, id) => DB[list].find((x) => x.id === id);
const triNom = (a, b) => `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, 'fr');
const eleveNom = (e) => (e ? `${e.prenom} ${e.nom}`.trim() : '—');
const eleveCourt = (e) => (e ? `${e.prenom} ${(e.nom || '').charAt(0).toUpperCase()}.` : '—');
const moniteurNom = (m) => (m ? `${m.prenom} ${m.nom}`.trim() : '—');
const agenceDe = (e) => (e ? byId('agences', e.agenceId) : null);
// Identité d'une auto-école (agence) : ses propres informations ; les infos communes ne servent
// qu'à compléter un champ resté vide (jamais le nom).
const CHAMPS_ECOLE = ['adresse', 'cp', 'ville', 'tel', 'email', 'siret', 'agrement', 'dateAgrement', 'exploitant', 'assureur', 'police', 'garantie', 'mediateur'];
function ecoleDe(a) {
  const ent = DB.entreprise;
  const ec = { nom: a?.nom || ent.nom };
  for (const k of CHAMPS_ECOLE) ec[k] = (a && a[k]) || ent[k] || '';
  return ec;
}
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
    if (['present', 'valide', 'nonvalide'].includes(p.statut) && !isExam(s.type)) res[baseDe(s.type)] += durH(s);
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
    const nbAjourne = list.filter((s) => ['ajourne', 'absent'].includes(st(s))).length;
    if (admis) out[t] = { cls: 'ok', txt: `Admis le ${fmtDate(admis.date)}` };
    else if (prevu) out[t] = { cls: 'warn', txt: `Le ${fmtDate(prevu.date)} à ${prevu.debut}` };
    else if (nbAjourne) out[t] = { cls: 'bad', txt: `Repassage à programmer (${nbAjourne} échec${nbAjourne > 1 ? 's' : ''})` };
    else out[t] = { cls: '', txt: '—' };
  }
  return out;
}
// Élèves qui ont raté (ajourné ou absent) un examen et doivent le repasser.
// Pour chaque élève et chaque épreuve, on regarde le dernier examen avec un résultat.
function repassages() {
  const out = [];
  for (const e of DB.eleves) {
    if (e.statut === 'abandon') continue;
    for (const t of ['exam_plateau', 'exam_circulation']) {
      const list = eleveSeances(e.id).filter((s) => s.type === t);
      const st = (s) => s.eleves.find((p) => p.eleveId === e.id).statut;
      const passes = list.filter((s) => st(s) !== 'prevu');
      if (!passes.length) continue;
      const dernier = passes[passes.length - 1];
      if (!['ajourne', 'absent'].includes(st(dernier))) continue;
      const nbEchecs = passes.filter((s) => ['ajourne', 'absent'].includes(st(s))).length;
      const programme = list.find((s) => st(s) === 'prevu' && (s.date + s.debut) > (dernier.date + dernier.debut));
      out.push({ eleve: e, type: t, dernier, resultat: st(dernier), numPassage: passes.length + 1, nbEchecs, programme });
    }
  }
  return out.sort((a, b) => (!!a.programme - !!b.programme) || a.dernier.date.localeCompare(b.dernier.date));
}
const ordinal = (n) => (n === 1 ? '1er' : `${n}e`);

/* ---------- Examen blanc → prêts pour l'examen → préparation ---------- */
const statutDe = (s, eleveId) => s.eleves.find((p) => p.eleveId === eleveId)?.statut;
const finDe = (s) => s.date + ' ' + s.fin;
const debutDe = (s) => s.date + ' ' + s.debut;

// Dernier examen blanc validé pour une épreuve, avant un moment donné
function blancValide(eleveId, base, avant = '9999') {
  const l = eleveSeances(eleveId).filter((s) => s.type === 'blanc_' + base && statutDe(s, eleveId) === 'valide' && finDe(s) <= avant);
  return l[l.length - 1] || null;
}
// Heures de préparation planifiées entre l'examen blanc validé et l'examen
// Leçons « 🎯 prépa examen » de l'élève pour cette épreuve, entre son examen blanc validé et l'examen
function preparation(eleveId, exam) {
  const base = baseDe(exam.type);
  const blanc = blancValide(eleveId, base, debutDe(exam));
  const depuis = blanc ? finDe(blanc) : '';
  const res = { faites: 0, prevues: 0, total: 0, toutes: 0 };
  for (const s of eleveSeances(eleveId)) {
    if (s.type !== base || debutDe(s) < depuis || debutDe(s) >= debutDe(exam)) continue;
    const st = statutDe(s, eleveId);
    if (!['present', 'prevu'].includes(st)) continue;
    res.toutes += durH(s); // toutes les leçons (normales + prépa)
    if (!s.prepa) continue;
    if (st === 'present') res.faites += durH(s); else res.prevues += durH(s);
  }
  res.total = res.faites + res.prevues;
  return res;
}
function prepBadge(p) {
  const { min, max } = DB.settings.heuresPrepa;
  const h = p.total;
  const cls = h < min ? 'bad' : h > max ? 'warn' : 'ok';
  const txt = h < min ? `il manque ${fmtH(min - h)}` : h > max ? `au-delà de ${max}h` : 'OK';
  const detail = p.prevues ? ` (${fmtH(p.faites)} faite${p.faites > 1 ? 's' : ''} + ${fmtH(p.prevues)} prévue${p.prevues > 1 ? 's' : ''})` : '';
  const autres = p.toutes - p.total;
  return `<span class="badge ${cls}" title="Leçons « 🎯 prépa examen » depuis l'examen blanc (${min} à ${max}h)">🎯 Prépa ${fmtH(h)}${detail} · ${txt}</span>`
    + ` <span class="badge" title="Toutes les leçons (normales + prépa) depuis l'examen blanc">Total ${fmtH(p.toutes)}${autres > 0 ? ` (dont ${fmtH(autres)} normales)` : ''}</span>`;
}
// Prochain examen d'un élève pour une épreuve (pour la fiche et le planning)
function prochainExamen(eleveId, base) {
  return eleveSeances(eleveId).find((s) => s.type === 'exam_' + base && s.date >= todayISO() && statutDe(s, eleveId) === 'prevu') || null;
}
// Élèves qui ont validé leur examen blanc : à inscrire, ou déjà inscrits (avec leur préparation)
function pretsPourExamen() {
  const out = [];
  for (const e of DB.eleves.filter((x) => x.statut === 'en_cours')) {
    for (const base of ['plateau', 'circulation']) {
      const exams = eleveSeances(e.id).filter((s) => s.type === 'exam_' + base);
      if (exams.some((s) => statutDe(s, e.id) === 'admis')) continue;
      const blanc = blancValide(e.id, base);
      if (!blanc) continue;
      // un échec à l'examen après ce blanc : il faut refaire un examen blanc
      if (exams.some((s) => debutDe(s) > finDe(blanc) && ['ajourne', 'absent'].includes(statutDe(s, e.id)))) continue;
      const exam = exams.find((s) => debutDe(s) > finDe(blanc) && statutDe(s, e.id) === 'prevu') || null;
      out.push({ eleve: e, base, blanc, exam, prepa: exam ? preparation(e.id, exam) : null });
    }
  }
  return out.sort((a, b) => (!!a.exam - !!b.exam) || a.blanc.date.localeCompare(b.blanc.date));
}

function viewPrets() {
  const q = UI.rechercheEleve.toLowerCase();
  const list = pretsPourExamen()
    .filter((r) => !UI.filtreAgence || r.eleve.agenceId === UI.filtreAgence)
    .filter((r) => !q || `${r.eleve.nom} ${r.eleve.prenom} ${r.eleve.prenom} ${r.eleve.nom}`.toLowerCase().includes(q));
  const { min, max } = DB.settings.heuresPrepa;
  if (!list.length) return `<div class="card empty">Aucun élève n'a encore validé d'examen blanc.<br><span class="small">Placez un « 📝 Examen blanc » dans le planning, puis notez « Validé ✅ » quand l'élève ne fait aucune faute éliminatoire.</span></div>`;
  return `<div class="table-wrap"><table>
    <thead><tr><th>Élève</th><th>Auto-école</th><th>Épreuve</th><th>Examen blanc</th><th>Examen</th><th>Préparation (${min} à ${max}h)</th></tr></thead>
    <tbody>${list.map((r) => {
      const e = r.eleve;
      return `<tr class="clickable" data-action="openFiche" data-id="${e.id}">
        <td><strong>${esc(e.nom.toUpperCase())}</strong> ${esc(e.prenom)}</td>
        <td>${agenceBadge(agenceDe(e))}</td>
        <td><span class="badge exam_${r.base}">${r.base === 'plateau' ? 'Plateau' : 'Circulation'}</span></td>
        <td>✅ validé le ${fmtDate(r.blanc.date)}</td>
        <td>${r.exam ? `<span class="badge ok">le ${fmtDate(r.exam.date)} à ${r.exam.debut}</span>`
          : `<button class="btn small primary" data-action="placerRepassage" data-eleve="${e.id}" data-type="exam_${r.base}">🎓 Inscrire à l'examen</button>`}</td>
        <td>${r.exam ? prepBadge(r.prepa) : `<span class="muted small">à planifier après l'inscription</span>`}</td>
      </tr>`;
    }).join('')}</tbody></table></div>
    <p class="muted small" style="margin-top:8px">Un élève apparaît ici dès que son examen blanc est noté « Validé ✅ ». La préparation compte les leçons plateau ou circulation (selon l'épreuve) planifiées entre l'examen blanc et l'examen.</p>`;
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
  ongletEleves: 'tous',
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

function majMenu() {
  const n = repassages().filter((r) => !r.programme).length;
  $('#tabs [data-view=eleves]').innerHTML = `👤 Élèves${n ? ` <span class="count" title="En attente de repassage">${n}</span>` : ''}`;
}

function viewConnexion() {
  if (Cloud.user && !Cloud.ready) return `<div class="card empty">${Cloud.error ? `<div class="alert bad">${esc(Cloud.error)}</div><button class="btn" data-action="cloudLogout">Se déconnecter</button>` : '⏳ Chargement du planning en ligne…'}</div>`;
  if (Cloud.user && Cloud.empty) {
    return `<div class="card" style="max-width:560px;margin:30px auto">
      <h2>Mise en service du planning partagé</h2>
      <p>Le planning en ligne est vide. Voulez-vous y envoyer les données de cet appareil (élèves, planning, factures, paiements, paramètres) ?</p>
      <p class="muted small">À faire une seule fois, depuis l'appareil qui contient les bonnes données.</p>
      <div class="row"><button class="btn primary" data-action="cloudUpload">⬆️ Envoyer mes données en ligne</button>
      <button class="btn" data-action="cloudStartEmpty">Commencer avec un planning vide</button></div>
    </div>`;
  }
  return `<div class="card" style="max-width:380px;margin:40px auto">
    <h2>Connexion</h2>
    <p class="muted small">Planning partagé — connectez-vous avec l'e-mail et le mot de passe fournis par l'auto-école.</p>
    ${Cloud.error ? `<div class="alert bad">${esc(Cloud.error)}</div>` : ''}
    <form id="login-form" class="form-grid" style="grid-template-columns:1fr" onsubmit="return false">
      <label class="field"><span>E-mail</span><input name="email" type="email" autocomplete="username" required></label>
      <label class="field"><span>Mot de passe</span><input name="password" type="password" autocomplete="current-password" required></label>
      <button class="btn primary" data-action="cloudLogin">Se connecter</button>
      <button class="btn ghost small" data-action="cloudReset">Mot de passe oublié ?</button>
    </form>
  </div>`;
}

const estMoniteur = () => Cloud.moniteur;

function render() {
  const v = $('#view');
  const bloque = Cloud.enabled && !Cloud.actif;
  $('#tabs').hidden = bloque;
  $('#user-chip').innerHTML = Cloud.user
    ? `<span class="small">${esc(Cloud.user.email)}${Cloud.role === 'moniteur' ? ' · moniteur' : Cloud.role === 'admin' ? ' · direction' : ''}</span> <button class="btn small" data-action="cloudLogout" title="Se déconnecter">⎋ Déconnexion</button>`
    : '';
  if (bloque) { v.innerHTML = viewConnexion(); return; }
  // Moniteur : uniquement le planning
  $$('#tabs button').forEach((b) => { b.hidden = estMoniteur() && !['planning', 'motos'].includes(b.dataset.view); });
  if (estMoniteur() && !['planning', 'motos'].includes(UI.view)) UI.view = 'planning';
  majMenu();
  if (UI.view === 'planning') v.innerHTML = viewPlanning();
  else if (UI.view === 'eleves') v.innerHTML = UI.eleveOuvert ? viewFiche(UI.eleveOuvert) : viewEleves();
  else if (UI.view === 'paiements') v.innerHTML = viewPaiements();
  else if (UI.view === 'motos') v.innerHTML = viewMotos();
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
  const moni = estMoniteur();
  if (moni) UI.moniteurSemaine = Cloud.monId;
  if (!UI.moniteurSemaine || !byId('moniteurs', UI.moniteurSemaine)) UI.moniteurSemaine = DB.moniteurs[0]?.id || null;
  const moniteursVus = moni ? DB.moniteurs.filter((m) => m.id === Cloud.monId) : DB.moniteurs;
  const semaine = UI.mode === 'semaine';
  const lundi = mondayOf(UI.date);

  let cols;
  if (semaine) {
    cols = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(lundi, i);
      return { date: d, mon: UI.moniteurSemaine, titre: fmtDayHead(d), today: d === todayISO() };
    });
  } else {
    cols = moniteursVus.map((m) => ({ date: UI.date, mon: m.id, titre: moniteurNom(m), couleur: m.couleur }));
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
    <div class="spacer"></div>
    ${moni ? '' : `<button class="btn" data-action="importExamens" title="Coller l'e-mail RdvPermis pour placer les examens">📥 Importer des examens (RdvPermis)</button>`}
  </div>
  ${moni ? '' : bandeauRappels()}
  ${semaine && !moni ? `<div class="seg" style="margin-bottom:10px">
      ${DB.moniteurs.map((m) => `<button class="${UI.moniteurSemaine === m.id ? 'on' : ''}" data-action="setMonSemaine" data-id="${m.id}"><span class="dot" style="background:${esc(m.couleur)}"></span>${esc(moniteurNom(m))}</button>`).join('')}
    </div>` : ''}
  ${cols.length ? agendaGrid(cols) : `<div class="card empty">${moni ? "Votre compte n'est relié à aucun moniteur : contactez la direction." : 'Ajoutez vos moniteurs dans Paramètres.'}</div>`}
  <p class="muted small" style="margin-top:8px">${moni ? 'Cliquez sur une leçon ou un examen pour voir les élèves et noter les présences ou les résultats.' : 'Cliquez sur une case vide pour placer une leçon ou un examen · Cliquez dessus pour ajouter un élève, noter les présences ou les résultats.'}
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
  const cap = capDe(s);
  const n = s.eleves.length;
  const noms = s.eleves.map((p) => {
    const e = byId('eleves', p.eleveId);
    const a = agenceDe(e);
    const barre = p.statut === 'absent' || p.statut === 'excuse';
    const res = ['admis', 'valide'].includes(p.statut) ? ' ✅' : ['ajourne', 'nonvalide'].includes(p.statut) ? ' ❌' : '';
    return `<div class="ag-el ${barre ? 'abs' : ''}"><span class="dot" style="background:${esc(a?.couleur || '#94a3b8')}"></span>${esc(eleveCourt(e))}${res}</div>`;
  }).join('');
  return `
  <div class="ag-bloc ${s.type}${s.prepa ? ' prepa' : ''}" style="top:${top + 1}px;height:${height}px" data-action="editSeance" data-id="${s.id}">
    <div class="ag-bloc-top"><span>${s.debut} ${TYPES[s.type].short}${s.prepa ? ' <span class="tag-prepa">🎯 Prépa exam</span>' : ''}</span><span class="fill ${n >= cap ? 'full' : 'free'}">${n}/${cap}</span></div>
    <div class="ag-els">${noms}</div>
    ${isExam(s.type) && n < cap ? `<div class="ag-libre">${cap - n} place${cap - n > 1 ? 's' : ''} à attribuer</div>` : ''}
    ${isExam(s.type) && s.lieu ? `<div class="ag-lieu">📍 ${esc(s.lieu)}</div>` : ''}
  </div>`;
}


/* ---------------------------------------------------------------------
   IMPORT DES DATES D'EXAMEN (copier-coller depuis RdvPermis)
   On colle l'e-mail de confirmation / la liste des candidats :
   l'appli retrouve les élèves connus, la date, l'heure, l'épreuve et
   le centre, puis place les examens au planning après vérification.
   --------------------------------------------------------------------- */
const norm = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const MOIS = { janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12 };

function trouverDate(t) {
  const n = norm(t);
  let m = n.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = n.match(/\b(\d{1,2})[\/.](\d{1,2})[\/.](\d{2,4})\b/);
  if (m) { const y = m[3].length === 2 ? '20' + m[3] : m[3]; return `${y}-${pad(m[2])}-${pad(m[1])}`; }
  m = n.match(/\b(\d{1,2})(?:er)?\s+(janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre)\s+(\d{4})\b/);
  if (m) return `${m[3]}-${pad(MOIS[m[2]])}-${pad(m[1])}`;
  return null;
}
function trouverHeure(t) {
  const m = norm(t).match(/\b([01]?\d|2[0-3])\s*(?:h|:)\s*([0-5]\d)?(?!\s*(?:min|mn))/);
  return m ? `${pad(m[1])}:${m[2] || '00'}` : null;
}
function trouverEpreuve(t) {
  const n = norm(t);
  if (/hors[\s-]+circulation|plateau|\bhc\b/.test(n)) return 'exam_plateau';
  if (/circulation|\bcirc\b/.test(n)) return 'exam_circulation';
  return null;
}
function trouverCentre(t) {
  for (const ligne of String(t).split('\n')) {
    const m = ligne.match(/(?:centre(?:\s+d['’]examen)?|site(?:\s+d['’]examen)?|lieu(?:\s+d['’]examen)?)\s*:\s*(.+)/i);
    if (m && m[1].trim()) return m[1].trim();
  }
  for (const ligne of String(t).split('\n')) if (/centre d['’]examen/i.test(ligne)) return ligne.trim();
  return null;
}
// Cherche une valeur dans la ligne de l'élève, puis de plus en plus loin autour.
function chercherAutour(lignes, i, fn, rayon = 8) {
  const v = fn(lignes[i]);
  if (v) return v;
  for (let d = 1; d <= rayon; d++) {
    for (const j of [i - d, i + d]) {
      if (j < 0 || j >= lignes.length) continue;
      const x = fn(lignes[j]);
      if (x) return x;
    }
  }
  return null;
}
function analyserImport(texte) {
  const lignes = texte.split(/\r?\n/);
  const lignesN = lignes.map(norm);
  const global = { date: trouverDate(texte), heure: trouverHeure(texte), type: trouverEpreuve(texte), lieu: trouverCentre(texte) };
  // Liste en tableau (copiée depuis une page web ou un tableur) : repère la colonne « Centre / Lieu / Site »
  const SEP = /\t|;|\||\s{2,}/;
  let colCentre = -1;
  for (const ln of lignesN) {
    const cells = ln.split(SEP).map((c) => c.trim());
    if (cells.length < 3) continue;
    const k = cells.findIndex((c) => /^(centre|lieu|site)/.test(c));
    if (k >= 0) { colCentre = k; break; }
  }
  const centreColonne = (i) => {
    if (colCentre < 0) return null;
    const cells = lignes[i].split(SEP).map((c) => c.trim());
    return cells.length > colCentre && cells[colCentre] ? cells[colCentre] : null;
  };
  const mot = (txt, w) => w && new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`).test(txt);
  const rows = [];
  for (const e of DB.eleves.filter((x) => x.statut !== 'abandon')) {
    const nom = norm(e.nom).trim();
    const prenom = norm(e.prenom).trim();
    lignesN.forEach((ln, i) => {
      // nom + prénom sur la même ligne, ou sur deux lignes qui se suivent (« Nom : … » / « Prénom : … »)
      const ok = (mot(ln, nom) && mot(ln, prenom)) || (mot(ln, nom) && mot(lignesN[i + 1] || '', prenom));
      if (!ok) return;
      rows.push({
        eleveId: e.id,
        type: chercherAutour(lignes, i, trouverEpreuve) || global.type || 'exam_plateau',
        date: chercherAutour(lignes, i, trouverDate) || global.date || '',
        debut: chercherAutour(lignes, i, trouverHeure) || global.heure || '08:00',
        lieu: centreColonne(i) || chercherAutour(lignes, i, trouverCentre, 12) || global.lieu || '',
      });
    });
  }
  // dédoublonne (même élève, même épreuve, même date)
  const vus = new Set();
  return rows.filter((r) => { const k = `${r.eleveId}|${r.type}|${r.date}`; if (vus.has(k)) return false; vus.add(k); return true; });
}

let importRows = [];
let importTexte = '';

function openImport() {
  openModal({
    title: '📥 Importer des dates d\'examen',
    wide: true,
    body: `
      <div class="alert info small">
        Copiez l'<strong>e-mail de confirmation RdvPermis</strong> (ou la liste des candidats affichée sur RdvPermis) et collez-le ci-dessous.
        L'appli retrouve les élèves de vos agences, la date, l'heure, l'épreuve (plateau / circulation) et le centre d'examen.
        Vous pourrez tout vérifier avant l'ajout au planning.
      </div>
      <textarea id="imp-texte" style="min-height:220px" placeholder="Collez ici le texte de l'e-mail ou de la liste…">${esc(importTexte)}</textarea>`,
    foot: `<button class="btn" data-action="closeModal">Annuler</button>
      <button class="btn primary" data-action="importAnalyser">Analyser</button>`,
    onMount: () => setTimeout(() => $('#imp-texte')?.focus(), 50),
  });
}

function openImportApercu() {
  const optEleves = (sel) => `<option value="">— Élève —</option>` + DB.eleves.slice().sort(triNom).map((e) => `<option value="${e.id}" ${sel === e.id ? 'selected' : ''}>${esc(e.nom.toUpperCase())} ${esc(e.prenom)} (${esc(agenceDe(e)?.nom || '')})</option>`).join('');
  openModal({
    title: '📥 Vérifier avant d\'ajouter au planning',
    wide: true,
    body: `
      ${importRows.length ? `<p class="small muted">${importRows.length} élève(s) trouvé(s). Corrigez si besoin, puis validez.</p>`
        : '<div class="alert warn">Aucun élève reconnu dans le texte. Vérifiez que les élèves existent dans l\'appli, ou ajoutez les lignes à la main.</div>'}
      <div class="row" style="margin-bottom:10px">
        <span class="small"><strong>Moniteur accompagnateur :</strong></span>
        <select id="imp-mon" style="width:auto">${DB.moniteurs.map((m) => `<option value="${m.id}" ${UI.importMon === m.id ? 'selected' : ''}>${esc(moniteurNom(m))}</option>`).join('')}</select>
      </div>
      <div class="table-wrap lines-table"><table>
        <thead><tr><th>Élève</th><th>Épreuve</th><th>Date</th><th>Heure</th><th>Centre d'examen</th><th></th></tr></thead>
        <tbody>${importRows.map((r, i) => `<tr>
          <td><select data-on-change="impEdit" data-i="${i}" data-k="eleveId">${optEleves(r.eleveId)}</select></td>
          <td><select data-on-change="impEdit" data-i="${i}" data-k="type">
            <option value="exam_plateau" ${r.type === 'exam_plateau' ? 'selected' : ''}>Plateau</option>
            <option value="exam_circulation" ${r.type === 'exam_circulation' ? 'selected' : ''}>Circulation</option></select></td>
          <td><input type="date" data-on-change="impEdit" data-i="${i}" data-k="date" value="${esc(r.date)}"></td>
          <td><input type="time" data-on-change="impEdit" data-i="${i}" data-k="debut" value="${esc(r.debut)}" step="900"></td>
          <td><input data-on-change="impEdit" data-i="${i}" data-k="lieu" value="${esc(r.lieu)}"></td>
          <td><button class="btn small ghost" data-action="impDel" data-i="${i}">✕</button></td>
        </tr>`).join('')}</tbody>
      </table></div>
      <button class="btn small" style="margin-top:8px" data-action="impAdd">+ Ajouter une ligne</button>`,
    foot: `<div class="left"><button class="btn" data-action="importRetour">◀ Modifier le texte</button></div>
      <button class="btn" data-action="closeModal">Annuler</button>
      <button class="btn primary" data-action="importValider">Ajouter au planning</button>`,
  });
}

function validerImport() {
  const monId = $('#imp-mon').value;
  UI.importMon = monId;
  const rows = importRows.filter((r) => r.eleveId && r.date && r.debut);
  if (!rows.length) return toast('Rien à ajouter : vérifiez les élèves et les dates', true);
  let ajoutes = 0; let deja = 0; const erreurs = [];
  for (const r of rows) {
    // déjà au planning pour cette épreuve ce jour-là ?
    if (DB.seances.some((s) => s.type === r.type && s.date === r.date && s.eleves.some((p) => p.eleveId === r.eleveId))) { deja++; continue; }
    // examen existant au même moment → on y ajoute l'élève ; sinon on crée le créneau
    let s = DB.seances.find((x) => x.type === r.type && x.date === r.date && x.debut === r.debut && (!r.lieu || !x.lieu || norm(x.lieu) === norm(r.lieu)));
    const nouveau = !s;
    if (nouveau) s = { id: uid(), type: r.type, date: r.date, debut: r.debut, fin: fromMin(toMin(r.debut) + (DB.settings.dureeDefaut[r.type] || 180)), moniteurId: monId, lieu: r.lieu, eleves: [] };
    const essai = { ...s, eleves: [...s.eleves, { eleveId: r.eleveId, statut: 'prevu' }] };
    const { errors } = seanceConflicts(essai);
    if (errors.length) { erreurs.push(`${eleveNom(byId('eleves', r.eleveId))} : ${errors[0]}`); continue; }
    s.eleves = essai.eleves;
    if (!s.lieu && r.lieu) s.lieu = r.lieu;
    if (nouveau) DB.seances.push(s);
    ajoutes++;
  }
  save();
  if (ajoutes) {
    const premier = rows.map((r) => r.date).sort()[0];
    UI.date = premier; UI.mode = 'jour';
    go('planning');
  }
  if (erreurs.length) {
    openModal({
      title: 'Import terminé avec des alertes',
      body: `<p>${ajoutes} élève(s) ajouté(s) au planning${deja ? `, ${deja} déjà présent(s)` : ''}.</p>
        ${erreurs.map((e) => `<div class="alert bad">⛔ ${esc(e)}</div>`).join('')}`,
      foot: '<button class="btn primary" data-action="closeModal">OK</button>',
    });
  } else {
    closeModal();
    toast(`${ajoutes} élève(s) ajouté(s) aux examens${deja ? ` · ${deja} déjà au planning` : ''}`);
  }
  importTexte = '';
}

/* ---------------------------------------------------------------------
   Fenêtre « séance » pour un moniteur : consultation + présences / résultats
   --------------------------------------------------------------------- */
function openSeanceMoniteur(s) {
  draft = JSON.parse(JSON.stringify(s));
  const exam = isExam(s.type);
  openModal({
    title: `${TYPES[s.type].label}${s.prepa ? ' · 🎯 Prépa examen' : ''} — ${esc(fmtDayLong(s.date))}`,
    body: `
      <p><strong>${s.debut} – ${s.fin}</strong>${s.lieu ? ` · 📍 ${esc(s.lieu)}` : ''}${exam && (s.rdvHeure || s.rdvLieu) ? `<br><span class="small muted">RDV élèves : ${esc(s.rdvHeure || '')} ${esc(s.rdvLieu || '')}</span>` : ''}</p>
      <div class="lbl">Élèves (${s.eleves.length})</div>
      <p class="muted small" style="margin:-2px 0 8px">Notez la présence, puis « 📋 Suivi » pour donner votre avis sur la leçon.</p>
      <div class="chips">
        ${s.eleves.length ? s.eleves.map((p, i) => {
          const e = byId('eleves', p.eleveId);
          const a = agenceDe(e);
          return `<div class="chip-row">
            <span class="dot" style="background:${esc(a?.couleur || '#94a3b8')}"></span>
            <span class="name">${esc(eleveNom(e))} <span class="muted small">${esc(a?.nom || '')}</span>
              ${e?.tel ? `<br><a class="small" href="tel:${esc(e.tel)}">📞 ${esc(e.tel)}</a>` : ''}</span>
            <select data-presence-i="${i}" class="presence ${p.statut}">
              ${Object.entries(statutsPour(s.type)).map(([k, l]) => `<option value="${k}" ${p.statut === k ? 'selected' : ''}>${l}</option>`).join('')}
            </select>
            <button class="btn small" data-action="suiviDepuisSeance" data-eleve="${p.eleveId}" title="Fiche de suivi">📋 Suivi</button>
          </div>`;
        }).join('') : '<div class="muted small">Aucun élève inscrit.</div>'}
      </div>`,
    foot: `<button class="btn" data-action="closeModal">Fermer</button>
      ${s.eleves.length ? '<button class="btn primary" data-action="saveSeanceMoniteur">Enregistrer</button>' : ''}`,
  });
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
        ${Object.entries(TYPES).map(([k, t]) => `<button data-action="setType" data-t="${k}" class="${draft.type === k ? 'on' : ''} ${k}">${t.exam ? '🎓 ' : t.blanc ? '📝 ' : ''}${t.label}<small>${t.exam ? 'accompagnement · ' : t.blanc ? 'sans faute éliminatoire · ' : ''}max ${capDe({ type: k })}</small></button>`).join('')}
      </div>
      <div id="s-lieu-wrap">
        <div class="row" style="align-items:flex-end;gap:12px">
          <div style="flex:0 0 170px"><div class="lbl">Places réservées</div>
            <input id="s-places" type="number" min="1" max="${DB.settings.capacite.exam_plateau}" value="${esc(draft.places || '')}" placeholder="ex : 3"></div>
          <div style="flex:1;min-width:200px"><div class="lbl">Centre d'examen</div>
            <input id="s-lieu" value="${esc(draft.lieu || '')}" placeholder="Ex : centre d'examen de …" list="lieux-exam"></div>
        </div>
        <p class="muted small" style="margin:4px 0 0">Mettez le nombre de places réservées sur RdvPermis : les noms des élèves pourront être ajoutés plus tard.</p>
        <div class="row" style="align-items:flex-end;gap:12px">
          <div style="flex:0 0 170px"><div class="lbl">RDV élèves à</div>
            <input id="s-rdvh" type="time" step="300" value="${esc(draft.rdvHeure || '')}"></div>
          <div style="flex:1;min-width:200px"><div class="lbl">Lieu du rendez-vous</div>
            <input id="s-rdvl" value="${esc(draft.rdvLieu || '')}" placeholder="vide = à l'auto-école de chaque élève"></div>
        </div>
        <datalist id="lieux-exam">${[...new Set(DB.seances.filter((x) => isExam(x.type)).map((x) => x.lieu).filter(Boolean))].map((l) => `<option value="${esc(l)}">`).join('')}</datalist>
      </div>
      <div id="s-prepa-wrap">
        <div class="lbl">Cette leçon est…</div>
        <div class="seg" id="s-prepa">
          <button data-action="setPrepa" data-v="0">Leçon normale</button>
          <button data-action="setPrepa" data-v="1">🎯 Préparation à l'examen</button>
        </div>
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
      ${!isNew ? `<div class="left"><button class="btn danger" data-action="deleteSeance">Supprimer</button><button class="btn" data-action="duplicateSeance" title="Même leçon la semaine suivante">Copier à +7 j</button><button class="btn" id="s-rappel" data-action="rappelsSeance">🔔 Prévenir les élèves</button></div>` : ''}
      <button class="btn" data-action="closeModal">Annuler</button>
      <button class="btn primary" data-action="saveSeance">${isNew ? 'Placer sur le planning' : 'Enregistrer'}</button>`,
    onMount: (mod) => {
      ['#s-date', '#s-debut', '#s-mon', '#s-places'].forEach((sel) => $(sel, mod).addEventListener('change', () => { readDraft(); refreshDraft(); }));
      refreshDraft();
      if (isNew && !isExam(draft.type) && matchMedia('(pointer: fine)').matches) setTimeout(() => $('#s-search')?.focus(), 50);
    },
  });
}

function readDraft() {
  const dur = toMin(draft.fin) - toMin(draft.debut);
  draft.date = $('#s-date').value;
  draft.debut = $('#s-debut').value || draft.debut;
  draft.fin = fromMin(toMin(draft.debut) + dur);
  draft.moniteurId = $('#s-mon').value;
  if (isExam(draft.type) && $('#s-lieu')) {
    draft.lieu = $('#s-lieu').value.trim();
    draft.places = parseInt($('#s-places').value, 10) || 0;
    draft.rdvHeure = $('#s-rdvh').value || '';
    draft.rdvLieu = $('#s-rdvl').value.trim();
  }
}

function refreshDraft() {
  const cap = capDe(draft);
  const n = draft.eleves.length;
  const dur = toMin(draft.fin) - toMin(draft.debut);
  $$('#s-type button').forEach((b) => b.classList.toggle('on', b.dataset.t === draft.type));
  $('#s-lieu-wrap').hidden = !isExam(draft.type);
  $('#s-prepa-wrap').hidden = categorie(draft.type) !== 'lecon';
  $$('#s-prepa button').forEach((b) => b.classList.toggle('on', (b.dataset.v === '1') === !!draft.prepa));
  if (isExam(draft.type)) $('#s-rdvh').placeholder = heureRdv({ ...draft, rdvHeure: '' });
  if ($('#s-rappel')) $('#s-rappel').hidden = !isExam(draft.type);
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
      ${draft.id ? `<button class="btn small" data-action="suiviDepuisSeance" data-eleve="${p.eleveId}" title="Fiche de suivi">📋 Suivi</button>` : ''}
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
  const tags = new Map();
  if (isExam(draft.type)) {
    for (const r of pretsPourExamen()) if (!r.exam && 'exam_' + r.base === draft.type) tags.set(r.eleve.id, 'examen blanc ✅');
    for (const r of repassages()) if (r.type === draft.type && !tags.has(r.eleve.id)) tags.set(r.eleve.id, `repassage ${r.type === 'exam_plateau' ? 'plateau' : 'circulation'} · blanc à refaire`);
    if (draft.type === 'exam_circulation') {
      for (const e of list) if (!tags.has(e.id) && eleveExamens(e.id).exam_plateau.cls === 'ok' && eleveExamens(e.id).exam_circulation.cls !== 'warn') tags.set(e.id, 'plateau ✅');
    }
  }
  if (draft.prepa && categorie(draft.type) === 'lecon') {
    for (const e of list) {
      const ex = prochainExamen(e.id, baseDe(draft.type));
      if (ex) { const p = preparation(e.id, ex); tags.set(e.id, `examen le ${fmtDate(ex.date)} · prépa ${fmtH(p.total)}/${DB.settings.heuresPrepa.min}h`); }
    }
  }
  list.sort((a, b) => (tags.has(b.id) - tags.has(a.id)) || triNom(a, b));
  if (!q && list.length > 6) list = list.slice(0, Math.max(6, [...tags.keys()].length));
  else list = list.slice(0, 12);
  box.innerHTML = list.map((e) => {
    const a = agenceDe(e);
    const busy = occupes.has(e.id);
    const tag = tags.get(e.id);
    return `<button class="result" data-action="pickEleve" data-id="${e.id}" ${busy ? 'disabled title="Déjà en leçon à cette heure"' : ''}>
      <span class="dot" style="background:${esc(a?.couleur || '#94a3b8')}"></span>
      <strong>${esc(e.nom.toUpperCase())}</strong> ${esc(e.prenom)}
      <span class="muted small">${esc(a?.nom || '')}${busy ? ' · déjà pris' : ''}</span>
      ${tag ? `<span class="badge exam_plateau">${esc(tag)}</span>` : ''}
    </button>`;
  }).join('') + `<button class="result add" data-action="quickEleve">＋ Nouvel élève${q ? ` « ${esc(q)} »` : ''}</button>`;
}

function seanceConflicts(s) {
  const errors = [];
  const cap = capDe(s);
  if (!s.date) errors.push('Choisissez une date.');
  if (isExam(s.type) && Number(s.places) > DB.settings.capacite[s.type]) errors.push(`${s.places} places : le maximum réglé pour un ${TYPES[s.type].label.toLowerCase()} est ${DB.settings.capacite[s.type]} (modifiable dans Paramètres).`);
  if (s.eleves.length > cap) errors.push(`${s.eleves.length} élèves pour ${cap} place${cap > 1 ? 's' : ''} en ${TYPES[s.type].label.toLowerCase()}.`);
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
function ongletsEleves() {
  const n = repassages().filter((r) => !r.programme && (!UI.filtreAgence || r.eleve.agenceId === UI.filtreAgence)).length;
  return `<div class="seg" style="margin-bottom:12px">
    <button class="${UI.ongletEleves === 'tous' ? 'on' : ''}" data-action="ongletEleves" data-o="tous">Tous les élèves</button>
    <button class="${UI.ongletEleves === 'repassage' ? 'on' : ''}" data-action="ongletEleves" data-o="repassage">En attente de repassage ${n ? `<span class="count">${n}</span>` : ''}</button>
    <button class="${UI.ongletEleves === 'prets' ? 'on' : ''}" data-action="ongletEleves" data-o="prets">Prêts pour l'examen ${(() => { const n = pretsPourExamen().filter((r) => !r.exam && (!UI.filtreAgence || r.eleve.agenceId === UI.filtreAgence)).length; return n ? `<span class="count">${n}</span>` : ''; })()}</button>
    <button class="${UI.ongletEleves === 'examens' ? 'on' : ''}" data-action="ongletEleves" data-o="examens">Examens à venir ${placesLibres() ? `<span class="count">${placesLibres()}</span>` : ''}</button>
  </div>`;
}

const examensAVenir = () => DB.seances.filter((x) => isExam(x.type) && x.date >= todayISO()).sort((a, b) => (a.date + a.debut).localeCompare(b.date + b.debut));
const placesLibres = () => examensAVenir().reduce((n, x) => n + Math.max(0, capDe(x) - x.eleves.length), 0);

function viewExamens() {
  const list = examensAVenir();
  if (!list.length) return '<div class="card empty">Aucun examen à venir. Placez-le dans le planning dès la réservation sur RdvPermis.</div>';
  return `<div class="table-wrap"><table>
    <thead><tr><th>Date</th><th>Épreuve</th><th>Centre</th><th>Moniteur</th><th>Élèves</th><th>Places</th></tr></thead>
    <tbody>${list.map((x) => {
      const cap = capDe(x);
      const libres = cap - x.eleves.length;
      return `<tr class="clickable" data-action="editSeance" data-id="${x.id}">
        <td><strong>${fmtDate(x.date)}</strong> ${x.debut}</td>
        <td><span class="badge ${x.type}">${TYPES[x.type].label}</span></td>
        <td>${esc(x.lieu || '—')}</td>
        <td>${esc(moniteurNom(byId('moniteurs', x.moniteurId)))}</td>
        <td>${x.eleves.map((p) => `<div>${esc(eleveNom(byId('eleves', p.eleveId)))} ${p.statut === 'prevu' ? prepBadge(preparation(p.eleveId, x)) : ''}</div>`).join('') || '<span class="muted">—</span>'}</td>
        <td>${libres > 0 ? `<span class="badge warn">${libres} à attribuer</span>` : '<span class="badge ok">complet</span>'} <span class="muted small">${x.eleves.length}/${cap}</span></td>
      </tr>`;
    }).join('')}</tbody></table></div>
    <p class="muted small" style="margin-top:8px">Cliquez sur un examen pour attribuer les places : les élèves en attente de repassage sont proposés en premier.</p>`;
}

function viewRepassages() {
  const q = UI.rechercheEleve.toLowerCase();
  const list = repassages()
    .filter((r) => !UI.filtreAgence || r.eleve.agenceId === UI.filtreAgence)
    .filter((r) => !q || `${r.eleve.nom} ${r.eleve.prenom} ${r.eleve.prenom} ${r.eleve.nom}`.toLowerCase().includes(q));
  const ligne = (r) => {
    const e = r.eleve;
    const epreuve = r.type === 'exam_plateau' ? 'Plateau' : 'Circulation';
    return `<tr class="clickable" data-action="openFiche" data-id="${e.id}">
      <td><strong>${esc(e.nom.toUpperCase())}</strong> ${esc(e.prenom)}</td>
      <td>${agenceBadge(agenceDe(e))}</td>
      <td><span class="badge ${r.type}">Repassage ${epreuve.toLowerCase()}</span></td>
      <td>${ordinal(r.numPassage)} passage</td>
      <td>${r.resultat === 'absent' ? 'Absent' : 'Ajourné'} le ${fmtDate(r.dernier.date)}</td>
      <td>${(() => { const b = blancValide(e.id, baseDe(r.type)); return b && finDe(b) > debutDe(r.dernier) ? `<span class="badge ok">✅ validé le ${fmtDate(b.date)}</span>` : '<span class="badge warn">📝 à refaire</span>'; })()}</td>
      <td>${r.programme
        ? `<span class="badge ok">Programmé le ${fmtDate(r.programme.date)} à ${r.programme.debut}</span>`
        : `<button class="btn small primary" data-action="placerRepassage" data-eleve="${e.id}" data-type="${r.type}">🎓 Programmer</button>`}</td>
    </tr>`;
  };
  return list.length ? `<div class="table-wrap"><table>
    <thead><tr><th>Élève</th><th>Agence</th><th>Épreuve à repasser</th><th>Passage</th><th>Dernier examen</th><th>Examen blanc</th><th></th></tr></thead>
    <tbody>${list.map(ligne).join('')}</tbody></table></div>
    <p class="muted small" style="margin-top:8px"><button class="btn small" data-action="importExamens">📥 Importer des dates d'examen (RdvPermis)</button></p>
    <p class="muted small" style="margin-top:8px">Un élève apparaît ici dès qu'il est noté « Ajourné » ou « Absent » à un examen. Il disparaît quand il est admis au repassage.</p>`
    : '<div class="card empty">Aucun élève en attente de repassage 👍</div>';
}

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
  ${ongletsEleves()}
  ${UI.ongletEleves === 'repassage' ? viewRepassages() : UI.ongletEleves === 'prets' ? viewPrets() : UI.ongletEleves === 'examens' ? viewExamens() : `
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
  <label class="row small muted" style="margin-top:10px;gap:6px"><input type="checkbox" style="width:auto" data-on-change="voirAnciens" ${UI.voirAnciens ? 'checked' : ''}> Afficher aussi les anciens élèves (permis obtenu, abandon)</label>`}`;
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
          <td><span class="badge ${s.type}">${TYPES[s.type].short}</span>${s.prepa ? ' <span class="badge prepa">🎯 Prépa exam</span>' : ''}</td>
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
  } else if (o === 'suivi') {
    contenu = viewSuiviEleve(id);
  } else if (o === 'contrats') {
    contenu = viewContratsEleve(id);
  } else {
    contenu = `<dl class="kv">
      <dt>Agence</dt><dd>${esc(a?.nom || '—')}</dd>
      <dt>Formation</dt><dd>${esc(e.formation || '—')}</dd>
      <dt>Téléphone</dt><dd>${e.tel ? `<a href="tel:${esc(e.tel)}">${esc(e.tel)}</a>` : '—'}</dd>
      <dt>E-mail</dt><dd>${e.email ? `<a href="mailto:${esc(e.email)}">${esc(e.email)}</a>` : '—'}</dd>
      <dt>Adresse</dt><dd>${esc([e.adresse, [e.cp, e.ville].filter(Boolean).join(' ')].filter(Boolean).join(', ') || '—')}</dd>
      <dt>Naissance</dt><dd>${e.naissance ? fmtDate(e.naissance) : '—'}</dd>
      <dt>N° NEPH</dt><dd>${esc(e.neph || '—')}</dd>
      <dt>Heures prévues</dt><dd>${e.heuresPrevues ? esc(e.heuresPrevues) + ' h' : '—'}</dd>
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
      ${['plateau', 'circulation'].map((b) => { const ex = prochainExamen(id, b); return ex ? `<div><span>Prépa examen ${b} (le ${fmtDate(ex.date)})</span><strong>${prepBadge(preparation(id, ex))}</strong></div>` : ''; }).join('')}
      <div><span>Reste dû</span><strong style="color:${fin.solde > 0 ? 'var(--bad)' : 'var(--ok)'}">${eur(Math.max(0, fin.solde))}</strong></div>
    </div>
    <div class="seg" style="margin:14px 0 12px">
      <button class="${o === 'lecons' ? 'on' : ''}" data-action="ongletFiche" data-o="lecons">Leçons</button>
      <button class="${o === 'suivi' ? 'on' : ''}" data-action="ongletFiche" data-o="suivi">📋 Suivi ${(DB.suivi || []).some((x) => x.eleveId === id) ? `<span class="muted small">(${DB.suivi.filter((x) => x.eleveId === id).length})</span>` : ''}</button>
      <button class="${o === 'compte' ? 'on' : ''}" data-action="ongletFiche" data-o="compte">Compte</button>
      <button class="${o === 'contrats' ? 'on' : ''}" data-action="ongletFiche" data-o="contrats">Contrats ${DB.contrats.some((c) => c.eleveId === id && c.statut !== 'signe') ? '<span class="count">!</span>' : ''}</button>
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
          <label class="field"><span>Heures prévues (évaluation)</span><input name="heuresPrevues" type="number" min="0" value="${esc(e.heuresPrevues || '')}"></label>
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

// Numéro de passage d'un élève à une épreuve : 1 = premier passage, 2 = 1er repassage…
function numeroPassage(eleveId, s) {
  const avant = DB.seances.filter((x) => x.type === s.type && x.id !== s.id && (x.date + x.debut) < (s.date + s.debut)
    && x.eleves.some((p) => p.eleveId === eleveId && ['admis', 'ajourne', 'absent'].includes(p.statut)));
  return avant.length + 1;
}

function ligneSeance(s, eleveId) {
  const p = s.eleves.find((x) => x.eleveId === eleveId);
  if (isExam(s.type)) {
    const n = numeroPassage(eleveId, s);
    const epreuve = TYPES[s.type].label.toLowerCase();
    const lieu = s.lieu ? ' - ' + s.lieu : '';
    if (n === 1) {
      const prix = DB.settings.tarifExamen[s.type] || 0;
      return { libelle: `Accompagnement ${epreuve} du ${fmtDate(s.date)}${lieu} (1er passage${prix ? '' : ' - offert'})`, qte: 1, pu: prix, seanceId: s.id };
    }
    return { libelle: `Frais de repassage ${epreuve} du ${fmtDate(s.date)}${lieu} (${n}e passage)`, qte: 1, pu: DB.settings.fraisRepassage[s.type] || 0, seanceId: s.id };
  }
  return {
    libelle: `${isBlanc(s.type) ? 'Examen blanc ' + baseDe(s.type) : 'Leçon ' + TYPES[s.type].label.toLowerCase() + (s.prepa ? ' (préparation examen)' : '')} du ${fmtDate(s.date)} ${s.debut}-${s.fin}${p?.statut === 'absent' ? ' (absence non excusée)' : ''}`,
    qte: round2(durH(s)),
    pu: DB.settings.tarifHeure[baseDe(s.type)] || 0,
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

async function saveFacture() {
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
    if (Cloud.actif) {
      try { ent.compteur = await Cloud.nextNumero(); }
      catch (e) { return toast('Connexion nécessaire pour numéroter la facture : ' + e.message, true); }
    } else ent.compteur = (Number(ent.compteur) || 0) + 1;
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
// Couleurs des documents PDF (carte de RDV, facture, contrat) — au choix dans Paramètres
const PALETTES = {
  orange: { nom: 'Orange & ardoise', fonce: [30, 41, 59], accent: [249, 115, 22], clair: [255, 237, 213] },
  marine: { nom: 'Bleu marine', fonce: [23, 37, 84], accent: [37, 99, 235], clair: [219, 234, 254] },
  turquoise: { nom: 'Vert turquoise', fonce: [19, 78, 74], accent: [20, 184, 166], clair: [204, 251, 241] },
  bordeaux: { nom: 'Bordeaux', fonce: [76, 5, 25], accent: [190, 18, 60], clair: [255, 228, 230] },
  violet: { nom: 'Violet', fonce: [46, 16, 101], accent: [124, 58, 237], clair: [237, 233, 254] },
  noir: { nom: 'Noir & or', fonce: [23, 23, 23], accent: [202, 138, 4], clair: [254, 249, 195] },
  rouge: { nom: 'Rouge & gris', fonce: [31, 41, 55], accent: [220, 38, 38], clair: [254, 226, 226] },
  gris: { nom: 'Sobre (gris)', fonce: [55, 65, 81], accent: [107, 114, 128], clair: [243, 244, 246] },
  bleuRose: { nom: 'Bleu clair & rose', fonce: [14, 165, 233], accent: [236, 72, 153], clair: [252, 231, 243], encre: [3, 105, 161] },
  vertGris: { nom: 'Vert & gris', fonce: [75, 85, 99], accent: [22, 163, 74], clair: [220, 252, 231], encre: [21, 128, 61] },
  jaune: { nom: 'Jaune', fonce: [250, 204, 21], accent: [234, 179, 8], clair: [254, 249, 195], encre: [133, 77, 14], surFonce: [41, 37, 36], sousFonce: [87, 83, 78], surAccent: [41, 37, 36] },
};
// Couleur du texte posé sur la couleur foncée / sur l'accent (blanc, sauf palettes claires comme le jaune)
const surFonce = () => palette().surFonce || [255, 255, 255];
const sousFonce = () => palette().sousFonce || [226, 232, 240];
const surAccent = () => palette().surAccent || [255, 255, 255];
// Auto-école du document en cours de création (sa couleur passe avant la couleur générale)
let PDF_AGENCE = null;
const palette = () => PALETTES[PDF_AGENCE && PDF_AGENCE.couleursPdf] || PALETTES[DB.settings.couleursPdf] || PALETTES.orange;

function pdfText(s) {
  return String(s ?? '').replace(/[  ]/g, ' ').replace(/→/g, '->').replace(/[’]/g, "'").replace(/[“”]/g, '"').replace(/³/g, '3');
}

// buildFacturePdf et buildCarteRdvPdf : voir pdfdesign.js

function texteCarteRdv(eleveId, seances) {
  const e = byId('eleves', eleveId);
  const ent = DB.entreprise;
  const ag = agenceDe(e);
  const lignes = seances.map((s) => `- ${parseISO(s.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} de ${s.debut} à ${s.fin} : ${TYPES[s.type].label}${s.lieu ? ' (' + s.lieu + ')' : ''}`);
  const ec = ecoleDe(ag);
  return `Bonjour ${e.prenom},\n\nVoici vos prochains rendez-vous moto :\n${lignes.join('\n') || '(aucun)'}\n\n${DB.settings.conditionsRdv}\n\n${ec.nom}${ec.tel ? ' - ' + ec.tel : ''}`;
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
      ${emailAutoPret() ? `<div class="envoi-auto">
        <button class="btn primary big" data-send="auto" ${email ? '' : 'disabled title="Pas d\'e-mail sur la fiche"'}>📧 Envoyer par e-mail (PDF joint)</button>
        <div class="small muted" id="envoi-etat">${email ? `Part tout de suite à ${esc(email)}, avec le PDF en pièce jointe.` : "Ajoutez l'e-mail de l'élève sur sa fiche pour l'envoi automatique."}</div>
      </div>` : ''}
      <div class="send-options">
        ${canShareFile ? `<button class="btn ${emailAutoPret() ? '' : 'primary'}" data-send="share">📲 Envoyer le PDF (mail, WhatsApp…)</button>` : ''}
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
          if (k === 'auto') {
            b.disabled = true;
            $('#envoi-etat').textContent = '⏳ Envoi en cours…';
            const base64 = doc.output('datauristring').split(',')[1];
            const r = await envoyerEmailAuto({ to: email, subject, text, ecole: ecoleDe(agenceDe(eleve)), pj: { nom: filename, base64 } });
            const m = messageResultat(r, email);
            $('#envoi-etat').textContent = m.txt;
            b.disabled = false;
            if (m.ok && r.etat === 'ok') b.textContent = '✅ Envoyé — renvoyer ?';
            toast(m.txt, !m.ok);
          } else if (k === 'share') await navigator.share({ files: [file], title: subject, text });
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
  const ec = ecoleDe(byId('agences', f.agenceId) || agenceDe(e));
  const text = `Bonjour ${e?.prenom || ''},\n\nVeuillez trouver ci-joint votre facture n° ${f.numero} du ${fmtDate(f.date)} d'un montant de ${eur(t.ttc)}${reste === 0 ? ' (réglée, merci)' : reste < t.ttc ? ` (reste à payer : ${eur(reste)})` : ''}.\n\nCordialement,\n${ec.nom}${ec.tel ? '\n' + ec.tel : ''}`;
  openSendDialog({
    title: `Envoyer la facture ${esc(f.numero)}`,
    doc: buildFacturePdf(f),
    filename: `Facture-${f.numero}.pdf`,
    eleve: e,
    subject: `Facture ${f.numero} - ${ec.nom}`,
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
    subject: `Vos rendez-vous moto - ${ecoleDe(agenceDe(e)).nom}`,
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
      <h2>Facturation & infos communes</h2>
      <p class="muted small">Numérotation des factures et TVA. Les autres informations ne servent qu'à compléter ce qu'une auto-école n'a pas renseigné.</p>
      ${ligne(`<span class="name">${esc(ent.nom)} <span class="muted small">· factures ${esc(ent.prefixe)}-AAAA-#### · TVA ${ent.tva}%</span></span>`, 'editEntreprise', '')}
    </div>
    <div class="card">
      <h2>Auto-écoles (agences)</h2>
      <p class="muted small">Chaque élève est inscrit dans une auto-école : son nom, son SIRET, sa signature et son tampon figurent sur les documents de l'élève.</p>
      ${DB.agences.map((a) => {
        const manque = ['siret', 'agrement', 'assureur', 'mediateur'].filter((k) => !a[k]).length;
        return ligne(`<span class="dot" style="background:${esc(a.couleur)}"></span><span class="name">${esc(a.nom)} <span class="muted small">${esc(a.ville || '')}</span>${manque ? ' <span class="badge warn">infos à compléter</span>' : ''}</span>`, 'editAgence', a.id);
      }).join('')}
      <button class="btn" data-action="editAgence">+ Ajouter une auto-école</button>
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
        <label class="field"><span>1er accompagnement examen plateau (€, 0 = offert)</span><input type="number" step="0.01" min="0" name="tarifExP" value="${s.tarifExamen.exam_plateau}"></label>
        <label class="field"><span>1er accompagnement examen circulation (€, 0 = offert)</span><input type="number" step="0.01" min="0" name="tarifExC" value="${s.tarifExamen.exam_circulation}"></label>
        <label class="field"><span>Frais de repassage plateau (€)</span><input type="number" step="0.01" min="0" name="repP" value="${s.fraisRepassage.exam_plateau}"></label>
        <label class="field"><span>Frais de repassage circulation (€)</span><input type="number" step="0.01" min="0" name="repC" value="${s.fraisRepassage.exam_circulation}"></label>
        <label class="field"><span>Préparation examen : heures minimum</span><input type="number" min="0" name="prepaMin" value="${s.heuresPrepa.min}"></label>
        <label class="field"><span>Préparation examen : heures maximum</span><input type="number" min="0" name="prepaMax" value="${s.heuresPrepa.max}"></label>
        <label class="field"><span>Planning de</span><input type="time" step="1800" name="heureMin" value="${s.heureMin}"></label>
        <label class="field"><span>à</span><input type="time" step="1800" name="heureMax" value="${s.heureMax}"></label>
        <label class="field full"><span>Texte en bas de la carte de RDV</span><textarea name="conditionsRdv">${esc(s.conditionsRdv)}</textarea></label>
        <label class="field full"><span>Texte en bas des factures</span><textarea name="mentionsFacture">${esc(s.mentionsFacture)}</textarea></label>
      </form>
      <div class="row" style="margin-top:10px;justify-content:flex-end"><button class="btn primary" data-action="saveSettings">Enregistrer</button></div>
    </div>
    <div class="card">
      <h2>🎨 Couleurs des documents</h2>
      <p class="muted small">Carte de rendez-vous, factures et contrats.</p>
      <div class="seg" style="margin-bottom:10px">
        <button class="${DB.settings.designPdf !== 'classique' ? 'on' : ''}" data-action="choisirDesign" data-k="moderne">✨ Style moderne</button>
        <button class="${DB.settings.designPdf === 'classique' ? 'on' : ''}" data-action="choisirDesign" data-k="classique">Style classique</button>
      </div>
      <div class="palettes">
        ${Object.entries(PALETTES).map(([k, pl]) => `<button class="palette ${(DB.settings.couleursPdf || 'orange') === k ? 'on' : ''}" data-action="choisirPalette" data-k="${k}">
          <span class="pal-bande" style="background:rgb(${pl.fonce})"><span style="background:rgb(${pl.accent})"></span></span>
          <span class="pal-nom">${esc(pl.nom)}</span></button>`).join('')}
      </div>
      <div class="row" style="margin-top:10px"><button class="btn small" data-action="apercuPalette">👁️ Voir un exemple de carte de RDV</button></div>
      ${DB.agences.length > 1 ? `<h3 style="margin-top:14px">Une couleur par auto-école</h3>
        <p class="muted small">Les documents d'un élève prennent la couleur de <strong>son</strong> auto-école. « Couleur générale » = celle choisie ci-dessus.</p>
        ${DB.agences.map((a) => { const pl = PALETTES[a.couleursPdf]; return `<div class="chip-row">
          <span class="pal-mini" style="background:rgb(${(pl || palette()).fonce})"><span style="background:rgb(${(pl || palette()).accent})"></span></span>
          <span class="name">${esc(a.nom)}</span>
          <select data-on-change="paletteAgence" data-id="${a.id}" style="width:auto">
            <option value="">Couleur générale</option>
            ${Object.entries(PALETTES).map(([k, x]) => `<option value="${k}" ${a.couleursPdf === k ? 'selected' : ''}>${esc(x.nom)}</option>`).join('')}
          </select>
          <button class="btn small ghost" data-action="apercuPalette" data-agence="${a.id}" title="Voir un exemple">👁️</button>
        </div>`; }).join('')}` : ''}
    </div>
    ${viewParamRappels()}
    ${viewParamContrats()}
    <div class="card">
      <h2>Prestations (pour les factures)</h2>
      ${DB.prestations.map((p) => ligne(`<span class="name">${esc(p.libelle)}</span><strong>${eur(p.prix)}</strong>`, 'editPrestation', p.id)).join('')}
      <button class="btn" data-action="editPrestation">+ Ajouter</button>
    </div>
    ${viewAcces()}
    ${viewParamEmail()}
    <div class="card">
      <h2>🌐 Planning partagé en ligne</h2>
      ${Cloud.actif ? `
        <p><span class="badge ok">Connecté</span> ${esc(Cloud.user.email)}</p>
        <p class="muted small">Toutes les modifications sont partagées en direct avec les agences et les moniteurs.</p>
        <div class="row"><button class="btn" data-action="cloudLogout">Se déconnecter</button>
        ${window.FIREBASE_CONFIG ? '' : '<button class="btn danger" data-action="cloudForget">Désactiver sur cet appareil</button>'}</div>`
      : `
        <p class="muted small">Pour que les agences et les moniteurs voient le même planning. Collez la configuration de votre projet Firebase (voir le guide FIREBASE.md).</p>
        <textarea id="cloud-cfg" placeholder='const firebaseConfig = { apiKey: "...", projectId: "...", ... };'></textarea>
        <div class="row" style="margin-top:8px"><button class="btn primary" data-action="cloudActiver">Activer le planning partagé</button></div>`}
    </div>
    <div class="card">
      <h2>Sauvegarde</h2>
      <p class="muted small">Version de l'appli : <strong>${APP_VERSION}</strong></p>
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

function viewAcces() {
  if (!Cloud.actif) return '';
  const admins = (DB.settings.acces && DB.settings.acces.admins) || [];
  return `
    <div class="card">
      <h2>🔐 Accès à l'appli</h2>
      <p class="muted small"><strong>Direction / secrétariat</strong> : accès complet. <strong>Moniteur</strong> : uniquement son planning (élèves, présences, résultats) — pas de paiements, factures, contrats, fiches ni paramètres.</p>
      <h3>Moniteurs</h3>
      ${DB.moniteurs.map((m) => `
        <div class="chip-row" style="flex-wrap:wrap">
          <span class="dot" style="background:${esc(m.couleur)}"></span>
          <span class="name">${esc(moniteurNom(m))} <span class="muted small">${m.email ? esc(m.email) : ''}</span></span>
          ${m.email ? '<span class="badge ok">accès moniteur</span>' : '<span class="badge">pas d\'accès</span>'}
          <button class="btn small" data-action="accesMoniteur" data-id="${m.id}">${m.email ? 'Modifier' : 'Donner l\'accès'}</button>
          ${m.email ? `<button class="btn small ghost" data-action="retirerAccesMoniteur" data-id="${m.id}" title="Retirer l'accès">✕</button>` : ''}
        </div>`).join('') || '<p class="muted small">Ajoutez d\'abord vos moniteurs ci-dessus.</p>'}
      <h3 style="margin-top:12px">Direction / secrétariat</h3>
      <p class="muted small">Les comptes propriétaires (écrits dans les règles Firebase) ont toujours un accès complet.</p>
      ${admins.map((em) => `<div class="chip-row"><span class="name">${esc(em)}</span><span class="badge ok">accès complet</span>
        <button class="btn small ghost" data-action="retirerAdmin" data-email="${esc(em)}" title="Retirer l'accès">✕</button></div>`).join('')}
      <button class="btn" data-action="ajouterAdmin">+ Ajouter un accès direction / secrétariat</button>
    </div>`;
}

function openAcces({ titre, email = '', explication, onOk }) {
  openModal({
    title: titre,
    body: `
      <p class="muted small">${explication}</p>
      <form id="acces-form" class="form-grid" onsubmit="return false">
        <label class="field full"><span>E-mail de connexion *</span><input name="email" type="email" required value="${esc(email)}"></label>
        <label class="field full"><span>Mot de passe provisoire (6 caractères min.) — laissez vide si le compte existe déjà</span><input name="mdp" type="text" autocomplete="off" minlength="6"></label>
      </form>
      <p class="muted small">Communiquez le mot de passe à la personne de vive voix ou par SMS. Elle pourra le changer avec « Mot de passe oublié ? » sur l'écran de connexion.</p>`,
    foot: `<button class="btn" data-action="closeModal">Annuler</button><button class="btn primary" id="acces-ok">Enregistrer</button>`,
    onMount: (m) => {
      $('#acces-ok', m).addEventListener('click', async () => {
        const form = $('#acces-form');
        if (!form.reportValidity()) return;
        const { email: em, mdp } = formData(form);
        const email = em.toLowerCase();
        $('#acces-ok').disabled = true;
        try {
          let etat = 'existe';
          if (mdp) etat = await Cloud.creerCompte(email, mdp);
          onOk(email);
          save(); closeModal(); render();
          toast(etat === 'cree' ? `Compte créé pour ${email} ✅` : `Accès donné à ${email} ✅`);
        } catch (e) {
          $('#acces-ok').disabled = false;
          const msg = { 'auth/weak-password': 'mot de passe trop court (6 caractères minimum)', 'auth/invalid-email': 'e-mail invalide' }[e.code] || e.message;
          toast('Impossible : ' + msg, true);
        }
      });
    },
  });
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
    { id: 'ag1', nom: 'Auto-école Centre', adresse: '12 rue de la République', cp: '69001', ville: 'Lyon', tel: '04 78 00 00 01', email: 'centre@exemple.fr', siret: '111 111 111 00011', agrement: 'E 01 069 0001 0', dateAgrement: '2015-03-02', exploitant: 'M. Exemple, gérant', assureur: 'Assureur Exemple', police: 'RC-0001', mediateur: 'Médiateur Exemple (www.mediateur-exemple.fr)', couleur: COULEURS_AGENCE[0] },
    { id: 'ag2', nom: 'Auto-école Gare', adresse: '3 place de la Gare', cp: '69003', ville: 'Lyon', tel: '04 78 00 00 02', email: 'gare@exemple.fr', siret: '222 222 222 00022', agrement: 'E 02 069 0002 0', dateAgrement: '2018-06-11', exploitant: 'Mme Exemple, gérante', assureur: 'Assureur Exemple', police: 'RC-0002', mediateur: 'Médiateur Exemple (www.mediateur-exemple.fr)', couleur: COULEURS_AGENCE[1] },
    { id: 'ag3', nom: 'Auto-école Nord', adresse: '8 av. du Parc', cp: '69009', ville: 'Lyon', tel: '04 78 00 00 03', email: 'nord@exemple.fr', siret: '333 333 333 00033', agrement: 'E 03 069 0003 0', dateAgrement: '2020-09-14', exploitant: 'M. Exemple, gérant', assureur: 'Assureur Exemple', police: 'RC-0003', mediateur: 'Médiateur Exemple (www.mediateur-exemple.fr)', couleur: COULEURS_AGENCE[2] },
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
  db.seances[db.seances.length - 1].prepa = true;
  add(0, '08:00', '10:00', 'plateau', 'm1', [0, 2, 4, 6, 8]);
  add(0, '08:00', '10:00', 'circulation', 'm2', [1, 3, 5]);
  add(0, '10:30', '12:30', 'circulation', 'm1', [7, 9]);
  add(0, '14:00', '16:00', 'plateau', 'm2', [2, 3, 7]);
  add(0, '16:00', '17:30', 'circulation', 'm1', [4]);
  add(1, '09:00', '11:00', 'plateau', 'm1', [4, 5, 9]);
  add(1, '13:30', '15:30', 'circulation', 'm2', [6, 8]);
  add(2, '08:00', '10:00', 'plateau', 'm1', [0, 1, 2, 3]);
  add(3, '10:00', '12:00', 'circulation', 'm2', [4, 5, 7]);
  add(2, '14:00', '16:00', 'circulation', 'm2', [0, 3]);
  db.seances[db.seances.length - 1].prepa = true;
  add(-2, '08:00', '11:00', 'exam_plateau', 'm2', [5, 6, 7]);
  add(4, '13:00', '16:00', 'exam_circulation', 'm1', [0, 3]);
  db.seances[db.seances.length - 2].lieu = "Centre d'examen Lyon Sud";
  db.seances[db.seances.length - 2].eleves.forEach((p, i) => { p.statut = i === 1 ? 'ajourne' : 'admis'; });
  db.seances[db.seances.length - 1].lieu = "Centre d'examen Lyon Sud";
  add(-5, '17:00', '18:00', 'blanc_plateau', 'm1', [4, 9]);
  db.seances[db.seances.length - 1].eleves = [{ eleveId: 'el4', statut: 'valide' }, { eleveId: 'el9', statut: 'nonvalide' }];
  add(-6, '10:00', '11:00', 'blanc_circulation', 'm2', [0, 3]);
  db.seances[db.seances.length - 1].eleves = [{ eleveId: 'el0', statut: 'valide' }, { eleveId: 'el3', statut: 'valide' }];
  // Motos & pleins (démo)
  const ilya = (j) => { const d = new Date(); d.setDate(d.getDate() - j); return toISODate(d); };
  db.motos = [
    { id: 'mo1', surnom: 'La Bleue', modele: 'Yamaha MT-07', plaque: 'GH-482-KL', categorie: 'A2', couleur: '#2563eb', km: 18420, emplacement: { type: 'agence', ref: 'ag1', texte: '', majLe: new Date().toISOString() } },
    { id: 'mo2', surnom: 'Flash', modele: 'Kawasaki Z650', plaque: 'FT-219-BN', categorie: 'A2', couleur: '#16a34a', km: 23110, emplacement: { type: 'piste', ref: '', texte: '', majLe: new Date().toISOString() } },
    { id: 'mo3', surnom: 'Titan', modele: 'Honda CB650R', plaque: 'EZ-731-QR', categorie: 'A2', couleur: '#dc2626', km: 9870, emplacement: { type: 'moniteur', ref: 'm2', texte: '', majLe: new Date().toISOString() } },
  ];
  const pl = (motoId, j, litres, montant, km, station) => db.pleins.push({ id: uid(), motoId, date: ilya(j), litres, montant, km, station, auteur: 'local', auteurNom: 'Karim B.', creeLe: new Date().toISOString() });
  db.pleins = [];
  pl('mo1', 70, 12.1, 22.4, 17940, 'Total'); pl('mo1', 40, 11.8, 21.9, 18180, 'Total'); pl('mo1', 12, 12.4, 23.1, 18420, 'Leclerc');
  pl('mo2', 55, 13.0, 24.2, 22610, 'Esso'); pl('mo2', 20, 13.5, 25.0, 22860, 'Total'); pl('mo2', 3, 12.9, 24.6, 23100, 'Total');
  pl('mo3', 33, 11.0, 20.5, 9620, 'Leclerc'); pl('mo3', 6, 11.6, 21.8, 9850, 'Esso');
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
    if (estMoniteur()) return toast('Seule la direction place les leçons. Cliquez sur une leçon pour noter les présences.');
    const type = 'circulation';
    const dur = dureeDe(type);
    openSeance({ type, date: d.date, debut: d.t, fin: fromMin(toMin(d.t) + dur), moniteurId: d.mon, lieu: '', eleves: [] });
  },
  editSeance(d) { const s = byId('seances', d.id); if (s) (estMoniteur() ? openSeanceMoniteur(s) : openSeance(s)); },
  suiviDepuisSeance(d) {
    if (estMoniteur()) {
      const s = byId('seances', draft.id);
      $$('[data-presence-i]').forEach((el) => { draft.eleves[+el.dataset.presenceI].statut = el.value; });
      if (s && JSON.stringify(s.eleves) !== JSON.stringify(draft.eleves)) { s.eleves = draft.eleves; save(); }
    } else {
      readDraft();
      const { errors } = seanceConflicts(draft);
      if (errors.length) { refreshDraft(); return toast(errors[0], true); }
      Object.assign(byId('seances', draft.id), JSON.parse(JSON.stringify(draft)));
      save(); render();
    }
    ACTIONS.openSuivi({ eleve: d.eleve, seance: draft.id }, null, { stopPropagation() {} });
  },
  saveSeanceMoniteur() {
    const s = byId('seances', draft.id);
    if (!s) return closeModal();
    $$('[data-presence-i]').forEach((el) => { draft.eleves[+el.dataset.presenceI].statut = el.value; });
    s.eleves = draft.eleves;
    save(); closeModal(); render(); toast('Enregistré');
  },
  setType(d) {
    readDraft();
    const avant = draft.type;
    draft.type = d.t;
    for (const p of draft.eleves) if (!statutsPour(draft.type)[p.statut]) p.statut = 'prevu';
    if (categorie(draft.type) !== 'lecon') delete draft.prepa;
    if (!draft.id && categorie(avant) !== categorie(draft.type)) draft.fin = fromMin(toMin(draft.debut) + dureeDe(draft.type));
    refreshDraft();
  },
  setPrepa(d) { draft.prepa = d.v === '1'; refreshDraft(); },
  setDuree(d) { draft.fin = fromMin(toMin(draft.debut) + Number(d.d)); refreshDraft(); },
  searchEleve() { renderResults(); },
  pickEleve(d) {
    if (draft.eleves.length >= capDe(draft)) return toast('Complet', true);
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
        if (snapshot.eleves.length < capDe(snapshot)) snapshot.eleves.push({ eleveId: e.id, statut: 'prevu' });
        openSeance(snapshot);
      },
      onCancel: () => openSeance(snapshot),
    });
  },
  saveSeance() {
    readDraft();
    const { errors } = seanceConflicts(draft);
    if (errors.length) { refreshDraft(); return toast(errors[0], true); }
    if (!draft.eleves.length && !(isExam(draft.type) && draft.places) && !confirm('Aucun élève : placer quand même ce créneau ?')) return;
    // Admis à l'examen circulation → permis obtenu
    if (draft.type === 'exam_circulation') {
      const recus = draft.eleves.filter((p) => p.statut === 'admis').map((p) => byId('eleves', p.eleveId)).filter((e) => e && e.statut !== 'obtenu');
      recus.forEach((e) => { e.statut = 'obtenu'; });
      if (recus.length) setTimeout(() => toast(`🎉 Permis obtenu : ${recus.map(eleveNom).join(', ')}`), 600);
    }
    if (draft.id) Object.assign(byId('seances', draft.id), draft);
    else { draft.id = uid(); DB.seances.push(draft); }
    save(); closeModal(); render(); toast(isExam(draft.type) ? 'Examen enregistré' : isBlanc(draft.type) ? 'Examen blanc enregistré' : 'Leçon enregistrée');
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
  choisirDesign(d) { DB.settings.designPdf = d.k; save(); render(); toast(d.k === 'moderne' ? 'Style moderne activé' : 'Style classique'); },
  choisirPalette(d) { DB.settings.couleursPdf = d.k; save(); render(); toast('Couleurs : ' + PALETTES[d.k].nom); },
  paletteAgence(d, el) {
    const a = byId('agences', d.id);
    if (el.value) a.couleursPdf = el.value; else delete a.couleursPdf;
    save(); render(); toast(`${a.nom} : ${el.value ? PALETTES[el.value].nom : 'couleur générale'}`);
  },
  apercuPalette(d) {
    const e = (d && d.agence ? DB.eleves.find((x) => x.agenceId === d.agence) : null) || DB.eleves[0];
    if (d && d.agence && (!e || e.agenceId !== d.agence)) return toast("Aucun élève dans cette auto-école pour l'exemple", true);
    if (!e) return toast("Ajoutez d'abord un élève", true);
    window.open(URL.createObjectURL(buildCarteRdvPdf(e.id, rdvAVenir(e.id)).output('blob')), '_blank');
  },
  ongletEleves(d) { UI.ongletEleves = d.o; render(); },
  importExamens() { if (!DB.moniteurs.length) return toast('Ajoutez d\'abord un moniteur', true); openImport(); },
  importAnalyser() {
    importTexte = $('#imp-texte').value;
    if (!importTexte.trim()) return toast('Collez d\'abord le texte', true);
    importRows = analyserImport(importTexte);
    openImportApercu();
  },
  importRetour() { openImport(); },
  impEdit(d, el) { importRows[+d.i][d.k] = el.value; },
  impDel(d) { UI.importMon = $('#imp-mon').value; importRows.splice(+d.i, 1); openImportApercu(); },
  impAdd() {
    UI.importMon = $('#imp-mon').value;
    const last = importRows[importRows.length - 1];
    importRows.push({ eleveId: '', type: last?.type || 'exam_plateau', date: last?.date || '', debut: last?.debut || '08:00', lieu: last?.lieu || '' });
    openImportApercu();
  },
  importValider: validerImport,
  placerRepassage(d, el, ev) {
    ev.stopPropagation();
    const date = todayISO() < UI.date ? UI.date : todayISO();
    openSeance({
      type: d.type, date, debut: '08:00', fin: fromMin(toMin('08:00') + (DB.settings.dureeDefaut[d.type] || 180)),
      moniteurId: DB.moniteurs[0]?.id, lieu: '', eleves: [{ eleveId: d.eleve, statut: 'prevu' }],
    });
    toast('Choisissez la date et l\'heure du repassage');
  },
  newEleve() { openEleve({ agenceId: UI.filtreAgence || DB.agences[0]?.id, formation: 'A2', statut: 'en_cours' }); },
  editEleve(d) { openEleve(byId('eleves', d.id)); },
  openFiche(d) { go('eleves', { eleveOuvert: d.id, ongletFiche: 'lecons' }); },
  openFicheCompte(d) { go('eleves', { eleveOuvert: d.id, ongletFiche: 'compte' }); },
  ongletFiche(d) { UI.ongletFiche = d.o; render(); },
  backEleves() { UI.eleveOuvert = null; render(); },
  deleteEleve(d) {
    const id = d.id;
    if (DB.factures.some((f) => f.eleveId === id) || DB.paiements.some((p) => p.eleveId === id) || DB.contrats.some((c) => c.eleveId === id && c.statut === 'signe')) {
      return toast('Cet élève a des factures, paiements ou un contrat signé : mettez-le plutôt en « Permis obtenu » ou « Abandon ».', true);
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
    s.fraisRepassage.exam_plateau = Number(f.repP) || 0;
    s.fraisRepassage.exam_circulation = Number(f.repC) || 0;
    s.heuresPrepa.min = parseInt(f.prepaMin, 10) || 0;
    s.heuresPrepa.max = Math.max(s.heuresPrepa.min, parseInt(f.prepaMax, 10) || 0);
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
        if (Cloud.actif) Cloud.setCompteur(data.compteur).catch(() => {});
      },
    });
  },
  editAgence(d) {
    const a = d.id ? byId('agences', d.id) : null;
    openSimpleForm({
      title: a ? "Modifier l'auto-école" : 'Nouvelle auto-école',
      values: a || { couleur: COULEURS_AGENCE[DB.agences.length % COULEURS_AGENCE.length] },
      fields: [
        { name: 'nom', label: "Nom de l'auto-école *", required: true, full: true },
        { name: 'adresse', label: 'Adresse', full: true },
        { name: 'cp', label: 'Code postal' }, { name: 'ville', label: 'Ville' },
        { name: 'tel', label: 'Téléphone', type: 'tel' }, { name: 'email', label: 'E-mail', type: 'email' },
        { name: 'siret', label: 'SIRET' }, { name: 'exploitant', label: 'Représentée par (exploitant)' },
        { name: 'agrement', label: "N° d'agrément" }, { name: 'dateAgrement', label: "Date de l'agrément", type: 'date' },
        { name: 'assureur', label: 'Assureur (responsabilité civile)' }, { name: 'police', label: "N° de contrat d'assurance" },
        { name: 'garantie', label: "Garantie financière (organisme et montant) — vide s'il n'y en a pas", full: true },
        { name: 'mediateur', label: 'Médiateur de la consommation (nom, site internet)', full: true },
        { name: 'couleur', label: 'Couleur dans le planning', type: 'color' },
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
        if (!confirm(Cloud.actif ? 'ATTENTION : mode partagé. Remplacer le planning de TOUT LE MONDE par celui de la sauvegarde ?' : 'Remplacer toutes les données actuelles par celles de la sauvegarde ?')) return;
        DB = migrate(data); save(); render(); toast('Données restaurées');
      } catch (err) { toast('Restauration impossible : ' + err.message, true); }
    };
    reader.readAsText(file);
  },
  async cloudLogin() {
    const form = $('#login-form');
    if (!form.reportValidity()) return;
    const { email, password } = formData(form);
    Cloud.error = '';
    try { await Cloud.login(email, password); }
    catch (e) { Cloud.error = 'E-mail ou mot de passe incorrect.'; render(); }
  },
  async cloudReset() {
    const email = $('#login-form [name=email]').value.trim();
    if (!email) return toast("Tapez d'abord votre e-mail", true);
    try { await Cloud.resetPassword(email); toast('E-mail de réinitialisation envoyé'); }
    catch (e) { toast('Impossible : ' + e.message, true); }
  },
  async cloudLogout() { await Cloud.logout(); },
  async cloudUpload() {
    try { await Cloud.upload(DB); toast('Données envoyées en ligne ✅'); render(); }
    catch (e) { toast('Envoi impossible : ' + e.message, true); }
  },
  async cloudStartEmpty() {
    if (!confirm('Commencer avec un planning vide (les données de cet appareil ne seront pas envoyées) ?')) return;
    DB = defaultState();
    try { await Cloud.upload(DB); render(); } catch (e) { toast('Impossible : ' + e.message, true); }
  },
  cloudActiver() {
    try {
      const cfg = parseFirebaseConfig($('#cloud-cfg').value);
      Cloud.saveConfig(cfg);
      toast('Configuration enregistrée, redémarrage…');
      setTimeout(() => location.reload(), 600);
    } catch (e) { toast('Configuration non reconnue : ' + e.message, true); }
  },
  async cloudForget() {
    if (!confirm('Désactiver le planning partagé sur cet appareil ? (Les données en ligne ne sont pas effacées.)')) return;
    Cloud.forgetConfig();
    await Cloud.logout(); // recharge la page
  },
  accesMoniteur(d) {
    const m = byId('moniteurs', d.id);
    openAcces({
      titre: `Accès moniteur — ${esc(moniteurNom(m))}`,
      email: m.email || '',
      explication: `${esc(moniteurNom(m))} verra uniquement <strong>son</strong> planning : ses leçons et examens, le nom et le téléphone des élèves, et pourra noter présences et résultats.`,
      onOk: (email) => {
        if (DB.moniteurs.some((x) => x.id !== m.id && (x.email || '').toLowerCase() === email)) throw new Error('cet e-mail est déjà utilisé par un autre moniteur');
        m.email = email;
      },
    });
  },
  retirerAccesMoniteur(d) {
    const m = byId('moniteurs', d.id);
    if (!confirm(`Retirer l'accès de ${moniteurNom(m)} ? Il ne pourra plus voir le planning.`)) return;
    delete m.email; save(); render(); toast('Accès retiré');
  },
  ajouterAdmin() {
    openAcces({
      titre: 'Accès direction / secrétariat',
      explication: 'Cette personne aura un <strong>accès complet</strong> : planning, élèves, paiements, factures, contrats et paramètres.',
      onOk: (email) => {
        DB.settings.acces = DB.settings.acces || { admins: [] };
        if (!DB.settings.acces.admins.includes(email)) DB.settings.acces.admins.push(email);
      },
    });
  },
  retirerAdmin(d) {
    if (!confirm(`Retirer l'accès complet de ${d.email} ?`)) return;
    DB.settings.acces.admins = DB.settings.acces.admins.filter((x) => x !== d.email);
    save(); render(); toast('Accès retiré');
  },
  loadDemo() {
    if (Cloud.actif) return toast('Impossible en mode partagé : cela remplacerait le planning de tout le monde.', true);
    if (DB.eleves.length && !confirm('Remplacer les données actuelles par des données de démonstration ?')) return;
    DB = demoData(); save(); go('planning', { date: todayISO(), mode: 'jour' }); toast('Données de démonstration chargées');
  },
  resetData() {
    if (Cloud.actif) return toast('Impossible en mode partagé : cela effacerait le planning de tout le monde.', true);
    if (!confirm('Effacer TOUTES les données ?')) return;
    if (!confirm('Vraiment tout effacer ? C\'est irréversible.')) return;
    DB = defaultState(); save(); go('planning'); toast('Données effacées');
  },
};

Object.assign(ACTIONS, CONTRAT_ACTIONS, RAPPEL_ACTIONS, SUIVI_ACTIONS, EMAIL_ACTIONS, MOTO_ACTIONS);

/* ---------------------------------------------------------------------
   Synchronisation en ligne
   --------------------------------------------------------------------- */
let renderTimer = null;
function renderPlusTard() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => {
    const a = document.activeElement;
    if (a && $('#view').contains(a) && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) return renderPlusTard();
    render();
  }, 250);
}
Cloud.onChange = (db) => {
  if (Cloud.deconnexion) return;
  DB = migrate(db);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(DB)); } catch (e) { /* plein */ }
  renderPlusTard();
};
Cloud.onState = () => render();

/* ---------------------------------------------------------------------
   Démarrage
   --------------------------------------------------------------------- */
Cloud.start();
render();
if (!Cloud.enabled) save(); // enregistre aussi les données converties depuis une ancienne version
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
    .then((r) => r.update())
    .catch(() => {});
  // Nouvelle version installée → on recharge une fois pour l'afficher
  // (pas lors de la toute première visite : seulement quand une version remplace une autre)
  const avaitUneVersion = !!navigator.serviceWorker.controller;
  let rechargee = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!avaitUneVersion || rechargee) return;
    const a = document.activeElement;
    if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) return; // ne coupe pas une saisie en cours
    rechargee = true; location.reload();
  });
}
