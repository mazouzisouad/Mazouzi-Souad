/* =====================================================================
   IMPORTER DES ÉLÈVES
   • PDF « Statistiques élèves » d'AGX / HarMobil' (liste des élèves)
   • ou tableau copié depuis Excel / fichier CSV (avec une ligne d'en-têtes)
   On choisit l'auto-école, on vérifie le tableau (doublons repérés), puis on
   importe. Le solde d'AGX n'est pas repris (les montants ne sont pas fiables).
   ===================================================================== */
'use strict';

/* ---------- Lecture du PDF (pdf.js chargé seulement quand on en a besoin) ---------- */
function chargerPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  return new Promise((resolve, reject) => {
    const sc = document.createElement('script');
    sc.src = 'vendor/pdfjs/pdf.min.js';
    sc.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdfjs/pdf.worker.min.js'; resolve(window.pdfjsLib); };
    sc.onerror = () => reject(new Error('lecteur de PDF introuvable (vérifiez la connexion)'));
    document.head.appendChild(sc);
  });
}
async function textePdf(buffer) {
  const pdfjs = await chargerPdfJs();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const items = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const tc = await (await doc.getPage(n)).getTextContent();
    for (const it of tc.items) if (it.str && it.str.trim()) items.push({ page: n, x: it.transform[4], y: it.transform[5], str: it.str.trim() });
  }
  return items;
}

