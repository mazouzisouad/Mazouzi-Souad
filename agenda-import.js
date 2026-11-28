/* =====================================================================
   IMPORTER UN PLANNING GOOGLE AGENDA (fichier .ics ou .zip exporté)
   Google Agenda : ⚙️ Paramètres → Importer et exporter → Exporter
   (un .zip qui contient un .ics par agenda).
   • 1 rendez-vous = 1 élève ; les rendez-vous de même horaire et de même
     type deviennent une seule leçon avec plusieurs élèves.
   • Le titre donne l'élève, le type (plateau, circu, prépa, exam blanc,
     évaluation) et parfois l'auto-école (family's, épinay, creil,
     compiègne, french, smile…). « Off », « NE PAS REMPLIR »… sont ignorés.
   • Tableau de vérification avant d'importer : élèves reconnus, inconnus
     (à créer ou à ignorer), type de leçon.
   ===================================================================== */
'use strict';

/* ---------- .zip (export Google) ---------- */
async function fichiersDuZip(buffer) {
  const v = new DataView(buffer), u8 = new Uint8Array(buffer);
  let eocd = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 66000); i--) if (v.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('fichier .zip illisible');
  const n = v.getUint16(eocd + 10, true);
  let p = v.getUint32(eocd + 16, true);
  const out = [];
  for (let k = 0; k < n; k++) {
    if (v.getUint32(p, true) !== 0x02014b50) break;
    const methode = v.getUint16(p + 10, true), taille = v.getUint32(p + 20, true);
    const lNom = v.getUint16(p + 28, true), lExtra = v.getUint16(p + 30, true), lCom = v.getUint16(p + 32, true);
    const offset = v.getUint32(p + 42, true);
    const nom = new TextDecoder().decode(u8.slice(p + 46, p + 46 + lNom));
    p += 46 + lNom + lExtra + lCom;
    if (!/\.ics$/i.test(nom)) continue;
    const debut = offset + 30 + v.getUint16(offset + 26, true) + v.getUint16(offset + 28, true);
    const data = u8.slice(debut, debut + taille);
    let texte;
    if (methode === 0) texte = new TextDecoder().decode(data);
    else if (methode === 8) {
      if (typeof DecompressionStream === 'undefined') throw new Error('ouvrez d\'abord le .zip et choisissez le fichier .ics qu\'il contient');
      texte = await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
    } else continue;
    out.push({ nom, texte });
  }
  return out;
}

/* ---------- .ics ---------- */
const fmtParis = new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
function dateIcs(valeur, params) {
  const m = String(valeur).match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);
  if (!m) return null;
  if (!m[4] || /VALUE=DATE(?!-)/.test(params || '')) return { date: `${m[1]}-${m[2]}-${m[3]}`, heure: null };
  if (m[7]) { // heure UTC → heure de Paris
    const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
    const parts = Object.fromEntries(fmtParis.formatToParts(d).map((x) => [x.type, x.value]));
    return { date: `${parts.year}-${parts.month}-${parts.day}`, heure: `${parts.hour === '24' ? '00' : parts.hour}:${parts.minute}` };
  }
  return { date: `${m[1]}-${m[2]}-${m[3]}`, heure: `${m[4]}:${m[5]}` };
}
function lireIcs(texte) {
  const lignes = String(texte).replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '').split(/\r?\n/);
  const evts = []; let e = null;
  const val = (x) => x.replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
  for (const l of lignes) {
    if (l === 'BEGIN:VEVENT') { e = {}; continue; }
    if (l === 'END:VEVENT') { if (e) evts.push(e); e = null; continue; }
    if (!e) continue;
    const i = l.indexOf(':'); if (i < 0) continue;
    const [nom, ...params] = l.slice(0, i).split(';');
    const v = l.slice(i + 1);
    if (nom === 'DTSTART') e.debut = dateIcs(v, params.join(';'));
    else if (nom === 'DTEND') e.fin = dateIcs(v, params.join(';'));
    else if (nom === 'SUMMARY') e.titre = val(v);
    else if (nom === 'DESCRIPTION') e.desc = val(v);
    else if (nom === 'RRULE') e.repete = true;
    else if (nom === 'STATUS') e.statut = v;
    else if (nom === 'UID') e.uid = v;
    else if (nom === 'RECURRENCE-ID') e.exception = true;
  }
  return evts;
}