/* ---------- Petites aides ---------- */
const sansAccent = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const joliCasse = (t) => String(t || '').toLowerCase().replace(/(^|[\s'’-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
const dateFr = (t) => { const m = String(t || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : ''; };
const chiffres = (t) => String(t || '').replace(/\D/g, '');
const estMajuscule = (w) => /\p{L}/u.test(w) && w === w.toUpperCase();

// « Mme BEN AHMED Abdel-nour » → { civilite, nom, prenom }
function separerNom(texte) {
  let mots = String(texte || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  let civilite = '';
  if (/^(m\.?|mme\.?|mlle\.?|mr\.?)$/i.test(mots[0] || '')) civilite = mots.shift().replace('.', '').replace(/^mr$/i, 'M');
  let i = 0;
  while (i < mots.length && estMajuscule(mots[i])) i++;
  if (i === mots.length) i = Math.max(1, Math.min(i, mots.length - 1)); // tout en majuscules : 1er mot = nom
  if (i === 0) i = 1;
  const nom = mots.slice(0, i).join(' ');
  const prenom = mots.slice(i).join(' ').replace(/\.+$/, '');
  return { civilite: civilite ? (/^m$/i.test(civilite) ? 'M.' : joliCasse(civilite)) : '', nom: joliCasse(nom), prenom: joliCasse(prenom) };
}
// lignes « 20 rue des tertes » / « 92220 BAGNEUX » → adresse, cp, ville
function separerAdresse(lignes) {
  const l = lignes.map((x) => x.trim()).filter(Boolean);
  let cp = '', ville = '';
  const idx = l.findIndex((x) => /^\d{5}\b/.test(x));
  if (idx >= 0) { const m = l[idx].match(/^(\d{5})\s*(.*)$/); cp = m[1]; ville = joliCasse(m[2]); l.splice(idx, 1); }
  else if (l.length) { const m = l[l.length - 1].match(/^(.*?)\s*(\d{5})\s*(.*)$/); if (m) { cp = m[2]; ville = joliCasse(m[3]); l[l.length - 1] = m[1]; } }
  return { adresse: l.join(', ').replace(/\s+/g, ' ').trim(), cp, ville };
}
const formationDe = (t) => { const p = String(t || '').trim().toUpperCase(); return p === 'A2' ? 'A2' : p === 'A' ? 'A' : /125/.test(p) ? 'Formation 125 cm³' : p ? 'Autre' : ''; };

/* ---------- PDF « Statistiques élèves » d'AGX ---------- */
const COLONNES_AGX = [
  { cle: 'nom', titre: /^nom/i }, { cle: 'adresse', titre: /^adresse/i }, { cle: 'tel', titre: /^t[ée]l[ée]phone/i },
  { cle: 'permis', titre: /^permis/i }, { cle: 'naissance', titre: /^date naiss/i }, { cle: 'bureau', titre: /^bureau/i }, { cle: 'solde', titre: /^solde/i },
];
function lireListeAgx(items) {
  // 1) position des colonnes (ligne d'en-têtes de la 1re page)
  const cols = [];
  for (const c of COLONNES_AGX) { const h = items.find((it) => c.titre.test(it.str)); if (h) cols.push({ cle: c.cle, x: h.x, y: h.y, page: h.page }); }
  if (cols.length < 4 || !cols.some((c) => c.cle === 'nom')) return null;
  cols.sort((a, b) => a.x - b.x);
  const colDe = (x) => { let r = cols[0]; for (const c of cols) if (x >= c.x - 3) r = c; return r.cle; };
  const yTitres = Math.min(...cols.map((c) => c.y)) - 4;
  const corps = items.filter((it) => !(it.page === cols[0].page && it.y >= yTitres - 6) && !/^(edition du|page \d+ sur|nom pr[ée]nom|neph$|date inscr|age$|courriel$)/i.test(it.str));
  // 2) une ligne d'élève commence par « M. » / « Mme » dans la 1re colonne
  const debuts = corps.filter((it) => colDe(it.x) === 'nom' && /^(M\.|Mme|Mlle|Mr)(\s|$)/.test(it.str)).sort((a, b) => a.page - b.page || b.y - a.y);
  const lignes = debuts.map((d) => ({ page: d.page, y: d.y, cells: {} }));
  for (const it of corps) {
    // la ligne dont le début est juste au-dessus (ou au même niveau) sur la même page
    let r = null;
    for (const l of lignes) if (l.page === it.page && l.y >= it.y - 1.5 && (!r || l.y < r.y)) r = l;
    if (!r) continue;
    const k = colDe(it.x);
    (r.cells[k] = r.cells[k] || []).push(it);
  }
  return lignes.map((l) => {
    // les morceaux d'une même ligne (même hauteur) sont recollés
    const txt = (k) => {
      const parLigne = [];
      for (const it of (l.cells[k] || []).sort((a, b) => b.y - a.y || a.x - b.x)) {
        const der = parLigne[parLigne.length - 1];
        if (der && Math.abs(der.y - it.y) < 2) der.str += ' ' + it.str; else parLigne.push({ y: it.y, str: it.str });
      }
      return parLigne.map((x) => x.str.replace(/\s+/g, ' ').trim());
    };
    const nomL = txt('nom');
    const neph = (nomL.find((x) => /^\d{9,13}$/.test(x.replace(/\s/g, ''))) || '').replace(/\s/g, '');
    const nomTexte = nomL.filter((x) => x.replace(/\s/g, '') !== neph).reduce((acc, x) => (acc.endsWith('-') ? acc + x : acc ? acc + ' ' + x : x), '');
    const permis = txt('permis'), nais = txt('naissance'), bureau = txt('bureau');
    const email = bureau.slice(1).join('').replace(/\s/g, '');
    return {
      ...separerNom(nomTexte), neph,
      ...separerAdresse(txt('adresse')),
      tel: chiffres(txt('tel').join('')),
      formation: formationDe(permis[0]), inscription: dateFr(permis[1]),
      naissance: dateFr(nais[0]), email: /@/.test(email) ? email.toLowerCase() : '',
    };
  }).filter((r) => r.nom);
}

/* ---------- Tableau collé (Excel) ou CSV, avec une ligne d'en-têtes ---------- */
const ENTETES = [
  ['civilite', /^(civ|civilit)/], ['nomprenom', /^nom.*pr[ée]nom|^nom et pr/], ['nom', /^nom\b|^nom de famille/], ['prenom', /^pr[ée]nom/],
  ['tel', /t[ée]l|portable|mobile/], ['email', /mail|courriel/], ['adresse', /^adresse|^rue/], ['cp', /^c\.?p\.?$|code postal/], ['ville', /^ville|commune/],
  ['naissance', /naiss/], ['neph', /neph/], ['inscription', /inscr/], ['formation', /permis|formation|cat[ée]gorie/],
];
function lireTableau(texte) {
  const lignes = String(texte || '').replace(/\r/g, '').split('\n').filter((l) => l.trim());
  if (lignes.length < 2) return null;
  const sep = lignes[0].includes('\t') ? '\t' : (lignes[0].split(';').length >= lignes[0].split(',').length ? ';' : ',');
  const couper = (l) => { const out = []; let cur = '', q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === sep && !q) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out.map((x) => x.trim()); };
  const tete = couper(lignes[0]).map((h) => sansAccent(h).toLowerCase());
  const map = tete.map((h) => (ENTETES.find(([, re]) => re.test(h)) || [null])[0]);
  if (!map.includes('nom') && !map.includes('nomprenom')) return null;
  return lignes.slice(1).map((l) => {
    const v = couper(l); const o = {};
    map.forEach((k, i) => { if (k && v[i] != null && v[i] !== '') o[k] = v[i]; });
    let r = { civilite: o.civilite || '', nom: joliCasse(o.nom || ''), prenom: joliCasse(o.prenom || '') };
    if (o.nomprenom && !o.nom) r = { ...separerNom((o.civilite ? o.civilite + ' ' : '') + o.nomprenom) };
    return {
      ...r, neph: chiffres(o.neph || ''), tel: chiffres(o.tel || ''), email: String(o.email || '').trim().toLowerCase(),
      adresse: o.adresse || '', cp: chiffres(o.cp || '').slice(0, 5), ville: joliCasse(o.ville || ''),
      naissance: /\d{4}-\d{2}-\d{2}/.test(o.naissance || '') ? o.naissance : dateFr(o.naissance), inscription: /\d{4}-\d{2}-\d{2}/.test(o.inscription || '') ? o.inscription : dateFr(o.inscription),
      formation: formationDe(o.formation),
    };
  }).filter((r) => r.nom);
}

/* ---------- Doublons : même NEPH, même téléphone, même e-mail ou même nom + prénom ---------- */
function doublonDe(r) {
  const n = (t) => sansAccent(t).toLowerCase().replace(/[^a-z]/g, '');
  return DB.eleves.find((e) => (r.neph && e.neph && chiffres(e.neph) === r.neph)
    || (r.tel && e.tel && chiffres(e.tel).slice(-9) === r.tel.slice(-9))
    || (r.email && e.email && e.email.toLowerCase() === r.email)
    || (n(e.nom) === n(r.nom) && n(e.prenom) === n(r.prenom))) || null;
}

/* ---------- Écran d'import ---------- */
let IMPORT_EL = { rows: [], source: '' };
function openImportEleves() {
  IMPORT_EL = { rows: [], source: '' };
  openModal({
    title: '📥 Importer des élèves',
    wide: true,
    body: `
      <div class="form-grid">
        <label class="field"><span>Auto-école de ces élèves *</span><select id="imp-el-ag">${DB.agences.map((a) => `<option value="${a.id}" ${UI.filtreAgence === a.id ? 'selected' : ''}>${esc(a.nom)}</option>`).join('')}</select></label>
        <label class="field"><span>Ces élèves sont…</span><select id="imp-el-statut">
          <option value="en_cours">En formation (actifs)</option><option value="inactif">Inactifs (anciens élèves)</option>
          <option value="obtenu">Permis obtenu</option></select></label>
        <label class="field"><span>Fichier : PDF « Statistiques élèves » d'AGX, ou CSV</span><input type="file" id="imp-el-fichier" accept=".pdf,.csv,.txt,application/pdf,text/csv" data-on-change="impElFichier"></label>
        <label class="field full"><span>… ou collez ici un tableau copié depuis Excel (avec la ligne des titres : Nom, Prénom, Téléphone…)</span>
          <textarea id="imp-el-texte" rows="4" placeholder="Nom&#9;Prénom&#9;Téléphone&#9;E-mail…"></textarea></label>
      </div>
      <div class="row" style="margin-top:6px"><button class="btn" data-action="impElLire">Lire le tableau collé</button><span class="small muted" id="imp-el-etat"></span></div>
      <div id="imp-el-apercu" style="margin-top:12px"></div>`,
    foot: `<button class="btn" data-action="closeModal">Annuler</button><button class="btn primary" id="imp-el-ok" data-action="impElValider" disabled>Importer</button>`,
  });
}
function afficherApercuImport() {
  const rows = IMPORT_EL.rows;
  const nouveaux = rows.filter((r) => !r.doublon).length;
  $('#imp-el-etat').textContent = rows.length ? `${rows.length} élève${rows.length > 1 ? 's' : ''} trouvé${rows.length > 1 ? 's' : ''} · ${nouveaux} nouveau${nouveaux > 1 ? 'x' : ''} · ${rows.length - nouveaux} déjà dans l'appli` : '';
  $('#imp-el-apercu').innerHTML = rows.length ? `
    <div class="table-wrap imp-el"><table>
      <thead><tr><th><input type="checkbox" data-on-change="impElTous" ${rows.every((r) => r.ok) ? 'checked' : ''}></th><th>Nom</th><th>Prénom</th><th>Téléphone</th><th>E-mail</th><th>Adresse</th><th>Naissance</th><th>NEPH</th><th>Inscription</th><th>Permis</th><th></th></tr></thead>
      <tbody>${rows.map((r, i) => `<tr class="${r.doublon ? 'doublon' : ''}">
        <td><input type="checkbox" data-on-change="impElCoche" data-i="${i}" ${r.ok ? 'checked' : ''}></td>
        <td><strong>${esc(r.nom.toUpperCase())}</strong></td><td>${esc(r.civilite ? r.civilite + ' ' : '')}${esc(r.prenom)}</td>
        <td>${esc(r.tel)}</td><td class="small">${esc(r.email)}</td>
        <td class="small">${esc([r.adresse, [r.cp, r.ville].filter(Boolean).join(' ')].filter(Boolean).join(', '))}</td>
        <td>${r.naissance ? fmtDate(r.naissance) : ''}</td><td class="small">${esc(r.neph)}</td>
        <td>${r.inscription ? fmtDate(r.inscription) : ''}</td><td>${esc(r.formation)}</td>
        <td class="small">${r.doublon ? `<span class="badge warn" title="Déjà dans l'appli : ${esc(eleveNom(r.doublon))}">déjà là</span>` : '<span class="badge ok">nouveau</span>'}</td>
      </tr>`).join('')}</tbody></table></div>
    <p class="small muted">Les élèves « déjà là » (même NEPH, téléphone, e-mail ou nom) sont décochés pour ne pas les créer deux fois. Le solde d'AGX n'est pas repris.</p>` : '';
  const n = rows.filter((r) => r.ok).length;
  const b = $('#imp-el-ok'); b.disabled = !n; b.textContent = n ? `Importer ${n} élève${n > 1 ? 's' : ''}` : 'Importer';
}
function preparerLignes(rows, source) {
  IMPORT_EL = { source, rows: rows.map((r) => { const d = doublonDe(r); return { ...r, doublon: d, ok: !d }; }) };
  afficherApercuImport();
}

const IMPORT_ELEVES_ACTIONS = {
  importEleves() { openImportEleves(); },
  async impElFichier(d, el) {
    const f = el.files[0]; if (!f) return;
    const etat = $('#imp-el-etat'); etat.textContent = 'Lecture du fichier…';
    try {
      let rows = null;
      if (/\.pdf$/i.test(f.name) || f.type === 'application/pdf') {
        const items = await textePdf(await f.arrayBuffer());
        const crit = items.find((it) => /actif\s*:/i.test(it.str));
        if (crit) $('#imp-el-statut').value = /actif\s*:\s*non/i.test(crit.str) ? 'inactif' : 'en_cours';
        rows = lireListeAgx(items);
      }
      else rows = lireTableau(await f.text());
      if (!rows || !rows.length) { etat.textContent = ''; return toast("Je n'ai pas trouvé de liste d'élèves dans ce fichier.", true); }
      preparerLignes(rows, f.name);
    } catch (e) { etat.textContent = ''; toast('Lecture impossible : ' + e.message, true); }
  },
  impElLire() {
    const rows = lireTableau($('#imp-el-texte').value);
    if (!rows || !rows.length) return toast("Collez le tableau avec sa ligne de titres (au moins une colonne « Nom »).", true);
    preparerLignes(rows, 'tableau collé');
  },
  impElCoche(d, el) { IMPORT_EL.rows[+d.i].ok = el.checked; afficherApercuImport(); },
  impElTous(d, el) { IMPORT_EL.rows.forEach((r) => { r.ok = el.checked; }); afficherApercuImport(); },
  impElValider() {
    const agenceId = $('#imp-el-ag').value, statut = $('#imp-el-statut').value || 'en_cours';
    const choisis = IMPORT_EL.rows.filter((r) => r.ok);
    for (const r of choisis) {
      DB.eleves.push({
        id: uid(), agenceId, statut, nom: r.nom, prenom: r.prenom, civilite: r.civilite || '',
        tel: r.tel, email: r.email, adresse: r.adresse, cp: r.cp, ville: r.ville, naissance: r.naissance, neph: r.neph,
        formation: r.formation || 'A2', inscription: r.inscription || todayISO(), importe: IMPORT_EL.source || 'import',
      });
    }
    let reactives = 0;
    if (statut === 'en_cours') for (const r of IMPORT_EL.rows) if (!r.ok && r.doublon && r.doublon.statut === 'inactif') { r.doublon.statut = 'en_cours'; reactives++; }
    save(); closeModal(); render();
    toast(`✅ ${choisis.length} élève${choisis.length > 1 ? 's' : ''} importé${choisis.length > 1 ? 's' : ''} dans ${byId('agences', agenceId)?.nom || ''}${statut === 'inactif' ? ' (inactifs)' : ''}${reactives ? ` · ${reactives} ancien${reactives > 1 ? 's' : ''} élève${reactives > 1 ? 's' : ''} redevenu${reactives > 1 ? 's' : ''} actif${reactives > 1 ? 's' : ''}` : ''}`);
  },
};

if (typeof module !== 'undefined') module.exports = { lireListeAgx, lireTableau, separerNom, separerAdresse };