/* ---------- Comprendre un rendez-vous ---------- */
const nrm = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const RE_IGNORE = /^(off|ne pas remplir|ferme|fermé|conge|congé|vacances|reunion|réunion|pause|dejeuner|déjeuner)\b/i;
const MOTS_OUTILS = new Set(('plateau platea plateu plat plt circu circulation circ cir prepa prep exam examen exams blanc blancs evaluation evalutation evaluatio evalu eval ' +
  'speed french family familys family\'s epinay creil compiegne tremblay smile argenteuil permis heure heures h 1ere 1er 1re premiere er ere ' +
  'sera absent absente annule annulee rdv cours lecon faire un une point de la le les du des en et au aux a avec auto ecole my mon pour sans non effectue effectuee precedente ' +
  'min mn minutes 30min 30mn 1h 2h moto').split(' '));
function agenceParMots(t) {
  const n = nrm(t);
  const trouve = (re) => DB.agences.find((a) => re.test(nrm(a.nom)));
  if (/compiegne/.test(n)) return trouve(/compiegne/);
  if (/creil/.test(n)) return trouve(/creil/);
  if (/argenteuil|\bfrench\b/.test(n)) return trouve(/french|argenteuil/);
  if (/epinay|famil/.test(n)) return trouve(/epinay/) || trouve(/famil/);
  if (/smile/.test(n)) return trouve(/smile/);
  if (/tremblay/.test(n)) return trouve(/tremblay/);
  return null;
}
function typeDuRdv(t) {
  const n = nrm(t);
  const circu = /\bcirc|\bcirculation/.test(n), plat = /\bplat|\bplt\b|\bplatea/.test(n);
  const base = circu && !plat ? 'circulation' : 'plateau';
  if (/evalu|\beval\b/.test(n)) return { type: base, mode: 'evaluation', sur: true };
  if (/blanc/.test(n)) return { type: base, mode: 'blanc', sur: circu || plat };
  if (/\bexam(en)?s?\b/.test(n)) return { type: 'exam_' + base, mode: null, sur: circu || plat };
  if (/prep/.test(n)) return { type: base, mode: 'prepa', sur: circu || plat };
  return { type: base, mode: null, sur: circu || plat };
}
const sansPour = (t) => String(t || '').replace(/\bpour\s+\S+/gi, ' '); // « … pour Marwane » = le moniteur
function motsDuNom(titre) {
  return nrm(sansPour(titre).replace(/\([^)]*\)/g, ' '))
    .replace(/[^a-z' -]/g, ' ').split(/[\s'-]+/)
    .filter((w) => w.length >= 2 && !MOTS_OUTILS.has(w));
}
// retrouve l'élève : tous les mots du nom (≥ 2) doivent être dans « prénom nom » de l'élève
function trouverEleves(mots, agence) {
  if (!mots.length) return [];
  const res = [];
  for (const e of DB.eleves) {
    const siens = new Set(nrm(`${e.prenom} ${e.nom}`).split(/[\s'-]+/).filter(Boolean));
    const ok = mots.filter((w) => siens.has(w)).length;
    if (ok >= Math.min(2, mots.length) && ok >= mots.length - (mots.length > 2 ? 1 : 0)) res.push({ e, score: ok + (agence && e.agenceId === agence.id ? 0.5 : 0) });
  }
  res.sort((a, b) => b.score - a.score);
  return res.filter((r) => r.score >= res[0]?.score - 0.01).map((r) => r.e);
}
// « Bazgua sofian » → nom Bazgua, prénom Sofian (le mot en MAJUSCULES est le nom s'il y en a un)
function nomPourCreer(titre) {
  const brut = sansPour(titre).replace(/\([^)]*\)/g, ' ').split(/\s+/).filter((w) => w.length >= 2 && !MOTS_OUTILS.has(nrm(w).replace(/[^a-z']/g, '')) && /\p{L}/u.test(w));
  if (!brut.length) return null;
  const maj = brut.filter((w) => w === w.toUpperCase());
  let nom, prenom;
  if (maj.length && maj.length < brut.length) { nom = maj.join(' '); prenom = brut.filter((w) => !maj.includes(w)).join(' '); }
  else { nom = brut[0]; prenom = brut.slice(1).join(' '); }
  const cap = (t) => t.toLowerCase().replace(/(^|[\s'’-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
  return { nom: cap(nom), prenom: cap(prenom) };
}

/* ---------- Écran ---------- */
let IMPORT_AG = { evts: [], rows: [] };
function openImportAgenda() {
  IMPORT_AG = { evts: [], rows: [] };
  const jy = DB.moniteurs.find((m) => /jean.?yves/i.test(moniteurNom(m))) || DB.moniteurs[0];
  openModal({
    title: '📥 Importer un planning Google Agenda',
    wide: true,
    body: `
      <p class="small muted" style="margin-top:0">Dans Google Agenda sur ordinateur : ⚙️ Paramètres → Importer et exporter → <strong>Exporter</strong>. Déposez ici le fichier .zip téléchargé (ou le .ics qu'il contient).</p>
      <div class="form-grid">
        <label class="field"><span>Planning de quel moniteur ? *</span><select id="ag-mon">${DB.moniteurs.map((m) => `<option value="${m.id}" ${m === jy ? 'selected' : ''}>${esc(moniteurNom(m))}</option>`).join('')}</select></label>
        <label class="field"><span>Fichier Google Agenda (.zip ou .ics)</span><input type="file" id="ag-fichier" accept=".zip,.ics,text/calendar,application/zip" data-on-change="agFichier"></label>
        <label class="field"><span>À partir du</span><input type="date" id="ag-du" value="${todayISO()}" data-on-change="agFiltre"></label>
        <label class="field"><span>Jusqu'au (vide = tout)</span><input type="date" id="ag-au" value="" data-on-change="agFiltre"></label>
        <label class="field"><span>Auto-école des élèves de ce fichier</span><select id="ag-ag-defaut" data-on-change="agFiltre">${DB.agences.map((a) => `<option value="${a.id}">${esc(a.nom)}</option>`).join('')}</select></label>
        <label class="field ag-forcer"><span>&nbsp;</span><span class="row" style="gap:8px;font-weight:600;color:var(--ink)"><input type="checkbox" id="ag-forcer" style="width:auto" data-on-change="agFiltre"> Tous les élèves de ce fichier sont de cette auto-école (même ceux déjà dans l'appli)</span></label>
      </div>
      <p class="small muted" style="margin:6px 0 0">Case cochée : par exemple l'agenda violet = My auto école Tremblay. Les élèves déjà dans l'appli y sont rangés aussi. Case décochée : l'auto-école ne sert qu'aux nouveaux élèves dont le titre ne dit pas l'auto-école.</p>
      <div class="small" id="ag-etat" style="margin-top:8px"></div>
      <div id="ag-apercu" style="margin-top:10px"></div>`,
    foot: `<button class="btn" data-action="closeModal">Annuler</button><button class="btn primary" id="ag-ok" data-action="agValider" disabled>Importer</button>`,
  });
}
function analyserRdv() {
  const du = $('#ag-du').value || '0000', au = $('#ag-au').value || '9999';
  const agDefaut = byId('agences', $('#ag-ag-defaut').value);
  const forcer = $('#ag-forcer')?.checked;
  const ancien = new Map(IMPORT_AG.rows.map((r) => [r.cle, r]));
  const rows = [];
  let ignores = 0, repetes = 0, horsPeriode = 0;
  for (const ev of IMPORT_AG.evts) {
    if (!ev.debut || !ev.debut.heure || !ev.fin || ev.statut === 'CANCELLED') { ignores++; continue; }
    if (ev.repete) { repetes++; continue; }
    const titre = (ev.titre || '').trim();
    if (!titre || RE_IGNORE.test(nrm(titre))) { ignores++; continue; }
    if (ev.debut.date < du || ev.debut.date > au) { horsPeriode++; continue; }
    const texte = titre + ' ' + (ev.desc || '');
    const agMots = agenceParMots(texte);
    const ty = typeDuRdv(texte);
    const mots = motsDuNom(titre);
    const cands = trouverEleves(mots, agMots);
    const cle = (ev.uid || '') + ev.debut.date + ev.debut.heure + titre;
    const prec = ancien.get(cle);
    const creer = nomPourCreer(titre);
    rows.push({
      cle, titre, date: ev.debut.date, debut: ev.debut.heure, fin: ev.fin.heure > ev.debut.heure ? ev.fin.heure : fromMin(toMin(ev.debut.heure) + 60),
      type: ty.type, mode: ty.mode, typeSur: ty.sur, absent: /absent/.test(nrm(texte)),
      agence: agMots, cands, creer,
      // élève inconnu : on propose de le créer seulement si le titre parle d'une leçon (sinon : « Rdv garage »…)
      choix: prec ? prec.choix : cands.length === 1 ? cands[0].id : (creer && mots.length && ty.sur ? 'creer' : 'ignorer'),
      agCreer: forcer ? agDefaut?.id || '' : prec ? prec.agCreer : (agMots || agDefaut)?.id || '',
    });
  }
  rows.sort((a, b) => (a.date + a.debut).localeCompare(b.date + b.debut));
  IMPORT_AG.rows = rows;
  IMPORT_AG.forcer = forcer ? agDefaut?.id || '' : '';
  IMPORT_AG.stats = { ignores, repetes, horsPeriode };
  afficherApercuAgenda();
}
function afficherApercuAgenda() {
  const rows = IMPORT_AG.rows, st = IMPORT_AG.stats || {};
  const reconnus = rows.filter((r) => r.choix !== 'creer' && r.choix !== 'ignorer').length;
  const aCreer = rows.filter((r) => r.choix === 'creer').length, ign = rows.filter((r) => r.choix === 'ignorer').length;
  $('#ag-etat').innerHTML = IMPORT_AG.evts.length ? `<strong>${rows.length}</strong> rendez-vous d'élèves dans la période · ✅ ${reconnus} élève${reconnus > 1 ? 's' : ''} reconnu${reconnus > 1 ? 's' : ''} · ➕ ${aCreer} à créer · ✖ ${ign} ignoré${ign > 1 ? 's' : ''}
    <span class="muted">· mis de côté : ${st.ignores || 0} (Off, NE PAS REMPLIR, journées entières…)${st.horsPeriode ? `, ${st.horsPeriode} hors période` : ''}${st.repetes ? `, ${st.repetes} rendez-vous répétés` : ''}</span>` : '';
  const optType = (r) => [['plateau', '', 'Plateau'], ['circulation', '', 'Circu'], ['plateau', 'prepa', '🎯 Prépa plateau'], ['circulation', 'prepa', '🎯 Prépa circu'], ['plateau', 'blanc', '📝 Blanc plateau'], ['circulation', 'blanc', '📝 Blanc circu'], ['plateau', 'evaluation', '🧭 Évaluation'], ['exam_plateau', '', '🎓 Examen plateau'], ['exam_circulation', '', '🎓 Examen circu']]
    .map(([t, m, l]) => `<option value="${t}|${m}" ${r.type === t && (r.mode || '') === m ? 'selected' : ''}>${l}</option>`).join('');
  $('#ag-apercu').innerHTML = rows.length ? `
    <div class="table-wrap imp-el"><table>
      <thead><tr><th>Date</th><th>Heure</th><th>Titre dans Google Agenda</th><th>Élève dans l'appli</th><th>Auto-école (si création)</th><th>Type</th></tr></thead>
      <tbody>${rows.map((r, i) => `<tr class="${r.choix === 'ignorer' ? 'doublon' : r.choix === 'creer' ? 'a-creer' : ''}">
        <td>${fmtDate(r.date)}</td><td>${r.debut}–${r.fin}</td>
        <td class="small">${esc(r.titre)}${r.absent ? ' <span class="badge bad">absent</span>' : ''}</td>
        <td><select data-on-change="agChoix" data-i="${i}">
          ${r.cands.map((e) => `<option value="${e.id}" ${r.choix === e.id ? 'selected' : ''}>✅ ${esc(eleveNom(e))} · ${esc(agenceDe(e)?.nom || '')}</option>`).join('')}
          ${r.creer ? `<option value="creer" ${r.choix === 'creer' ? 'selected' : ''}>➕ Créer : ${esc(r.creer.prenom)} ${esc(r.creer.nom.toUpperCase())}</option>` : ''}
          <option value="ignorer" ${r.choix === 'ignorer' ? 'selected' : ''}>✖ Ne pas importer</option>
          ${r.cands.length ? '' : `<optgroup label="Choisir un élève">${DB.eleves.slice().sort(triNom).map((e) => `<option value="${e.id}">${esc(e.nom.toUpperCase())} ${esc(e.prenom)}</option>`).join('')}</optgroup>`}
        </select></td>
        <td>${r.choix === 'creer' ? `<select data-on-change="agAgence" data-i="${i}">${DB.agences.map((a) => `<option value="${a.id}" ${r.agCreer === a.id ? 'selected' : ''}>${esc(a.nom)}</option>`).join('')}</select>`
          : IMPORT_AG.forcer && r.choix !== 'ignorer' && byId('eleves', r.choix)?.agenceId !== IMPORT_AG.forcer ? `<span class="badge info">→ ${esc(byId('agences', IMPORT_AG.forcer)?.nom || '')}</span>` : '<span class="muted small">—</span>'}</td>
        <td><select data-on-change="agType" data-i="${i}" class="${r.typeSur ? '' : 'a-verifier'}" title="${r.typeSur ? '' : 'Type non écrit dans le titre : à vérifier'}">${optType(r)}</select></td>
      </tr>`).join('')}</tbody></table></div>
    <p class="small muted">Les rendez-vous qui ont la même heure et le même type deviennent une seule leçon avec plusieurs élèves. Les élèves déjà présents dans une leçon identique ne sont pas ajoutés deux fois. Rendez-vous passés : élève « présent » (ou « absent » si c'est écrit) ; à venir : « prévu ».</p>` : (IMPORT_AG.evts.length ? '<p class="muted">Aucun rendez-vous d\'élève dans cette période.</p>' : '');
  const n = rows.filter((r) => r.choix !== 'ignorer').length;
  const b = $('#ag-ok'); b.disabled = !n; b.textContent = n ? `Importer ${n} rendez-vous` : 'Importer';
}

const IMPORT_AGENDA_ACTIONS = {
  importAgenda() { openImportAgenda(); },
  async agFichier(d, el) {
    const f = el.files[0]; if (!f) return;
    $('#ag-etat').textContent = 'Lecture du fichier…';
    try {
      let textes = [];
      if (/\.zip$/i.test(f.name) || f.type === 'application/zip') textes = (await fichiersDuZip(await f.arrayBuffer())).map((x) => x.texte);
      else textes = [await f.text()];
      IMPORT_AG.evts = textes.flatMap(lireIcs);
      if (!IMPORT_AG.evts.length) { $('#ag-etat').textContent = ''; return toast("Aucun rendez-vous trouvé dans ce fichier.", true); }
      analyserRdv();
    } catch (e) { $('#ag-etat').textContent = ''; toast('Lecture impossible : ' + e.message, true); }
  },
  agFiltre() { if (IMPORT_AG.evts.length) analyserRdv(); },
  agChoix(d, el) { IMPORT_AG.rows[+d.i].choix = el.value; afficherApercuAgenda(); },
  agAgence(d, el) { IMPORT_AG.rows[+d.i].agCreer = el.value; },
  agType(d, el) { const [t, m] = el.value.split('|'); Object.assign(IMPORT_AG.rows[+d.i], { type: t, mode: m || null, typeSur: true }); },
  agValider() {
    const monId = $('#ag-mon').value, auj = todayISO();
    const crees = new Map(); // même nom créé une seule fois
    let nbCrees = 0, nbRdv = 0, nbLecons = 0;
    const deplaces = new Set();
    for (const r of IMPORT_AG.rows) {
      if (r.choix === 'ignorer') continue;
      let eid = r.choix;
      if (eid === 'creer') {
        const k = nrm(r.creer.nom + ' ' + r.creer.prenom);
        if (!crees.has(k)) {
          const e = { id: uid(), nom: r.creer.nom, prenom: r.creer.prenom, agenceId: r.agCreer || DB.agences[0]?.id, formation: 'A2', statut: 'en_cours', inscription: r.date < auj ? r.date : auj, importe: 'Google Agenda' };
          DB.eleves.push(e); crees.set(k, e.id); nbCrees++;
        }
        eid = crees.get(k);
      } else if (IMPORT_AG.forcer) {
        const e = byId('eleves', eid);
        if (e && e.agenceId !== IMPORT_AG.forcer) { e.agenceId = IMPORT_AG.forcer; deplaces.add(e.id); }
      }
      // leçon identique (même moniteur, jour, horaire, type) : on y ajoute l'élève
      let s = DB.seances.find((x) => x.moniteurId === monId && x.date === r.date && x.debut === r.debut && x.fin === r.fin && x.type === r.type);
      if (!s) { s = { id: uid(), date: r.date, debut: r.debut, fin: r.fin, type: r.type, moniteurId: monId, lieu: '', eleves: [], importe: 'Google Agenda' }; DB.seances.push(s); nbLecons++; }
      if (s.eleves.some((p) => p.eleveId === eid)) continue;
      const passe = r.date < auj || (r.date === auj && r.fin <= new Date().toTimeString().slice(0, 5));
      const p = { eleveId: eid, statut: r.absent ? 'absent' : isExam(r.type) ? (passe ? 'prevu' : 'prevu') : r.mode === 'blanc' ? 'prevu' : passe ? 'present' : 'prevu' };
      if (r.mode && categorie(r.type) === 'lecon') p.mode = r.mode;
      s.eleves.push(p); nbRdv++;
    }
    save(); closeModal(); render();
    toast(`✅ ${nbRdv} rendez-vous importés en ${nbLecons} leçon${nbLecons > 1 ? 's' : ''}${nbCrees ? ` · ${nbCrees} élève${nbCrees > 1 ? 's' : ''} créé${nbCrees > 1 ? 's' : ''}` : ''}${deplaces.size ? ` · ${deplaces.size} élève${deplaces.size > 1 ? 's' : ''} rangé${deplaces.size > 1 ? 's' : ''} à ${byId('agences', IMPORT_AG.forcer)?.nom || ''}` : ''}`);
  },
};

if (typeof module !== 'undefined') module.exports = { lireIcs, typeDuRdv, motsDuNom, nomPourCreer };
